import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/useCart";
import { useOrder } from "../context/useOrder";

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
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";


  /* =========================================
     PAYMENT STATE
  ========================================= */

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [paymentProcessing, setPaymentProcessing] =
    useState(false);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);


  /* =========================================
     ORDER STATE
  ========================================= */

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);


  /* =========================================
     CUSTOMER DATA
  ========================================= */

  const [customerData, setCustomerData] =
    useState(null);


  /* =========================================
     GO TO LOGIN FROM CHECKOUT
  ========================================= */

  const goToLogin = () => {

    navigate("/login", {
      state: {
        from: "/checkout",
      },
    });

  };


  /* =========================================
     COMPLETE ORDER
  ========================================= */

  const completeOrder = (customer, payment) => {

    const loggedIn =
      localStorage.getItem("qaverin-logged-in") === "true";


    /* LOGIN SAFETY CHECK */

    if (!loggedIn) {

      alert(
        "Please login to place an order."
      );

      goToLogin();

      return;
    }


    /* CUSTOMER CHECK */

    if (!customer) {
      return;
    }


    /* CART CHECK */

    if (!cartItems.length) {
      return;
    }


    /* =======================================
       CREATE ORDER
    ======================================= */

    addOrder({

      items: cartItems.map((item) => ({
        ...item,
      })),

      total: Number(cartTotal),

      customer,

      payment,

      status: "ORDER PLACED",

    });


    /* =======================================
       CLEAR CART
    ======================================= */

    clearCart();


    /* =======================================
       GO TO SUCCESS PAGE
    ======================================= */

    navigate("/order-success");

  };


  /* =========================================
     PLACE ORDER
  ========================================= */

  const handlePlaceOrder = (event) => {

    event.preventDefault();


    /* =======================================
       LOGIN CHECK
    ======================================= */

    const loggedIn =
      localStorage.getItem("qaverin-logged-in") === "true";


    if (!loggedIn) {

      alert(
        "Please login to continue with checkout."
      );

      goToLogin();

      return;
    }


    /* =======================================
       CART CHECK
    ======================================= */

    if (cartItems.length === 0) {
      return;
    }


    /* =======================================
       PREVENT DOUBLE ORDER
    ======================================= */

    if (isPlacingOrder) {
      return;
    }


    /* =======================================
       FORM DATA
    ======================================= */

    const formData =
      new FormData(event.currentTarget);


    /* =======================================
       PHONE VALIDATION
    ======================================= */

    const phone =
      String(
        formData.get("phone") || ""
      ).trim();


    const phoneDigits =
      phone.replace(/\D/g, "");


    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 12
    ) {

      alert(
        "Please enter a valid phone number."
      );

      return;
    }


    /* =======================================
       PINCODE VALIDATION
    ======================================= */

    const pincode =
      String(
        formData.get("pincode") || ""
      ).trim();


    if (!/^\d{6}$/.test(pincode)) {

      alert(
        "Please enter a valid 6-digit PIN code."
      );

      return;
    }


    /* =======================================
       CUSTOMER DATA
    ======================================= */

    const customer = {

      email:
        String(
          formData.get("email") || ""
        ).trim(),

      phone,

      name:
        String(
          formData.get("name") || ""
        ).trim(),

      address:
        String(
          formData.get("address") || ""
        ).trim(),

      city:
        String(
          formData.get("city") || ""
        ).trim(),

      state:
        String(
          formData.get("state") || ""
        ).trim(),

      pincode,

    };


    setCustomerData(customer);


    /* =======================================
       CASH ON DELIVERY
    ======================================= */

    if (paymentMethod === "cod") {

      setIsPlacingOrder(true);


      setTimeout(() => {

        completeOrder(
          customer,
          "cod"
        );

      }, 1000);


      return;
    }


    /* =======================================
       CARD / UPI
    ======================================= */

    setShowPaymentModal(true);

  };


  /* =========================================
     PROCESS PAYMENT
  ========================================= */

  const handlePayment = () => {

    /* LOGIN SAFETY CHECK */

    const loggedIn =
      localStorage.getItem("qaverin-logged-in") === "true";


    if (!loggedIn) {

      alert(
        "Please login to complete payment."
      );

      setShowPaymentModal(false);

      goToLogin();

      return;
    }


    if (paymentProcessing) {
      return;
    }


    if (!customerData) {
      return;
    }


    setPaymentProcessing(true);


    /* =======================================
       DEMO PAYMENT PROCESSING
    ======================================= */

    setTimeout(() => {

      setPaymentProcessing(false);

      setPaymentSuccess(true);


      /* =====================================
         PAYMENT SUCCESS
      ===================================== */

      setTimeout(() => {

        setShowPaymentModal(false);

        setPaymentSuccess(false);

        setIsPlacingOrder(true);


        /* ===================================
           CREATE ORDER
        =================================== */

        setTimeout(() => {

          completeOrder(
            customerData,
            paymentMethod
          );

        }, 700);

      }, 1200);

    }, 1800);

  };


  /* =========================================
     CLOSE PAYMENT MODAL
  ========================================= */

  const closePaymentModal = () => {

    if (paymentProcessing) {
      return;
    }

    setShowPaymentModal(false);

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
     EMPTY CART
  ========================================= */

  if (cartItems.length === 0) {

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


  return (

    <main className="checkout-page">


      {/* =========================================
          HEADER
      ========================================= */}

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



      {/* =========================================
          CHECKOUT CONTENT
      ========================================= */}

      <section className="checkout-layout">


        {/* =========================================
            CHECKOUT FORM
        ========================================= */}

        <form
          className="checkout-form"
          onSubmit={handlePlaceOrder}
        >


          {/* =======================================
              CONTACT INFORMATION
          ======================================= */}

          <div className="checkout-section">

            <p className="checkout-section-number">
              01
            </p>


            <h2>
              Contact information
            </h2>


            <div className="checkout-fields">


              {/* EMAIL */}

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
                  required
                />

              </div>



              {/* PHONE */}

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



          {/* =======================================
              SHIPPING INFORMATION
          ======================================= */}

          <div className="checkout-section">

            <p className="checkout-section-number">
              02
            </p>


            <h2>
              Shipping address
            </h2>


            <div className="checkout-fields">


              {/* FULL NAME */}

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
                  required
                />

              </div>



              {/* ADDRESS */}

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



              {/* CITY + STATE */}

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



              {/* PINCODE */}

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



          {/* =======================================
              PAYMENT
          ======================================= */}

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



          {/* =======================================
              PLACE ORDER
          ======================================= */}

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



        {/* =========================================
            ORDER SUMMARY
        ========================================= */}

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


                {/* IMAGE */}

                <div className="checkout-product-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />


                  <span>
                    {item.quantity}
                  </span>

                </div>



                {/* PRODUCT INFO */}

                <div className="checkout-product-info">

                  <h3>
                    {item.name}
                  </h3>


                  <p>
                    {item.type}
                  </p>

                </div>



                {/* PRICE */}

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



          {/* SUBTOTAL */}

          <div className="checkout-summary-line">

            <span>
              Subtotal
            </span>


            <span>
              ${Number(cartTotal).toFixed(2)}
            </span>

          </div>



          {/* SHIPPING */}

          <div className="checkout-summary-line">

            <span>
              Shipping
            </span>


            <span>
              FREE
            </span>

          </div>


          <div className="checkout-summary-divider"></div>



          {/* TOTAL */}

          <div className="checkout-total">

            <span>
              TOTAL
            </span>


            <strong>
              ${Number(cartTotal).toFixed(2)}
            </strong>

          </div>



          {/* BACK TO CART */}

          <Link
            to="/cart"
            className="back-to-cart"
          >

            ← BACK TO BAG

          </Link>

        </aside>

      </section>



      {/* =========================================
          PAYMENT MODAL
      ========================================= */}

      {showPaymentModal && (

        <div className="payment-modal-overlay">

          <div className="payment-modal">


            {/* PAYMENT FORM */}

            {!paymentProcessing &&
              !paymentSuccess && (

              <>

                <button
                  type="button"
                  className="payment-modal-close"
                  onClick={closePaymentModal}
                >
                  ×
                </button>


                <p className="payment-modal-eyebrow">
                  QAVERIN · SECURE PAYMENT
                </p>


                <h2>

                  {paymentMethod === "card"
                    ? "Card payment."
                    : "UPI payment."
                  }

                </h2>


                <p className="payment-modal-description">

                  Complete your payment securely
                  to place your order.

                </p>



                {/* CARD PAYMENT */}

                {paymentMethod === "card" ? (

                  <div className="card-payment-form">


                    {/* CARD NUMBER */}

                    <div className="payment-field">

                      <label>
                        CARD NUMBER
                      </label>


                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />

                    </div>



                    {/* EXPIRY + CVV */}

                    <div className="payment-small-row">

                      <div className="payment-field">

                        <label>
                          EXPIRY
                        </label>


                        <input
                          type="text"
                          placeholder="MM / YY"
                          maxLength="7"
                          autoComplete="cc-exp"
                        />

                      </div>


                      <div className="payment-field">

                        <label>
                          CVV
                        </label>


                        <input
                          type="password"
                          placeholder="•••"
                          maxLength="3"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />

                      </div>

                    </div>



                    {/* CARD HOLDER */}

                    <div className="payment-field">

                      <label>
                        CARD HOLDER
                      </label>


                      <input
                        type="text"
                        placeholder="Name on card"
                        autoComplete="cc-name"
                      />

                    </div>

                  </div>

                ) : (

                  /* UPI PAYMENT */

                  <div className="upi-payment-form">

                    <div className="upi-symbol">
                      UPI
                    </div>


                    <div className="payment-field">

                      <label>
                        UPI ID
                      </label>


                      <input
                        type="text"
                        placeholder="yourname@upi"
                        autoComplete="off"
                      />

                    </div>

                  </div>

                )}



                {/* PAYMENT BUTTON */}

                <button
                  type="button"
                  className="payment-confirm-button"
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                >

                  PAY $

                  {Number(cartTotal).toFixed(2)}


                  <span>
                    →
                  </span>

                </button>


                <p className="payment-demo-note">

                  Demo payment · No real money will
                  be charged.

                </p>

              </>

            )}



            {/* PAYMENT PROCESSING */}

            {paymentProcessing && (

              <div className="payment-processing">

                <div className="payment-loader">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>


                <p className="payment-processing-label">
                  PROCESSING PAYMENT
                </p>


                <h2>
                  Please wait...
                </h2>

              </div>

            )}



            {/* PAYMENT SUCCESS */}

            {paymentSuccess && (

              <div className="payment-success">

                <div className="payment-success-icon">
                  ✓
                </div>


                <p>
                  PAYMENT SUCCESSFUL
                </p>


                <h2>
                  Thank you.
                </h2>


                <span>
                  Your order is being prepared.
                </span>

              </div>

            )}

          </div>

        </div>

      )}

    </main>

  );

}


export default Checkout;