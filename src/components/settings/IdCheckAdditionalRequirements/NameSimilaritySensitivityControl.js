import React from "react";
import { Tooltip, TextStyle } from "@shopify/polaris";
import { Box } from "rebass";
import { RangeSlider } from "@shopify/polaris";
import { BsShieldFillX } from "react-icons/bs";
import { FaInfoCircle } from "react-icons/fa";

export default function NameSimilaritySensitivityControl({ onChange, value }) {
  return (
    <Box width={0.6} mx={4} mt={3} mb={4}>
      <RangeSlider
        output={false}
        label={
          <span className="ri-text-lg font-semibold">
            Name Similarity Sensitivity
          </span>
        }
        min={10}
        max={100}
        step={10}
        prefix={<p>More lenient</p>}
        suffix={<p>More strict</p>}
        value={value}
        onChange={onChange}
      />
      <div className="ri-flex ri-items-center ri-text-sm ri-text-gray-500 ri-mt-3 ri-mb-3">
        <BsShieldFillX size="1em" style={{ marginRight: "0.75em" }} />
        Will block IDs with a name matching score of &nbsp;
        <span className="ri-font-semibold">{value}%</span>
      </div>
      <Tooltip
        content="Fuzzy matching attempts to match names in cases such as matching nicknames or shortened names. Matching John to Johnathon, or Jenn to Jennifer, etc."
        dismissOnMouseOut
      >
        <div className="ri-flex ri-items-center ri-text-sm ri-text-gray-500 ri-mt-3 ri-mb-3">
          <FaInfoCircle size="1em" style={{ marginRight: "0.75em" }} />
          <span className="ri-underline">
            Uses fuzzy matching to compare names.
          </span>
        </div>
      </Tooltip>
    </Box>
  );
}
