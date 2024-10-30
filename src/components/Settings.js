import {
  Page,
  Layout,
  ContextualSaveBar,
  Tabs,
  Banner,
  Card,
} from "@shopify/polaris";
import React, { useEffect, useState, useContext } from "react";
import { Formik } from "formik";
import { useToast } from "providers/ToastProvider";
import { useShop } from "providers/ShopProvider";
import { Flex, Box } from "rebass";
import { updateSettings as callUpdateSettings } from "services/wpApi";
import * as yup from "yup";
import IdCheckAppearance from "components/settings/IdCheckAppearance";
import AdditionalCheckRequirements from "components/settings/AdditionalCheckRequirements";
import IdCheckNotificationsSettings from "components/settings/IdCheckNotificationSettings";
import TermsAndConditions from "components/settings/TermsAndConditions";
import Billing from "components/settings/Billing";
import {
  FcSettings,
  FcClearFilters,
  FcEditImage,
  FcAbout,
  FcMoneyTransfer,
  FcShop,
} from "react-icons/fc";
import DeactivateLicenseKey from "components/settings/DeactivateLicenseKey";
import Triggers from "components/settings/v2/Flows";
import OrderStatusSyncing from "./settings/IdCheckAdditionalRequirements/OrderStatusSyncing";
import getDefaultValues from "./settings/getDefaultValues";

export default function Settings() {
  const setToast = useToast();
  const { shop, setShop } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  function updateSettings(values, setSubmitting) {
    setSubmitting(true);
    callUpdateSettings(values)
      .then(({ data }) => {
        setSubmitting(false);
        setShop(data);
      })
      .catch((err) => {
        Sentry.captureException(err);
        setToast(
          "Unable to update your shop settings. Please contact support."
        );
        setSubmitting(false);
      });
  }

  const tabs = [
    {
      id: "automatic-triggers",
      content: (
        //#637381
        <Flex alignItems="center">
          <FcSettings style={{ marginRight: "5px" }} />
          <span>Triggers</span>
        </Flex>
      ),
      accessibilityLabel: "Automatic ID triggers",
      panelID: "automatic-triggers-content-1",
    },
    {
      id: "appearance",
      content: (
        //#637381

        <Flex alignItems="center">
          <FcEditImage style={{ marginRight: "5px" }} />
          <span>Appearance</span>
        </Flex>
      ),
      accessibilityLabel: "ID check appearance",
      panelID: "Appearance",
    },
    {
      id: "automatic-rules",
      content: (
        //#637381
        <Flex alignItems="center">
          <FcClearFilters style={{ marginRight: "5px" }} />
          <span>Rules</span>
        </Flex>
      ),
      accessibilityLabel: "Automatic ID rules",
      panelID: "automatic-rules-content-1",
    },
    {
      id: "notifications",
      content: (
        //#637381

        <Flex alignItems="center">
          <FcAbout style={{ marginRight: "5px" }} />
          <span>Notifications</span>
        </Flex>
      ),
      accessibilityLabel: "Notifications on ID checks",
      panelID: "automatic-notifications-content-1",
    },
    {
      id: "woocommerce",
      content: (
        //#637381
        <Flex alignItems="center">
          <FcShop style={{ marginRight: "5px" }} />
          <span>WooCommerce</span>
        </Flex>
      ),
      accessibilityLabel: "WooCommerce details",
      panelID: "woocommerce-settings-content-1",
    },
    {
      id: "billing",
      content: (
        //#637381
        <Flex alignItems="center">
          <FcMoneyTransfer style={{ marginRight: "5px" }} />
          <span>Billing</span>
        </Flex>
      ),
      accessibilityLabel: "Billing details",
      panelID: "automatic-billing-content-1",
    },
  ];

  return (
    <>
      <Page>
        {Array.isArray(shop?.settings?.deliveryMethods) &&
          shop?.settings?.deliveryMethods.includes("checkout") &&
          !shop?.settings?.automaticRemindersEnabled && (
            <Banner
              status="info"
              title="Automatically reminder customers"
              // tab #3 contains notification settings
              action={{
                content: "Schedule reminders",
                onAction: () => setSelectedTab(3),
              }}
            >
              <p>
                Increase verification rates and save time by setting up a
                reminder schedule.
              </p>
              <p>
                Set up a schedule to remind customers to finish their ID checks.
              </p>
            </Banner>
          )}
        <Tabs
          tabs={tabs}
          selected={selectedTab}
          onSelect={(tab) => setSelectedTab(tab)}
        >
          <Box pt={3}>
            <Formik
              enableReinitialize
              initialValues={getDefaultValues(shop)}
              validationSchema={yup.object().shape({
                priceFloor: yup
                  .number()
                  .min(0)
                  .when("priceFloorEnabled", {
                    is: true,
                    then: yup.number().required("A price is required"),
                  }),
                // minimumAge: yup
                // .string()
                // .matches(
                //   /(disabled|legal_canadian_smoking_ages|21|18|\d+)/,
                //   "A valid age is required"
                // ) // weird stuff with the regex based rule, it doesn't seem to work properly
                // .required(),
                // more weird stuff, an empty string causes this to break
                // contactEmails: yup
                //   .array()
                //   .of(
                //     yup.string().email().required("A valid email is required")
                //   ),
              })}
              onSubmit={(values, { setSubmitting }) => {
                updateSettings(values, setSubmitting);
              }}
            >
              {({
                values,
                errors,
                dirty,
                handleBlur,
                handleSubmit,
                isSubmitting,
                isValid,
                resetForm,
                setFieldValue,
              }) => {
                return (
                  <Layout>
                    {selectedTab === 0 && <Triggers />}
                    {selectedTab === 1 && (
                      <IdCheckAppearance
                        values={values}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        errors={errors}
                        shop={shop}
                      />
                    )}

                    {selectedTab === 2 && (
                      <AdditionalCheckRequirements
                        values={values}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        errors={errors}
                        shop={shop}
                      />
                    )}
                    {selectedTab === 3 && (
                      <>
                        <IdCheckNotificationsSettings />
                      </>
                    )}
                    {selectedTab === 4 && (
                      <Layout.AnnotatedSection
                        title="WooCommerce Integration Settings"
                        description={
                          <>
                            <p>
                              Customize how ID checks synchronize with
                              WooCommerce.
                            </p>
                          </>
                        }
                      >
                        <Card fullWidth={true}>
                          <OrderStatusSyncing />
                        </Card>
                      </Layout.AnnotatedSection>
                    )}
                    {selectedTab === 5 && (
                      <>
                        <Billing shop={shop} />
                        {!shop.sandboxMode && shop.licenseKey && (
                          <DeactivateLicenseKey />
                        )}
                        <TermsAndConditions />
                      </>
                    )}
                    {dirty && (
                      <>
                        <style jsx>{`
                          .Polaris-Frame__ContextualSaveBar {
                            top: 32px;
                          }
                        `}</style>

                        <ContextualSaveBar
                          message={
                            isValid
                              ? "Unsaved changes"
                              : Object.values(errors)[0]
                          }
                          fullWidth
                          alignContentFlush={false}
                          discardAction={{
                            content: "Discard",
                            onAction: resetForm,
                          }}
                          saveAction={{
                            content: "Save",
                            onAction: handleSubmit,
                            loading: isSubmitting,
                            disabled: !isValid,
                          }}
                        />
                      </>
                    )}
                  </Layout>
                );
              }}
            </Formik>
          </Box>
        </Tabs>
      </Page>
    </>
  );
}
