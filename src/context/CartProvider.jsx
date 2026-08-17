import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState(() => {

    const savedCart =
      localStorage.getItem("qaverin-cart");

    try {
      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }

  });


  useEffect(() => {

    localStorage.setItem(
      "qaverin-cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  /* =========================================
     ADD TO CART
  ========================================= */

  const addToCart = (product, quantity = 1) => {

    let wasAlreadyInCart = false;


    setCartItems((currentItems) => {

      const existingItem =
        currentItems.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );


      /* =====================================
         ALREADY EXISTS
      ===================================== */

      if (existingItem) {

        wasAlreadyInCart = true;

        return currentItems;

      }


      /* =====================================
         ADD NEW PRODUCT
      ===================================== */

      return [

        ...currentItems,

        {
          ...product,

          quantity: Number(quantity) || 1,

        },

      ];

    });


    return !wasAlreadyInCart;

  };


  /* =========================================
     CHECK CART
  ========================================= */

  const isInCart = (id) => {

    return cartItems.some(
      (item) =>
        String(item.id) ===
        String(id)
    );

  };


  /* =========================================
     INCREASE QUANTITY
  ========================================= */

  const increaseQuantity = (id) => {

    setCartItems((currentItems) =>

      currentItems.map((item) =>

        String(item.id) === String(id)

          ? {
              ...item,

              quantity:
                Number(item.quantity || 0) + 1,
            }

          : item

      )

    );

  };


  /* =========================================
     DECREASE QUANTITY
  ========================================= */

  const decreaseQuantity = (id) => {

    setCartItems((currentItems) =>

      currentItems

        .map((item) =>

          String(item.id) === String(id)

            ? {
                ...item,

                quantity:
                  Number(item.quantity || 0) - 1,
              }

            : item

        )

        .filter(
          (item) =>
            Number(item.quantity || 0) > 0
        )

    );

  };


  /* =========================================
     REMOVE
  ========================================= */

  const removeFromCart = (id) => {

    setCartItems((currentItems) =>

      currentItems.filter(
        (item) =>
          String(item.id) !== String(id)
      )

    );

  };


  /* =========================================
     CLEAR
  ========================================= */

  const clearCart = () => {

    setCartItems([]);

  };


  /* =========================================
     COUNT
  ========================================= */

  const cartCount = cartItems.reduce(

    (total, item) =>

      total +
      Number(item.quantity || 0),

    0

  );


  /* =========================================
     TOTAL
  ========================================= */

  const cartTotal = cartItems.reduce(

    (total, item) =>

      total +
      Number(item.price || 0) *
      Number(item.quantity || 0),

    0

  );


  return (

    <CartContext.Provider
      value={{

        cartItems,

        addToCart,

        isInCart,

        increaseQuantity,

        decreaseQuantity,

        removeFromCart,

        clearCart,

        cartCount,

        cartTotal,

      }}
    >

      {children}

    </CartContext.Provider>

  );

}