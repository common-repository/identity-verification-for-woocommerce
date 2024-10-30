import React from "react";
import { CalloutCard } from "@shopify/polaris";

export default function CreateCheckCalloutCard({
  secondaryAction,
  primaryAction,
}) {
  return (
    <CalloutCard
      title="Verify your customers real life identities with an ID check."
      illustration="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_310/v1600205014/Real%20ID/Dylanpierce_Keyframe-1.jpg"
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    >
      <p>Create an ID check to verify your customers real life identity.</p>
      <p>
        Real ID will verify the authenticity of your customer's government
        issued IDs with an option headshot to compare them against.
      </p>
    </CalloutCard>
  );
}
