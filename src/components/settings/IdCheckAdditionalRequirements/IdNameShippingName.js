import React from "react";
import {
  Banner,
  TextContainer,
  Checkbox,
  Button,
  FormLayout,
  RangeSlider,
} from "@shopify/polaris";
import { Box, Flex } from "rebass";
import CrossCheckAddressIcon from "assets/cross_check_shipping_address.svg";
import NameSimilaritySensitivityControl from "./NameSimilaritySensitivityControl";

export default function IdNameShippingName({ shop, values, setFieldValue }) {
  return (
    <>
      {/* <Flex mt={4} justifyContent="center">
        <Box width={400}>
          <CrossCheckAddressIcon />
        </Box>
      </Flex> */}
      <Checkbox
        label={
          <>
            Require the <strong>name on the ID</strong> match the{" "}
            <strong>customer's name</strong> on the{" "}
            <strong>shipping address</strong>
          </>
        }
        disabled={shop.subscriptionPlan === "lite"}
        checked={
          shop.subscriptionPlan === "lite"
            ? false
            : values.crossCheckShippingCustomerLastName
        }
        onChange={(checked) => {
          setFieldValue("crossCheckShippingCustomerLastName", checked);
        }}
      />
      {values?.crossCheckShippingCustomerLastName && (
        <NameSimilaritySensitivityControl
          value={values?.crossCheckNameThreshold * 100}
          onChange={(value) => {
            setFieldValue("crossCheckNameThreshold", value / 100);
          }}
        />
      )}
    </>
  );
}
