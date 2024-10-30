import React, { useState } from "react";
import {
  Card,
  TextContainer,
  DescriptionList,
  Collapsible,
  Tabs,
  TextStyle,
  TextField,
} from "@shopify/polaris";
import { Box } from "rebass";
import { FaInfoCircle } from "react-icons/fa";
import { useFormikContext } from "formik";
import { useShop } from "providers/ShopProvider";
import get from "lodash/get";

export default function EmailTemplates() {
  const [shortcodesOpen, setShortcodesOpen] = useState(false);
  const { values, setFieldValue, errors } = useFormikContext();
  const [selectedEmailMenu, setSelectedEmailMenu] = useState(0);
  const { shop } = useShop();
  const emailsMenu = [
    {
      id: "intro",
      content: "Introduction",
      accessibilityLabel: "ID check email content",
      panelID: "id-check-email",
      fieldName: "defaultContent",
      helpText:
        "This content will appear in both the email and ID check sent to the customer.",
      defaultContent: "",
    },
    {
      id: "in-review",
      content: "In Review",
      accessibilityLabel: "ID check in review email content",
      panelID: "id-check-in-review-email",
      fieldName: "emailContent.customer.check.in_review",
      helpText:
        shop?.usagePlan === "lite"
          ? "This email is sent to the customer when they have submitted their ID photos."
          : "This email is sent when a customers ID isn't automatically able to be verified.",
    },
    {
      id: "completed",
      content: "Verified",
      accessibilityLabel: "ID check completed email content",
      panelID: "id-check-completed-email",
      fieldName: "emailContent.customer.check.completed",
      helpText:
        shop?.usagePlan === "lite"
          ? "This email is sent to the customer when their ID photos have been automatically verified or manually approved."
          : "This email is sent when the customers ID photos have been manually approved",
    },
    {
      id: "failed",
      content: "Failed",
      accessibilityLabel: "ID check failed email content",
      panelID: "id-check-failed-email",
      fieldName: "emailContent.customer.check.failed",
      helpText:
        shop?.usagePlan === "lite"
          ? "This email is sent to the customer when their ID photos have been manually rejected."
          : "This email is sent to the customer when their ID photos have been manually rejected.",
    },
  ];
  console.log(emailsMenu[selectedEmailMenu].fieldName);
  return (
    <Card fullWidth>
      <Card.Section title="ID Check Content">
        <Tabs
          tabs={emailsMenu}
          selected={selectedEmailMenu}
          onSelect={setSelectedEmailMenu}
        />
        <Box my={4}>
          <TextContainer>
            <p className="ri-text-sm ri-text-gray-500">
              {emailsMenu[selectedEmailMenu].helpText}
            </p>
            <p
              onClick={() => {
                setShortcodesOpen(!shortcodesOpen);
              }}
              className="ri-text-sm ri-text-gray-500 ri-underline"
            >
              Use shortcodes to personalize the message with order details.
              <FaInfoCircle size="1em" style={{ marginLeft: "0.75em" }} />
            </p>
          </TextContainer>
          <Collapsible
            open={shortcodesOpen}
            id="shortcodes-collapsible"
            expandOnPrint
          >
            <DescriptionList
              items={[
                {
                  term: "[orderId]",
                  description: (
                    <TextContainer>
                      <p>The unique order ID number</p>
                      <p>
                        <TextStyle variation="subdued">
                          We recommend placing this early as possible in the
                          message so the customer knows the ID verification
                          message is associated with their order.
                        </TextStyle>
                      </p>
                    </TextContainer>
                  ),
                },
                {
                  term: "[firstName]",
                  description: "The customers first name",
                },
                {
                  term: "[lastName]",
                  description: "The customers last name",
                },
              ]}
            />
          </Collapsible>
        </Box>
        <Box my={4}>
          <TextField
            label="Email content"
            value={get(values, emailsMenu[selectedEmailMenu].fieldName)}
            onChange={(value) => {
              setFieldValue(emailsMenu[selectedEmailMenu].fieldName, value);
            }}
            multiline={5}
            helpText={
              selectedEmailMenu === 0 &&
              "The call to action button to start ID verification is automatically added to the email."
            }
            error={errors.defaultContent}
          />
        </Box>
      </Card.Section>
    </Card>
  );
}
