import React from "react";
import { Layout, Card, TextContainer } from "@shopify/polaris";

export default function TermsAndConditions() {
  return (
    <Layout.AnnotatedSection title="Terms & Conditions">
      <Card>
        <Card.Section>
          <TextContainer>
            <p>
              By using Real ID, you agree to our{" "}
              <a
                target="_blank"
                href="https://getverdict.com/subscription-terms"
              >
                Standard Subscription Agreement
              </a>
              ,{" "}
              <a target="_blank" href="https://getverdict.com/privacy">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a target="_blank" href="https://getverdict.com/terms">
                Terms & Conditions
              </a>
              .
            </p>
          </TextContainer>
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
}
