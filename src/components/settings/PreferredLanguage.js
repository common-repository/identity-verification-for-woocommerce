import React from "react";
import { Card, Select } from "@shopify/polaris";
import { useFormikContext } from "formik";

export default function PreferredLanguage() {
  const { values, setFieldValue } = useFormikContext();
  const locales = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "German", value: "de" },
    { label: "French", value: "fr" },
    { label: "Portuguese", value: "pt" },
    { label: "Italian", value: "it" },
    { label: "Dutch", value: "nl" },
  ];
  return (
    <>
      <br />
      <Card title="Language Preferences" sectioned>
        <Select
          label="Preferred language"
          options={locales}
          onChange={(value) => {
            setFieldValue("preferredLocale", value);
          }}
          value={values.preferredLocale}
          helpText={
            <p>
              Choose the language of the verification flow for your customers.
            </p>
          }
        />
      </Card>
    </>
  );
}
