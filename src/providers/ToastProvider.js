import { useContext, createContext } from "react";

export const ToastContext = createContext(false);

export const ToastProvider = ToastContext.Provider;

export function useToast() {
  const setToast = useContext(ToastContext);
  return setToast;
}
