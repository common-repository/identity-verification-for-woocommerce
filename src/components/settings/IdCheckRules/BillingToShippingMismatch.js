import React from "react";
import { Flex, Box } from "rebass";
import { useFormikContext } from "formik";
import Toggle from "react-toggle";

export default function BillingToShippingMismatch() {
  const { values, setFieldValue } = useFormikContext();

  return (
    <Flex justifyContent="flex-start" alignItems="center">
      <Box my={4} mx={3} display="flex" alignItems="center">
        <Toggle
          checked={values.shippingBillingAddressMismatchEnabled}
          onChange={(e) => {
            setFieldValue(
              "shippingBillingAddressMismatchEnabled",
              e.target.checked
            );
          }}
        />
      </Box>
      <Box width={0.8}>
        <p>
          Require ID verification for orders that the{" "}
          <strong>Billing Address</strong> does not match the{" "}
          <strong>Shipping Address</strong>.
        </p>
      </Box>
    </Flex>
  );
}
