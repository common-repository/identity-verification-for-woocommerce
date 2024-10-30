import React from "react";
import { useFormikContext } from "formik";
import { Card, ChoiceList } from "@shopify/polaris";

export default function CustomerRoles() {
  const { values, setFieldValue } = useFormikContext();

  return (
    <Card.Section title="Customer Roles">
      <p className="ri-my-4 ri-gray-600">
        Require ID verification for any new accounts with the following roles.
      </p>
      <ChoiceList
        allowMultiple
        titleDisabled
        selected={values.idRequiredCustomerRoles || []}
        onChange={(v) => setFieldValue("idRequiredCustomerRoles", v)}
        choices={[
          {
            label: "Customer",
            value: "customer",
            helpText: "WooCommerce customer accounts",
          },
          {
            label: "Vendor",
            value: "vendor",
            helpText: "Vendor accounts.",
          },
          {
            label: "Seller",
            value: "seller",
            helpText: "Seller accounts.",
          },
        ]}
      />
    </Card.Section>
  );
}
