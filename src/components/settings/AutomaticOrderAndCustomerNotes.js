import React, { useState } from "react";
import {
  Layout,
  Card,
  Link,
  Collapsible,
  DescriptionList,
  FormLayout,
  TextStyle,
} from "@shopify/polaris";
import Toggle from "react-toggle";
import { Flex, Box } from "rebass";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";

export default function AutomaticOrderAndCustomerNotes({
  values,
  setFieldValue,
}) {
  const [openNoteDescriptions, setOpenNoteDescriptions] = useState(false);

  return (
    <Layout.AnnotatedSection
      title="Shopify Dashboard Order & Customer Updates"
      description={
        <>
          <p>
            By default, Real ID will add tags & notes to customers & orders that
            require ID verification.
          </p>
          <br />
          <p>
            Real ID will <strong>not</strong> interfere with other tags made by
            other apps.
          </p>
        </>
      }
    >
      <Card
        fullWidth
        title="Automatic notes on customers & orders during ID verification steps"
      >
        <Card.Section>
          <Box mb={4}>
            <Link
              onClick={() => {
                setOpenNoteDescriptions(!openNoteDescriptions);
              }}
            >
              The notes left automatically on orders & customers in the Shopify
              dashboard{" "}
              {openNoteDescriptions ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </Link>
            <Collapsible
              open={openNoteDescriptions}
              id="basic-collapsible"
              transition={{
                duration: "500ms",
                timingFunction: "ease-in-out",
              }}
              expandOnPrint
            >
              <DescriptionList
                items={[
                  {
                    term: "Delivered an ID check to the customer",
                    description:
                      "The ID check link was delivered to the customer by SMS or email or it was presented to them in the checkout order status page.",
                  },
                  {
                    term: "Customer opened the ID check",
                    description:
                      "The customer has opened the ID check link, either delivered by email, SMS or directly in the checkout order status page.",
                  },
                  {
                    term: "Customer uploaded their ID photo",
                    description:
                      "The customer has uploaded their ID photo and is available to view in the ID check details page within the app.",
                  },
                  {
                    term: "Customer uploaded their headshot photo",
                    description:
                      "The customer has uploaded their selfie photo and is available to view in the ID check details page within the app.",
                  },
                  {
                    term: "Customer completed ID verification",
                    description:
                      "The customer has successfully completed ID verification.",
                  },
                  {
                    term: "Customer failed ID verification",
                    description:
                      "The customer has failed ID verification. This could be from blurry images, inconsistencies from the customer or order to the ID detals, the customer is underage or is possibly fraudulent.",
                  },
                ]}
              />
            </Collapsible>
          </Box>
          <FormLayout>
            <Flex justifyContent="flex-start" alignItems="center">
              <Box my={2} mx={3} display="flex" alignItems="center">
                <Toggle
                  checked={!values.disableAutomaticNotes}
                  onChange={(e) => {
                    setFieldValue("disableAutomaticNotes", !e.target.checked);
                  }}
                />
              </Box>
              <Box>
                Automatically leave notes on customers & orders for ID
                verification events
              </Box>
            </Flex>
            <TextStyle variation="subdued">
              By default this option is enabled.
            </TextStyle>
          </FormLayout>
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
}
