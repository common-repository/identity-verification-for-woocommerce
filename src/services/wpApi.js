import axios from "axios";

axios.interceptors.request.use((config) => {
  const nonce = window.realIdApiSettings.nonce;
  config.headers["X-WP-Nonce"] = nonce;
  config.headers["Content-Type"] = "application/json";

  return config;
});

/**
 * https://github.com/axios/axios/blob/v1.x/lib/helpers/combineURLs.js
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
export function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;
}

/**
 * Get the root wp-json URL
 *
 * @returns String
 */
function root() {
  return window.realIdApiSettings.root;
}

/**
 * get the full WP API route for the given path
 *
 * @param {String} path
 * @returns
 */
function wpRoute(path) {
  return root()
    ? root().replace(/\/?\/$/, "") + "/" + path.replace(/^\/+/, "")
    : root();

  // combinedUrls not found? weird, moved the logic inside this method instead
  return combineUrls(root(), path);
}

export const getCurrentShop = () => {
  return axios.get(wpRoute(`/real-id/v1/shop`));
};

export const getChecks = (params) => {
  return axios.get(wpRoute("/real-id/v1/checks"), {
    params,
  });
};

export const createCheck = (data) => {
  return axios.post(wpRoute("/real-id/v1/checks"), data);
};

export const getCheck = (checkId) => {
  return axios.get(wpRoute(`/real-id/v1/checks/${checkId}`));
};

export const deleteCheckData = (checkId) => {
  return axios.post(wpRoute(`/real-id/v1/checks/${checkId}/data`));
};

export const deliverCheckReminder = (checkId, data) => {
  return axios.post(wpRoute(`/real-id/v1/checks/${checkId}/reminder`), data);
};

export const manuallyApproveCheck = (checkId) => {
  return axios.post(wpRoute(`/real-id/v1/checks/${checkId}/approve`));
};

export const manuallyRejectCheck = (checkId, params) => {
  return axios.post(wpRoute(`/real-id/v1/checks/${checkId}/reject`), params);
};

export const updateSettings = (settings) => {
  return axios.post(wpRoute(`/real-id/v1/shop/settings`), settings);
};

export const deactivateLicense = () => {
  return axios.delete(wpRoute("/real-id/v1/license/deactivate"));
};

export const activateLicense = ({ licenseKey }) => {
  return axios.post(wpRoute("/real-id/v1/license/activate"), {
    licenseKey,
  });
};

export const updateDeliveryMethods = (params) => {
  return axios.post(
    wpRoute("/real-id/v1/shop/update-delivery-methods"),
    params
  );
};

export const addEmailSignature = (params) => {
  return axios.post(wpRoute("/real-id/v1/shop/email-signature/add"), params);
};

export const checkEmailSignatureVerificationStatus = () => {
  return axios.post(
    wpRoute("/real-id/v1/shop/email-signature/check-verification-status")
  );
};

export const removeEmailSignature = (params) => {
  return axios.delete(
    wpRoute("/real-id/v1/shop/email-signature/remove"),
    params
  );
};

export const resetToSandboxMode = () => {
  return axios.post(wpRoute("/real-id/v1/shop/reset"));
};

export const listCategories = ({ currentPage = 1 }) => {
  return axios.get(wpRoute("/wc/v3/products/categories"), {
    params: {
      page: currentPage,
      per_page: 5,
    },
  });
};

export const getCurrentLicenseKey = () => {
  return axios.get(wpRoute("/real-id/v1/license-key"));
};

export const searchOrders = (params) => {
  return axios.get(wpRoute("/real-id/v1/orders/search"), { params });
};

export const getOrder = (id) => {
  return axios.get(wpRoute(`/real-id/v1/orders/${id}`));
};

export const checkEmailSignatureDKIMStatus = () => {
  return axios.get(
    wpRoute(`real-id/v1/shop/email-signature/check-dkim-status`)
  );
};

export const checkEmailSignatureReturnPathStatus = () => {
  return axios.get(
    wpRoute(`real-id/v1/shop/email-signature/check-return-path-status`)
  );
};
