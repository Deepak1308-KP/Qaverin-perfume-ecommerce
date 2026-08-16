import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";

export function CartProvider({ children }) {

  /* =================================
     LOAD CART FROM LOCAL STORAGE
  ================================= */

  const [cartItems, setCartItems] = useState(() => {

    const savedCart =
      localStorage.getItem("qaverin-cart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];

  });


  /* =================================
     SAVE CART TO LOCAL STORAGE
  ================================= */

  useEffect(() => {

    localStorage.setItem(
      "qaverin-cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  /* =================================
     ADD TO CART
  ================================= */

  const addToCart = (product, quantity = 1) => {

    setCartItems((currentItems) => {

      const existingItem =
        currentItems.find(
          (item) => item.id === product.id
        );


      if (existingItem) {

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );

      }


      return [
        ...currentItems,

        {
          ...product,
          quantity,
        },
      ];

    });

  };


  /* =================================
     INCREASE QUANTITY
  ================================= */

  const increaseQuantity = (id) => {

    setCartItems((currentItems) =>

      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )

    );

  };


  /* =================================
     DECREASE QUANTITY
  ================================= */

  const decreaseQuantity = (id) => {

    setCartItems((currentItems) =>

      currentItems
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )

    );

  };


  /* =================================
     REMOVE FROM CART
  ================================= */

  const removeFromCart = (id) => {

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );

  };


  /* =================================
     CLEAR CART
  ================================= */

  const clearCart = () => {

    setCartItems([]);

  };


  /* =================================
     CART COUNT
  ================================= */

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );


  /* =================================
     CART TOTAL
  ================================= */

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) *
      item.quantity,
    0
  );


  /* =================================
     PROVIDER
  ================================= */

  return (

    <CartContext.Provider
      value={{

        cartItems,

        addToCart,

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