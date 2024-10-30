import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { useToast } from "providers/ToastProvider";
import * as Sentry from "@sentry/react";
import { Card, ChoiceList, Banner, TextContainer } from "@shopify/polaris";
import { CgExternal } from "react-icons/cg";
import { useShop } from "providers/ShopProvider";
import { updateDeliveryMethods } from "services/wpApi";

export default function IdVerificationFlows() {
  const setToast = useToast();
  const [deliveryMethods, setDeliveryMethods] = useState(["emailOrSms"]);

  const { shop } = useShop();
  const { values, setFieldValue } = useFormikContext();
  // for the loading indicator when the user chooses to enable or disable the post order delivery method
  const [
    isUpdatingPostOrderDeliveryMethod,
    setIsUpdatingPostOrderDeliveryMethod,
  ] = useState(false);

  useEffect(() => {
    if (!shop) {
      return;
    }

    setDeliveryMethods(shop?.settings?.deliveryMethods || ["emailOrSms"]);
  }, [shop]);

  return (
    <Card.Section>
      <ChoiceList
        disabled={isUpdatingPostOrderDeliveryMethod}
        allowMultiple
        title="Decide when to prompt the customer to verify their ID during the purchase experience. By default Real ID will send ID checks to customers by email or SMS after they've completed checkout."
        choices={[
          {
            label:
              "ID check delivered by email or SMS after checkout (Default)",
            value: "emailOrSms",
            helpText:
              "An email or SMS will be sent to the customer after they make a purchase using their contact information they submitted during checkout",
            disabled: true,
            renderChildren: () => (
              <ChoiceList
                disabled={true}
                allowMultiple
                selected={["viaEmail", "viaSms"]}
                choices={[
                  {
                    label: "Send ID check to the customer by email",
                    value: "viaEmail",
                  },
                  {
                    label: "Send ID check to the customer by SMS",
                    value: "viaSms",
                  },
                ]}
              />
            ),
          },
          // {
          //   label: "After account registration",
          //   value: "registration",
          //   helpText: (
          //     <>
          //       Require ID verification by email immediately after a customer
          //       registers an account on your site.
          //       <Banner status="info">
          //         <TextContainer>
          //           <p>
          //             Account registration occurs <i>before</i> checkout.
          //           </p>
          //           <p>
          //             This means that the ID verification will be required for
          //             all customers, regardless of any rules you have enabled
          //             above including products or collections that require ID
          //             verification, or the's order total price, etc.
          //           </p>
          //         </TextContainer>
          //       </Banner>
          //     </>
          //   ),
          // },
          {
            label: "Required before checkout",
            value: "preCheckout",
            helpText: (
              <>
                Require ID verfication before checkout on all products in your
                store
                <Banner status="info">
                  <TextContainer>
                    <p>
                      This will require ID verification for all products in your
                      store. However, repeat customers will not be required to
                      complete ID verification again if they are logged in to
                      the account they verified in the past.
                    </p>
                    <p>
                      An ID verification pop up will appear for unverified
                      customers when they attempt to add a product to their cart
                      or checkout.
                    </p>
                  </TextContainer>
                </Banner>
              </>
            ),
          },
          // {
          //   label: "Presented at end of checkout",
          //   value: "checkout",
          //   helpText: (
          //     <>
          //       <p>
          //         Customers will be prompted to complete ID verification in the
          //         order status page.{" "}
          //       </p>
          //       <p>
          //         <a
          //           href="http://getverdict.com/real-id/help/showing-id-verification-during-checkout"
          //           target="_blank"
          //         >
          //           <CgExternal />
          //           &nbsp;How ID verification appears in post checkout.
          //         </a>
          //       </p>
          //     </>
          //   ),
          // },
        ]}
        selected={deliveryMethods}
        onChange={(channels) => {
          // add or remove the script tag from the shop if they elect to enable or disable the feature
          // updateCheckoutDeliveryMethod(
          //   channels.includes("checkout")
          // );

          setIsUpdatingPostOrderDeliveryMethod(true);

          updateDeliveryMethods({
            deliveryMethods: channels,
          })
            .then(({ data }) => {
              setDeliveryMethods(data?.settings?.deliveryMethods);
              setIsUpdatingPostOrderDeliveryMethod(false);
            })
            .catch((err) => {
              setToast(
                "Unable to update your ID verification delivery settings, please contact support for assistance."
              );
              setIsUpdatingPostOrderDeliveryMethod(false);
              Sentry.captureException(err);
            });
        }}
      />
    </Card.Section>
  );
}
