import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { useOrder } from "../context/useOrder";

import "./Account.css";


function Account() {

  const navigate = useNavigate();

  const { cartCount } = useCart();

  const { wishlistCount } = useWishlist();

  const { orders } = useOrder();


  /* =========================================
     FORMAT ORDER DATE
  ========================================= */

  const formatOrderDate = (order) => {

    /*
      New orders have createdAt.
      Older orders may only have date.
    */

    if (order?.createdAt) {

      const date =
        new Date(order.createdAt);

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


    /* FALLBACK */

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
     ORDER ITEM COUNT
  ========================================= */

  const getOrderItemCount = (items) => {

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


  /* =========================================
     EMPTY ORDER CHECK
  ========================================= */

  const hasOrders =
    Array.isArray(orders) &&
    orders.length > 0;


  return (

    <main className="account-page">


      {/* =========================================
          ACCOUNT HEADER
      ========================================= */}

      <section className="account-header">

        <p className="account-eyebrow">
          QAVERIN · YOUR ACCOUNT
        </p>


        <h1>

          Welcome to

          <br />

          <em>Qaverin.</em>

        </h1>


        <p className="account-description">

          Manage your collection, favorites
          and shopping experience.

        </p>

      </section>


      {/* =========================================
          ACCOUNT CONTENT
      ========================================= */}

      <section className="account-content">


        {/* =========================================
            PROFILE
        ========================================= */}

        <Link
          to="/profile"
          className="account-profile"
        >

          <div className="account-avatar">
            Q
          </div>


          <div>

            <p className="account-profile-label">
              YOUR PROFILE
            </p>


            <h2>
              Qaverin Guest
            </h2>


            <p>
              Welcome to your personal
              fragrance space.
            </p>

          </div>


          <strong className="account-profile-arrow">
            →
          </strong>

        </Link>


        {/* =========================================
            ACCOUNT OPTIONS
        ========================================= */}

        <div className="account-options">


          {/* =====================================
              WISHLIST
          ===================================== */}

          <button
            type="button"
            className="account-option"
            onClick={() =>
              navigate("/wishlist")
            }
          >

            <div className="account-option-icon">
              ♡
            </div>


            <div className="account-option-info">

              <span>
                WISHLIST
              </span>


              <p>

                {wishlistCount}

                {" "}

                {wishlistCount === 1
                  ? "fragrance"
                  : "fragrances"}

                {" "}saved

              </p>

            </div>


            <strong>
              →
            </strong>

          </button>


          {/* =====================================
              CART
          ===================================== */}

          <button
            type="button"
            className="account-option"
            onClick={() =>
              navigate("/cart")
            }
          >

            <div className="account-option-icon">
              ♧
            </div>


            <div className="account-option-info">

              <span>
                YOUR BAG
              </span>


              <p>

                {cartCount}

                {" "}

                {cartCount === 1
                  ? "item"
                  : "items"}

                {" "}in your bag

              </p>

            </div>


            <strong>
              →
            </strong>

          </button>


          {/* =====================================
              SHOP
          ===================================== */}

          <Link
            to="/shop"
            className="account-option"
          >

            <div className="account-option-icon">
              ✦
            </div>


            <div className="account-option-info">

              <span>
                EXPLORE COLLECTION
              </span>


              <p>
                Discover your next signature
              </p>

            </div>


            <strong>
              →
            </strong>

          </Link>

        </div>


        {/* =========================================
            MY ORDERS
        ========================================= */}

        <section className="account-orders">


          {/* =====================================
              ORDERS HEADER
          ===================================== */}

          <div className="account-orders-header">

            <div>

              <p className="account-orders-eyebrow">
                QAVERIN · ORDER HISTORY
              </p>


              <h2>

                My <em>orders.</em>

              </h2>

            </div>


            <span className="account-orders-count">

              {orders.length}

              {" "}

              {orders.length === 1
                ? "ORDER"
                : "ORDERS"}

            </span>

          </div>


          {/* =====================================
              EMPTY ORDERS
          ===================================== */}

          {!hasOrders ? (

            <div className="orders-empty">

              <div className="orders-empty-icon">
                ✦
              </div>


              <h3>
                No orders yet.
              </h3>


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


            /* =====================================
               ORDER LIST
            ===================================== */

            <div className="orders-list">

              {orders.map((order) => {

                const items =
                  Array.isArray(order.items)
                    ? order.items
                    : [];


                const itemCount =
                  getOrderItemCount(items);


                return (

                  <article
                    className="order-card"
                    key={order.id}
                  >


                    {/* =================================
                        ORDER HEADER
                    ================================= */}

                    <div className="order-card-header">

                      <div>

                        <span>
                          ORDER
                        </span>


                        <h3>
                          #{order.id}
                        </h3>

                      </div>


                      <div className="order-status">

                        {order.status ||
                          "ORDER PLACED"}

                      </div>

                    </div>


                    {/* =================================
                        ORDER ITEMS
                    ================================= */}

                    <div className="order-items">

                      {items.length === 0 ? (

                        <p className="order-no-items">
                          No item information available.
                        </p>

                      ) : (

                        items.map((item, index) => (

                          <div
                            className="order-item"
                            key={
                              `${order.id}-${item.id}-${index}`
                            }
                          >


                            {/* IMAGE */}

                            <div className="order-item-image">

                              <img
                                src={item.image}
                                alt={item.name}
                              />


                              <span>
                                {item.quantity}
                              </span>

                            </div>


                            {/* INFORMATION */}

                            <div className="order-item-info">

                              <h4>
                                {item.name}
                              </h4>


                              <p>
                                {item.type}
                              </p>

                            </div>


                            {/* ITEM TOTAL */}

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

                        ))

                      )}

                    </div>


                    {/* =================================
                        ORDER FOOTER
                    ================================= */}

                    <div className="order-card-footer">


                      {/* ORDER DATE */}

                      <div>

                        <span>
                          ORDER DATE
                        </span>


                        <p>
                          {formatOrderDate(order)}
                        </p>

                      </div>


                      {/* PAYMENT */}

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

                      <div className="order-total">

                        <span>
                          TOTAL
                        </span>


                        <strong>

                          $
                          {getOrderTotal(order)}

                        </strong>

                      </div>

                    </div>


                    {/* =================================
                        VIEW ORDER DETAILS
                    ================================= */}

                    <Link
                      to={`/order/${order.id}`}
                      className="view-order-button"
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


        {/* =========================================
            ACCOUNT MESSAGE
        ========================================= */}

        <div className="account-message">

          <span>
            ✦
          </span>


          <p>

            Your fragrance journey begins
            with finding a scent that feels
            uniquely yours.

          </p>


          <span>
            ✦
          </span>

        </div>


      </section>


      {/* =========================================
          BACK HOME
      ========================================= */}

      <Link
        to="/"
        className="account-home-button"
      >

        ← BACK TO HOME

      </Link>


    </main>

  );

}


export default Account;