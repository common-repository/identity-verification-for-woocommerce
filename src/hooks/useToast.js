import React, { useContext } from "react";
import { ToastContext } from "../providers/ToastProvider";

export default function useToast() {
  const setToast = useContext(ToastContext);
  return setToast;
}
