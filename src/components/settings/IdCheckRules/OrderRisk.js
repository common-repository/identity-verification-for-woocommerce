import React from "react";
import { useFormikContext } from "formik";
import { Flex, Box } from "rebass";
import { ChoiceList, TextStyle, Badge } from "@shopify/polaris";
import Toggle from "react-toggle";

export default function OrderRisk() {
  const { values, setFieldValue } = useFormikContext();

  return (
    <>
      <Flex justifyContent="flex-start" alignItems="center">
        <Box my={4} mx={3} display="flex" alignItems="center">
          <Toggle
            checked={values.orderRiskLevelsEnabled}
            onChange={(e) => {
              setFieldValue("orderRiskLevelsEnabled", e.target.checked);
            }}
          />
        </Box>
        <Box width={0.8}>
          <p>
            Require ID verification on the <strong>risk level</strong> of
            orders.
          </p>
        </Box>
      </Flex>

      {values.orderRiskLevelsEnabled && (
        <Box marginLeft={5} my={3}>
          <ChoiceList
            allowMultiple
            title=""
            choices={[
              {
                label: <Badge status="warning">Medium Risk</Badge>,
                value: "medium",
              },
              {
                label: <Badge status="critical">High Risk</Badge>,
                value: "high",
              },
            ]}
            selected={values.orderRiskLevels}
            onChange={(orderRiskLevels) => {
              setFieldValue("orderRiskLevels", orderRiskLevels);
            }}
          />
          <TextStyle variation="subdued">
            Ratings are provided by Shopify or 3rd party anti-fraud apps
            installed on your store.
          </TextStyle>
        </Box>
      )}
    </>
  );
}
