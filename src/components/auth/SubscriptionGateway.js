import React from "react";
import { useShop } from "providers/ShopProvider";
import get from "lodash/get";
import { Box } from "rebass";
// import usePricingModal from "components/hooks/usePricingModal";

import { HiLockClosed } from "react-icons/hi";

export default function SubscriptionGateway({
  permission,
  children,
  minimumPlan,
}) {
  const { shop } = useShop();
  // const { openPricingModal } = usePricingModal();

  // if the shop's isn't qualified for the wrapped feature, disable it, and wrap with a Modal
  if (!(shop.permissions || []).includes(permission)) {
    return (
      <Box
        // onClick={openPricingModal}
        onClick={() => {}}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 100,
          cursor: "pointer",
          "*": { pointerEvents: "none" },
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "#e3e8ec",
            borderRadius: "100%",
            width: "20px",
            height: "20px",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
          }}
        >
          <HiLockClosed color="#545c63" />
        </div>

        <div style={{ opacity: 0.5 }}>{children}</div>
      </Box>
    );
  }

  return children;
}
