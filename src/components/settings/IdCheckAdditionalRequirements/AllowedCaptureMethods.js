import React from "react";
import { Card, TextContainer, TextStyle, ChoiceList } from "@shopify/polaris";
import { Box } from "rebass";
import { useFormikContext } from "formik";

export default function AllowedCaptureMethods() {
  const { values, setFieldValue, errors, onBlur } = useFormikContext();

  return (
    <Card.Section title="Capture Settings">
      <Box my={2}>
        <TextContainer spacing="tight">
          <TextStyle variation="subdued">
            Control if the customer is allowed upload their ID photos from
            files, or they are required to use their devices camera.
          </TextStyle>
          <p>
            <TextStyle variation="subdued">
              Disabling file uploads will increase security by requiring the
              customer to use their actual phone with a live photo of their
              document{values?.idCheckType === "idv" ? " and selfie" : ""}.
            </TextStyle>
          </p>
        </TextContainer>
      </Box>
      {errors?.allowedCaptureMethods && (
        <div className="ri-block ri-text-rose-500 ri-my-4 ri-py-3 ri-px-2 ri-bg-rose-200">
          Need to select at least one to allow customers to capture their
          photos.
        </div>
      )}
      <ChoiceList
        onBlur={onBlur}
        title="Allowed capture methods"
        choices={[
          {
            label: "Device camera (phone or webcam)",
            value: "camera",
          },
          {
            label: "Upload image files",
            value: "upload",
          },
        ]}
        selected={values.allowedCaptureMethods}
        onChange={(choices) => {
          setFieldValue("allowedCaptureMethods", choices);
        }}
        allowMultiple={true}
      />
    </Card.Section>
  );
}
