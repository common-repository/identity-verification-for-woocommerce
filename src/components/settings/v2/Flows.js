import React, { useState, useCallback } from "react";
import {
  Layout,
  TextContainer,
  Card,
  TextField,
  TextStyle,
  Subheading,
  Button,
} from "@shopify/polaris";
import { Box } from "rebass";
import get from "lodash/get";
import { useFormikContext } from "formik";
import useShop from "hooks/useShop";
import { FiExternalLink } from "react-icons/fi";
import PostCheckoutOptions from "components/settings/v2/PostCheckoutOptions";

import {
  CheckAllOrders,
  OnlyUsa,
  PriceFloor,
  BillingToShippingMismatch,
  OrderRisk,
  RepeatCustomerVerification,
  CreditCardPayments,
  // IdVerificationFlows,
} from "components/settings/IdCheckRules";
import IdVerificationFlows from "components/settings/IdCheckRules/v2/IdVerificationFlows";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import IDRequiredCategories from "components/settings/IdCheckRules/IDRequiredCategories";
import IdRequiredCustomerRoles from "../IdCheckRules/IdRequiredCustomerRoles";

export default function AutomaticVerificationRules() {
  const { values, errors, setFieldValue } = useFormikContext();
  const { shop } = useShop();

  return (
    <>
      <Layout.AnnotatedSection
        title="Automatic ID verification triggers & rules"
        description={
          <TextContainer>
            <p>
              Save time and passively validate customers by automatically
              sending ID checks on qualifying orders.
            </p>
            <br />
          </TextContainer>
        }
      >
        <Card fullWidth title="Automated ID checks">
          <IdVerificationFlows />
        </Card>

        {values.deliveryMethod === "manual" && (
          <Card
            title="Manual ID checks"
            primaryFooterAction={{
              onAction: () => {
                redirect.dispatch(Redirect.Action.APP, `/home`);
              },
              content: "Send a new ID check",
            }}
          >
            <Card.Section>
              <TextContainer spacing="loose">
                <p>
                  Real ID is in manual mode. It will not send any ID checks
                  automatically or require ID verification for any new customer
                  account or order.
                </p>
                <p>
                  You can instead send ID checks by email or SMS directly to
                  your customers using the new ID check page.
                </p>
              </TextContainer>
            </Card.Section>
          </Card>
        )}
        {values.deliveryMethod === "post-checkout" && <PostCheckoutOptions />}
        {values.deliveryMethod === "pre-checkout" && (
          <>
            <Card title="ID verification required before checkout">
              <Card.Section>
                <TextContainer spacing="loose">
                  <p>
                    Customers will be required to pass ID verification before
                    the checkout button is enabled in their cart.
                  </p>
                  <p>
                    Real ID will replace the Checkout button with a Verify your
                    ID button. After the customer completes ID verification, the
                    Checkout button will return.
                  </p>
                  <p>
                    <a
                      href="https://getverdict.com/help/docs/flows/before-checkout"
                      target="_blank"
                    >
                      Learn more&nbsp;
                    </a>
                    <FiExternalLink />
                  </p>
                </TextContainer>
              </Card.Section>
            </Card>
            <Card title="Filters">
              <SubscriptionGateway
                permission="automatic_rules"
                minimumPlan="Starter"
              >
                <IDRequiredCategories />
              </SubscriptionGateway>
              <Card.Section>
                <SubscriptionGateway
                  permission="remember_repeat_customers"
                  minimumPlan="Business"
                >
                  <RepeatCustomerVerification checked={true} disabled={true} />
                </SubscriptionGateway>
              </Card.Section>
            </Card>
          </>
        )}
        {values.deliveryMethod === "registration" && (
          <Card title="Requiring ID verification before viewing store">
            <Card.Section>
              <TextContainer spacing="loose">
                <p>
                  Customers will be required to pass ID verification before they
                  can view your store.
                </p>
                <p>
                  Real ID will automatically block any unregistered and
                  unverified customers from viewing the content of your store.
                </p>
                <p>
                  After the customer registers, then they will be able to verify
                  their ID.
                </p>
                <p>
                  After verifying their ID, their Shopify customer profile will
                  be updated with their verification status so they're
                  remembered for future logins and orders.
                </p>
                <p>
                  <a
                    href="http://help.getverdict.com/article/7-how-to-prompt-id-verification-after-customer-registration"
                    target="_blank"
                  >
                    Learn more&nbsp;
                  </a>
                  <FiExternalLink />
                </p>
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <Subheading>Pages unverified customers can visit</Subheading>
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    By default account registration and login pages are allowed
                    for unregistered and unverified customers.
                  </TextStyle>
                </p>
                <p>
                  <TextStyle variation="subdued">
                    But if additional pages need to be accessible to unverified
                    customers such as a catalog, add those pages below:
                  </TextStyle>
                </p>
              </TextContainer>
              <Box my={3}>
                <Button
                  onClick={() => {
                    setFieldValue("registrationSettings.allowedPages", [
                      ...(values.registrationSettings.allowedPages || []),
                      "/",
                    ]);
                  }}
                >
                  Add Allowed Page
                </Button>
              </Box>
              {[
                ...(values.registrationSettings?.allowedPages || []),
                "/my-account/",
              ].map((url, i) => (
                <Box key={i} my={3}>
                  <TextField
                    error={get(
                      errors,
                      `registrationSettings.allowedPages[${i + 2}]`
                    )}
                    value={url}
                    onChange={(value) => {
                      setFieldValue(
                        `registrationSettings.allowedPages[${i}]`,
                        value
                      );
                    }}
                    placeholder="/"
                    prefix={shop.url}
                    disabled={["/my-account/"].includes(url)}
                    clearButton={!["/my-account/"].includes(url)}
                    onClearButtonClick={(url) => {
                      const newAllowedPages =
                        values.registrationSettings.allowedPages.filter(
                          (p, pi) => pi !== i
                        );
                      setFieldValue(
                        "registrationSettings.allowedPages",
                        newAllowedPages
                      );
                    }}
                  />
                </Box>
              ))}
            </Card.Section>
            <Card.Section>
              <Subheading>Login & Registration Buttons</Subheading>
              <TextContainer>
                <p>
                  <TextStyle variation="subdued">
                    Define the login and registration pages linked from the ID
                    gate. Use fully qualified URLs or paths.
                  </TextStyle>
                </p>
              </TextContainer>
              <Box my={3}>
                <TextField
                  label="Login URL"
                  description="The URL to your login page"
                  value={values.registrationSettings.loginUrl}
                  onChange={(value) => {
                    setFieldValue("registrationSettings.loginUrl", value);
                  }}
                />
              </Box>
              <Box my={3}>
                <TextField
                  label="Registration URL"
                  description="The URL to your registration page"
                  value={values.registrationSettings.registrationUrl}
                  onChange={(value) => {
                    setFieldValue(
                      "registrationSettings.registrationUrl",
                      value
                    );
                  }}
                />
              </Box>
            </Card.Section>
            <Card.Section>
              <SubscriptionGateway
                permission="remember_repeat_customers"
                minimumPlan="Business"
              >
                <RepeatCustomerVerification checked={true} disabled={true} />
              </SubscriptionGateway>
            </Card.Section>
          </Card>
        )}
        {values.deliveryMethod === "registration-webhook" && (
          <Card title="Require ID verification after registering an account">
            <Card.Section>
              <TextContainer spacing="loose">
                <p>
                  Build trust on your store or marketplace by requiring ID
                  verification after account registration.
                </p>
                <p>
                  After a user account is registered, they're sent an ID check
                  via email.
                </p>
                {/* <p>
                  <a
                    href="http://help.getverdict.com/article/7-how-to-prompt-id-verification-after-customer-registration"
                    target="_blank"
                  >
                    Learn more&nbsp;
                  </a>
                  <FiExternalLink />
                </p> */}
              </TextContainer>
            </Card.Section>
            <IdRequiredCustomerRoles />
            <Card.Section title="Verify accounts once">
              <SubscriptionGateway
                permission="remember_repeat_customers"
                minimumPlan="Business"
              >
                <RepeatCustomerVerification checked={true} disabled={true} />
              </SubscriptionGateway>
            </Card.Section>
          </Card>
        )}
      </Layout.AnnotatedSection>
    </>
  );
}
