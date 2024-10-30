import React, { useState } from "react";
import { Flex, Box } from "rebass";
import {
  Card,
  Layout,
  TextContainer,
  ChoiceList,
  DataTable,
  Subheading,
  TextStyle,
  FormLayout,
  Checkbox,
  TextField,
  Banner,
  Link,
  Collapsible,
  Tabs,
} from "@shopify/polaris";
import IdCheckOption from "components/IdCheckOption";
import { AiOutlineIdcard } from "react-icons/ai";
import { BiFace } from "react-icons/bi";
import SignatureRequired from "components/checks/SignatureRequired";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import IdNameShippingName from "components/settings/IdCheckAdditionalRequirements/IdNameShippingName";
import NameSimilaritySensitivityControl from "./IdCheckAdditionalRequirements/NameSimilaritySensitivityControl";
import AllowedCaptureMethods from "./IdCheckAdditionalRequirements/AllowedCaptureMethods";
import MinimumOverallConfidence from "./IdCheckAdditionalRequirements/MinimumOverallConfidence";
import OrderStatusSyncing from "./IdCheckAdditionalRequirements/OrderStatusSyncing";
import { MdLocalShipping } from "react-icons/md";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import Toggle from "components/core/formik/Toggle";

export default function AdditionalCheckRequirements({
  values,
  setFieldValue,
  shop,
  errors,
}) {
  const [crossCheckHelpOpened, setCrossCheckHelpOpened] = useState(false);
  const [selected, setSelected] = useState(0);
  const tabs = [
    {
      id: "billing-to-id-consistency-check",
      content: (
        <Flex alignItems="center">
          <BsFillCreditCard2FrontFill style={{ marginRight: "5px" }} />
          <span>Billing Details</span>
        </Flex>
      ),
      accessibilityLabel: "Customer Billing to ID consistency checks",
      panelID: "billing-to-id-consistency-check-1",
    },
    {
      id: "shipping-to-id-consistency-check",
      content: (
        <Flex alignItems="center">
          <MdLocalShipping style={{ marginRight: "5px" }} />
          <span>Shipping Details</span>
        </Flex>
      ),
      accessibilityLabel: "Customer shipping to ID consistency checks",
      panelID: "shipping-to-id-consistency-check-1",
    },
  ];

  return (
    <Layout.AnnotatedSection
      title="Additional ID Check Requirements"
      description={
        <>
          <p>Require additional personal information during the ID check.</p>
        </>
      }
    >
      <Card fullWidth={true}>
        <SubscriptionGateway permission="idv_check_type" minimumPlan="Plus">
          <Card.Section title="ID Photo Requirements">
            <Flex>
              <IdCheckOption
                selected={values.idCheckType === "id"}
                onClick={() => {
                  setFieldValue("idCheckType", "id");
                }}
                title="ID Only"
                icons={<AiOutlineIdcard />}
                subtitle="More convenient"
                helperText="Only require a photo of the customer's valid ID. The ID will be scanned for authenticity."
              />
              <IdCheckOption
                selected={values.idCheckType === "idv"}
                onClick={() => {
                  setFieldValue("idCheckType", "idv");
                }}
                icons={
                  <Flex alignItems="center" justifyContent="center" width={0.5}>
                    <AiOutlineIdcard />
                    <TextStyle variation="subdued">+</TextStyle>
                    <BiFace />
                  </Flex>
                }
                title="ID and Headshot"
                subtitle="More secure"
                helperText="The face in the headshot will be cross referenced with the face photo on the ID document. Also includes the ID authenticity scan."
              />
            </Flex>
            <Box mt={4}>
              <Toggle
                field="includeBackId"
                label={<>Capture the back of the customer's ID.</>}
              />
            </Box>
          </Card.Section>
        </SubscriptionGateway>
        <AllowedCaptureMethods />
        <SubscriptionGateway permission="age_requirements" minimumPlan="Plus">
          <Card.Section title="Age Requirements">
            <Box my={2}>
              <TextContainer spacing="tight">
                <TextStyle variation="subdued">
                  If your products are age restricted, you can have Real ID
                  enforce a minimum age to pass ID verification.
                </TextStyle>
                <p>
                  <TextStyle variation="subdued">
                    You'll be alerted if a customer is underage.
                  </TextStyle>
                </p>
              </TextContainer>
            </Box>
            {shop.subscriptionPlan === "lite" && (
              <Banner status="warning">
                <TextContainer spacing="loose">
                  <p>
                    Automatic ID to order consistency checks are only available
                    with the A.I. plan.
                  </p>
                  <p>You can change your plan at any time.</p>
                </TextContainer>
              </Banner>
            )}
            <ChoiceList
              title="Minimum age to pass an ID check"
              choices={[
                {
                  label: "No minimum age requirement",
                  value: "disabled",
                },
                {
                  label: "18",
                  value: "18",
                },
                {
                  label: "21",
                  value: "21",
                },
                {
                  label: "Other age",
                  value: "other",
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <TextField
                        type="number"
                        error={errors.minimumAge}
                        suffix="years old"
                        value={
                          values.minimumAge == "other"
                            ? ""
                            : values.minimumAge + ""
                        }
                        onChange={(value) => {
                          setFieldValue("minimumAge", value);
                        }}
                      />
                    ),
                },
                {
                  label: "Canadian and U.S. Legal Smoking Ages",
                  value: "legal_canadian_smoking_ages",
                  renderChildren: (isSelected) =>
                    isSelected && (
                      <Box my={2}>
                        <Box my={2}>
                          <p>
                            Below are the age minimums that will be enforced for
                            each Canadian province and the U.S.
                          </p>
                        </Box>
                        <Subheading element="h2">
                          Canadian Tobacco Purchase Age Restrictions
                        </Subheading>
                        <DataTable
                          columnContentTypes={["text", "numeric"]}
                          headings={["Province", "Minimum Age"]}
                          rows={[
                            ["Alberta", "18+"],
                            ["British Columbia", "19+"],
                            ["Manitoba", "18+"],
                            ["Ontario", "19+"],
                            ["Prince Edward Island", "21+"],
                            ["Quebec", "18+"],
                            ["Saskatchewan", "18+"],
                            ["New Brunswick", "19+"],
                            ["Newfoundland and Labrador", "19+"],
                            ["Northwest Territories", "18+"],
                            ["Nova Scotia", "19+"],
                            ["Nunavut", "18+"],
                            ["Yukon Territories", "18+"],
                          ]}
                        />
                        <Box my={2}>
                          <Subheading element="h2">
                            United States Tobacco Purchase Age Restrictions
                          </Subheading>
                          <DataTable
                            columnContentTypes={["text", "numeric"]}
                            headings={["State", "Minimum Age"]}
                            rows={[["All States", "21+"], ,]}
                          />
                        </Box>
                        <TextStyle variation="subdued">
                          All other countries will not be checked for an age
                          minimum.
                        </TextStyle>
                      </Box>
                    ),
                },
              ]}
              disabled={shop.subscriptionPlan === "lite"}
              // const ageRequirementSelection = useMemo(() => {
              //   if (!minimumAgeEnabled) {
              //     return "disabled";
              //   }

              //   if ([18, 21].includes(parseInt(minimumAge))) {
              //     // convert to a string so the textfield works proper
              //     return [minimumAge + ""];
              //   }

              //   if (minimumAge === "legal_canadian_smoking_ages") {
              //     return "legal_canadian_smoking_ages";
              //   }

              //   return "other";
              // }, [minimumAge, minimumAgeEnabled]);
              selected={
                shop.subscriptionPlan === "lite"
                  ? "disabled"
                  : (() => {
                      if (!values.minimumAgeEnabled) {
                        return "disabled";
                      }
                      if ([18, 21].includes(parseInt(values.minimumAge))) {
                        // convert to a string so the textfield works proper
                        return [values.minimumAge + ""];
                      }
                      if (values.minimumAge === "legal_canadian_smoking_ages") {
                        return "legal_canadian_smoking_ages";
                      }
                      return "other";
                    })() //ageRequirementSelection
              }
              onChange={([choice]) => {
                if (choice == "disabled") {
                  setFieldValue("minimumAgeEnabled", false);
                  setFieldValue("minimumAge", "disabled");
                  return;
                }

                // if (choice == "other") {
                //   setFieldValue("minimumAge", "other");
                //   // don't `return` here because we need to set the minimumAgeEnabled to true
                // }

                // if (choice == "legal_canadian_smoking_ages") {
                //   setFieldValue(
                //     "minimumAge",
                //     "legal_canadian_smoking_ages"
                //   );
                //   // don't `return` here because we need to set the minimumAgeEnabled to true
                // }

                setFieldValue("minimumAge", choice.toString());
                setFieldValue("minimumAgeEnabled", true);
              }}
            />
          </Card.Section>
        </SubscriptionGateway>
        <SubscriptionGateway
          permission="id_to_order_consistency_checks"
          minimumPlan="Starter"
        >
          <Card.Section title="ID to Order consistency checks">
            <Box my={3}>
              <TextContainer spacing="loose">
                <TextStyle variation="subdued">
                  Automatically reject IDs for orders that have mismatching
                  details. This will help reduce fraud by ensuring the
                  customer's supplied ID matches the personal information on the
                  order.
                </TextStyle>
              </TextContainer>
              <TextContainer>
                <TextStyle variation="subdued">
                  <p>
                    <Link
                      onClick={() =>
                        setCrossCheckHelpOpened(!crossCheckHelpOpened)
                      }
                    >
                      Which data points are compared?
                    </Link>
                  </p>
                  <Box my={3}>
                    <Collapsible open={crossCheckHelpOpened}>
                      <TextContainer spacing="loose">
                        <p>
                          The order's <strong>Billing Address</strong>,{" "}
                          <strong>Shipping Address</strong> are included
                          respectfully in each of these checks below.
                        </p>
                        <p>
                          For example, if the customer's billing address does
                          not match the address on their license, then the ID
                          check will fail.
                        </p>
                      </TextContainer>
                    </Collapsible>
                  </Box>
                </TextStyle>
              </TextContainer>
              {shop.subscriptionPlan === "lite" && (
                <Banner status="warning">
                  <TextContainer spacing="loose">
                    <p>
                      Automatic ID to order consistency checks are only
                      available with the A.I. plan.
                    </p>
                    <p>You can change your plan at any time.</p>
                  </TextContainer>
                </Banner>
              )}
              <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
                {selected == 0 && (
                  <Box mt={3}>
                    {/* <Flex mt={4} justifyContent="center">
                      <Box width={400}>
                        <CrossCheckLastNameIcon />
                      </Box>
                    </Flex> */}
                    <Checkbox
                      label={
                        <>
                          Require the <strong>name on the ID</strong> match the{" "}
                          <strong>customer's name</strong> on the{" "}
                          <strong>billing address</strong>
                        </>
                      }
                      disabled={shop.subscriptionPlan === "lite"}
                      checked={
                        shop.subscriptionPlan === "lite"
                          ? false
                          : values.crossCheckCustomerLastName
                      }
                      onChange={(checked) => {
                        setFieldValue("crossCheckCustomerLastName", checked);
                      }}
                    />
                    {values?.crossCheckCustomerLastName && (
                      <NameSimilaritySensitivityControl
                        value={values?.crossCheckNameThreshold * 100}
                        onChange={(value) => {
                          setFieldValue("crossCheckNameThreshold", value / 100);
                        }}
                      />
                    )}
                    <Checkbox
                      label={
                        <>
                          Require the <strong>address on the ID</strong> match
                          the <strong>order's billing address</strong>
                        </>
                      }
                      helpText={
                        <TextContainer>
                          <p>
                            Only accept ID documents that match the order's
                            billing address.{" "}
                          </p>
                          <p>
                            Some documents such as passports only include the
                            state & country fields. We'll use the most specific
                            details available on the ID document & shipping
                            address to make a match.
                          </p>
                        </TextContainer>
                      }
                      disabled={shop.subscriptionPlan === "lite"}
                      checked={
                        shop.subscriptionPlan === "lite"
                          ? false
                          : values.crossCheckBillingAddress
                      }
                      onChange={(checked) => {
                        setFieldValue("crossCheckBillingAddress", checked);
                      }}
                    />
                  </Box>
                )}
                {selected == 1 && (
                  <Box mt={3}>
                    <IdNameShippingName
                      shop={shop}
                      values={values}
                      setFieldValue={setFieldValue}
                    />
                    <Checkbox
                      label={
                        <>
                          Require the <strong>address on the ID</strong> match
                          the <strong>order's shipping address</strong>
                        </>
                      }
                      helpText={
                        <TextContainer>
                          <p>
                            Only accept ID documents that match the order's
                            shipping address.{" "}
                          </p>
                          <p>
                            Some documents such as passports only include the
                            state & country fields. We'll use the most specific
                            details available on the ID document & shipping
                            address to make a match.
                          </p>
                        </TextContainer>
                      }
                      disabled={shop.subscriptionPlan === "lite"}
                      checked={
                        shop.subscriptionPlan === "lite"
                          ? false
                          : values.crossCheckShippingAddress
                      }
                      onChange={(checked) => {
                        setFieldValue("crossCheckShippingAddress", checked);
                      }}
                    />
                  </Box>
                )}
              </Tabs>
            </Box>
          </Card.Section>
        </SubscriptionGateway>
        <SubscriptionGateway permission="e_signatures" minimumPlan="Starter">
          <Card.Section>
            <SignatureRequired
              shop={shop}
              label="Require the customer signature to complete an ID check"
              checked={values.signatureRequired}
              setChecked={(checked) => {
                setFieldValue("signatureRequired", checked);
              }}
            />
          </Card.Section>
        </SubscriptionGateway>
        <SubscriptionGateway
          permission={"remember_repeat_customers"}
          // permissions={[
          //   "remember_repeat_customers",
          //   "exceptions.remember_repeat_customers",
          // ]}
          minimumPlan="Starter"
        >
          <Card.Section>
            <MinimumOverallConfidence />
          </Card.Section>
        </SubscriptionGateway>
      </Card>
    </Layout.AnnotatedSection>
  );
}
