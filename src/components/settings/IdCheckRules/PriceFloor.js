import React from "react";
import { Flex, Box } from "rebass";
import { useFormikContext } from "formik";
import Toggle from "react-toggle";
import { TextField } from "@shopify/polaris";

export default function PriceFloor() {
  const { values, setFieldValue, handleBlur, errors } = useFormikContext();

  return (
    <Flex justifyContent="flex-start">
      <Box my={4} mx={3} display="flex" alignItems="center">
        <Toggle
          checked={values.priceFloorEnabled}
          onChange={(e) => {
            setFieldValue("priceFloorEnabled", e.target.checked);
          }}
        />
      </Box>
      <Flex justifyContent="space-around" alignItems="center" width={0.8}>
        Require ID verification for orders above&nbsp;
        <Box width={0.3}>
          <TextField
            inputMode="numeric"
            min={0}
            type="number"
            value={values.priceFloor.toString()}
            onChange={(value) => {
              setFieldValue("priceFloor", value);
            }}
            onBlur={handleBlur}
            error={errors.priceFloor}
            name="priceFloor"
            prefix="$"
          />
        </Box>
      </Flex>
    </Flex>
  );
}
