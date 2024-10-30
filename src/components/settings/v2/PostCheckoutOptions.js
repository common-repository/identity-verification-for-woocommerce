import React, { useState, useCallback } from "react";
import {
  Badge,
  TextContainer,
  Card,
  FormLayout,
  TextStyle,
  Tooltip,
  Tabs,
} from "@shopify/polaris";
import { Box } from "rebass";
import { FiExternalLink } from "react-icons/fi";
import {
  CheckAllOrders,
  OnlyUsa,
  PriceFloor,
  BillingToShippingMismatch,
  RepeatCustomerVerification,
  CreditCardPayments,
} from "components/settings/IdCheckRules";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import IDRequiredCategories from "components/settings/IdCheckRules/IDRequiredCategories";

export default function PostCheckoutOptions() {
  const [selectedNavItem, setSelectedNavItem] = useState(0);

  const tabs = [
    {
      id: "triggers",
      content: "Triggers",
      accessibilityLabel: "All triggers",
      panelID: "all-triggers-1",
    },
    {
      id: "exceptions",
      content: "Exceptions",
      accessibilityLabel: "All Exceptions",
      panelID: "all-exceptions-1",
    },
  ];
  return (
    <Card fullWidth title="Settings for verifying ID after checkout">
      <Tabs
        tabs={tabs}
        selected={selectedNavItem}
        onSelect={setSelectedNavItem}
      >
        <>
          {selectedNavItem === 0 && (
            <section key="rules">
              <Card.Section>
                <TextContainer spacing="loose">
                  <p>
                    Real ID will automatically send ID checks to customers that
                    trigger one or more of your enabled rules.
                  </p>
                  <br />
                  <p>
                    Orders that trigger an ID check will have the{" "}
                    <Badge status="default">ID verification required</Badge> tag
                    added to the customer & order in the Shopify dashboard.
                  </p>
                  <p>
                    <a
                      href="https://getverdict.com/help/docs/flows/after-checkout"
                      target="_blank"
                    >
                      Learn more&nbsp;
                    </a>
                    <FiExternalLink />
                  </p>
                </TextContainer>
              </Card.Section>
              <Card.Section>
                <FormLayout>
                  <SubscriptionGateway
                    permission="automatic_rules_check_all_orders"
                    minimumPlan="Lite"
                  >
                    <CheckAllOrders />
                  </SubscriptionGateway>
                </FormLayout>
              </Card.Section>
              <Card.Section>
                <Box mt={3} mb={4}>
                  <p></p>
                </Box>
                <FormLayout>
                  <SubscriptionGateway
                    permission="automatic_rules"
                    minimumPlan="Starter"
                  >
                    <OnlyUsa />
                  </SubscriptionGateway>
                </FormLayout>
              </Card.Section>
              <Card.Section>
                <Box mt={3} mb={4}>
                  <p></p>
                </Box>
                <FormLayout>
                  <SubscriptionGateway
                    permission="automatic_rules"
                    minimumPlan="Starter"
                  >
                    <PriceFloor />
                  </SubscriptionGateway>
                </FormLayout>
              </Card.Section>
              <Card.Section>
                <SubscriptionGateway
                  permission="automatic_rules"
                  minimumPlan="Starter"
                >
                  <BillingToShippingMismatch />
                </SubscriptionGateway>
              </Card.Section>
              <Card.Section>
                <SubscriptionGateway
                  permission="automatic_rules"
                  minimumPlan="Starter"
                >
                  <IDRequiredCategories />
                </SubscriptionGateway>
              </Card.Section>
            </section>
          )}
          {selectedNavItem === 1 && (
            <>
              <Card.Section>
                <TextContainer spacing="loose">
                  <p>
                    Orders are <strong>skipped</strong> from your automatic ID
                    verification triggers if one or more of these exceptions
                    apply.
                  </p>
                  <p>
                    <a
                      href="https://getverdict.com/help/docs/flows/after-checkout#id-check-triggers"
                      target="_blank"
                    >
                      Learn more&nbsp;
                    </a>
                    <FiExternalLink />
                  </p>
                </TextContainer>
              </Card.Section>
              <SubscriptionGateway
                permission="remember_repeat_customers"
                minimumPlan="Business"
              >
                <RepeatCustomerVerification />
              </SubscriptionGateway>
            </>
          )}
        </>
      </Tabs>
    </Card>
  );
}
