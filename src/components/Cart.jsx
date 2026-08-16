import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";

import "./Cart.css";


function Cart() {

  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();


  /* =================================
     OPEN PRODUCT DETAILS
  ================================= */

  const openProduct = (id) => {
    navigate(`/product/${id}`);
  };


  return (
    <main className="cart-page">


      {/* =================================
          CART HEADER
      ================================= */}

      <section className="cart-header">

        <p className="cart-eyebrow">
          YOUR QAVERIN BAG
        </p>

        <h1>
          Your <em>collection.</em>
        </h1>

        <p className="cart-description">
          Carefully selected fragrances,
          ready to become part of your signature.
        </p>

      </section>


      {/* =================================
          EMPTY CART
      ================================= */}

      {cartItems.length === 0 ? (

        <section className="cart-empty">

          <div className="cart-empty-icon">
            ♡
          </div>

          <h2>
            Your bag is empty.
          </h2>

          <p>
            Discover a fragrance that becomes
            uniquely yours.
          </p>

          <Link
            to="/shop"
            className="cart-shop-button"
          >
            EXPLORE COLLECTION
            <span>→</span>
          </Link>

        </section>

      ) : (

        <section className="cart-content">


          {/* =================================
              CART ITEMS
          ================================= */}

          <div className="cart-items">

            <div className="cart-items-top">

              <span>
                {cartCount}{" "}
                {cartCount === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>

              <span>
                QAVERIN
              </span>

            </div>


            {/* =================================
                ITEMS
            ================================= */}

            {cartItems.map((item) => (

              <article
                className="cart-item"
                key={item.id}
              >


                {/* =================================
                    IMAGE
                ================================= */}

                <div
                  className="cart-item-image"
                  onClick={() =>
                    openProduct(item.id)
                  }
                  role="button"
                  tabIndex="0"
                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      openProduct(item.id);
                    }

                  }}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                </div>


                {/* =================================
                    INFORMATION
                ================================= */}

                <div className="cart-item-info">

                  <div>

                    <p className="cart-item-type">
                      {item.type}
                    </p>


                    <h2
                      className="cart-product-name"
                      onClick={() =>
                        openProduct(item.id)
                      }
                    >
                      {item.name}
                    </h2>


                    <p className="cart-item-price">
                      ${Number(item.price).toFixed(2)}
                    </p>

                  </div>


                  {/* =================================
                      QUANTITY
                  ================================= */}

                  <div className="cart-quantity">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>


                  {/* =================================
                      REMOVE
                  ================================= */}

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    REMOVE
                  </button>

                </div>


                {/* =================================
                    ITEM TOTAL
                ================================= */}

                <div className="cart-item-total">

                  $
                  {(item.price * item.quantity).toFixed(2)}

                </div>

              </article>

            ))}

          </div>


          {/* =================================
              ORDER SUMMARY
          ================================= */}

          <aside className="cart-summary">

            <p className="summary-eyebrow">
              ORDER SUMMARY
            </p>

            <h2>
              Your order
            </h2>


            {/* ITEM COUNT */}

            <div className="summary-line">

              <span>
                Items
              </span>

              <span>
                {cartCount}
              </span>

            </div>


            {/* SUBTOTAL */}

            <div className="summary-line">

              <span>
                Subtotal
              </span>

              <span>
                ${cartTotal.toFixed(2)}
              </span>

            </div>


            {/* SHIPPING */}

            <div className="summary-line">

              <span>
                Shipping
              </span>

              <span>
                FREE
              </span>

            </div>


            <div className="summary-divider"></div>


            {/* TOTAL */}

            <div className="summary-total">

              <span>
                TOTAL
              </span>

              <strong>
                ${cartTotal.toFixed(2)}
              </strong>

            </div>


            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="checkout-button"
            >

              <span>
                PROCEED TO CHECKOUT
              </span>

              <span>
                →
              </span>

            </Link>


            {/* CONTINUE SHOPPING */}

            <Link
              to="/shop"
              className="continue-shopping"
            >
              ← CONTINUE SHOPPING
            </Link>

          </aside>

        </section>

      )}

    </main>
  );
}


export default Cart;