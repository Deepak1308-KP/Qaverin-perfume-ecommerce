import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import "./Orders.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


const API_URL = import.meta.env.VITE_API_BASE_URL;
// =========================================
// PRODUCT IMAGE
// =========================================

function getProductImage(name) {

  const productName =
    name
      ? name.toLowerCase()
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
// ORDERS COMPONENT
// =========================================

function Orders() {

  // =========================================
  // STATE
  // =========================================

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingOrderId, setCancellingOrderId] =
    useState(null);



  // =========================================
  // LOGIN STATUS
  // =========================================

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";



  // =========================================
  // FETCH ORDERS
  // =========================================

  useEffect(() => {

    let cancelled = false;

    const loadOrders = async () => {

      const token =
        localStorage.getItem(
          "qaverin-token"
        );



      // =====================================
      // NO TOKEN
      // =====================================

      if (!token) {

        if (!cancelled) {

          setOrders([]);

          setLoading(false);

        }

        return;

      }



      try {

        // ===================================
        // API REQUEST
        // ===================================

        const response = await fetch(
          `${API_URL}/api/orders`,
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



        if (cancelled) {
          return;
        }



        // ===================================
        // API ERROR
        // ===================================

        if (!response.ok) {

          setError(
            data.message ||
            "Unable to load orders."
          );

          setOrders([]);

        }



        // ===================================
        // SUCCESS
        // ===================================

        else {

          const backendOrders =
            Array.isArray(data.orders)
              ? data.orders
              : [];



          /*
           * IMPORTANT
           *
           * Newest order first.
           *
           * We use created_at when available.
           * If created_at is unavailable,
           * we fall back to the database id.
           */

          const sortedOrders =
            [...backendOrders].sort(
              (a, b) => {

                const dateA =
                  new Date(
                    a.created_at ||
                    a.createdAt ||
                    a.date ||
                    0
                  ).getTime();

                const dateB =
                  new Date(
                    b.created_at ||
                    b.createdAt ||
                    b.date ||
                    0
                  ).getTime();



                /*
                 * If both dates are valid,
                 * newest date comes first.
                 */

                if (
                  !Number.isNaN(dateA) &&
                  !Number.isNaN(dateB) &&
                  dateA !== dateB
                ) {

                  return dateB - dateA;

                }



                /*
                 * Fallback:
                 * Higher database ID = newer order.
                 */

                return (
                  Number(b.id || 0) -
                  Number(a.id || 0)
                );

              }
            );



          setOrders(
            sortedOrders
          );

          setError("");

        }



        setLoading(false);



      } catch (error) {

        if (cancelled) {
          return;
        }



        console.error(
          "Orders fetch error:",
          error
        );



        setError(
          "Unable to connect to the server."
        );



        setOrders([]);

        setLoading(false);

      }

    };



    loadOrders();



    return () => {

      cancelled = true;

    };

  }, []);



  // =========================================
  // PROTECT ORDERS PAGE
  // =========================================

  if (!isLoggedIn) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }



  // =========================================
  // FORMAT ORDER DATE
  // =========================================

  const formatOrderDate = (order) => {

    if (order?.created_at) {

      const date =
        new Date(
          order.created_at
        );



      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {

        return date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      }

    }



    if (order?.createdAt) {

      const date =
        new Date(
          order.createdAt
        );



      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {

        return date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      }

    }



    return order?.date || "—";

  };



  // =========================================
  // PAYMENT NAME
  // =========================================

  const getPaymentName = (payment) => {

    if (!payment) {
      return "—";
    }

    const method =
      String(payment)
        .trim()
        .toLowerCase();



    switch (method) {

      // =====================================
      // CARD
      // =====================================

      case "card":
      case "credit":
      case "credit_card":
      case "debit":
      case "debit_card":

        return "Credit / Debit Card";



      // =====================================
      // UPI
      // =====================================

      case "upi":

        return "UPI";



      // =====================================
      // CASH ON DELIVERY
      // =====================================

      case "cod":
      case "cash":
      case "cash_on_delivery":

        return "Cash on Delivery";



      // =====================================
      // NET BANKING
      // =====================================

      case "netbanking":
      case "net_banking":
      case "net-banking":
      case "cashfree":

        return "Net Banking";



      // =====================================
      // OTHER PAYMENT METHODS
      // =====================================

      default:

        return payment;

    }

  };



  // =========================================
  // ITEM COUNT
  // =========================================

  const getItemCount = (items) => {

    if (!Array.isArray(items)) {
      return 0;
    }



    return items.reduce(
      (total, item) => {

        return (
          total +
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );

  };



  // =========================================
  // ORDER TOTAL
  // =========================================

  const getOrderTotal = (order) => {

    return Number(
      order?.total_amount ||
      order?.total ||
      0
    ).toFixed(2);

  };



  // =========================================
  // CUSTOMER ORDER NUMBER
  // =========================================

  /*
   * Because orders are now sorted newest first:
   *
   * index 0 = latest order
   * index 1 = second latest
   * index 2 = oldest
   *
   * Customer-facing number:
   *
   * latest  = total orders
   * oldest  = #1
   */

  const getCustomerOrderNumber = (index) => {

    return (
      orders.length - index
    );

  };



  // =========================================
  // CANCEL ORDER
  // =========================================

  const handleCancelOrder = async (orderId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );



    if (!confirmed) {
      return;
    }



    const token =
      localStorage.getItem(
        "qaverin-token"
      );



    if (!token) {

      setError(
        "Please login again."
      );

      return;

    }



    try {

      setCancellingOrderId(
        orderId
      );

      setError("");



      const response = await fetch(
       `${API_URL}/api/orders/${orderId}/cancel`,
        {
          method: "PUT",

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }
      );



      const data =
        await response.json();



      if (!response.ok) {

        setError(
          data.message ||
          "Unable to cancel order."
        );

        return;

      }



      // Update only the cancelled order
      // without changing the other orders.

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              Number(order.id) ===
              Number(orderId)
                ? {
                    ...order,
                    status: "Cancelled",
                  }
                : order
          )
      );



    } catch (error) {

      console.error(
        "Cancel order error:",
        error
      );



      setError(
        "Unable to connect to the server."
      );



    } finally {

      setCancellingOrderId(
        null
      );

    }

  };



  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <main className="orders-page">

        <section className="orders-content">

          <div className="orders-empty">

            <div className="orders-empty-icon">
              ✦
            </div>



            <h2>
              Loading orders...
            </h2>



            <p>
              Fetching your fragrance orders.
            </p>

          </div>

        </section>

      </main>

    );

  }



  // =========================================
  // ERROR
  // =========================================

  if (error) {

    return (

      <main className="orders-page">

        <section className="orders-content">

          <div className="orders-empty">

            <div className="orders-empty-icon">
              !
            </div>



            <h2>
              Unable to load orders.
            </h2>



            <p>
              {error}
            </p>



            <button
              type="button"
              className="orders-shop-button"
              onClick={() =>
                window.location.reload()
              }
            >

              TRY AGAIN

              <span>
                →
              </span>

            </button>

          </div>

        </section>

      </main>

    );

  }



  // =========================================
  // MAIN RENDER
  // =========================================

  return (

    <main className="orders-page">



      {/* =====================================
          HEADER
      ===================================== */}

      <section className="orders-header">

        <p className="orders-eyebrow">
          QAVERIN · ORDER HISTORY
        </p>



        <div className="orders-title-row">

          <div>

            <h1>
              My <em>orders.</em>
            </h1>



            <p className="orders-description">

              View your fragrance purchases
              and order details.

            </p>

          </div>



          <span className="orders-count">

            {orders.length}

            {" "}

            {orders.length === 1
              ? "ORDER"
              : "ORDERS"}

          </span>

        </div>

      </section>



      {/* =====================================
          ORDER CONTENT
      ===================================== */}

      <section className="orders-content">



        {/* ===================================
            EMPTY ORDERS
        =================================== */}

        {orders.length === 0 ? (

          <div className="orders-empty">

            <div className="orders-empty-icon">
              ✦
            </div>



            <h2>
              No orders yet.
            </h2>



            <p>

              Your fragrance journey begins
              with your first order.

            </p>



            <Link
              to="/shop"
              className="orders-shop-button"
            >

              EXPLORE COLLECTION

              <span>
                →
              </span>

            </Link>

          </div>

        ) : (

          /* =================================
             ORDERS LIST
          ================================= */

          <div className="orders-list">

            {orders.map((order, index) => {

              const items =
                Array.isArray(
                  order.items
                )
                  ? order.items
                  : [];



              const itemCount =
                getItemCount(items);



              /*
               * Customer-facing order number.
               *
               * Example with 3 orders:
               *
               * index 0 → #3
               * index 1 → #2
               * index 2 → #1
               */

              const customerOrderNumber =
                getCustomerOrderNumber(
                  index
                );



              return (

                <article
                  className="orders-card"
                  key={order.id}
                >



                  {/* =========================
                      ORDER HEADER
                  ========================= */}

                  <div className="orders-card-header">

                    <div>

                      <span>
                        ORDER
                      </span>



                      <h2>
                        #{customerOrderNumber}
                      </h2>

                    </div>



                    <div className="orders-status">

                      {order.status ||
                        "ORDER PLACED"}

                    </div>

                  </div>



                  {/* =========================
                      ORDER ITEMS
                  ========================= */}

                  <div className="orders-items">

                    {items.length === 0 ? (

                      <p className="orders-no-items">

                        No item information
                        available.

                      </p>

                    ) : (

                      items.map(
                        (item, itemIndex) => {

                          const image =
                            getProductImage(
                              item.name
                            ) ||
                            item.image;



                          return (

                            <div
                              className="orders-item"
                              key={
                                `${order.id}-${item.id}-${itemIndex}`
                              }
                            >



                              {/* IMAGE */}

                              <div className="orders-item-image">

                                {image ? (

                                  <img
                                    src={image}
                                    alt={
                                      item.name ||
                                      "Qaverin fragrance"
                                    }
                                  />

                                ) : (

                                  <div
                                    className="orders-image-placeholder"
                                  >
                                    QAVERIN
                                  </div>

                                )}



                                <span>
                                  {item.quantity}
                                </span>

                              </div>



                              {/* ITEM INFORMATION */}

                              <div className="orders-item-info">

                                <h3>
                                  {item.name}
                                </h3>



                                <p>

                                  {item.type ||
                                    item.description ||
                                    "Qaverin fragrance"}

                                </p>

                              </div>



                              {/* ITEM PRICE */}

                              <strong>

                                $

                                {(
                                  Number(
                                    item.price || 0
                                  ) *
                                  Number(
                                    item.quantity || 0
                                  )
                                ).toFixed(2)}

                              </strong>

                            </div>

                          );

                        }
                      )

                    )}

                  </div>



                  {/* =========================
                      ORDER DETAILS
                  ========================= */}

                  <div className="orders-details">



                    {/* ORDER DATE */}

                    <div>

                      <span>
                        ORDER DATE
                      </span>



                      <p>
                        {formatOrderDate(
                          order
                        )}
                      </p>

                    </div>



                    {/* PAYMENT */}

                    <div>

                      <span>
                        PAYMENT
                      </span>



                      <p>

                        {getPaymentName(
                          order.payment_method ||
                          order.payment
                        )}

                      </p>

                    </div>



                    {/* ITEMS */}

                    <div>

                      <span>
                        ITEMS
                      </span>



                      <p>

                        {itemCount}

                        {" "}

                        {itemCount === 1
                          ? "ITEM"
                          : "ITEMS"}

                      </p>

                    </div>



                    {/* TOTAL */}

                    <div>

                      <span>
                        TOTAL
                      </span>



                      <strong>

                        $

                        {getOrderTotal(
                          order
                        )}

                      </strong>

                    </div>



                  </div>



                  {/* =========================
                      VIEW DETAILS
                  ========================= */}

                  <Link
                    to={`/order/${order.id}`}
                    className="orders-view-button"
                    state={{
                      customerOrderNumber:
                        customerOrderNumber,
                    }}
                  >

                    VIEW ORDER DETAILS

                    <span>
                      →
                    </span>

                  </Link>



                  {/* =========================
                      CANCEL ORDER
                  ========================= */}

                  {(order.status === "Pending" ||
                    order.status === "Confirmed") && (

                    <button
                      type="button"
                      className="orders-cancel-button"
                      onClick={() =>
                        handleCancelOrder(
                          order.id
                        )
                      }
                      disabled={
                        cancellingOrderId ===
                        order.id
                      }
                    >

                      {cancellingOrderId ===
                      order.id
                        ? "CANCELLING..."
                        : "CANCEL ORDER"}

                    </button>

                  )}



                </article>

              );

            })}

          </div>

        )}

      </section>



      {/* =====================================
          BACK TO ACCOUNT
      ===================================== */}

      <Link
        to="/account"
        className="orders-back"
      >

        ← BACK TO ACCOUNT

      </Link>



    </main>

  );

}



export default Orders;