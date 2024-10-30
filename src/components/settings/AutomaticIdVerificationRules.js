import React from "react";
import { Layout, TextContainer, Card, FormLayout } from "@shopify/polaris";
import { Box } from "rebass";

import {
  CheckAllOrders,
  OnlyUsa,
  PriceFloor,
  BillingToShippingMismatch,
  RepeatCustomerVerification,
  IdVerificationFlows,
  IDRequiredCollections,
} from "components/settings/IdCheckRules";
import SubscriptionGateway from "components/auth/SubscriptionGateway";

export default function AutomaticVerificationRules() {
  return (
    <>
      <Layout.AnnotatedSection
        title="Automatic ID verification triggers & rules"
        description={
          <TextContainer>
            <p>
              Save time and passively validate customers by automatically
              sending ID checks on risky orders.
            </p>
            <br />
            <p>
              Real ID will automatically send ID checks to customers that
              trigger one or more of your enabled rules.
            </p>
          </TextContainer>
        }
      >
        <Card fullWidth title="ID verification triggers">
          <Card.Section>
            <Box mt={3} mb={4}>
              <p>
                Choose one or more of the conditions below to automatically send
                an ID check to the customer based on the order details.
              </p>
            </Box>
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
          {/*
            <Card.Section>
              <SubscriptionGateway
                permission="automatic_rules"
                minimumPlan="Starter"
              >
                <OrderRisk />
              </SubscriptionGateway>
            </Card.Section>
      */}
          <SubscriptionGateway permission="automatic_rules" minimumPlan="Plus">
            <IDRequiredCollections />
          </SubscriptionGateway>
        </Card>
        <Card title="Customers only need to verify once">
          <SubscriptionGateway
            permission="remember_repeat_customers"
            minimumPlan="Business"
          >
            <RepeatCustomerVerification />
          </SubscriptionGateway>
        </Card>
        <Card title="When to display ID Checks">
          <SubscriptionGateway
            permission="post_checkout_flow"
            minimumPlan="Lite"
          >
            <IdVerificationFlows />
          </SubscriptionGateway>
        </Card>
      </Layout.AnnotatedSection>
    </>
  );
}
