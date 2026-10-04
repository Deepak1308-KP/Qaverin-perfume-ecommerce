import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

import "./OrderDetails.css";

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
// COMPONENT
// =========================================

function OrderDetails() {

  const { id } = useParams();

  const location = useLocation();


  // =========================================
  // STATE
  // =========================================

  const [order, setOrder] =
    useState(null);

  const [customerOrderNumber, setCustomerOrderNumber] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================
  // CUSTOMER ORDER NUMBER FROM NAVIGATION
  // =========================================

  const passedOrderNumber =
    location.state?.customerOrderNumber || null;


  // =========================================
  // LOGIN STATUS
  // =========================================

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";


  // =========================================
  // FETCH ORDER
  // =========================================

  useEffect(() => {

    let cancelled = false;


    const fetchOrder = async () => {

      const token =
        localStorage.getItem(
          "qaverin-token"
        );


      // =====================================
      // TOKEN CHECK
      // =====================================

      if (!token) {

        if (!cancelled) {

          setError(
            "Login session expired."
          );

          setLoading(false);

        }

        return;

      }


      try {

        // =====================================
        // FETCH SPECIFIC ORDER
        // =====================================

        const orderResponse =
          await fetch(
            `${API_URL}/api/orders/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const orderData =
          await orderResponse.json();


        if (cancelled) {
          return;
        }


        // =====================================
        // API ERROR
        // =====================================

        if (!orderResponse.ok) {

          setError(
            orderData.message ||
            "Unable to load order."
          );

          setOrder(null);

          setLoading(false);

          return;

        }


        // =====================================
        // CURRENT ORDER
        // =====================================

        const currentOrder =
          orderData.order;


        if (!currentOrder) {

          setError(
            "Order information was not returned."
          );

          setOrder(null);

          setLoading(false);

          return;

        }


        setOrder(
          currentOrder
        );


        // =====================================
        // CUSTOMER ORDER NUMBER
        // =====================================
        //
        // First priority:
        // Number passed from Orders.jsx
        //
        // Second priority:
        // Calculate from all orders.
        //
        // Never use database ID as the
        // customer-facing order number.
        // =====================================

        if (passedOrderNumber) {

          setCustomerOrderNumber(
            Number(passedOrderNumber)
          );

        } else {

          try {

            const ordersResponse =
              await fetch(
               `${API_URL}/api/orders`,
                {
                  method: "GET",

                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );


            const ordersData =
              await ordersResponse.json();


            if (
              ordersResponse.ok &&
              Array.isArray(
                ordersData.orders
              )
            ) {

              const allOrders =
                [...ordersData.orders];


              // =================================
              // SORT NEWEST FIRST
              // =================================

              allOrders.sort(
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


                  if (
                    !Number.isNaN(dateA) &&
                    !Number.isNaN(dateB) &&
                    dateA !== dateB
                  ) {

                    return dateB - dateA;

                  }


                  return (
                    Number(b.id || 0) -
                    Number(a.id || 0)
                  );

                }
              );


              // =================================
              // FIND CURRENT ORDER
              // =================================

              const currentId =
                Number(
                  currentOrder?.id || id
                );


              const currentIndex =
                allOrders.findIndex(
                  (item) =>
                    Number(item.id) ===
                    currentId
                );


              // =================================
              // CALCULATE CUSTOMER NUMBER
              // =================================

              if (currentIndex !== -1) {

                const calculatedNumber =
                  allOrders.length -
                  currentIndex;


                setCustomerOrderNumber(
                  calculatedNumber
                );

              }

            }

          } catch (ordersError) {

            console.error(
              "Unable to calculate customer order number:",
              ordersError
            );

          }

        }


        setLoading(false);


      } catch (fetchError) {

        if (cancelled) {
          return;
        }


        console.error(
          "Order details error:",
          fetchError
        );


        setError(
          "Unable to connect to the server."
        );


        setOrder(null);

        setLoading(false);

      }

    };


    fetchOrder();


    return () => {

      cancelled = true;

    };

  }, [id, passedOrderNumber]);


  // =========================================
  // LOGIN PROTECTION
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
  // LOADING
  // =========================================

  if (loading) {

    return (

      <main className="order-details-page">

        <section className="order-details-empty">

          <span className="order-details-empty-icon">
            ✦
          </span>


          <p className="order-details-eyebrow">
            QAVERIN · ORDER
          </p>


          <h1>
            Loading <em>order.</em>
          </h1>


          <p>
            Fetching your order details.
          </p>

        </section>

      </main>

    );

  }


  // =========================================
  // ORDER NOT FOUND
  // =========================================

  if (!order) {

    return (

      <main className="order-details-page">

        <section className="order-details-empty">

          <span className="order-details-empty-icon">
            ✦
          </span>


          <p className="order-details-eyebrow">
            QAVERIN · ORDER
          </p>


          <h1>
            Order <em>not found.</em>
          </h1>


          <p>
            {error ||
              "We couldn't find the order you're looking for."}
          </p>


          <Link
            to="/orders"
            className="order-details-back-button"
          >
            ← BACK TO ORDERS
          </Link>

        </section>

      </main>

    );

  }


  // =========================================
  // ORDER ITEMS
  // =========================================

  const orderItems =
    Array.isArray(order.items)
      ? order.items
      : [];


  // =========================================
  // PAYMENT LABEL
  // =========================================

  const paymentMethod =
    order.payment_method === "card"
      ? "Credit / Debit Card"
      : order.payment_method === "upi"
      ? "UPI"
      : order.payment_method === "cod"
      ? "Cash on Delivery"
      : "—";


  // =========================================
  // ORDER TOTAL
  // =========================================

  const orderTotal =
    Number(
      order.total_amount ||
      order.total ||
      0
    );


  // =========================================
  // ORDER DATE
  // =========================================

  const formatOrderDate = () => {

    const rawDate =
      order.created_at ||
      order.createdAt ||
      order.date;


    if (!rawDate) {
      return "—";
    }


    const date =
      new Date(rawDate);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =========================================
  // CUSTOMER INFORMATION
  // =========================================

  const customerName =
    order.customer_name ||
    order.customer?.name ||
    "—";


  const customerEmail =
    order.email ||
    order.customer?.email ||
    "—";


  const customerPhone =
    order.phone ||
    order.customer?.phone ||
    "—";


  const customerAddress =
    order.address ||
    order.customer?.address ||
    "—";


  const customerCity =
    order.city ||
    order.customer?.city ||
    "—";


  const customerState =
    order.state ||
    order.customer?.state ||
    "—";


  const customerPincode =
    order.pincode ||
    order.customer?.pincode ||
    "—";


  // =========================================
  // DISPLAY ORDER NUMBER
  // =========================================

  const displayOrderNumber =
    customerOrderNumber ||
    passedOrderNumber ||
    "—";


  // =========================================
  // RENDER
  // =========================================

  return (

    <main className="order-details-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="order-details-header">

        <p className="order-details-eyebrow">
          QAVERIN · ORDER DETAILS
        </p>


        <h1>
          Your <em>order.</em>
        </h1>


        <p className="order-details-description">

          Thank you for choosing QAVERIN.
          Here are the details of your fragrance order.

        </p>

      </section>


      {/* =====================================
          ORDER CONTENT
      ===================================== */}

      <section className="order-details-content">


        {/* ===================================
            ORDER TOP
        =================================== */}

        <div className="order-details-top">

          <div>

            <span>
              ORDER NUMBER
            </span>


            <h2>
              #{displayOrderNumber}
            </h2>

          </div>


          <div className="order-details-status">

            {order.status ||
              "Pending"}

          </div>

        </div>


        {/* ===================================
            ORDER META
        =================================== */}

        <div className="order-details-meta">

          <div>

            <span>
              ORDER DATE
            </span>


            <p>
              {formatOrderDate()}
            </p>

          </div>


          <div>

            <span>
              PAYMENT
            </span>


            <p>
              {paymentMethod}
            </p>

          </div>


          <div>

            <span>
              TOTAL
            </span>


            <strong>
              ${orderTotal.toFixed(2)}
            </strong>

          </div>

        </div>


        {/* ===================================
            PRODUCTS
        =================================== */}

        <section className="order-products">

          <div className="order-section-heading">

            <span>
              YOUR FRAGRANCES
            </span>


            <span>

              {orderItems.length}{" "}

              {orderItems.length === 1
                ? "ITEM"
                : "ITEMS"}

            </span>

          </div>


          <div className="order-product-list">

            {orderItems.length > 0 ? (

              orderItems.map(
                (item, index) => {

                  const productImage =
                    getProductImage(
                      item.name
                    );


                  return (

                    <article
                      className="order-product"
                      key={
                        `${item.id}-${index}`
                      }
                    >


                      {/* IMAGE */}

                      <div className="order-product-image">

                        {productImage ? (

                          <img
                            src={productImage}
                            alt={
                              item.name ||
                              "Qaverin fragrance"
                            }
                          />

                        ) : (

                          <div className="order-product-image-fallback">

                            QAVERIN

                          </div>

                        )}


                        <span>

                          {Number(
                            item.quantity || 0
                          )}

                        </span>

                      </div>


                      {/* INFO */}

                      <div className="order-product-info">

                        <p>
                          {item.type ||
                            "FRAGRANCE"}
                        </p>


                        <h3>
                          {item.name ||
                            "Unnamed Product"}
                        </h3>


                        <small>
                          {item.description ||
                            "A sophisticated Qaverin fragrance."}
                        </small>

                      </div>


                      {/* PRICE */}

                      <div className="order-product-price">

                        <span>

                          $
                          {Number(
                            item.price || 0
                          ).toFixed(2)}

                        </span>


                        <small>

                          {Number(
                            item.quantity || 0
                          )} ×

                        </small>

                      </div>

                    </article>

                  );

                }

              )

            ) : (

              <p className="order-details-no-products">

                No product information
                available.

              </p>

            )}

          </div>

        </section>


        {/* ===================================
            CUSTOMER INFORMATION
        =================================== */}

        <section className="order-customer">

          <div className="order-section-heading">

            <span>
              SHIPPING INFORMATION
            </span>

          </div>


          <div className="order-customer-grid">

            <div>

              <span>
                FULL NAME
              </span>


              <p>
                {customerName}
              </p>

            </div>


            <div>

              <span>
                EMAIL
              </span>


              <p>
                {customerEmail}
              </p>

            </div>


            <div>

              <span>
                PHONE
              </span>


              <p>
                {customerPhone}
              </p>

            </div>


            <div>

              <span>
                ADDRESS
              </span>


              <p>
                {customerAddress}
              </p>

            </div>


            <div>

              <span>
                CITY
              </span>


              <p>
                {customerCity}
              </p>

            </div>


            <div>

              <span>
                STATE
              </span>


              <p>
                {customerState}
              </p>

            </div>


            <div>

              <span>
                PIN CODE
              </span>


              <p>
                {customerPincode}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================
            PRICE SUMMARY
        =================================== */}

        <section className="order-summary">

          <div className="order-summary-line">

            <span>
              Subtotal
            </span>


            <span>
              ${orderTotal.toFixed(2)}
            </span>

          </div>


          <div className="order-summary-line">

            <span>
              Shipping
            </span>


            <span>
              FREE
            </span>

          </div>


          <div className="order-summary-divider">
          </div>


          <div className="order-summary-total">

            <span>
              TOTAL
            </span>


            <strong>
              ${orderTotal.toFixed(2)}
            </strong>

          </div>

        </section>


        {/* ===================================
            ACTIONS
        =================================== */}

        <div className="order-details-actions">

          <Link
            to="/orders"
            className="order-details-secondary"
          >
            ← BACK TO ORDERS
          </Link>


          <Link
            to="/shop"
            className="order-details-primary"
          >

            CONTINUE SHOPPING

            <span>
              →
            </span>

          </Link>

        </div>


      </section>

    </main>

  );

}


export default OrderDetails;