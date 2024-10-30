import React, { useContext, createContext } from "react";

export const ShopContext = createContext(false);

export const ShopProvider = ShopContext.Provider;

export const useShop = () => {
  return useContext(ShopContext);
};
