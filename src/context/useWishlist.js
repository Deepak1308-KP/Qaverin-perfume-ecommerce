import { useContext } from "react";
import { WishlistContext } from "./WishlistContext";

export function useWishlist() {
  return useContext(WishlistContext);
}