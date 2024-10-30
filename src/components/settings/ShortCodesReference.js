import React, { useState } from "react";
import {
  TextContainer,
  Collapsible,
  TextStyle,
  DescriptionList,
} from "@shopify/polaris";
import { FaInfoCircle } from "react-icons/fa";
import { Box } from "rebass";

export default function ShortCodesReference({ additionalContent, my, mb }) {
  const [shortcodesOpen, setShortcodesOpen] = useState(false);
  return (
    <Box my={my || 4} mb={mb || 0}>
      <TextContainer>
        {additionalContent}
        <p
          onClick={() => {
            setShortcodesOpen(!shortcodesOpen);
          }}
          className="ri-text-sm ri-text-gray-500 ri-underline"
        >
          Use shortcodes to personalize the message with order details.
          <FaInfoCircle size="1em" style={{ marginLeft: "0.75em" }} />
        </p>
      </TextContainer>
      <Collapsible
        open={shortcodesOpen}
        id="shortcodes-collapsible"
        expandOnPrint
      >
        <DescriptionList
          items={[
            {
              term: "[orderId]",
              description: (
                <TextContainer>
                  <p>The unique order ID number</p>
                  <p>
                    <TextStyle variation="subdued">
                      We recommend placing this early as possible in the message
                      so the customer knows the ID verification message is
                      associated with their order.
                    </TextStyle>
                  </p>
                </TextContainer>
              ),
            },
            {
              term: "[firstName]",
              description: "The customers first name",
            },
            {
              term: "[lastName]",
              description: "The customers last name",
            },
          ]}
        />
      </Collapsible>
    </Box>
  );
}
