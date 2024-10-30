import React, { useContext } from "react";
import {
  Card,
  Layout,
  TextStyle,
  TextContainer,
  Button,
  Link,
} from "@shopify/polaris";
import LicensePrompt from "../LicensePrompt";

export default function Billing({ shop }) {
  const openPricingModal = () => {};
  // const { openPricingModal } = usePricingModal();
  const hasComplimentaryAccess = shop.monthlyFeeWaived;

  return (
    <Layout.AnnotatedSection
      title="Billing"
      description={
        <>
          <p>Update your Real ID monthly plan at any time.</p>
          <br />
        </>
      }
    >
      {!shop.usageSubscriptionItems || shop.sandboxMode ? (
        <LicensePrompt />
      ) : (
        <Card fullWidth title="Current Plan">
          <Card.Section>
            {shop.usageSubscriptionItems && shop.monthlyPlan && shop.usagePlan && (
              <TextContainer spacing="loose">
                <strong style={{ textTransform: "uppercase" }}>
                  {shop.monthlyPlan}
                </strong>
                <p>
                  With {shop.usagePlan == "ai" && "A.I. powered"}
                  {shop.usagePlan == "lite" && "Manual powered"} ID checking
                </p>
                {shop.pricePerCheck && (
                  <p>
                    <span
                      style={{
                        textDecoration: hasComplimentaryAccess
                          ? "line-through"
                          : "none",
                      }}
                    >
                      ${shop.pricePerCheck} per ID check.
                    </span>
                    {hasComplimentaryAccess && (
                      <>
                        &nbsp;Special complimentary pricing -{" "}
                        <TextStyle variation="positive">
                          ${shop.complimentaryPricePerCheck}
                        </TextStyle>{" "}
                        per I.D. check
                      </>
                    )}
                  </p>
                )}
                <Button primary url="https://dashboard.getverdict.com">
                  Change Plan
                </Button>
              </TextContainer>
            )}
          </Card.Section>
        </Card>
      )}
    </Layout.AnnotatedSection>
  );
}
