import React from "react";
import { Checkbox, Select, Card, Badge, Banner } from "@shopify/polaris";
import { useFormikContext } from "formik";
import useShop from "hooks/useShop";
import get from "lodash/get";
import Toggle from "react-toggle";
import { RiExternalLinkLine as ExternalLinkIcon } from "react-icons/ri";

export function OrderStatusSelect({
  availableWcOptions,
  values,
  setFieldValue,
  label,
  fieldPath,
  condition,
}) {
  const selectedLabel = React.useMemo(() => {
    const selectedOption = availableWcOptions.find(
      (option) => option.value === get(values, fieldPath)
    );

    return selectedOption.label;
  }, [values, availableWcOptions]);

  return (
    <div className="ri-my-4">
      <Select
        disabled={!values.wc?.orderStatusSyncingEnabled}
        label={label}
        options={availableWcOptions}
        onChange={(value) => {
          setFieldValue(fieldPath, value);
        }}
        value={get(values, fieldPath)}
        helpText={
          <>
            Set the order status to <Badge>{selectedLabel}</Badge> when the ID
            check has been {condition}.
          </>
        }
      />
    </div>
  );
}

export default function OrderStatusSyncing() {
  const { values, setFieldValue } = useFormikContext();
  const { shop } = useShop();
  const availableWcOptions = React.useMemo(() => {
    if (!shop) return;

    const availableWcOrderStatuses = shop.wc_available_order_statuses;

    return Object.entries(availableWcOrderStatuses).reduce((sum, entry) => {
      return [...sum, { value: entry[0], label: entry[1] }];
    }, []);
  }, [shop]);

  console.log(values.wc.orderStatusSyncingEnabled);

  return (
    <Card.Section title="Order Status Syncing">
      <div className="ri-my-5">
        <p className="ri-mb-3">
          Synchronize the ID check status as the customer completes their ID
          check with the corresponding WooCommerce order status.
        </p>
        <p className="ri-mb-3">
          <a href="https://getverdict.com/help/docs/woocommerce/order-statuses">
            Learn more about order status syncing
            <ExternalLinkIcon />
          </a>
        </p>

        <div className="ri-my-6 ri-flex ri-items-center">
          <div className="ri-mr-4">
            <Toggle
              checked={values.wc?.orderStatusSyncingEnabled}
              onChange={(e) => {
                setFieldValue("wc.orderStatusSyncingEnabled", e.target.checked);
              }}
            />
          </div>
          Sync ID checks to order statuses{" "}
          {values.wc?.orderStatusSyncingEnabled ? "enabled" : "disabled"}
        </div>
        <OrderStatusSelect
          label="ID verification in progress"
          availableWcOptions={availableWcOptions}
          values={values}
          setFieldValue={setFieldValue}
          fieldPath="wc.orderStatusMapping.in_progress"
          condition="started or is in progress"
        />
        <OrderStatusSelect
          label="Passed ID verification"
          availableWcOptions={availableWcOptions}
          values={values}
          setFieldValue={setFieldValue}
          fieldPath="wc.orderStatusMapping.completed"
          condition="successfuly completed"
        />
        <OrderStatusSelect
          label="Failed ID verification"
          availableWcOptions={availableWcOptions}
          values={values}
          setFieldValue={setFieldValue}
          fieldPath="wc.orderStatusMapping.failed"
          condition="failed"
        />
        <div className="mt-4">
          <Banner status="info">
            <p className="mb-3">
              Only orders with the status <code>Processing</code> or{" "}
              <code>Completed</code> will be updated. Orders with the status{" "}
              <code>Payment processing</code> and <code>Payment failed</code>{" "}
              statuses will be ignored.
            </p>
          </Banner>
        </div>
      </div>
    </Card.Section>
  );
}
