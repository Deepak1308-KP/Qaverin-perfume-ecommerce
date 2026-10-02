import { useEffect, useState } from "react";
import { WishlistContext } from "./WishlistContext";


/* =========================================
   GET CURRENT USER
========================================= */

function getCurrentUser() {

  try {

    const savedUser =
      localStorage.getItem(
        "qaverin-current-user"
      );

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);

  } catch (error) {

    console.error(
      "Current user load error:",
      error
    );

    return null;

  }

}


/* =========================================
   GET USER WISHLIST KEY
========================================= */

function getWishlistKey() {

  const user =
    getCurrentUser();

  if (!user) {
    return null;
  }


  /*
    Prefer user ID because it is unique.
    If ID is not available, use email.
  */

  const userIdentifier =
    user.id ||
    user.user_id ||
    user.email;


  if (!userIdentifier) {
    return null;
  }


  return `qaverin-wishlist-${userIdentifier}`;

}


/* =========================================
   LOAD WISHLIST
========================================= */

function loadWishlist() {

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";

  const token =
    localStorage.getItem(
      "qaverin-token"
    );


  if (!isLoggedIn || !token) {

    return [];

  }


  const wishlistKey =
    getWishlistKey();


  if (!wishlistKey) {

    return [];

  }


  try {

    const savedWishlist =
      localStorage.getItem(
        wishlistKey
      );


    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [];

  } catch (error) {

    console.error(
      "Wishlist load error:",
      error
    );

    return [];

  }

}


export function WishlistProvider({
  children
}) {


  /* =========================================
     WISHLIST STATE
  ========================================= */

  const [
    wishlistItems,
    setWishlistItems
  ] = useState(
    loadWishlist
  );


  /* =========================================
     SAVE WISHLIST
  ========================================= */

  useEffect(() => {

    const isLoggedIn =
      localStorage.getItem(
        "qaverin-logged-in"
      ) === "true";

    const token =
      localStorage.getItem(
        "qaverin-token"
      );


    if (!isLoggedIn || !token) {

      return;

    }


    const wishlistKey =
      getWishlistKey();


    if (!wishlistKey) {

      return;

    }


    localStorage.setItem(
      wishlistKey,
      JSON.stringify(
        wishlistItems
      )
    );

  }, [wishlistItems]);


  /* =========================================
     LOGIN LISTENER
  ========================================= */

  useEffect(() => {

    const handleAuthChange = () => {

      /*
        After login the page normally reloads,
        but this also makes the provider respond
        if login state changes without reload.
      */

      const isLoggedIn =
        localStorage.getItem(
          "qaverin-logged-in"
        ) === "true";

      const token =
        localStorage.getItem(
          "qaverin-token"
        );


      if (!isLoggedIn || !token) {

        setWishlistItems([]);

        return;

      }


      setWishlistItems(
        loadWishlist()
      );

    };


    window.addEventListener(
      "qaverin-auth-change",
      handleAuthChange
    );


    return () => {

      window.removeEventListener(
        "qaverin-auth-change",
        handleAuthChange
      );

    };

  }, []);


  /* =========================================
     LOGOUT LISTENER
  ========================================= */

  useEffect(() => {

    const handleLogout = () => {

      /*
        Clear only the CURRENT user's
        wishlist from React state.

        IMPORTANT:
        We do NOT delete the user's
        saved wishlist from localStorage.

        This means:

        User A
        ↓
        Wishlist A saved

        Logout
        ↓
        UI becomes empty

        Login again
        ↓
        Wishlist A comes back
      */

      setWishlistItems([]);

    };


    window.addEventListener(
      "qaverin-logout",
      handleLogout
    );


    return () => {

      window.removeEventListener(
        "qaverin-logout",
        handleLogout
      );

    };

  }, []);


  /* =========================================
     CHECK LOGIN
  ========================================= */

  const isUserLoggedIn = () => {

    const isLoggedIn =
      localStorage.getItem(
        "qaverin-logged-in"
      ) === "true";

    const token =
      localStorage.getItem(
        "qaverin-token"
      );


    return (
      isLoggedIn &&
      !!token
    );

  };


  /* =========================================
     ADD TO WISHLIST
  ========================================= */

  const addToWishlist = (
    product
  ) => {

    if (!isUserLoggedIn()) {

      alert(
        "Please login before adding products to your wishlist."
      );

      return false;

    }


    setWishlistItems(
      (currentItems) => {

        const alreadyExists =
          currentItems.some(
            (item) =>
              Number(item.id) ===
              Number(product.id)
          );


        if (alreadyExists) {

          return currentItems;

        }


        return [
          ...currentItems,
          product,
        ];

      }
    );


    return true;

  };


  /* =========================================
     REMOVE FROM WISHLIST
  ========================================= */

  const removeFromWishlist = (
    id
  ) => {

    if (!isUserLoggedIn()) {

      return false;

    }


    setWishlistItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            Number(item.id) !==
            Number(id)
        )
    );


    return true;

  };


  /* =========================================
     TOGGLE WISHLIST
  ========================================= */

  const toggleWishlist = (
    product
  ) => {

    if (!isUserLoggedIn()) {

      alert(
        "Please login before adding products to your wishlist."
      );

      return false;

    }


    setWishlistItems(
      (currentItems) => {

        const alreadyExists =
          currentItems.some(
            (item) =>
              Number(item.id) ===
              Number(product.id)
          );


        if (alreadyExists) {

          return currentItems.filter(
            (item) =>
              Number(item.id) !==
              Number(product.id)
          );

        }


        return [
          ...currentItems,
          product,
        ];

      }
    );


    return true;

  };


  /* =========================================
     CHECK WISHLIST
  ========================================= */

  const isWishlisted = (
    id
  ) => {

    return wishlistItems.some(
      (item) =>
        Number(item.id) ===
        Number(id)
    );

  };


  /* =========================================
     WISHLIST COUNT
  ========================================= */

  const wishlistCount =
    wishlistItems.length;


  /* =========================================
     PROVIDER
  ========================================= */

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