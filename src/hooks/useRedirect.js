import React from "react";
import { useHistory } from "react-router";

export default function useRedirect() {
  const history = useHistory();
  return history.push;
}
