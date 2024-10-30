import {
  defaultCheckContent,
  defaultImagePublicId,
  defaultPrimaryColor,
} from "../../constants";
import get from "lodash/get";
import { nanoid } from "nanoid";

export const defaultAutomaticRemindersSchedule = [
  {
    id: nanoid(5),
    delay: { interval: 2, unit: "hours" },
    subject: "ID verification required for your order [orderId]",
    body: `Hi [firstName],

This is just a friendly reminder that ID verification is still required for your order to process.

Please complete your ID check as soon as possible for prompt shipment.`,
  },
  {
    id: nanoid(5),
    delay: { interval: 4, unit: "hours" },
    subject: "ID check incomplete for order [orderId]",
    body: `Hi [firstName],

Just in case you missed our prior email, we still haven't received your ID check yet.

Your order requires ID verification for fulfillment. Please verify your ID to unblock your order.`,
  },
  {
    id: nanoid(5),
    delay: { interval: 24, unit: "hours" },
    subject: "Final ID verification reminder",
    body: `Hi [firstName],
          
We have not yet received your ID check, and it may require use to cancel the order.

ID verification is required for order shipment. Please follow the instructions below. Otherwise, we may need to cancel this order. `,
  },
];

export const defaultAutomaticRetriesPolicy = {
  enabled: false,
  maxAttempts: 1,
  subject: `Retry verifying your ID`,
  body: `
Hello [firstName],

We weren't able to automatically verify your ID with your first try. 

For the best results, please make sure your entire ID is visible and without glare. Make sure all fields on the ID are readable in the photo.

Use the button below to verify your ID:
`,
};

export default function getDefaultValues(shop) {
  return {
    checkAllOrders: get(shop, "settings.checkAllOrders"),
    priceFloor: get(shop, "settings.priceFloor", 100),
    priceFloorEnabled: get(shop, "settings.priceFloorEnabled", false),
    shippingBillingAddressMismatchEnabled: get(
      shop,
      "settings.shippingBillingAddressMismatchEnabled",
      false
    ),
    orderRiskLevelsEnabled: get(shop, "settings.orderRiskLevelsEnabled", false),
    orderRiskLevels: get(shop, "settings.orderRiskLevels", []),
    uniqueCustomersOnlyEnabled: get(
      shop,
      "settings.uniqueCustomersOnlyEnabled"
    ),
    defaultContent: get(shop, "settings.defaultContent", defaultCheckContent),
    minimumAge: get(shop, "settings.minimumAge", ""),
    minimumAgeEnabled: get(shop, "settings.minimumAgeEnabled", false),

    contactEmails: get(shop, "settings.contactEmails", [
      get(shop, "settings.contactEmail", shop.contactEmail),
    ]),
    monitoredChannels: get(shop, "settings.monitoredChannels", []),
    crossCheckCustomerLastName: get(
      shop,
      "settings.crossCheckCustomerLastName",
      false
    ),
    crossCheckBillingAddress: get(
      shop,
      "settings.crossCheckBillingAddress",
      false
    ),
    crossCheckShippingAddress: get(
      shop,
      "settings.crossCheckShippingAddress",
      false
    ),
    crossCheckShippingCustomerLastName: get(
      shop,
      "settings.crossCheckShippingCustomerLastName",
      false
    ),
    crossCheckNameThreshold: get(shop, "settings.crossCheckNameThreshold", 0.7),
    checkOnlyUsa: get(shop, "settings.checkOnlyUsa", false),
    requiredIdUsStates: get(shop, "settings.requiredIdUsStates", []),
    usStateSpecificity: get(shop, "settings.usStateSpecificity", "all_usa"),
    primaryColor: get(shop, "settings.primaryColor", defaultPrimaryColor),
    secondaryColor: get(
      shop,
      "settings.secondaryColor",
      shop?.settings?.primaryColor || defaultPrimaryColor
    ),
    idCheckType: get(shop, "settings.idCheckType", "idv"),
    includeBackId: shop?.settings?.includeBackId,
    signatureRequired: get(shop, "settings.signatureRequired", false),
    disableAutomaticNotes: get(shop, "settings.disableAutomaticNotes", false),
    imageUrl: get(shop, "settings.imageUrl", false),
    imagePublicId: get(shop, "settings.imagePublicId", defaultImagePublicId),
    requiredIdTagsEnabled: get(shop, "settings.requiredIdTagsEnabled"),
    requiredIdCategoriesEnabled: shop.settings?.requiredIdCategoriesEnabled,
    requiredIdCategories: get(shop, "settings.requiredIdCategories", []),
    requiredIdTagsEnabled: get(shop, "settings.requiredIdTagsEnabled"),
    requiredIdTags: get(shop, "settings.requiredIdTags", []),
    preferredLocale: get(shop, "settings.preferredLocale", "en"),
    automaticRemindersEnabled: get(
      shop,
      "settings.automaticRemindersEnabled",
      false
    ),
    automaticRetriesPolicy:
      shop?.settings?.automaticRetriesPolicy || defaultAutomaticRetriesPolicy,
    automaticRemindersSchedule:
      shop?.settings.automaticRemindersSchedule ||
      defaultAutomaticRemindersSchedule,
    emailContent: {
      customer: {
        check: {
          completed:
            shop?.settings?.emailContent?.customer?.check?.completed ||
            `Hello [firstName],

Thanks for completing ID verification!

We're reviewing the results and we'll be in touch about your shipment date & order details.

Thank you for helping keep our shop secure and protect against fraud.

If you have any questions, please contact email our customer support.
`,

          in_review:
            shop?.settings?.emailContent?.customer?.check?.in_review ||
            `Hello [firstName],

We have received your ID for verification, but we were unable to automatically verify it.

A team member will be manually reviewing your case.

If you have any questions, please email our customer service team.

Thank you`,

          failed:
            shop?.settings?.emailContent?.customer?.check?.failed ||
            `Hello [firstName],

Unfortunately after a manual review, we were not able to conclusively pass your ID.

Please contact customer support for the status of your refund if you have made a purchase.

If you have any questions or believe this is a mistake, please contact email our customer support.`,
        },
      },
    },
    deliveryMethod: get(shop, "settings.deliveryMethod", "manual"),
    idRequiredCustomerRoles: get(shop, "settings.idRequiredCustomerRoles", [
      "customer",
      "vendor",
      "seller",
    ]),
    allowedCaptureMethods: shop?.settings?.allowedCaptureMethods || [
      "camera",
      "upload",
    ],

    registrationSettings: get(shop, "settings.registrationSettings", {
      intro: {
        title: "Age Restricted Content",
        content: `ID verification is required to view our entire store.

Simply make an account and verify your ID with the prompts below. You will be prompted to upload an image of your driver's license or passport.

ID verification is instant, and you will only need to do this once with your account. After you've verified you'll be able to make your purchase.

if you're not ready to verify your ID, you can still open our limited menu with the "View Menu" button below.

Real ID, our ID verification provider, is GDPR and CCPA compliant and is designed with your security and privacy first. You can request to have your ID scrubbed at any time and your account will remain verified.`,
      },
      allowedPages: ["/my-account/"],
      secondaryActions: [],
      registrationUrl: "/wp-login.php?action=register",
      loginUrl: "/wp-login.php",
    }),
    wc: {
      orderStatusSyncingEnabled: shop?.settings?.wc?.orderStatusSyncingEnabled,
      orderStatusMapping: {
        in_progress:
          shop?.settings?.wc?.orderStatusMapping?.in_progress || "wc-on-hold",
        completed:
          shop?.settings?.wc?.orderStatusMapping?.completed || "wc-processing",
        failed: shop?.settings?.wc?.orderStatusMapping?.failed || "wc-failed",
      },
    },
    customConfidenceThreshold: shop?.settings?.customConfidenceThreshold || 0.9,
  };
}
