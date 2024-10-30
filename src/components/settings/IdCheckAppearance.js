import React, { useState } from "react";
import {
  Layout,
  Card,
  TextStyle,
  TextField,
  TextContainer,
  DropZone,
  Thumbnail,
  Tabs,
  Banner,
  Heading,
} from "@shopify/polaris";
import { Flex, Box, Button as RbButton } from "rebass";
import axios from "axios";
import { Image, Transformation, CloudinaryContext } from "cloudinary-react";
import { ChromePicker } from "react-color";
import PreviewCustomContent from "components/settings/PreviewCustomContent";
import { useToast } from "providers/ToastProvider";
import * as Sentry from "@sentry/react";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import PreferredLanguage from "./PreferredLanguage";
import EmailTemplates from "./IdCheckAppearance/EmailTemplates";
import { BiEnvelope, BiUserPlus } from "react-icons/bi";
import { MdSms } from "react-icons/md";

export default function IdCheckAppearance({
  values,
  setFieldValue,
  errors,
  shop,
}) {
  const setToast = useToast();
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(0);

  const deliveryMethodsMenu = [
    {
      id: "email",
      content: (
        <Flex alignItems="center">
          <BiEnvelope color="gray" style={{ marginRight: "0.5em" }} /> Email
        </Flex>
      ),
      accessibilityLabel: "Email design",
      panelID: "email-1",
    },
    {
      id: "sms",
      content: (
        <Flex alignItems="center">
          <MdSms color="gray" style={{ marginRight: "0.5em" }} /> SMS
        </Flex>
      ),
      accessibilityLabel: "SMS design",
      panelID: "sms-1",
    },
    {
      id: "registration",
      content: (
        <Flex alignItems="center">
          <BiUserPlus color="gray" style={{ marginRight: "0.5em" }} />{" "}
          Registration
        </Flex>
      ),
      accessibilityLabel: "ID verification required for registration",
      panelID: "registration-1",
    },
  ];

  return (
    <>
      <Layout>
        <Layout.Section>
          <br />
          <Card title="ID Check Appearance" sectioned>
            <p>
              Alter the appearance of ID checks to your end customers to match
              your stores branding.
            </p>
          </Card>
          <PreferredLanguage />
        </Layout.Section>

        <Layout.Section oneHalf>
          <SubscriptionGateway permission="branding" minimumPlan="Pro">
            <Box mb={3}>
              <Tabs
                selected={selectedDeliveryMethod}
                tabs={deliveryMethodsMenu}
                onSelect={(menu) => {
                  setSelectedDeliveryMethod(menu);
                }}
              >
                {/* Email and Web Branding settings */}
                {selectedDeliveryMethod === 0 && <EmailTemplates />}
                {/* SMS branding settings */}
                {selectedDeliveryMethod === 1 && (
                  <Card fullWidth>
                    <Card.Section title="SMS content">
                      <Box my={2}>
                        <Banner status="warning">
                          <p>
                            <TextStyle variation="subdued">
                              Due to phone carrier restrictions on content sent
                              on SMS messages, the ID verification notice
                              message is not editable.
                            </TextStyle>
                          </p>
                        </Banner>
                      </Box>
                      <TextField
                        label="SMS message content"
                        disabled={true}
                        value={
                          "Hi [firstName], your recent order [orderId] requires ID verification. Start your verification here:"
                        }
                        onChange={() => {}}
                        multiline={2}
                        helpText="The unique ID check link is automatically added to the end of the SMS message."
                      />
                    </Card.Section>
                  </Card>
                )}
                {/* Registration Flow settings */}
                {/* if the customer hasn't enabled this option yet, show something special */}
                {selectedDeliveryMethod === 2 && (
                  <Card
                    fullWidth
                    primaryFooterAction={{
                      content: "Add secondary button",
                      onAction: () => {
                        setFieldValue("registrationSettings.secondaryButtons", [
                          ...(values.registrationSettings?.secondaryButtons ||
                            []),
                          { url: "", label: "View Menu" },
                        ]);
                      },
                    }}
                  >
                    <Card.Section title="ID Verification Gate Content">
                      <Box my={2}>
                        <TextContainer>
                          <p>
                            <TextStyle variation="subdued">
                              This content will appear in on all ID gated pages.
                              Visitors will only be able to view this pages
                              after they have registered and successfully
                              verified their ID.
                            </TextStyle>
                          </p>
                        </TextContainer>
                      </Box>
                      <TextField
                        label="Title"
                        value={values?.registrationSettings?.intro?.title}
                        onChange={(value) => {
                          setFieldValue(
                            "registrationSettings.intro.title",
                            value
                          );
                        }}
                        error={errors?.registrationSettings?.intro?.title}
                      />
                      <TextField
                        label="Introduction"
                        value={values?.registrationSettings?.intro?.content}
                        onChange={(value) => {
                          setFieldValue(
                            "registrationSettings.intro.content",
                            value
                          );
                        }}
                        multiline={8}
                        helpText="This content will appear on all ID verification gated pages."
                        error={errors?.registrationSettings?.intro?.content}
                      />
                    </Card.Section>
                    <Card.Section title="Secondary Buttons">
                      <TextContainer>
                        <TextStyle variation="subdued">
                          Add secondary links for unverified customers to view
                          menus or unprotected content.
                        </TextStyle>
                      </TextContainer>
                      {(
                        values?.registrationSettings?.secondaryButtons || []
                      ).map((btn, i) => (
                        <Box key={i} my={3}>
                          <a
                            onClick={() => {
                              const newSecondaryButtons =
                                values.registrationSettings.secondaryButtons.filter(
                                  (btn, fi) => i !== fi
                                );
                              console.log(newSecondaryButtons);
                              setFieldValue(
                                "registrationSettings.secondaryButtons",
                                newSecondaryButtons
                              );
                            }}
                            style={{
                              float: "right",
                              color: "grey",
                              textDecoration: "underline",
                            }}
                          >
                            Remove
                          </a>
                          <TextField
                            label="Label"
                            helpText="The label of the secondary button."
                            value={btn?.label}
                            onChange={(value) => {
                              setFieldValue(
                                `registrationSettings.secondaryButtons[${i}].label`,
                                value
                              );
                            }}
                          />
                          <TextField
                            label="URL"
                            helpText="The URL to the ungated page."
                            value={btn?.url}
                            prefix={shop?.url}
                            onChange={(value) => {
                              setFieldValue(
                                `registrationSettings.secondaryButtons[${i}].url`,
                                value
                              );
                            }}
                            placeholder="/"
                          />
                        </Box>
                      ))}
                    </Card.Section>
                  </Card>
                )}
              </Tabs>
            </Box>
            <Card title="Branding" fullWidth>
              <Card.Section title="Primary Color">
                <ChromePicker
                  color={values.primaryColor}
                  onChange={(color) => {
                    setFieldValue("primaryColor", color.hex);
                  }}
                  disableAlpha={true}
                />
              </Card.Section>
              <Card.Section title="Secondary Color">
                <ChromePicker
                  color={values.secondaryColor}
                  onChange={(color) => {
                    setFieldValue("secondaryColor", color.hex);
                  }}
                  disableAlpha={true}
                />
              </Card.Section>
              <Card.Section title="Brand Image">
                <DropZone
                  id="brand-drop-zone"
                  allowMultiple={false}
                  variableHeight={true}
                  accept="image/*"
                  type="image"
                  onDrop={(_droppedFiles, acceptedFiles, _rejectedFiles) => {
                    let formData = new FormData();
                    formData.append("upload_preset", "kiuetlpk");
                    formData.append("file", acceptedFiles[0]);
                    axios
                      .post(
                        "https://api.cloudinary.com/v1_1/tinyhouse/image/upload",
                        formData,
                        {
                          headers: {
                            "X-Requested-With": "XMLHttpRequest",
                          },
                          transformRequest: [
                            (data, headers) => {
                              // Cloudinary doesn't allow the wp-nonce header
                              delete headers["X-WP-Nonce"];

                              return data;
                            },
                          ],
                        }
                      )
                      .then(({ data }) => {
                        setFieldValue("imageUrl", data.secure_url);
                        setFieldValue("imagePublicId", data.public_id);
                      })
                      .catch((err) => {
                        console.log(err);
                        Sentry.captureException(err);
                        setToast(
                          "Unable to upload your branding photo, please contact support."
                        );
                      });
                  }}
                >
                  {values.imageUrl && (
                    <Flex>
                      <Thumbnail
                        size="large"
                        alt={"Your brand image shown in customer ID checks"}
                        source={values.imageUrl}
                      />
                    </Flex>
                  )}

                  <DropZone.FileUpload />
                </DropZone>
                <Box mt={3}>
                  <TextContainer spacing="loose">
                    <p>
                      <TextStyle variation="subdued">
                        Your brand image will be automatically resized to 250px
                        wide in all emails and in the customers ID verification
                        intake flow.
                      </TextStyle>
                    </p>
                    <p>
                      <TextStyle variation="subdued">
                        We recommend using logos that are wide, rather than
                        narrow.
                      </TextStyle>
                    </p>
                  </TextContainer>
                </Box>
              </Card.Section>
            </Card>
          </SubscriptionGateway>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card fullWidth>
            <Card.Section title="Preview">
              {selectedDeliveryMethod <= 1 && (
                <>
                  <Box my={2}>
                    <TextStyle variation="subdued">
                      This is a preview of the customer's notification email and
                      ID check styling and content.
                    </TextStyle>
                  </Box>
                  <Flex
                    id="check-preview"
                    bg={values.primaryColor}
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Flex
                      // mt={4}
                      mx={2}
                      width={0.7}
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      bg={values.primaryColor}
                    >
                      <Box my={3}>
                        <CloudinaryContext cloudName="tinyhouse">
                          <Image publicId={values.imagePublicId}>
                            <Transformation width="250" crop="scale" />
                          </Image>
                        </CloudinaryContext>
                      </Box>
                      <Box
                        px={4}
                        py={3}
                        sx={{
                          lineHeight: "1.7em",
                          "p:first-of-type": {
                            marginBottom: "16px",
                          },
                        }}
                        backgroundColor="white"
                      >
                        <PreviewCustomContent />
                        <Flex my={4} justifyContent="center">
                          <RbButton
                            sx={{
                              textDecoration: "none",
                              color: "#FFF",
                              backgroundColor:
                                values.primaryButtonColor ||
                                values.primaryColor,
                              border: 0,
                              lineHeight: 2,
                              fontWeight: "bold",
                              textAlign: "center",
                              cursor: "pointer",
                              display: "inline-block",
                              borderRadius: "5px",
                              textTransform: "uppercase",
                            }}
                          >
                            Start ID check
                          </RbButton>
                        </Flex>
                      </Box>
                    </Flex>
                  </Flex>
                </>
              )}
              {selectedDeliveryMethod === 2 && (
                <>
                  <Box my={2}>
                    <TextStyle variation="subdued">
                      This is a preview of the ID verification prompt to
                      unverified customers before they sign in or register an
                      account.
                    </TextStyle>
                  </Box>
                  <Flex
                    id="check-preview"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      px={4}
                      py={3}
                      sx={{
                        lineHeight: "1.7em",
                        "p:first-of-type": {
                          marginBottom: "16px",
                        },
                      }}
                      backgroundColor="white"
                    >
                      {values?.registrationSettings?.intro?.title && (
                        <Flex justifyContent="center" my={3}>
                          <Heading>
                            {values.registrationSettings.intro.title}
                          </Heading>
                        </Flex>
                      )}
                      <PreviewCustomContent
                        field={
                          selectedDeliveryMethod <= 1
                            ? "defaultContent"
                            : "registrationSettings.intro.content"
                        }
                      />
                      <Flex my={4} justifyContent="center">
                        <RbButton
                          sx={{
                            textDecoration: "none",
                            color: "#FFF",
                            backgroundColor:
                              values.primaryButtonColor || values.primaryColor,
                            border: 0,
                            lineHeight: 2,
                            fontWeight: "bold",
                            textAlign: "center",
                            cursor: "pointer",
                            display: "inline-block",
                            borderRadius: "5px",
                            textTransform: "uppercase",
                          }}
                        >
                          Create an Account
                        </RbButton>
                        {selectedDeliveryMethod === 2 &&
                          values?.registrationSettings?.secondaryButtons?.map(
                            (btn, i) => (
                              <RbButton
                                key={i}
                                sx={{
                                  textDecoration: "none",
                                  color: "#FFF",
                                  backgroundColor: "#000", // TODO: allow customers to alter this color as well
                                  border: 0,
                                  lineHeight: 2,
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  cursor: "pointer",
                                  display: "inline-block",
                                  borderRadius: "5px",
                                  textTransform: "uppercase",
                                  marginX: "5px",
                                }}
                              >
                                {btn.label}
                              </RbButton>
                            )
                          )}
                      </Flex>
                      <p>
                        Already have an account? <a href="#">Login here.</a>
                      </p>
                    </Box>
                  </Flex>
                </>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.AnnotatedSection></Layout.AnnotatedSection>
      </Layout>
    </>
  );
}
