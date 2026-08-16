import { Link, Navigate, useParams } from "react-router-dom";

import { useOrder } from "../context/useOrder";

import "./OrderDetails.css";


function OrderDetails() {

  const { id } = useParams();

  const { orders } = useOrder();


  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";


  /* =========================================
     PROTECT ORDER DETAILS PAGE
  ========================================= */

  if (!isLoggedIn) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /* =========================================
     FIND ORDER
  ========================================= */

  const order = orders.find(
    (item) =>
      String(item.id) === String(id)
  );


  /* =========================================
     ORDER NOT FOUND
  ========================================= */

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
            We couldn't find the order you're looking for.
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


  /* =========================================
     ORDER ITEMS
  ========================================= */

  const orderItems =
    Array.isArray(order.items)
      ? order.items
      : [];


  /* =========================================
     PAYMENT LABEL
  ========================================= */

  const paymentMethod =
    order.payment === "card"
      ? "Credit / Debit Card"
      : order.payment === "upi"
      ? "UPI"
      : order.payment === "cod"
      ? "Cash on Delivery"
      : "—";


  /* =========================================
     ORDER TOTAL
  ========================================= */

  const orderTotal =
    Number(order.total || 0);


  /* =========================================
     RENDER
  ========================================= */

  return (

    <main className="order-details-page">


      {/* =========================================
          HEADER
      ========================================= */}

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


      {/* =========================================
          ORDER CONTENT
      ========================================= */}

      <section className="order-details-content">


        {/* =========================================
            ORDER TOP
        ========================================= */}

        <div className="order-details-top">

          <div>

            <span>
              ORDER NUMBER
            </span>

            <h2>
              #{order.id}
            </h2>

          </div>


          <div className="order-details-status">
            {order.status || "ORDER PLACED"}
          </div>

        </div>


        {/* =========================================
            ORDER META
        ========================================= */}

        <div className="order-details-meta">

          <div>

            <span>
              ORDER DATE
            </span>

            <p>
              {order.date || "—"}
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


        {/* =========================================
            PRODUCTS
        ========================================= */}

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

              orderItems.map((item, index) => (

                <article
                  className="order-product"
                  key={`${item.id}-${index}`}
                >


                  {/* IMAGE */}

                  <div className="order-product-image">

                    <img
                      src={item.image}
                      alt={
                        item.name ||
                        "Product"
                      }
                    />

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

              ))

            ) : (

              <p className="order-details-no-products">
                No product information available.
              </p>

            )}

          </div>

        </section>


        {/* =========================================
            CUSTOMER INFORMATION
        ========================================= */}

        <section className="order-customer">

          <div className="order-section-heading">

            <span>
              SHIPPING INFORMATION
            </span>

          </div>


          <div className="order-customer-grid">


            {/* NAME */}

            <div>

              <span>
                FULL NAME
              </span>

              <p>
                {order.customer?.name ||
                  "—"}
              </p>

            </div>


            {/* EMAIL */}

            <div>

              <span>
                EMAIL
              </span>

              <p>
                {order.customer?.email ||
                  "—"}
              </p>

            </div>


            {/* PHONE */}

            <div>

              <span>
                PHONE
              </span>

              <p>
                {order.customer?.phone ||
                  "—"}
              </p>

            </div>


            {/* ADDRESS */}

            <div>

              <span>
                ADDRESS
              </span>

              <p>
                {order.customer?.address ||
                  "—"}
              </p>

            </div>


            {/* CITY */}

            <div>

              <span>
                CITY
              </span>

              <p>
                {order.customer?.city ||
                  "—"}
              </p>

            </div>


            {/* STATE */}

            <div>

              <span>
                STATE
              </span>

              <p>
                {order.customer?.state ||
                  "—"}
              </p>

            </div>


            {/* PIN CODE */}

            <div>

              <span>
                PIN CODE
              </span>

              <p>
                {order.customer?.pincode ||
                  "—"}
              </p>

            </div>

          </div>

        </section>


        {/* =========================================
            PRICE SUMMARY
        ========================================= */}

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


          <div className="order-summary-divider"></div>


          <div className="order-summary-total">

            <span>
              TOTAL
            </span>

            <strong>
              ${orderTotal.toFixed(2)}
            </strong>

          </div>

        </section>


        {/* =========================================
            ACTIONS
        ========================================= */}

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