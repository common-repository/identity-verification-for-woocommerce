import React, { useState, useCallback } from "react";
import {
  Layout,
  Card,
  TextContainer,
  FormLayout,
  TextField,
  TextStyle,
  Checkbox,
  ResourceItem,
  ResourceList,
  Modal,
  Select,
  Icon,
} from "@shopify/polaris";
import { Box } from "rebass";
import SubscriptionGateway from "components/auth/SubscriptionGateway";
import { useFormikContext } from "formik";
import { ClockMajor } from "@shopify/polaris-icons";
import truncate from "lodash/truncate";
import ShortCodesReference from "components/settings/ShortCodesReference";
import { getUnixTime, add } from "date-fns";
import sortBy from "lodash/sortBy";
import useToast from "hooks/useToast";
import { nanoid } from "nanoid";
import useShop from "hooks/useShop";
import { defaultAutomaticRemindersSchedule } from "components/settings/getDefaultValues";

export function ReminderEntry({ delay, subject, body, id, openEditor }) {
  const { values, setFieldValue } = useFormikContext();
  return (
    <ResourceItem
      id={id}
      onClick={() => {
        openEditor(id);
      }}
      shortcutActions={[
        {
          content: "Edit",
          onAction: () => {
            openEditor(id);
          },
        },
        {
          content: "Delete",
          onAction: () => {
            setFieldValue(
              "automaticRemindersSchedule",
              values.automaticRemindersSchedule.filter(
                (reminder) => reminder.id !== id
              )
            );
          },
        },
      ]}
    >
      <h3 className="ri-text-xl ri-text-loose ri-mb-4">{subject}</h3>
      <p className="ri-truncate ri-my-4 ri-text-gray-500">
        {truncate(body, { length: 100 })}
      </p>
      <div className="ri-gray-400 ri-flex ri-items-center">
        <span className="ri-mx-1 ri-inline-block">
          <Icon source={ClockMajor} color="base" />
        </span>
        {delay?.interval}&nbsp;
        {delay?.unit} after purchase
      </div>
    </ResourceItem>
  );
}

export function ReminderSchedule({ openEditor }) {
  const { values, setFieldValue } = useFormikContext();

  return (
    <ResourceList
      resourceName={{ singular: "reminder", plural: "reminders" }}
      items={sortBy(
        values.automaticRemindersSchedule.map((reminder) => ({
          ...reminder,
          ts: getUnixTime(
            add(new Date(), {
              [reminder.delay?.unit]: reminder.delay?.interval,
            })
          ),
        })),
        (item) => item.ts
      )}
      renderItem={(item) => <ReminderEntry {...item} openEditor={openEditor} />}
    />
  );
}

export function ReminderEditor({
  open,
  onClose,
  reminderValues,
  setReminderValue,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      secondaryActions={{
        content: "Close",
        onAction: onClose,
      }}
      title="Edit Reminder"
    >
      <Modal.Section>
        <ShortCodesReference
          my={2}
          mb={5}
          additionalContent={
            <p>
              Schedule a personalized email reminder for the customer to finish
              their ID check.
            </p>
          }
        />
        <FormLayout>
          <TextField
            label="Subject"
            value={reminderValues?.subject}
            onChange={(value) => {
              setReminderValue("subject", value);
            }}
          />
          <TextField
            label="Body"
            value={reminderValues?.body}
            onChange={(value) => {
              setReminderValue("body", value);
            }}
            multiline={3}
            helpText={
              "The link to begin the ID check is automatically added to this email."
            }
          />
          <FormLayout.Group condensed>
            <TextField
              label="Delay"
              type="number"
              value={`${reminderValues?.delay?.interval}`}
              onChange={(value) => {
                setReminderValue("delay.interval", value);
              }}
            />
            <Select
              label="Interval"
              // helpText={`The customer will be sent this email ${values.automaticRemindersSchedule[selectedReminder]?.delay?.unit} ${values.automaticRemindersSchedule[selectedReminder]?.delay?.interval} after their order was placed.`}
              options={[
                {
                  label: "hours",
                  value: "hours",
                },
                {
                  label: "days",
                  value: "days",
                },
              ]}
              value={reminderValues?.delay?.unit}
              onChange={(value) => {
                setReminderValue("delay.unit", value);
              }}
            />
          </FormLayout.Group>
          <p className="ri-text-slate-500">
            The customer will be sent this email{" "}
            {reminderValues?.delay?.interval} {reminderValues?.delay?.unit}{" "}
            after their order was placed.
          </p>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}

export default function CustomerAutomaticReminders() {
  const [selectedReminder, setSelectedReminder] = useState(false);
  const [reminderEditorOpen, setReminderEditorOpen] = useState(false);
  const [active, setActive] = useState(true);
  const { shop } = useShop(); // temporary, until other shops migrate to this new schedule pattern.

  const handleChange = useCallback(() => setActive(!active), [active]);
  const { values, setFieldValue } = useFormikContext();
  const setToast = useToast();

  let primaryFooterAction = {
    content:
      values.automaticRemindersSchedule.length >= 4
        ? "All reminders set"
        : "Add reminder",
    onAction: () => {
      const newReminderId = nanoid(5);
      setFieldValue("automaticRemindersSchedule", [
        ...values.automaticRemindersSchedule,
        {
          id: newReminderId,
          subject: `Your order [orderId] still requires your ID`,
          body: `Hi [firstName],

This is a friendly reminder that your order [orderId] still requires ID verification.

Please follow the instructions below to verify your ID and resume shipment.
`,
          delay: {
            interval: 8,
            unit: "hours",
          },
        },
      ]);
      setSelectedReminder(newReminderId);
      setReminderEditorOpen(true);
      setToast("Added scheduled reminder.");
    },
    disabled: values.automaticRemindersSchedule.length >= 4,
  };

  let secondaryFooterActions = [
    {
      id: "reset-to-default",
      content: "Reset to default reminders schedule",
      onAction: () => {
        setFieldValue(
          "automaticRemindersSchedule",
          defaultAutomaticRemindersSchedule
        );
        setToast("Reminder schedule reset to defaults.");
      },
      plain: true,
    },
  ];

  return (
    <Layout.AnnotatedSection
      title="Customer ID Check Notifications"
      description={
        <>
          <p>Control how your customers are sent ID checks.</p>
          <br />
        </>
      }
    >
      <Card
        fullWidth
        title="Automatic ID check reminders"
        primaryFooterAction={
          values.automaticRemindersEnabled ? primaryFooterAction : null
        }
        secondaryFooterActions={
          values.automaticRemindersEnabled ? secondaryFooterActions : null
        }
      >
        <Card.Section>
          <Box mb={3}>
            <TextContainer spacing="">
              <p>
                Increase ID check completion rates with scheduled reminders.
              </p>
              <p>Reminders are sent until the customer submits their ID.</p>
              <p>
                <TextStyle variation="subdued">
                  The content of the messages will be the same as in the{" "}
                  <strong>Appearance</strong> section.
                </TextStyle>
              </p>
            </TextContainer>
          </Box>

          <SubscriptionGateway permission="branding" minimumPlan="Pro">
            <Checkbox
              label="Send reminders to finish ID checks via email"
              checked={values.automaticRemindersEnabled}
              onChange={(checked) => {
                setFieldValue("automaticRemindersEnabled", checked);
              }}
            />
            {values.automaticRemindersEnabled && (
              <ReminderSchedule
                openEditor={(id) => {
                  setSelectedReminder(id);
                  setReminderEditorOpen(true);
                }}
              />
            )}
          </SubscriptionGateway>
        </Card.Section>
      </Card>
      <ReminderEditor
        open={reminderEditorOpen}
        onClose={() => setReminderEditorOpen(false)}
        reminderValues={values.automaticRemindersSchedule.find(
          (reminder) => reminder.id === selectedReminder
        )}
        setReminderValue={(fieldName, value) => {
          const reminderIndex = values.automaticRemindersSchedule.findIndex(
            (reminder) => reminder.id === selectedReminder
          );
          console.log("updating reminder ", reminderIndex);

          setFieldValue(
            `automaticRemindersSchedule[${reminderIndex}].${fieldName}`,
            value
          );
        }}
        selectedReminder={selectedReminder}
      />
    </Layout.AnnotatedSection>
  );
}
