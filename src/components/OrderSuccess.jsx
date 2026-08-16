import { Link } from "react-router-dom";

import { useOrder } from "../context/useOrder";

import "./OrderSuccess.css";


function OrderSuccess() {

  const { orders } = useOrder();


  /* =========================================
     GET LATEST ORDER
  ========================================= */

  const latestOrder =
    Array.isArray(orders) && orders.length > 0
      ? orders[0]
      : null;


  /* =========================================
     NO ORDER
  ========================================= */

  if (!latestOrder) {

    return (

      <main className="order-success-page">

        <div className="order-success-empty">

          <span>
            ✦
          </span>

          <p className="success-eyebrow">
            QAVERIN · ORDER
          </p>

          <h1>
            No order <em>found.</em>
          </h1>

          <p>
            Your order details will appear here
            after you place an order.
          </p>

          <Link
            to="/shop"
            className="success-secondary-button"
          >
            EXPLORE COLLECTION
            <span>→</span>
          </Link>

        </div>

      </main>

    );

  }


  /* =========================================
     PAYMENT NAME
  ========================================= */

  const getPaymentName = (payment) => {

    switch (payment) {

      case "card":
        return "Credit / Debit Card";

      case "upi":
        return "UPI";

      case "cod":
        return "Cash on Delivery";

      default:
        return "—";

    }

  };


  /* =========================================
     PAYMENT METHOD
  ========================================= */

  const paymentMethod =
    getPaymentName(
      latestOrder.payment
    );


  /* =========================================
     ORDER TOTAL
  ========================================= */

  const orderTotal =
    Number(
      latestOrder.total || 0
    );


  /* =========================================
     ORDER ITEMS
  ========================================= */

  const orderItems =
    Array.isArray(latestOrder.items)
      ? latestOrder.items
      : [];


  /* =========================================
     ITEM COUNT
  ========================================= */

  const itemCount =
    orderItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );


  /* =========================================
     ORDER DATE
  ========================================= */

  const orderDate =
    latestOrder.date || "—";


  /* =========================================
     ORDER STATUS
  ========================================= */

  const orderStatus =
    latestOrder.status || "ORDER PLACED";


  /* =========================================
     RENDER
  ========================================= */

  return (

    <main className="order-success-page">


      {/* =========================================
          SUCCESS CONTENT
      ========================================= */}

      <section className="success-content">


        {/* =====================================
            SUCCESS ICON
        ===================================== */}

        <div className="success-icon">

          <span>
            ✓
          </span>

        </div>


        {/* =====================================
            EYEBROW
        ===================================== */}

        <p className="success-eyebrow">
          QAVERIN · ORDER CONFIRMED
        </p>


        {/* =====================================
            HEADING
        ===================================== */}

        <h1>

          Thank you for

          <br />

          <em>
            your order.
          </em>

        </h1>


        {/* =====================================
            DESCRIPTION
        ===================================== */}

        <p className="success-description">

          Your fragrance journey has officially begun.

          <br />

          Your order has been successfully placed.

        </p>


        {/* =====================================
            ORDER CARD
        ===================================== */}

        <div className="success-order-card">


          {/* =====================================
              ORDER HEADER
          ===================================== */}

          <div className="success-order-header">

            <div>

              <span>
                ORDER NUMBER
              </span>

              <h2>
                #{latestOrder.id}
              </h2>

            </div>


            <div className="success-status">

              {orderStatus}

            </div>

          </div>


          {/* =====================================
              DIVIDER
          ===================================== */}

          <div className="success-divider"></div>


          {/* =====================================
              ORDER DETAILS
          ===================================== */}

          <div className="success-details">


            {/* =================================
                ORDER DATE
            ================================= */}

            <div>

              <span>
                ORDER DATE
              </span>

              <p>
                {orderDate}
              </p>

            </div>


            {/* =================================
                PAYMENT
            ================================= */}

            <div>

              <span>
                PAYMENT
              </span>

              <p>
                {paymentMethod}
              </p>

            </div>


            {/* =================================
                ITEMS
            ================================= */}

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


            {/* =================================
                TOTAL
            ================================= */}

            <div>

              <span>
                TOTAL
              </span>

              <strong>
                ${orderTotal.toFixed(2)}
              </strong>

            </div>


          </div>

        </div>


        {/* =========================================
            SUCCESS MESSAGE
        ========================================= */}

        <div className="success-message">


          <span>
            ✦
          </span>


          <p>

            Thank you for choosing QAVERIN.

            <br />

            A signature in every scent.

          </p>


          <span>
            ✦
          </span>


        </div>


        {/* =========================================
            ACTION BUTTONS
        ========================================= */}

        <div className="success-actions">


          {/* =====================================
              VIEW ORDER DETAILS
          ===================================== */}

          <Link
            to={`/order/${latestOrder.id}`}
            className="success-primary-button"
          >

            VIEW ORDER DETAILS

            <span>
              →
            </span>

          </Link>


          {/* =====================================
              CONTINUE SHOPPING
          ===================================== */}

          <Link
            to="/shop"
            className="success-secondary-button"
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


export default OrderSuccess;