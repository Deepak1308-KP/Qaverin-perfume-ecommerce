import { useEffect, useState } from "react";
import { WishlistContext } from "./WishlistContext";

export function WishlistProvider({ children }) {

  /* =================================
     LOAD WISHLIST FROM LOCAL STORAGE
  ================================= */

  const [wishlistItems, setWishlistItems] =
    useState(() => {

      const savedWishlist =
        localStorage.getItem(
          "qaverin-wishlist"
        );

      return savedWishlist
        ? JSON.parse(savedWishlist)
        : [];

    });


  /* =================================
     SAVE WISHLIST TO LOCAL STORAGE
  ================================= */

  useEffect(() => {

    localStorage.setItem(
      "qaverin-wishlist",
      JSON.stringify(wishlistItems)
    );

  }, [wishlistItems]);


  /* =================================
     ADD TO WISHLIST
  ================================= */

  const addToWishlist = (product) => {

    setWishlistItems((currentItems) => {

      const alreadyExists =
        currentItems.some(
          (item) => item.id === product.id
        );


      if (alreadyExists) {

        return currentItems;

      }


      return [
        ...currentItems,
        product,
      ];

    });

  };


  /* =================================
     REMOVE FROM WISHLIST
  ================================= */

  const removeFromWishlist = (id) => {

    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );

  };


  /* =================================
     TOGGLE WISHLIST
  ================================= */

  const toggleWishlist = (product) => {

    setWishlistItems((currentItems) => {

      const alreadyExists =
        currentItems.some(
          (item) => item.id === product.id
        );


      if (alreadyExists) {

        return currentItems.filter(
          (item) => item.id !== product.id
        );

      }


      return [
        ...currentItems,
        product,
      ];

    });

  };


  /* =================================
     CHECK WISHLIST
  ================================= */

  const isWishlisted = (id) => {

    return wishlistItems.some(
      (item) => item.id === id
    );

  };


  /* =================================
     WISHLIST COUNT
  ================================= */

  const wishlistCount =
    wishlistItems.length;


  /* =================================
     PROVIDER
  ================================= */

  return (

    <WishlistContext.Provider
      value={{

        wishlistItems,

        addToWishlist,

        removeFromWishlist,

        toggleWishlist,

        isWishlisted,

        wishlistCount,

      }}
    >

      {children}

    </WishlistContext.Provider>

  );

}