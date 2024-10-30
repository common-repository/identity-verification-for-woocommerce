/**
 * Retrieve the given asset
 *
 * @param {String} assetPath
 * @returns String
 */
export const asset = (assetPath) => {
  return `${window.realIdAssetsUrl}/${assetPath}`;
};

/**
 *  Render a template content string into human readable format
 *
 * NOTE: yes it's called `selectedOrder` but in fact it's the order ID (#1111).
 *   It's a pullover from the new.js page. I'm just tired at the moment.
 *
 * @param {String} content
 * @param {Object} params
 * @return {String}
 */
export const renderContent = (content = "", params, forEmail = false) => {
  let renderedContent = content
    .replace(/\[firstName\]/g, params.firstName || "")
    .replace(/\[lastName\]/g, params.lastName || "");

  // not doing this leaves a weird 'undefined' string
  if (params.selectedOrder) {
    renderedContent = renderedContent.replace(
      /\[orderId\]/g,
      params.selectedOrder
    );
  } else {
    renderedContent = renderedContent.replace(/\[orderId\]/g, "");
  }
  if (forEmail) {
    renderedContent = renderedContent.replace(/\n+/g, "<br/>");
  }

  return renderedContent.replace("undefined", "");
};
