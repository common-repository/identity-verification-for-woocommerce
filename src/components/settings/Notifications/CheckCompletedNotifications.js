import React from "react";
import {
  Layout,
  Card,
  TextContainer,
  FormLayout,
  TextField,
  TextStyle,
} from "@shopify/polaris";
import get from "lodash/get";
import without from "lodash/without";
import { useFormikContext } from "formik";

export default function IdCheckNotificationSettings() {
  const { values, setFieldValue, errors } = useFormikContext();

  return (
    <Layout.AnnotatedSection
      title="ID Check Notifications"
      description={
        <>
          <p>
            These email addresses will receive notifications when customers
            complete ID checks.
          </p>
          <br />
          <p>
            Add your team members emails to keep them updated when customers
            pass or fail ID checks.
          </p>
        </>
      }
    >
      <Card
        fullWidth
        title="Email Addresses"
        primaryFooterAction={{
          content: "Add email",
          onAction: () => {
            setFieldValue("contactEmails", [...values.contactEmails, ""]);
          },
        }}
      >
        <Card.Section>
          <p className="ri-my-3">
            <TextStyle variation="subdued">
              When an ID check is completed, an emails will be will be sent to
              these email addresses
            </TextStyle>
          </p>
          {values.contactEmails.map((contactEmail, i) => (
            <FormLayout key={i}>
              <TextField
                label="Email"
                type="email"
                error={get(errors, `contactEmails[${i}]`)}
                value={contactEmail}
                onChange={(value) => {
                  setFieldValue(`contactEmails[${i}]`, value);
                }}
                clearButton={i != 0}
                onClearButtonClick={(email) => {
                  const newContactEmails = without(
                    values.contactEmails,
                    values.contactEmails[i]
                  );
                  console.log(newContactEmails);
                  setFieldValue("contactEmails", newContactEmails);
                }}
              />
            </FormLayout>
          ))}
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
}
