import React, { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { renderContent } from "helpers";
import useDebounce from "hooks/useDebounce";
import get from "lodash/get";

/**
 * Render a preview of the form's defaultContent to show what a sample ID check's content would look like to an end customer
 *
 * @NOTE uses Formik's context API to listen to changes on the form
 */
export default function PreviewCustomContent({ field = "defaultContent" }) {
  // Grab values from formik context
  const [renderedContent, setRenderedContent] = useState("");
  const { values } = useFormikContext();

  const debouncedContent = useDebounce(get(values, field));

  useEffect(() => {
    setRenderedContent(
      renderContent(debouncedContent, {
        selectedOrder: "#1234",
        firstName: "John",
        lastName: "Smith",
      })
    );
  }, [debouncedContent]);

  return <div style={{ whiteSpace: "pre-line" }}>{renderedContent}</div>;
}
