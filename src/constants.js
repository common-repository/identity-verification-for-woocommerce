export const defaultCheckContent = `Hello [firstName],

We received your order [orderId], but ID verification is required to complete your order.
`;

// export const defaultImagePublicId = "Real%20ID/Screen_Shot_2020-09-17_at_5.38.59_PM.png";
export const defaultImagePublicId = "Real%20ID/real_id_white_png.png";

export const defaultPrimaryColor = "#108043";

// there are the tags that should be overwritten with new stages in checks.
export const availableIdVerificationTags = [
  "ID verification required",
  "ID verification completed",
  "ID verification failed",
  "ID check manually approved",
  "ID check manually rejected",
];
