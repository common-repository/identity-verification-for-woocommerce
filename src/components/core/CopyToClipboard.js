import React, { useState } from "react";
import { CopyToClipboard as CopyToClipboardBase } from "react-copy-to-clipboard";
import useToast from "hooks/useToast";

export default function CopyToClipboard({ text, children }) {
  const setToast = useToast();

  return (
    <CopyToClipboardBase
      text={text}
      onCopy={() => {
        setToast("Copied to clipboard");
      }}
    >
      {children}
    </CopyToClipboardBase>
  );
}
