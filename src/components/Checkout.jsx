import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useOrder } from "../context/useOrder";

const API_URL = import.meta.env.VITE_API_BASE_URL;
import "./Checkout.css";



function Checkout() {

  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const { addOrder } = useOrder();



  /* =========================================
     LOGIN / USER DATA
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";



  const userData =
    localStorage.getItem("qaverin-current-user");



  let currentUser = null;

  try {

    currentUser = userData
      ? JSON.parse(userData)
      : null;

  } catch (error) {

    console.error(
      "Unable to read current user:",
      error
    );

  }



  /* =========================================
     STATE
  ========================================= */

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);



  /* =========================================
     LOGIN
  ========================================= */

  const goToLogin = () => {

    navigate("/login", {
      state: {
        from: "/checkout",
      },
    });

  };



  /* =========================================
     COMPLETE COD ORDER
  ========================================= */

  const completeOrder = async (
    customer,
    payment
  ) => {

    const token =
      localStorage.getItem("qaverin-token");



    if (!token) {

      alert(
        "Your login session has expired. Please login again."
      );

      setIsPlacingOrder(false);

      goToLogin();

      return;
    }



    if (
      !currentUser ||
      currentUser.role !== "customer"
    ) {

      alert(
        "Please login with a customer account before placing an order."
      );

      setIsPlacingOrder(false);

      return;
    }



    if (!customer) {

      setIsPlacingOrder(false);

      return;
    }



    if (!cartItems.length) {

      alert(
        "Your cart is empty."
      );

      setIsPlacingOrder(false);

      return;
    }



    try {

      setIsPlacingOrder(true);



      const response =
        await fetch(
         `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({

              customer:
                customer,

              payment_method:
                payment,

            }),
          }
        );



      const data =
        await response.json();



      if (!response.ok) {

        alert(
          data.message ||
          "Unable to place your order."
        );

        setIsPlacingOrder(false);

        return;
      }



      if (!data.order) {

        alert(
          "Order was created but no order information was returned."
        );

        setIsPlacingOrder(false);

        return;
      }



      localStorage.setItem(
        "qaverin-last-order",
        JSON.stringify(data.order)
      );



      if (addOrder) {

        addOrder(
          data.order
        );

      }



      await clearCart();



      navigate(
        "/order-success",
        {
          replace: true,
        }
      );



    } catch (error) {

      console.error(
        "Order creation error:",
        error
      );

      alert(
        "Unable to connect to the server. Please make sure the Flask backend is running."
      );

      setIsPlacingOrder(false);

    }

  };



  /* =========================================
     START CASHFREE PAYMENT
  ========================================= */

  const startCashfreePayment =
    async (customer) => {

      const token =
        localStorage.getItem(
          "qaverin-token"
        );



      if (!token) {

        alert(
          "Your login session has expired. Please login again."
        );

        goToLogin();

        return;
      }



      if (!customer) {

        alert(
          "Customer information is missing."
        );

        return;
      }



      if (!window.Cashfree) {

        alert(
          "Cashfree payment service is not loaded. Please refresh the page and try again."
        );

        return;
      }



      try {

        setIsPlacingOrder(true);



        /* =================================
           CREATE CASHFREE ORDER
        ================================= */

        const response =
          await fetch(
            `${API_URL}/api/payment/create`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                amount:
                  Number(cartTotal),

                customer:
                  customer,

                /* IMPORTANT:
                   Send the payment method
                   selected on Qaverin checkout.
                */

                payment_method:
                  paymentMethod,

              }),
            }
          );



        const data =
          await response.json();



        if (!response.ok) {

          console.error(
            "Cashfree create order error:",
            data
          );

          alert(
            data.message ||
            "Unable to start payment."
          );

          setIsPlacingOrder(false);

          return;
        }



        if (!data.payment_session_id) {

          console.error(
            "Cashfree session missing:",
            data
          );

          alert(
            "Cashfree payment session was not created."
          );

          setIsPlacingOrder(false);

          return;
        }



        /* =================================
           SAVE CHECKOUT INFORMATION
           BEFORE CASHFREE OPENS
        ================================= */

        localStorage.setItem(
          "qaverin-pending-payment",
          JSON.stringify({

            order_id:
              data.order_id,

            customer:
              customer,

            payment_method:
              paymentMethod,

          })
        );



        console.log(
          "Pending payment information saved."
        );



        /* =================================
           INITIALIZE CASHFREE
        ================================= */

        const cashfree =
          window.Cashfree({
            mode: "sandbox",
          });



        /* =================================
           OPEN CASHFREE CHECKOUT
        ================================= */

        await cashfree.checkout({

          paymentSessionId:
            data.payment_session_id,

          redirectTarget:
            "_self",

        });



      } catch (error) {

        console.error(
          "Cashfree payment error:",
          error
        );

        alert(
          "Unable to connect to Cashfree. Please try again."
        );

        setIsPlacingOrder(false);

      }

    };



  /* =========================================
     PLACE ORDER
  ========================================= */

  const handlePlaceOrder = (
    event
  ) => {

    event.preventDefault();



    const loggedIn =
      localStorage.getItem(
        "qaverin-logged-in"
      ) === "true";



    if (!loggedIn) {

      alert(
        "Please login to continue with checkout."
      );

      goToLogin();

      return;
    }



    if (
      !currentUser ||
      currentUser.role !== "customer"
    ) {

      alert(
        "Please login with a customer account before placing an order."
      );

      return;
    }



    const token =
      localStorage.getItem(
        "qaverin-token"
      );



    if (!token) {

      alert(
        "Login session not found. Please login again."
      );

      goToLogin();

      return;
    }



    if (cartItems.length === 0) {

      alert(
        "Your cart is empty."
      );

      return;
    }



    if (isPlacingOrder) {

      return;

    }



    const formData =
      new FormData(
        event.currentTarget
      );



    /* =================================
       PHONE
    ================================= */

    const phone =
      String(
        formData.get("phone") || ""
      ).trim();



    const phoneDigits =
      phone.replace(
        /\D/g,
        ""
      );



    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 12
    ) {

      alert(
        "Please enter a valid phone number."
      );

      return;
    }



    /* =================================
       PINCODE
    ================================= */

    const pincode =
      String(
        formData.get("pincode") || ""
      ).trim();



    if (
      !/^\d{6}$/.test(pincode)
    ) {

      alert(
        "Please enter a valid 6-digit PIN code."
      );

      return;
    }



    /* =================================
       EMAIL
    ================================= */

    const email =
      String(
        formData.get("email") || ""
      ).trim();



    if (!email) {

      alert(
        "Please enter your email address."
      );

      return;
    }



    /* =================================
       NAME
    ================================= */

    const name =
      String(
        formData.get("name") || ""
      ).trim();



    if (!name) {

      alert(
        "Please enter your full name."
      );

      return;
    }



    /* =================================
       ADDRESS
    ================================= */

    const address =
      String(
        formData.get("address") || ""
      ).trim();



    const city =
      String(
        formData.get("city") || ""
      ).trim();



    const state =
      String(
        formData.get("state") || ""
      ).trim();



    /* =================================
       CUSTOMER
    ================================= */

    const customer = {

      email,

      phone,

      name,

      address,

      city,

      state,

      pincode,

    };



    /* =================================
       CASH ON DELIVERY
    ================================= */

    if (
      paymentMethod === "cod"
    ) {

      setIsPlacingOrder(true);



      setTimeout(() => {

        completeOrder(
          customer,
          "cod"
        );

      }, 700);



      return;
    }



    /* =================================
       CARD / UPI → CASHFREE
    ================================= */

    startCashfreePayment(
      customer
    );

  };



  /* =========================================
     LOGIN PROTECTION
  ========================================= */

  if (!isLoggedIn) {

    return (

      <main className="checkout-page">

        <section className="checkout-login-required">

          <p className="checkout-eyebrow">
            QAVERIN · CHECKOUT
          </p>



          <h1>
            Please <em>login.</em>
          </h1>



          <p className="checkout-login-description">

            You need to be logged in before
            you can proceed with checkout
            and place an order.

          </p>



          <button
            type="button"
            className="checkout-login-button"
            onClick={goToLogin}
          >

            LOGIN TO CONTINUE

            <span>
              →
            </span>

          </button>



          <Link
            to="/cart"
            className="checkout-login-back"
          >

            ← BACK TO BAG

          </Link>

        </section>

      </main>

    );

  }



  /* =========================================
     ADMIN PROTECTION
  ========================================= */

  if (
    !currentUser ||
    currentUser.role !== "customer"
  ) {

    return (

      <main className="checkout-page">

        <section className="checkout-login-required">

          <p className="checkout-eyebrow">
            QAVERIN · CHECKOUT
          </p>



          <h1>
            Customer <em>login required.</em>
          </h1>



          <p className="checkout-login-description">

            Admin accounts cannot place
            customer orders. Please login
            with a customer account.

          </p>



          <button
            type="button"
            className="checkout-login-button"
            onClick={() => {

              localStorage.removeItem(
                "qaverin-logged-in"
              );

              localStorage.removeItem(
                "qaverin-token"
              );

              localStorage.removeItem(
                "qaverin-current-user"
              );

              navigate(
                "/login",
                {
                  replace: true,

                  state: {
                    from: "/checkout",
                  },

                }
              );

            }}
          >

            LOGIN AS CUSTOMER

            <span>
              →
            </span>

          </button>



          <Link
            to="/"
            className="checkout-login-back"
          >

            ← BACK TO STORE

          </Link>

        </section>

      </main>

    );

  }



  /* =========================================
     EMPTY CART
  ========================================= */

  if (
    cartItems.length === 0
  ) {

    return (

      <main className="checkout-page">

        <section className="checkout-empty">

          <p className="checkout-eyebrow">
            QAVERIN CHECKOUT
          </p>



          <h1>
            Your bag is <em>empty.</em>
          </h1>



          <p>

            Add a fragrance to your bag before
            proceeding to checkout.

          </p>



          <Link
            to="/shop"
            className="checkout-shop-button"
          >

            EXPLORE COLLECTION

            <span>
              →
            </span>

          </Link>

        </section>

      </main>

    );

  }



  /* =========================================
     MAIN CHECKOUT
  ========================================= */

  return (

    <main className="checkout-page">



      <section className="checkout-header">

        <p className="checkout-eyebrow">
          QAVERIN · CHECKOUT
        </p>



        <h1>
          Complete your <em>order.</em>
        </h1>



        <p>
          A few details and your fragrance
          will be on its way.
        </p>

      </section>



      <section className="checkout-layout">



        {/* =================================
            FORM
        ================================= */}

        <form
          className="checkout-form"
          onSubmit={handlePlaceOrder}
        >



          {/* CONTACT */}

          <div className="checkout-section">

            <p className="checkout-section-number">
              01
            </p>



            <h2>
              Contact information
            </h2>



            <div className="checkout-fields">



              <div className="checkout-field">

                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>



                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  defaultValue={
                    currentUser?.email || ""
                  }
                  required
                />

              </div>



              <div className="checkout-field">

                <label htmlFor="phone">
                  PHONE NUMBER
                </label>



                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  maxLength="15"
                  required
                />

              </div>

            </div>

          </div>



          {/* SHIPPING */}

          <div className="checkout-section">

            <p className="checkout-section-number">
              02
            </p>



            <h2>
              Shipping address
            </h2>



            <div className="checkout-fields">



              <div className="checkout-field">

                <label htmlFor="name">
                  FULL NAME
                </label>



                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  defaultValue={
                    currentUser?.name || ""
                  }
                  required
                />

              </div>



              <div className="checkout-field">

                <label htmlFor="address">
                  ADDRESS
                </label>



                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="House / Street / Area"
                  autoComplete="street-address"
                  required
                />

              </div>



              <div className="checkout-row">



                <div className="checkout-field">

                  <label htmlFor="city">
                    CITY
                  </label>



                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    autoComplete="address-level2"
                    required
                  />

                </div>



                <div className="checkout-field">

                  <label htmlFor="state">
                    STATE
                  </label>



                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="State"
                    autoComplete="address-level1"
                    required
                  />

                </div>

              </div>



              <div className="checkout-field">

                <label htmlFor="pincode">
                  PIN CODE
                </label>



                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  placeholder="560001"
                  maxLength="6"
                  autoComplete="postal-code"
                  pattern="[0-9]{6}"
                  required
                />

              </div>

            </div>

          </div>



          {/* PAYMENT */}

          <div className="checkout-section">

            <p className="checkout-section-number">
              03
            </p>



            <h2>
              Payment
            </h2>



            <div className="payment-options">



              {/* CARD */}

              <label
                className={`payment-option ${
                  paymentMethod === "card"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={
                    paymentMethod === "card"
                  }
                  onChange={() =>
                    setPaymentMethod("card")
                  }
                />



                <span>
                  Credit / Debit Card
                </span>



                <small>
                  CARD
                </small>

              </label>



              {/* UPI */}

              <label
                className={`payment-option ${
                  paymentMethod === "upi"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={
                    paymentMethod === "upi"
                  }
                  onChange={() =>
                    setPaymentMethod("upi")
                  }
                />



                <span>
                  UPI
                </span>



                <small>
                  UPI
                </small>

              </label>



              {/* COD */}

              <label
                className={`payment-option ${
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod === "cod"
                  }
                  onChange={() =>
                    setPaymentMethod("cod")
                  }
                />



                <span>
                  Cash on Delivery
                </span>



                <small>
                  COD
                </small>

              </label>

            </div>

          </div>



          {/* PLACE ORDER BUTTON */}

          <button
            type="submit"
            className={`place-order-button ${
              isPlacingOrder
                ? "placing-order"
                : ""
            }`}
            disabled={isPlacingOrder}
          >

            {isPlacingOrder
              ? "PROCESSING..."
              : paymentMethod === "cod"
              ? "PLACE ORDER"
              : "CONTINUE TO PAYMENT"
            }



            <span>

              {isPlacingOrder
                ? "✓"
                : "→"
              }

            </span>

          </button>

        </form>



        {/* =================================
            ORDER SUMMARY
        ================================= */}

        <aside className="checkout-summary">



          <p className="checkout-summary-eyebrow">
            YOUR ORDER
          </p>



          <h2>
            Summary
          </h2>



          <div className="checkout-products">

            {cartItems.map((item) => (

              <div
                className="checkout-product"
                key={item.id}
              >



                <div className="checkout-product-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />



                  <span>
                    {item.quantity}
                  </span>

                </div>



                <div className="checkout-product-info">

                  <h3>
                    {item.name}
                  </h3>



                  <p>
                    {item.type}
                  </p>

                </div>



                <strong>

                  $
                  {(
                    Number(item.price) *
                    Number(item.quantity)
                  ).toFixed(2)}

                </strong>

              </div>

            ))}

          </div>



          <div className="checkout-summary-line">

            <span>
              Subtotal
            </span>



            <span>
              ${Number(cartTotal).toFixed(2)}
            </span>

          </div>



          <div className="checkout-summary-line">

            <span>
              Shipping
            </span>



            <span>
              FREE
            </span>

          </div>



          <div className="checkout-summary-divider">
          </div>



          <div className="checkout-total">

            <span>
              TOTAL
            </span>



            <strong>
              ${Number(cartTotal).toFixed(2)}
            </strong>

          </div>



          <Link
            to="/cart"
            className="back-to-cart"
          >

            ← BACK TO BAG

          </Link>

        </aside>

      </section>

    </main>

  );

}



export default Checkout;