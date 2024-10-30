import React from "react";
import { Flex, Box } from "rebass";
import Toggle from "react-toggle";
import { useFormikContext } from "formik";

export default function CheckAllOrders({ checked, onChange }) {
  const { values, setFieldValue } = useFormikContext();

  return (
    <Flex justifyContent="flex-start" alignItems="center">
      <Box my={4} mx={3} display="flex" alignItems="center">
        <Toggle
          checked={values.checkAllOrders}
          onChange={(e) => {
            setFieldValue("checkAllOrders", e.target.checked);
          }}
        />
      </Box>
      <Box>Require ID verification for all orders</Box>
    </Flex>
  );
}
