import React from "react";
import { Badge } from "@shopify/polaris";

export default function renderBadge({ step, success }) {
  if (step === "draft") {
    return <Badge progress="incomplete">Draft</Badge>;
  } else if (step === "delivered") {
    return (
      <Badge progress="incomplete" status="info">
        Delivered
      </Badge>
    );
  } else if (step === "opened") {
    return (
      <Badge progress="incomplete" status="info">
        Link Opened
      </Badge>
    );
  } else if (step === "id") {
    return (
      <Badge progress="completed" status="info">
        1 of 2 photos submitted
      </Badge>
    );
  } else if (step === "submitted-photo") {
    return (
      <Badge progress="completed" status="info">
        2 of 2 photos submitted
      </Badge>
    );
  } else if (step === "face_match") {
    return (
      <Badge progress="completed" status="info">
        Face match in Progress
      </Badge>
    );
  } else if (step === "in_review") {
    return (
      <Badge progress="completed" status="warning">
        Needs Reviewed
      </Badge>
    );
  } else if (step === "completed" && success) {
    return (
      <Badge progress="completed" status="success">
        Verified
      </Badge>
    );
  } else if (step === "completed" && !success) {
    return (
      <Badge progress="completed" status="critical">
        Failed Verification
      </Badge>
    );
  } else {
    return "";
  }
}
