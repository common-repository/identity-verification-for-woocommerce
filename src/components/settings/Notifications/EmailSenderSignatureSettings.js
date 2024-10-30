import React, { useState, useMemo } from "react";
import {
  Card,
  TextField,
  FormLayout,
  Banner,
  TextContainer,
  TextStyle,
  Layout,
  Button,
} from "@shopify/polaris";
import get from "lodash/get";
import isNil from "lodash/isNil";
import * as Sentry from "@sentry/nextjs";
import useToast from "hooks/useToast";
import { Box } from "rebass";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import isEmail from "validator/lib/isEmail";
import { useFormikContext } from "formik";
import useShop from "hooks/useShop";
import CopyToClipboard from "components/core/CopyToClipboard";
import { FaCheckCircle } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import clsx from "clsx";
import {
  checkEmailSignatureReturnPathStatus,
  checkEmailSignatureDKIMStatus,
  removeEmailSignature,
  checkEmailSignatureVerificationStatus,
  addEmailSignature,
} from "services/wpApi";

export function CodeText({ children, text, className }) {
  return (
    <CopyToClipboard text={text}>
      <span
        className={clsx(
          "ri-bg-gray-100 ri-border-1 ri-border-solid ri-border-gray-300 ri-rounded-md ri-p-1 ri-text-gray-800 ri-font-mono",
          className
        )}
      >
        {children}
      </span>
    </CopyToClipboard>
  );
}

export function DNSVerification({ shop }) {
  const setToast = useToast();
  const { setShop } = useShop();
  // extract just the host name from the full domain name
  const DKIMHost = useMemo(() => {
    if (
      !shop?.emailSenderSignature?.DKIMPendingHost &&
      !shop?.emailSenderSignature?.DKIMHost
    ) {
      return "";
    }

    const regex = /^([a-zA-Z0-9]+\._domainkey)/;

    const match = (
      shop.emailSenderSignature.DKIMPendingHost ||
      shop.emailSenderSignature.DKIMHost
    ).match(regex);

    if (match && match[1]) {
      const extractedSubstring = match[1];
      console.log(extractedSubstring); // Output: "20211103203331pm"
      return extractedSubstring;
    } else {
      console.log("No match found.");
    }
  }, [shop?.emailSenderSignature?.DKIMPendingHost]);

  return (
    <div className="ri-my-6">
      <h3 className="ri-text-lg ri-leading-tight ri-font-semibold ri-mb-2">
        DNS Records
      </h3>
      {(!shop?.emailSenderSignature?.DKIMVerified ||
        !shop?.emailSenderSignature?.ReturnPathDomainVerified) && (
        <Banner status="info" title="Add DNS records">
          <TextContainer>
            <p>
              For the best results, you will need to add these DNS records to
              your domain in order to verify ownership.
            </p>
            <p>
              After adding these records, your email address will be fully
              verified.
            </p>
          </TextContainer>
        </Banner>
      )}
      {shop?.emailSenderSignature?.DKIMVerified &&
        shop.emailSenderSignature.ReturnPathDomainVerified && (
          <div>
            <p className="ri-mb-3">
              Your domain <strong>{shop?.emailSenderSignature.Domain}</strong>{" "}
              is DKIM verified &nbsp;
              <FaCheckCircle color="green" />
            </p>
          </div>
        )}
      <table className="w-full ri-border-spacing-x-2 ri-border-spacing-y-4">
        <thead>
          <tr>
            <th></th>
            <th className="ri-text-left">Type</th>
            <th className="ri-text-left">Host</th>
            <th className="ri-text-left">Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ri-align-top">
              {shop.emailSenderSignature.DKIMVerified ? (
                <FaCheckCircle color="green" />
              ) : (
                <FaExclamationTriangle color="orange" />
              )}
            </td>
            <td className="ri-align-top">
              <CodeText>TXT</CodeText>
            </td>
            <td className="ri-align-top">
              <CodeText text={DKIMHost}>{DKIMHost}</CodeText>
            </td>
            <td className="ri-align-top">
              <CodeText
                text={
                  shop.emailSenderSignature.DKIMPendingTextValue ||
                  shop.emailSenderSignature.DKIMTextValue
                }
                className="ri-break-all ri-block"
              >
                {shop.emailSenderSignature.DKIMPendingTextValue ||
                  shop.emailSenderSignature.DKIMTextValue}
              </CodeText>
            </td>
            <td>
              <Button
                disabled={shop.emailSenderSignature?.DKIMVerified}
                onClick={() => {
                  checkEmailSignatureDKIMStatus
                    .then(({ data }) => {
                      setShop(data.shop);
                      setToast(`DKIM record verified.`);
                    })
                    .catch((e) => {
                      console.log(e);
                      Sentry.captureException(e);
                      setToast(`Unable to verify DKIM`);
                    });
                }}
              >
                Verify
              </Button>
            </td>
          </tr>
          <tr>
            <td className="ri-align-top">
              {shop.emailSenderSignature.ReturnPathDomainVerified ? (
                <FaCheckCircle color="green" />
              ) : (
                <FaExclamationTriangle color="orange" />
              )}
            </td>
            <td className="ri-align-top">
              <CodeText>CNAME</CodeText>
            </td>
            <td className="ri-align-top">
              <CodeText text="pm-bounces">pm-bounces</CodeText>
            </td>
            <td className="ri-align-top">
              <CodeText
                text={shop.emailSenderSignature.ReturnPathDomainCNAMEValue}
              >
                {shop.emailSenderSignature.ReturnPathDomainCNAMEValue}
              </CodeText>
            </td>
            <td>
              <Button
                disabled={shop.emailSenderSignature?.ReturnPathDomainVerified}
                onClick={() => {
                  checkEmailSignatureReturnPathStatus
                    .then(({ data }) => {
                      setShop(data.shop);
                      setToast(`Return Path record verified.`);
                    })
                    .catch((e) => {
                      console.log(e);
                      Sentry.captureException(e);
                      setToast(`Unable to verify Return Path`);
                    });
                }}
              >
                Verify
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function EmailSenderSignatureSettings() {
  const { shop, setShop } = useShop();
  const { values, setFieldValue } = useFormikContext();
  const setToast = useToast();
  const [fromEmail, setFromEmail] = useState(
    get(shop, "emailSenderSignature.EmailAddress", shop?.contactEmail)
  );
  const [fromName, setFromName] = useState(
    get(shop, "emailSenderSignature.Name", "Support")
  );

  let primaryFooterAction = {
    content: "Verify",
    disabled: !fromName || !fromEmail || !isEmail(fromEmail),
    onAction: () => {
      // verify domain
      addEmailSignature({
        fromEmail,
        fromName,
      })
        .then(({ data }) => {
          setShop(data.shop);
          setToast(
            `Sent a verification email to ${fromEmail}. Confirm ownership by clicking the link in the email.`
          );
        })
        .catch((e) => {
          Sentry.captureException(e);
          console.error(e);
          setToast(
            e.response?.data?.message ||
              `Unable to add the email ${fromEmail} for email verification. Please contact support.`
          );
        });
    },
  };
  let secondaryFooterActions = [];

  if (shop?.emailSenderSignature) {
    primaryFooterAction = {
      content: "Check Verification Status",
      onAction: () => {
        // verify domain
        checkEmailSignatureVerificationStatus
          .then(({ data }) => {
            setShop(data.shop);
            setToast(`Refreshed verification status.`);
            console.log(data);
          })
          .catch((e) => {
            Sentry.captureException(e);
            console.error(e);
            setToast(
              `Email not yet verified, please check your inbox for an email from support@postmarkapp.com`
            );
          });
      },
    };
  }

  if (shop?.emailSenderSignature?.Confirmed) {
    primaryFooterAction = false;
  }

  if (shop?.emailSenderSignature) {
    secondaryFooterActions = [
      {
        destructive: true,
        content: "Remove Email Address",
        onAction: () => {
          removeEmailSignature
            .then(({ data }) => {
              setToast(`Removed your email address.`);
              setShop(data.shop);
              console.log(data);
            })
            .catch((e) => {
              Sentry.captureException(e);
              console.error(e);
              setToast(
                `Unable to remove the email ${fromEmail} from settings. Please contact support.`
              );
            });
        },
      },
    ];
  }

  return (
    <Layout.AnnotatedSection
      title="Send ID checks with your own email address"
      description={
        <>
          <p>
            Build trust with your customers by using your email address to send
            ID checks.
          </p>
          <br />
          <p>Verify your email below to get started.</p>
        </>
      }
    >
      {/* TODO: make a specific permission for this, but make a task to apply it to old accounts too */}
      <SubscriptionGateway permission="branding" minimumPlan="Pro">
        <Card
          fullWidth
          primaryFooterAction={primaryFooterAction}
          secondaryFooterActions={secondaryFooterActions}
          title="Use your own email address"
        >
          <Card.Section>
            {shop?.emailSenderSignature?.Confirmed && (
              <div>
                <p className="ri-mb-3">
                  Now sending ID checks and notifications to customers with{" "}
                  <strong>{shop?.emailSenderSignature.EmailAddress}</strong>
                  &nbsp;
                  <FaCheckCircle color="green" />
                </p>
                <p>
                  ID check notifications to customers will now be sent from this
                  email.
                </p>
              </div>
            )}
            {!shop?.emailSenderSignature?.Confirmed &&
              shop?.emailSenderSignature && (
                <Banner status="info" title="Just one more step">
                  <TextContainer>
                    <p>
                      Check your inbox at{" "}
                      <code>{shop?.emailSenderSignature?.EmailAddress}</code>{" "}
                      for an email from Postmark to finish email verification.
                    </p>
                    <p>
                      This email will contain a link to verify your email
                      address.
                    </p>
                  </TextContainer>
                </Banner>
              )}

            {!shop?.emailSenderSignature && (
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    To build customer trust, you can use your own{" "}
                    <strong>email address</strong> to send ID verification
                    checks.
                  </TextStyle>
                </p>
                <p>
                  <TextStyle variation="subdued">
                    ID check notifications will be sent to the customer using
                    this email address:
                    <ul>
                      <li>ID check required</li>
                      <li>ID check passed</li>
                      <li>ID check in review</li>
                    </ul>
                  </TextStyle>
                </p>
                <p>
                  <TextStyle variation="subdued">
                    Use your customer support email address below:
                  </TextStyle>
                </p>
              </TextContainer>
            )}
            <Box my={3}>
              <h3 className="ri-text-lg ri-leading-tight ri-font-semibold ri-mb-2">
                Email Address
              </h3>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Name"
                    value={fromName}
                    disabled={!isNil(shop?.emailSenderSignature)}
                    onChange={(value) => {
                      setFromName(value);
                    }}
                  />
                  {get(shop, "settings.emailSenderVerificationStatus") !==
                    "verified" && (
                    <TextField
                      type="email"
                      label="Email Address"
                      disabled={!isNil(shop?.emailSenderSignature)}
                      value={fromEmail}
                      onChange={(value) => {
                        setFromEmail(value);
                      }}
                    />
                  )}
                </FormLayout.Group>
              </FormLayout>
            </Box>
            {shop?.emailSenderSignature?.Confirmed && (
              <DNSVerification shop={shop} />
            )}
          </Card.Section>
        </Card>
      </SubscriptionGateway>
    </Layout.AnnotatedSection>
  );
}
