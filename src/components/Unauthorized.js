import {
  Page,
  Layout,
  Heading,
  Card,
  TextField,
  Button,
  Banner,
} from "@shopify/polaris";
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import {
  activateLicense,
  resetToSandboxMode,
  getCurrentLicenseKey,
} from "../services/wpApi";
import { useShop } from "../providers/ShopProvider";
import { useToast } from "../providers/ToastProvider";

export default function Unauthorized({ props }) {
  const { setShop } = useShop();
  const [currentLicenseKey, setCurrentLicenseKey] = useState("");
  const [sandboxMode, setSandboxMode] = useState(false);
  const setToast = useToast();

  useEffect(async () => {
    try {
      const { data } = await getCurrentLicenseKey();
      setCurrentLicenseKey(data.license_key);
      setSandboxMode(!!data.sandbox_mode);
    } catch (e) {
      setToast(
        "Unable to retrieve current license keys. Make sure you are logged into Wordpress."
      );
      console.error(e);
    }
  }, []);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Formik
            initialValues={{ apiKey: "" }}
            onSubmit={async (values, actions) => {
              try {
                const shop = await activateLicense({
                  licenseKey: values.apiKey,
                });
                setShop(shop);
              } catch (e) {
                console.error(e);
                setToast(
                  e.response?.data?.message ||
                    "Unable to update your subscription. Your key is invalid or is inactive."
                );
              }
            }}
          >
            {({ values, setFieldValue, handleSubmit, isSubmitting }) => (
              <Card
                title="Unauthorized"
                primaryFooterAction={{
                  content: "Update License Key",
                  onClick: handleSubmit,
                  loading: isSubmitting,
                  disabled: !values.apiKey,
                }}
                secondaryFooterActions={[
                  {
                    content: "Reset to Test Mode",
                    onAction: async () => {
                      const { data } = await resetToSandboxMode();
                      setShop(data);
                    },
                  },
                ]}
              >
                <Card.Section>
                  <Banner title="Current License Key">
                    Your current license key is <code>{currentLicenseKey}</code>{" "}
                    and the plugin is in{" "}
                    <strong>{sandboxMode ? "testing mode" : "live"}</strong>
                  </Banner>
                </Card.Section>
                <Card.Section>
                  <p>
                    To find your license key, login to the{" "}
                    <a href="https://dashboard.getverdict.com">
                      Real ID Dashboard
                    </a>
                    .
                  </p>

                  <p className="mb-5">
                    Please enter your Real ID license key below.
                  </p>

                  <>
                    <TextField
                      value={values.apiKey}
                      label="API Key"
                      onChange={(value) =>
                        setFieldValue("apiKey", value?.trim())
                      }
                    />
                  </>
                </Card.Section>
              </Card>
            )}
          </Formik>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
