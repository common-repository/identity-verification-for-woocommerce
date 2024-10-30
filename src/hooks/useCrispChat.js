import React, { useEffect } from "react";

export default function useCrispChat(shop) {
  useEffect(() => {
    if (window.CRISP_TOKEN) {
      return;
    }

    if (!shop) {
      return;
    }

    if (!["business", "enterprise"].includes(shop?.monthlyPlan)) {
      return;
    }

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "05c40527-6445-49bc-a850-150014b14daf";
    window.CRISP_TOKEN_ID = shop._id;
    $crisp.push(["set", "user:nickname", [shop.name]]);
    $crisp.push(["set", "user:email", [shop.contactEmail]]);
    $crisp.push(["set", "user:company", [shop.name]]);
    $crisp.push(["set", "session:data", [[["platform", "woocommerce"]]]]);

    (function () {
      var d = document;
      var s = d.createElement("script");

      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }, [shop]);
}
