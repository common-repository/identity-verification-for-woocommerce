import * as React from "react";
import { Box } from "rebass";
import useShop from "hooks/useShop";
import { useFormikContext } from "formik";
import { Tooltip, TextStyle, RangeSlider } from "@shopify/polaris";
import { BsShieldFillX } from "react-icons/bs";
import { FaInfoCircle } from "react-icons/fa";
import { TbGauge } from "react-icons/tb";

export default function MinimumOverallConfidence() {
  const { shop } = useShop();
  const { values, setFieldValue } = useFormikContext();

  return (
    <Box width={0.8} mx={4} mt={3} mb={4}>
      <TbGauge className="ri-text-4xl ri-text-gray-600" />
      <h2 className="ri-text-lg ri-font-semibold ri-text-gray-700">
        Minimum Overall Confidence
      </h2>
      <p className="ri-text-gray-600 ri-text-base ri-my-6 ">
        Adjust the minimum overall confidence to your risk profile. The lowest
        score of the ID, headshot and face match scores must pass the minimum
        confidence threshold in order to pass automatically.
      </p>
      <RangeSlider
        output={false}
        label={<span className="ri-text-lg font-semibold">Confidence</span>}
        min={60}
        max={95}
        step={5}
        prefix={<p>More lenient</p>}
        suffix={<p>More strict</p>}
        value={values.customConfidenceThreshold * 100}
        onChange={(value) =>
          setFieldValue("customConfidenceThreshold", value / 100)
        }
      />
      <Tooltip
        content="All individual scores of the ID, headshot and face match must meet the minimum confidence threshold in order to pass automatically."
        dismissOnMouseOut
      >
        <div className="ri-flex ri-items-center ri-text-sm ri-text-gray-500 ri-mt-3 ri-mb-3">
          <BsShieldFillX size="1em" style={{ marginRight: "0.75em" }} />
          Approve ID checks above &nbsp;
          <span className="ri-font-semibold">
            {values.customConfidenceThreshold * 100}%
          </span>
          &nbsp; confidence
        </div>
        <div
          className="ri-underline ri-text-gray-500"
          onClick={() => setFieldValue("customConfidenceThreshold", 0.9)}
        >
          Reset to default
        </div>
      </Tooltip>
    </Box>
  );
}
