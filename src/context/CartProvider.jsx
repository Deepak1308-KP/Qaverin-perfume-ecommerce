import { useCallback, useEffect, useState } from "react";
import { CartContext } from "./CartContext";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


// =========================================
// API URL
// =========================================

const API_URL = "http://127.0.0.1:5000";


// =========================================
// PRODUCT IMAGE
// =========================================

function getProductImage(name) {

  const productName = name
    ? String(name).toLowerCase()
    : "";

  if (productName.includes("noir")) {
    return noir;
  }

  if (productName.includes("rose")) {
    return rose;
  }

  if (productName.includes("oud")) {
    return oud;
  }

  if (
    productName.includes("éclat") ||
    productName.includes("eclat")
  ) {
    return eclat;
  }

  return null;
}


// =========================================
// FORMAT CART ITEM
// =========================================

function formatCartItem(item) {

  return {

    // Product ID
    id: Number(item.product_id),

    // Real cart row ID
    cartId:
      item.cart_id !== undefined &&
      item.cart_id !== null
        ? Number(item.cart_id)
        : null,

    name:
      item.name ||
      "Qaverin fragrance",

    brand:
      item.brand ||
      "",

    price:
      Number(item.price) || 0,

    description:
      item.description ||
      "",

    category:
      item.category ||
      "",

    type:
      item.type ||
      item.category ||
      "Eau de Parfum",

    image:
      getProductImage(item.name) ||
      item.image ||
      null,

    quantity:
      Number(item.quantity) || 1,

    // STOCK
    stock:
      item.stock !== undefined &&
      item.stock !== null
        ? Number(item.stock)
        : null,

  };

}


// =========================================
// CART PROVIDER
// =========================================

export function CartProvider({ children }) {

  // =========================================
  // STATE
  // =========================================

  const [cartItems, setCartItems] =
    useState([]);

  const [loadingCart, setLoadingCart] =
    useState(true);

  // Prevent double clicking Add to Cart
  const [addingProducts, setAddingProducts] =
    useState(new Set());


  // =========================================
  // FETCH PRODUCT STOCK
  // =========================================

  const getProductStock = async (
    productId
  ) => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/products`
        );

      const data =
        await response.json();

      if (!response.ok) {

        console.error(
          "Unable to fetch products:",
          data
        );

        return null;
      }

      const products =
        Array.isArray(data.products)
          ? data.products
          : [];

      const product =
        products.find(
          (item) =>
            Number(item.id) ===
            Number(productId)
        );

      if (!product) {

        console.error(
          "Product not found:",
          productId
        );

        return null;
      }

      return Number(product.stock) || 0;

    } catch (error) {

      console.error(
        "Get product stock error:",
        error
      );

      return null;
    }

  };


// =========================================
// FETCH CART
// =========================================

  const fetchCart = useCallback(
    async () => {

      const token =
        localStorage.getItem(
          "qaverin-token"
        );

      // =======================================
      // USER NOT LOGGED IN
      // =======================================

      if (!token) {

        setCartItems([]);

        setLoadingCart(false);

        return;
      }

      try {

        // =====================================
        // GET CART
        // =====================================

        const response =
          await fetch(
            `${API_URL}/api/cart`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        // =====================================
        // API ERROR
        // =====================================

        if (!response.ok) {

          console.error(
            "Fetch cart failed:",
            data
          );

          setCartItems([]);

          return;
        }

        // =====================================
        // CART DATA
        // =====================================

        const backendCart =
          Array.isArray(data.cart)
            ? data.cart
            : [];

        const formattedCart =
          backendCart.map(
            formatCartItem
          );

        console.log(
          "CART FROM BACKEND:",
          formattedCart
        );

        setCartItems(
          formattedCart
        );

      } catch (error) {

        console.error(
          "Fetch cart error:",
          error
        );

        setCartItems([]);

      } finally {

        setLoadingCart(false);

      }

    },
    []
  );


// =========================================
// INITIAL CART LOAD
// =========================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        fetchCart();

      }, 0);

    return () => {

      clearTimeout(timer);

    };

  }, [fetchCart]);


// =========================================
// LOGOUT LISTENER
// =========================================
//
// IMPORTANT:
//
// Account.jsx sends:
//
// window.dispatchEvent(
//   new Event("qaverin-logout")
// );
//
// When that happens, clear only the
// frontend React cart state.
//
// The database cart is NOT deleted.
//
// When the user logs in again,
// fetchCart() loads their database cart.
// =========================================

  useEffect(() => {

    const handleLogout = () => {

      console.log(
        "Logout detected - clearing cart state"
      );

      setCartItems([]);

      setLoadingCart(false);

      // Also clear any pending add states
      setAddingProducts(
        new Set()
      );

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


// =========================================
// ADD TO CART
// =========================================

  const addToCart = async (
    product,
    quantity = 1
  ) => {

    const token =
      localStorage.getItem(
        "qaverin-token"
      );

    // =======================================
    // LOGIN CHECK
    // =======================================

    if (!token) {

      alert(
        "Please login before adding products to your bag."
      );

      return false;
    }

    // =======================================
    // PRODUCT ID
    // =======================================

    const productId =
      Number(product?.id);

    if (!productId) {

      console.error(
        "Invalid product:",
        product
      );

      alert(
        "Invalid product."
      );

      return false;
    }

    // =======================================
    // GET STOCK
    // =======================================

    const stock =
      await getProductStock(
        productId
      );

    if (
      stock !== null &&
      stock <= 0
    ) {

      alert(
        "This product is currently out of stock."
      );

      return false;
    }

    // =======================================
    // CHECK EXISTING PRODUCT
    // =======================================

    const existingItem =
      cartItems.find(
        (item) =>
          Number(item.id) ===
          productId
      );

    // =======================================
    // ALREADY IN CART
    // =======================================

    if (existingItem) {

      console.log(
        "Product already in cart:",
        productId
      );

      return false;
    }

    // =======================================
    // PREVENT DOUBLE CLICK
    // =======================================

    if (
      addingProducts.has(productId)
    ) {

      return false;
    }

    setAddingProducts(
      (previous) => {

        const next =
          new Set(previous);

        next.add(productId);

        return next;

      }
    );

    try {

      // =====================================
      // CHECK REQUESTED QUANTITY
      // =====================================

      const requestedQuantity =
        Number(quantity) || 1;

      if (
        stock !== null &&
        requestedQuantity > stock
      ) {

        alert(
          `Only ${stock} item${
            stock === 1
              ? ""
              : "s"
          } available.`
        );

        return false;
      }

      // =====================================
      // POST CART
      // =====================================

      const response =
        await fetch(
          `${API_URL}/api/cart`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              product_id:
                productId,

              quantity:
                requestedQuantity,
            }),
          }
        );

      const data =
        await response.json();

      // =====================================
      // API ERROR
      // =====================================

      if (!response.ok) {

        console.error(
          "Add cart failed:",
          data
        );

        alert(
          data.message ||
          "Unable to add product to cart."
        );

        return false;
      }

      // =====================================
      // REFRESH CART
      // =====================================

      await fetchCart();

      return true;

    } catch (error) {

      console.error(
        "Add to cart error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

      return false;

    } finally {

      setAddingProducts(
        (previous) => {

          const next =
            new Set(previous);

          next.delete(productId);

          return next;

        }
      );

    }

  };


// =========================================
// CHECK IF PRODUCT IS IN CART
// =========================================

  const isInCart = (productId) => {

    const numericProductId =
      Number(productId);

    return cartItems.some(
      (item) =>
        Number(item.id) ===
        numericProductId
    );

  };


// =========================================
// FIND CART ITEM
// =========================================

  const findCartItem = (productId) => {

    const numericProductId =
      Number(productId);

    return cartItems.find(
      (item) =>
        Number(item.id) ===
        numericProductId
    );

  };


// =========================================
// UPDATE QUANTITY
// =========================================

  const updateQuantity = async (
    productId,
    quantity
  ) => {

    const token =
      localStorage.getItem(
        "qaverin-token"
      );

    if (!token) {

      alert(
        "Please login first."
      );

      return false;
    }

    const numericProductId =
      Number(productId);

    const numericQuantity =
      Number(quantity);

    if (!numericProductId) {

      console.error(
        "Invalid product ID:",
        productId
      );

      return false;
    }

    // =====================================
    // NEVER ALLOW ZERO
    // =====================================

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity < 1
    ) {

      return false;
    }

    const item =
      findCartItem(
        numericProductId
      );

    if (!item) {

      console.error(
        "Product not found in cart state:",
        numericProductId
      );

      return false;
    }

    // =====================================
    // GET CURRENT STOCK
    // =====================================

    const stock =
      await getProductStock(
        numericProductId
      );

    // =====================================
    // STOCK LIMIT
    // =====================================

    if (
      stock !== null &&
      numericQuantity > stock
    ) {

      alert(
        `Only ${stock} item${
          stock === 1
            ? ""
            : "s"
        } available.`
      );

      return false;
    }

    // =====================================
    // USE CART ROW ID
    // =====================================

    const identifier =
      Number(item.cartId) ||
      numericProductId;

    try {

      console.log(
        "UPDATING CART:",
        {
          productId:
            numericProductId,

          cartId:
            item.cartId,

          identifier,

          quantity:
            numericQuantity,

          stock,
        }
      );

      const response =
        await fetch(
          `${API_URL}/api/cart/${identifier}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              quantity:
                numericQuantity,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      console.log(
        "UPDATE RESPONSE:",
        data
      );

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to update quantity."
        );

        return false;
      }

      await fetchCart();

      return true;

    } catch (error) {

      console.error(
        "Update quantity error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

      return false;

    }

  };


// =========================================
// INCREASE QUANTITY
// =========================================

  const increaseQuantity = async (
    productId
  ) => {

    const item =
      findCartItem(
        productId
      );

    if (!item) {

      console.error(
        "Cannot increase quantity. Product not found:",
        productId
      );

      return false;
    }

    const currentQuantity =
      Number(item.quantity) || 1;

    // =====================================
    // GET STOCK
    // =====================================

    const stock =
      await getProductStock(
        productId
      );

    // =====================================
    // MAXIMUM STOCK
    // =====================================

    if (
      stock !== null &&
      currentQuantity >= stock
    ) {

      alert(
        `Only ${stock} item${
          stock === 1
            ? ""
            : "s"
        } available.`
      );

      return false;
    }

    return updateQuantity(
      productId,
      currentQuantity + 1
    );

  };


// =========================================
// DECREASE QUANTITY
// =========================================

  const decreaseQuantity = async (
    productId
  ) => {

    const item =
      findCartItem(
        productId
      );

    if (!item) {

      console.error(
        "Cannot decrease quantity. Product not found:",
        productId
      );

      return false;
    }

    const currentQuantity =
      Number(item.quantity) || 1;

    // =====================================
    // MINIMUM QUANTITY = 1
    // =====================================

    if (
      currentQuantity <= 1
    ) {

      return false;
    }

    return updateQuantity(
      productId,
      currentQuantity - 1
    );

  };


// =========================================
// REMOVE FROM CART
// =========================================

  const removeFromCart = async (
    productId
  ) => {

    const token =
      localStorage.getItem(
        "qaverin-token"
      );

    if (!token) {

      alert(
        "Please login first."
      );

      return false;
    }

    const numericProductId =
      Number(productId);

    if (!numericProductId) {

      console.error(
        "Invalid product ID:",
        productId
      );

      return false;
    }

    const item =
      findCartItem(
        numericProductId
      );

    if (!item) {

      console.error(
        "Cannot remove product. Product not found:",
        numericProductId
      );

      return false;
    }

    try {

      console.log(
        "REMOVING CART:",
        {
          productId:
            numericProductId,

          cartId:
            item.cartId
        }
      );

      const response =
        await fetch(
          `${API_URL}/api/cart/${numericProductId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      console.log(
        "REMOVE RESPONSE:",
        data
      );

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to remove product."
        );

        return false;
      }

      await fetchCart();

      return true;

    } catch (error) {

      console.error(
        "Remove cart error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

      return false;

    }

  };


// =========================================
// CLEAR CART
// =========================================

  const clearCart = async () => {

    const token =
      localStorage.getItem(
        "qaverin-token"
      );

    if (!token) {

      setCartItems([]);

      return false;
    }

    const items =
      [...cartItems];

    if (
      items.length === 0
    ) {

      setCartItems([]);

      return true;
    }

    let allRemoved =
      true;

    // =====================================
    // REMOVE EVERY CART ROW
    // =====================================

    for (
      const item of items
    ) {

      // USE PRODUCT ID
      const identifier =
        Number(item.id);

      if (!identifier) {

        allRemoved =
          false;

        continue;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/api/cart/${identifier}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {

          allRemoved =
            false;

        }

      } catch (error) {

        console.error(
          "Clear cart item error:",
          error
        );

        allRemoved =
          false;

      }

    }

    // =====================================
    // CLEAR FRONTEND STATE
    // =====================================

    setCartItems([]);

    // =====================================
    // VERIFY BACKEND
    // =====================================

    await fetchCart();

    return allRemoved;

  };


// =========================================
// CLEAR FRONTEND CART STATE
// =========================================
//
// IMPORTANT:
//
// This does NOT delete the database cart.
//
// It only clears React state when the
// user logs out.
//

  const clearCartState = () => {

    setCartItems([]);

    setLoadingCart(false);

  };


// =========================================
// TOTAL QUANTITY
// =========================================

  const cartCount =
    cartItems.reduce(
      (
        total,
        item
      ) => {

        return (
          total +
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );


// =========================================
// UNIQUE PRODUCT COUNT
// =========================================

  const cartItemCount =
    cartItems.length;


// =========================================
// CART TOTAL
// =========================================

  const cartTotal =
    cartItems.reduce(
      (
        total,
        item
      ) => {

        return (
          total +
          Number(
            item.price || 0
          ) *
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );


// =========================================
// PROVIDER
// =========================================

  return (

    <CartContext.Provider
      value={{

        // CART
        cartItems,

        // ADD
        addToCart,

        // CHECK
        isInCart,

        // FIND
        findCartItem,

        // QUANTITY
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,

        // REMOVE
        removeFromCart,
        clearCart,

        // LOGOUT
        clearCartState,

        // TOTALS
        cartCount,

        // UNIQUE PRODUCTS
        cartItemCount,

        cartTotal,

        // STATUS
        loadingCart,

        // REFRESH
        fetchCart,

      }}
    >

      {children}

    </CartContext.Provider>

  );

}