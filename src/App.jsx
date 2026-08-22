import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { CartProvider } from "./context/CartProvider";
import { WishlistProvider } from "./context/WishlistProvider";
import { OrderProvider } from "./context/OrderProvider";

import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import SignatureCollection from "./components/SignatureCollection";
import OurStory from "./components/OurStory";
import Experience from "./components/Experience";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import Shop from "./components/Shop";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Wishlist from "./components/Wishlist";

import OrderSuccess from "./components/OrderSuccess";
import OrderDetails from "./components/OrderDetails";
import Orders from "./components/Orders";

import Profile from "./components/Profile";
import About from "./components/About";
import Collections from "./components/Collections";
import Account from "./components/Account";

import Login from "./components/Login";
import Signup from "./components/Signup";


/* =========================================
   HOME PAGE
========================================= */

function Home() {
  return (
    <>
      <Hero />

      <SignatureCollection />

      <OurStory />

      <Experience />

      <Newsletter />

      <Footer />
    </>
  );
}


/* =========================================
   WELCOME POPUP
   SHOW ONLY FOR LOGGED-OUT USERS
========================================= */

function EntryNotification() {
  const [showNotification, setShowNotification] = useState(() => {
    const loggedIn =
      localStorage.getItem("qaverin-logged-in") === "true";

    return !loggedIn;
  });


  /* =========================================
     HIDE AFTER 5 SECONDS
  ========================================= */

  useEffect(() => {
    if (!showNotification) return;

    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [showNotification]);


  /* =========================================
     DON'T SHOW FOR LOGGED-IN USER
  ========================================= */

  if (!showNotification) {
    return null;
  }


  /* =========================================
     POPUP
  ========================================= */

  return (
    <div
      style={{
        position: "fixed",

        top: "85px",

        right: "25px",

        zIndex: 999999,

        width: "340px",

        padding: "18px 20px",

        display: "flex",

        alignItems: "flex-start",

        gap: "14px",

        background:
          "var(--popup-background, #f7f4ef)",

        color:
          "var(--popup-text, #171513)",

        border:
          "1px solid var(--popup-border, #d8c5aa)",

        borderRadius: "4px",

        boxShadow:
          "0 12px 35px rgba(0, 0, 0, 0.18)",

        fontFamily:
          "Arial, sans-serif",

        animation:
          "qaverinPopupIn 0.4s ease",

        pointerEvents: "none",
      }}
    >

      {/* ICON */}

      <span
        style={{
          flexShrink: 0,

          width: "28px",

          height: "28px",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          color: "#9b7540",

          fontSize: "17px",

          border:
            "1px solid #9b7540",

          borderRadius: "50%",
        }}
      >
        ✦
      </span>


      {/* CONTENT */}

      <div
        style={{
          flex: 1,
        }}
      >

        <strong
          style={{
            display: "block",

            marginBottom: "6px",

            fontSize: "9px",

            fontWeight: "600",

            letterSpacing: "2px",

            color: "#9b7540",
          }}
        >
          WELCOME TO QAVERIN
        </strong>


        <p
          style={{
            margin: 0,

            fontSize: "12px",

            lineHeight: "1.6",

            color:
              "var(--popup-message, #5f5952)",
          }}
        >
          Please login or create an account
          to enjoy your fragrance journey.
        </p>

      </div>

    </div>
  );
}


/* =========================================
   NOT FOUND PAGE
========================================= */

function NotFound() {
  return (
    <main
      style={{
        minHeight: "80vh",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        background: "#f7f4ef",

        color: "#171513",

        textAlign: "center",

        padding: "40px",
      }}
    >

      <p
        style={{
          fontFamily:
            "Arial, sans-serif",

          fontSize: "10px",

          letterSpacing: "4px",

          color: "#9b7540",
        }}
      >
        QAVERIN
      </p>


      <h1
        style={{
          fontFamily:
            "Georgia, serif",

          fontSize: "60px",

          fontWeight: "400",

          margin: "10px 0",
        }}
      >
        Page not found.
      </h1>


      <p
        style={{
          fontFamily:
            "Arial, sans-serif",

          color: "#6f6962",
        }}
      >
        The page you're looking for doesn't exist.
      </p>


      <a
        href="/"
        style={{
          marginTop: "25px",

          padding: "14px 22px",

          background: "#171513",

          color: "#fff",

          textDecoration: "none",

          fontFamily:
            "Arial, sans-serif",

          fontSize: "10px",

          letterSpacing: "1.5px",
        }}
      >
        BACK TO HOME →
      </a>

    </main>
  );
}


/* =========================================
   APP
========================================= */

function App() {
  return (
    <CartProvider>

      <WishlistProvider>

        <OrderProvider>

          <BrowserRouter>

            <Navbar />

            <EntryNotification />

            <Routes>


              {/* =================================
                  HOME
              ================================= */}

              <Route
                path="/"
                element={<Home />}
              />


              {/* =================================
                  SHOP
              ================================= */}

              <Route
                path="/shop"
                element={<Shop />}
              />


              {/* =================================
                  PRODUCT DETAILS
              ================================= */}

              <Route
                path="/product/:id"
                element={<ProductDetails />}
              />


              {/* =================================
                  CART
              ================================= */}

              <Route
                path="/cart"
                element={<Cart />}
              />


              {/* =================================
                  CHECKOUT
              ================================= */}

              <Route
                path="/checkout"
                element={<Checkout />}
              />


              {/* =================================
                  WISHLIST
              ================================= */}

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />


              {/* =================================
                  ORDER SUCCESS
              ================================= */}

              <Route
                path="/order-success"
                element={<OrderSuccess />}
              />


              {/* =================================
                  ALL ORDERS
              ================================= */}

              <Route
                path="/orders"
                element={<Orders />}
              />


              {/* =================================
                  ORDER DETAILS
              ================================= */}

              <Route
                path="/order/:id"
                element={<OrderDetails />}
              />


              {/* =================================
                  PROFILE
              ================================= */}

              <Route
                path="/profile"
                element={<Profile />}
              />


              {/* =================================
                  ABOUT
              ================================= */}

              <Route
                path="/about"
                element={<About />}
              />


              {/* =================================
                  COLLECTIONS
              ================================= */}

              <Route
                path="/collections"
                element={<Collections />}
              />


              {/* =================================
                  LOGIN
              ================================= */}

              <Route
                path="/login"
                element={<Login />}
              />


              {/* =================================
                  SIGN UP
              ================================= */}

              <Route
                path="/signup"
                element={<Signup />}
              />


              {/* =================================
                  ACCOUNT
              ================================= */}

              <Route
                path="/account"
                element={<Account />}
              />


              {/* =================================
                  INVALID URL
              ================================= */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>

          </BrowserRouter>

        </OrderProvider>

      </WishlistProvider>

    </CartProvider>
  );
}


export default App;