import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

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
          fontFamily: "Arial, sans-serif",

          fontSize: "10px",

          letterSpacing: "4px",

          color: "#9b7540",
        }}
      >
        QAVERIN
      </p>


      <h1
        style={{
          fontFamily: "Georgia, serif",

          fontSize: "60px",

          fontWeight: "400",

          margin: "10px 0",
        }}
      >
        Page not found.
      </h1>


      <p
        style={{
          fontFamily: "Arial, sans-serif",

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

          fontFamily: "Arial, sans-serif",

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