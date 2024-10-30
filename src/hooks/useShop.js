import React, { useContext } from "react";
import { ShopContext } from "../providers/ShopProvider";

export default () => {
  return useContext(ShopContext);
};
