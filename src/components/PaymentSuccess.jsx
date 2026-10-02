import { useEffect, useRef, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useCart } from "../context/useCart";
import { useOrder } from "../context/useOrder";

import "./PaymentSuccess.css";


function PaymentSuccess() {

  /* =========================================
     PREVENT DOUBLE PAYMENT VERIFICATION
  ========================================= */

  const verificationStarted =
    useRef(false);


  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  const { clearCart } =
    useCart();

  const { addOrder } =
    useOrder();


  /* =========================================
     PAYMENT STATE
  ========================================= */

  const [status, setStatus] =
    useState("checking");

  const [message, setMessage] =
    useState(
      "Verifying your payment..."
    );


  /* =========================================
     VERIFY PAYMENT
  ========================================= */

  useEffect(() => {

    /*
     * IMPORTANT:
     *
     * React development mode / StrictMode
     * can run useEffect more than once.
     *
     * We must make sure that payment
     * verification and order creation
     * happen only ONE time.
     */

    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;


    const verifyPayment = async () => {

      /* =====================================
         GET LOGIN TOKEN
      ===================================== */

      const token =
        localStorage.getItem(
          "qaverin-token"
        );


      /* =====================================
         GET CASHFREE ORDER ID
      ===================================== */

      const cashfreeOrderId =
        searchParams.get(
          "order_id"
        );


      /* =====================================
         CHECK CASHFREE ORDER ID
      ===================================== */

      if (!cashfreeOrderId) {

        setStatus("failed");

        setMessage(
          "Payment failed because the Cashfree order ID was not found."
        );

        return;
      }


      /* =====================================
         CHECK LOGIN TOKEN
      ===================================== */

      if (!token) {

        setStatus("failed");

        setMessage(
          "Your login session expired. Your order was not confirmed."
        );

        return;
      }


      try {

        /* ===================================
           VERIFY CASHFREE PAYMENT
        =================================== */

        const verifyResponse =
          await fetch(
            "http://127.0.0.1:5000/api/payment/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                order_id:
                  cashfreeOrderId,
              }),
            }
          );


        const verifyData =
          await verifyResponse.json();


        console.log(
          "Cashfree verification:",
          verifyData
        );


        /* ===================================
           BACKEND ERROR
        =================================== */

        if (!verifyResponse.ok) {

          setStatus("failed");

          setMessage(
            verifyData.message ||
            "Your order could not be confirmed because the payment could not be verified."
          );

          return;
        }


        /* ===================================
           PAYMENT FAILED
        =================================== */

        if (
          verifyData.payment_status ===
            "FAILED" ||

          verifyData.payment_status ===
            "CANCELLED" ||

          verifyData.payment_status ===
            "USER_DROPPED"
        ) {

          setStatus("failed");

          setMessage(
            "Your order has been cancelled because the payment failed. No order was placed."
          );

          return;
        }


        /* ===================================
           PAYMENT PENDING
        =================================== */

        if (
          verifyData.payment_status !==
          "SUCCESS"
        ) {

          setStatus("pending");

          setMessage(
            "Your payment is still pending. Your order has not been confirmed yet."
          );

          return;
        }


        /* ===================================
           PAYMENT SUCCESS
        =================================== */

        console.log(
          "Payment successful:",
          cashfreeOrderId
        );


        /* ===================================
           GET CHECKOUT DATA
           
           Backend returns the customer
           information saved before Cashfree.
        =================================== */

        const customer =
          verifyData.customer;


        const paymentMethod =
          verifyData.payment_method ||
          "cashfree";


        /* ===================================
           CHECK CUSTOMER DATA
        =================================== */

        if (!customer) {

          setStatus("failed");

          setMessage(
            "Payment was successful, but checkout information could not be found. Your order was not confirmed."
          );

          return;
        }


        /* ===================================
           CREATE QAVERIN MYSQL ORDER
        =================================== */

        const orderResponse =
          await fetch(
            "http://127.0.0.1:5000/api/orders",
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
                  paymentMethod,

                cashfree_order_id:
                  cashfreeOrderId,

              }),
            }
          );


        const orderData =
          await orderResponse.json();


        console.log(
          "Qaverin order response:",
          orderData
        );


        /* ===================================
           ORDER CREATION ERROR
        =================================== */

        if (!orderResponse.ok) {

          setStatus("failed");

          setMessage(
            orderData.message ||
            "Payment was successful, but your order could not be confirmed."
          );

          return;
        }


        /* ===================================
           CHECK ORDER DATA
        =================================== */

        if (!orderData.order) {

          setStatus("failed");

          setMessage(
            "Payment was successful, but your order could not be confirmed."
          );

          return;
        }


        /* ===================================
           SAVE LAST ORDER
        =================================== */

        localStorage.setItem(
          "qaverin-last-order",
          JSON.stringify(
            orderData.order
          )
        );


        /* ===================================
           UPDATE ORDER CONTEXT
        =================================== */

        if (addOrder) {

          addOrder(
            orderData.order
          );

        }


        /* ===================================
           CLEAR OLD PENDING DATA
        =================================== */

        localStorage.removeItem(
          "qaverin-pending-payment"
        );


        /* ===================================
           CLEAR CART
        =================================== */

        await clearCart();


        /* ===================================
           SUCCESS
        =================================== */

        setStatus("success");

        setMessage(
          "Your order has been confirmed successfully."
        );


      } catch (error) {

        console.error(
          "Payment verification error:",
          error
        );


        setStatus("failed");

        setMessage(
          "Your order has been cancelled because the payment could not be completed."
        );

      }

    };


    verifyPayment();


  }, [
    searchParams,
    clearCart,
    addOrder,
  ]);


  /* =========================================
     CHECKING PAYMENT
  ========================================= */

  if (status === "checking") {

    return (

      <main className="payment-success-page">

        <section className="payment-success-content">

          <div className="payment-status-icon">

            ...

          </div>


          <p>
            Q A V E R I N · P A Y M E N T
          </p>


          <h1>
            Verifying <em>payment.</em>
          </h1>


          <span>
            {message}
          </span>

        </section>

      </main>

    );

  }


  /* =========================================
     SUCCESS
  ========================================= */

  if (status === "success") {

    return (

      <main className="payment-success-page">

        <section className="payment-success-content">


          <div className="payment-status-icon success-icon">

            ✓

          </div>


          <p>
            Q A V E R I N · P A Y M E N T
          </p>


          <h1>
            Order <em>confirmed.</em>
          </h1>


          <span>
            {message}
          </span>


          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
          >

            VIEW MY ORDERS

            <span>
              →
            </span>

          </button>


        </section>

      </main>

    );

  }


  /* =========================================
     PENDING
  ========================================= */

  if (status === "pending") {

    return (

      <main className="payment-success-page">

        <section className="payment-success-content">


          <div className="payment-status-icon pending-icon">

            !

          </div>


          <p>
            Q A V E R I N · P A Y M E N T
          </p>


          <h1>
            Payment <em>pending.</em>
          </h1>


          <span>
            {message}
          </span>


          <button
            type="button"
            onClick={() =>
              navigate("/checkout")
            }
          >

            RETURN TO CHECKOUT

            <span>
              →
            </span>

          </button>


        </section>

      </main>

    );

  }


  /* =========================================
     FAILED
  ========================================= */

  return (

    <main className="payment-success-page">

      <section className="payment-success-content">


        <div className="payment-status-icon failed-icon">

          ×

        </div>


        <p>
          Q A V E R I N · P A Y M E N T
        </p>


        <h1>
          Order <em>cancelled.</em>
        </h1>


        <span>
          {message}
        </span>


        <button
          type="button"
          onClick={() =>
            navigate("/checkout")
          }
        >

          RETURN TO CHECKOUT

          <span>
            →
          </span>

        </button>


      </section>

    </main>

  );

}


export default PaymentSuccess;