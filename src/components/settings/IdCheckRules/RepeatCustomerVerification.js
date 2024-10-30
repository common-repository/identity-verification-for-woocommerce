import React from "react";
import { useFormikContext } from "formik";
import { Card, Banner, Badge, Checkbox, TextContainer } from "@shopify/polaris";
import { Flex } from "rebass";

import { HiQuestionMarkCircle } from "react-icons/hi";

const Label = () => <div></div>;

export default function RepeatCustomerVerification({ disabled, checked }) {
  const { values, setFieldValue } = useFormikContext();

  return (
    <Card.Section>
      <Flex justifyContent="space-between" alignItems="center">
        <Checkbox
          label="Only require customers to complete ID verification once"
          helpText="Enabling this option will keep repeat customers from verifying on each order that triggers the automatic rules"
          checked={checked || values.uniqueCustomersOnlyEnabled}
          disabled={disabled}
          onChange={(checked) => {
            setFieldValue("uniqueCustomersOnlyEnabled", checked);
          }}
        />
      </Flex>
      <Banner status="info">
        <TextContainer spacing="loose">
          <p>
            A customer will be considered verified by Real ID if they have the
            Real ID metadata set to <Badge>completed</Badge> on their
            WooCommerce profile.
          </p>
          <p>
            The app automatically updates the customer profile when the customer
            passes their ID verification check, or manually approve it.
          </p>
        </TextContainer>
      </Banner>
    </Card.Section>
  );
}
