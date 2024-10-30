import React from "react";

const CurrencyComponent = ({ amount, currencyCode }) => (
  <>
    {new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount)}
  </>
);

export default CurrencyComponent;
