import React from "react";
import { Flex, Box } from "rebass";
import { useFormikContext } from "formik";
import Toggle from "react-toggle";

export default function ToggleField({ field, label }) {
  const { values, setFieldValue } = useFormikContext();

  return (
    <Flex justifyContent="flex-start" alignItems="center">
      <Box my={2} mx={3} display="flex" alignItems="center">
        <Toggle
          checked={values[field]}
          onChange={(e) => {
            setFieldValue(field, e.target.checked);
          }}
        />
      </Box>
      <Box width={0.8}>
        <p>{label}</p>
      </Box>
    </Flex>
  );
}
