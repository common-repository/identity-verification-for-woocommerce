import React, { useState } from "react";
import { Tabs } from "@shopify/polaris";
import CheckCompletedNotifications from "./Notifications/CheckCompletedNotifications";
import EmailSenderSignatureSettings from "./Notifications/EmailSenderSignatureSettings";
import CustomerAutomaticReminders from "./Notifications/CustomerAutomaticReminders";

export default function IdCheckNotificationSettings() {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      id: "for-customers",
      content: "For Customers",
      accessibilityLabel: "Notifications for customers",
      panelID: "for-customers",
    },
    {
      id: "for-merchants",
      content: "For your Team",
      panelID: "for-your-team",
    },
  ];

  return (
    <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
      {selectedTab === 0 && (
        <>
          <EmailSenderSignatureSettings />
          <CustomerAutomaticReminders />
        </>
      )}
      {selectedTab === 1 && <CheckCompletedNotifications />}
    </Tabs>
  );
}
