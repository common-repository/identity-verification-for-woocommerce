import React, { useEffect, useState, useCallback } from "react";
import { useFormikContext } from "formik";
import * as Sentry from "@sentry/react";
import { Card, TextContainer, TextStyle, Checkbox } from "@shopify/polaris";
import EmailIcon from "icons/email.svg";
import PostCheckoutIcon from "icons/post-checkout-rectangle.svg";
import PreCheckoutIcon from "icons/pre-checkout-rectangle.svg";
import RegistrationIcon from "icons/registration-rectangle.svg";
import RegistrationWebhookIcon from "icons/registration-webhook-rectangle.svg";
import { motion, AnimatePresence } from "framer-motion";

export function FlowOption({
  title,
  subtitle = "",
  label,
  value,
  icon,
  setEditing,
}) {
  const { values, setFieldValue, errors } = useFormikContext();

  const selected = values.deliveryMethod === value;

  function handleChange() {
    setFieldValue("deliveryMethod", value);
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleChange}
      className={`ri-flex ri-items-center ri-gap-5 ri-py-4 ri-px-6 ri-border-2 ri-border-solid ri-rounded-md ri-cursor-pointer ${
        !selected &&
        "hover:ri-border-slate-300 ri-text-gray-500 ri-border-slate-100 hover:ri-border-slate-200 hover:ri-bg-gray-50"
      } ${
        selected &&
        "ri-border-green-600 ri-text-gray-700 ri-border-solid ri-bg-green-50"
      }`}
    >
      <div>{icon}</div>
      <div className="">
        <h4
          className={`ri-text-lg ${
            selected ? "ri-font-semibold ri-text-green-900" : ""
          }`}
        >
          {title}
        </h4>
        <p className={`ri-text-sm ${selected ? "ri-text-green-700" : ""}`}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export const FLOW_CHOICES = {
  "post-checkout": {
    title: "After checkout",
    subtitle: "Ask the customer for their ID after they make a purchase.",
    icon: PostCheckoutIcon,
  },
  "pre-checkout": {
    title: "Before checkout",
    subtitle: "Ask the customer for their ID before they make a purchase.",
    icon: PreCheckoutIcon,
  },
  registration: {
    title: "Before viewing store",
    subtitle: "Ask the customer for their ID before visiting your store.",
    icon: RegistrationIcon,
  },
  "registration-webhook": {
    title: "After account registration",
    subtitle:
      "Ask the customer or vendor for their ID after registering an account.",
    icon: RegistrationWebhookIcon,
  },
};

export default function IdVerificationFlows() {
  const [editing, setEditing] = useState(false);
  const { values, setFieldValue } = useFormikContext();
  const Icon = FLOW_CHOICES[values.deliveryMethod]?.icon || <></>;
  const [checked, setChecked] = useState(values.deliveryMethod !== "manual");

  const handleChange = useCallback(
    (newChecked) => {
      setChecked(newChecked);

      if (newChecked) {
        setFieldValue("deliveryMethod", "post-checkout");
        setEditing(true);
      } else {
        setFieldValue("deliveryMethod", "manual");
        setEditing(false);
      }
    },
    [setFieldValue, setEditing]
  );

  return (
    <AnimatePresence>
      <Card.Section>
        <div className="ri-flex ri-justify-between">
          <Checkbox
            label="Enable automated ID checks"
            checked={checked}
            onChange={handleChange}
          />
          {checked && !editing && (
            <motion.button
              className="ri-cursor-pointer ri-bg-transparent ri-underline ri-text-blue-600 ri-border-0"
              onClick={setEditing}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Change verification flow
            </motion.button>
          )}
        </div>

        {checked && (
          <h2 className="ri-mb-4">
            Choose when ID verification is presented or required from customers.
          </h2>
        )}

        <div className="ri-w-full ri-grid ri-gap-3 ri-my-6">
          {editing && (
            <>
              {Object.keys(FLOW_CHOICES).map((value) => {
                const Icon = FLOW_CHOICES[value].icon;
                return (
                  <FlowOption
                    value={value}
                    title={FLOW_CHOICES[value].title}
                    subtitle={FLOW_CHOICES[value].subtitle}
                    icon={<Icon className="ri-w-64 ri-h-42" />}
                    setEditing={setEditing}
                  />
                );
              })}
            </>
          )}

          {!editing && values.deliveryMethod !== "manual" && (
            <FlowOption
              value={values.deliveryMethod}
              title={FLOW_CHOICES[values.deliveryMethod].title}
              subtitle={FLOW_CHOICES[values.deliveryMethod].subtitle}
              icon={<Icon className="ri-w-64 ri-h-42" />}
              setEditing={setEditing}
            />
          )}
        </div>
      </Card.Section>
    </AnimatePresence>
  );
}
