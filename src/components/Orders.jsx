import { Link, Navigate } from "react-router-dom";

import { useOrder } from "../context/useOrder";

import "./Orders.css";


function Orders() {

  const { orders } = useOrder();


  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";


  /* =========================================
     PROTECT ORDERS PAGE
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
     FORMAT ORDER DATE
  ========================================= */

  const formatOrderDate = (order) => {

    if (order?.createdAt) {

      const date = new Date(
        order.createdAt
      );


      if (!Number.isNaN(date.getTime())) {

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
     ITEM COUNT
  ========================================= */

  const getItemCount = (items) => {

    if (!Array.isArray(items)) {
      return 0;
    }


    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  };


  /* =========================================
     ORDER TOTAL
  ========================================= */

  const getOrderTotal = (order) => {

    return Number(
      order?.total || 0
    ).toFixed(2);

  };


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

            {orders.map((order) => {

              const items =
                Array.isArray(order.items)
                  ? order.items
                  : [];


              const itemCount =
                getItemCount(items);


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
                        #{order.id}
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
                        (item, index) => (

                          <div
                            className="orders-item"
                            key={
                              `${order.id}-${item.id}-${index}`
                            }
                          >


                            {/* IMAGE */}

                            <div className="orders-item-image">

                              <img
                                src={item.image}
                                alt={item.name}
                              />


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
                                {item.type}
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

                        )
                      )

                    )}

                  </div>



                  {/* =========================
                      ORDER DETAILS
                  ========================= */}

                  <div className="orders-details">


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


                    <div>

                      <span>
                        PAYMENT
                      </span>


                      <p>

                        {getPaymentName(
                          order.payment
                        )}

                      </p>

                    </div>


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
                  >

                    VIEW ORDER DETAILS

                    <span>
                      →
                    </span>

                  </Link>


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