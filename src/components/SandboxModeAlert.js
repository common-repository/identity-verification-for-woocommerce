import React from "react";
import { useShop } from "providers/ShopProvider";
import { Heading, Banner, TextContainer } from "@shopify/polaris";

export default function SandboxModeAlert() {
  const { shop } = useShop();

  console.log("Real ID :: shop sandboxmode", shop.sandboxMode);

  return (
    <>
      {shop.sandboxMode && (
        <Banner
          status="info"
          action={{
            content: "Go Live",
            url: "https://dashboard.getverdict.com",
          }}
        >
          <Heading>Sandbox mode</Heading>
          <TextContainer>
            <p>
              Real ID is currently in sandbox mode. ID checks are free in
              sandbox mode. However checks will not include real results, just
              placeholders for demonstration and testing.
            </p>
            <p>
              All automatic ID triggers and settings will work as normal, when
              you're ready to activate Real ID sign up for a license key with
              the button below.
            </p>
          </TextContainer>
        </Banner>
      )}
    </>
  );
}
