import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  TextContainer,
  TextStyle,
  Layout,
  TextField,
} from "@shopify/polaris";
import { deactivateLicense as deactivateLicenseRequest } from "services/wpApi";
import { useToast } from "providers/ToastProvider";
import { useShop } from "providers/ShopProvider";
import { getCurrentLicenseKey } from "../../services/wpApi";

export default function DeactivateLicenseKey({}) {
  const setToast = useToast();
  const { setShop } = useShop();
  const [currentLicenseKey, setCurrentLicenseKey] = useState("");

  useEffect(async () => {
    try {
      const { data } = await getCurrentLicenseKey();
      setCurrentLicenseKey(data.license_key);
    } catch (e) {
      setToast(
        "Unable to retrieve current license keys. Make sure you are logged into Wordpress."
      );
      console.error(e);
    }
  }, []);

  const deactivateLicense = () => {
    deactivateLicenseRequest()
      .then(({ data }) => {
        setToast("License deactivated");
        setShop(data.shop);
      })
      .catch(() => {
        setToast(
          "Unable to deactivate license, please contact support or try again later."
        );
      });
  };

  return (
    <Layout.AnnotatedSection
      title="License"
      description={
        <>
          <p>
            {" "}
            Your license keys can been accessed in the{" "}
            <a href="dashboard.getverdict.com">Real ID dashboard</a>.
          </p>
          <br />
        </>
      }
    >
      <Card fullWidth>
        <Card.Section>
          <TextField
            value={currentLicenseKey}
            label="Current License Key"
            disabled
          />
        </Card.Section>
        <Card.Section>
          <TextContainer spacing="loose">
            <TextStyle variation="subdued">
              <p>
                Need to change to a new license key? Use the button below to
                deactivate the current Real ID license key.
              </p>
            </TextStyle>
            <Button destructive onClick={deactivateLicense}>
              Deactivate License Key
            </Button>
          </TextContainer>
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
}
