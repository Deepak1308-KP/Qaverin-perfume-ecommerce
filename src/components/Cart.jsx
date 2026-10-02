import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";

import "./Cart.css";


function Cart() {

  const navigate = useNavigate();


  // =========================================
  // CART CONTEXT
  // =========================================

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    loadingCart,
  } = useCart();


  // =========================================
  // LOGIN STATUS
  // =========================================

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";

  const token =
    localStorage.getItem(
      "qaverin-token"
    );


  // =========================================
  // SAFE CART ITEMS
  // =========================================

  const safeCartItems =
    Array.isArray(cartItems)
      ? cartItems
      : [];


  // =========================================
  // OPEN PRODUCT DETAILS
  // =========================================

  const openProduct = (id) => {

    const numericId =
      Number(id);

    if (!numericId) {
      return;
    }

    navigate(
      `/product/${numericId}`
    );

  };


  // =========================================
  // CHECKOUT
  // =========================================

  const handleCheckout = (event) => {

    event.preventDefault();


    // =======================================
    // LOGIN CHECK
    // =======================================

    if (
      !isLoggedIn ||
      !token
    ) {

      alert(
        "Please login before proceeding to checkout."
      );

      navigate(
        "/login",
        {
          state: {
            from: "/checkout",
          },
        }
      );

      return;

    }


    // =======================================
    // EMPTY CART CHECK
    // =======================================

    if (
      safeCartItems.length === 0
    ) {

      alert(
        "Your bag is empty."
      );

      return;

    }


    // =======================================
    // GO TO CHECKOUT
    // =======================================

    navigate(
      "/checkout"
    );

  };


  // =========================================
  // CART TOTAL SAFETY
  // =========================================

  const safeCartTotal =
    Number.isFinite(
      Number(cartTotal)
    )
      ? Number(cartTotal)
      : 0;


  // =========================================
  // LOADING
  // =========================================

  if (loadingCart) {

    return (

      <main className="cart-page">

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


        <section className="cart-empty">

          <div className="cart-empty-icon">
            ✦
          </div>

          <h2>
            Loading your bag...
          </h2>

          <p>
            Please wait while we load your collection.
          </p>

        </section>

      </main>

    );

  }


  // =========================================
  // RENDER
  // =========================================

  return (

    <main className="cart-page">


      {/* =========================================
          CART HEADER
      ========================================= */}

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


      {/* =========================================
          EMPTY CART
      ========================================= */}

      {safeCartItems.length === 0 ? (

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

            <span>
              →
            </span>

          </Link>

        </section>

      ) : (

        <section className="cart-content">


          {/* =========================================
              CART ITEMS
          ========================================= */}

          <div className="cart-items">


            {/* =======================================
                CART TOP
            ======================================= */}

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


            {/* =======================================
                ITEMS
            ======================================= */}

            {safeCartItems.map((item) => {

              const itemId =
                Number(item.id);

              const quantity =
                Number(item.quantity) || 1;

              const price =
                Number(item.price) || 0;

              const itemTotal =
                price * quantity;


              return (

                <article
                  className="cart-item"
                  key={
                    item.cartId ||
                    item.id
                  }
                >


                  {/* =================================
                      IMAGE
                  ================================= */}

                  <div
                    className="cart-item-image"
                    onClick={() =>
                      openProduct(itemId)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {

                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {

                        event.preventDefault();

                        openProduct(
                          itemId
                        );

                      }

                    }}
                  >

                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name ||
                        "Qaverin fragrance"
                      }
                    />

                  </div>


                  {/* =================================
                      INFORMATION
                  ================================= */}

                  <div className="cart-item-info">


                    {/* PRODUCT DETAILS */}

                    <div>

                      <p className="cart-item-type">

                        {item.type ||
                          "Eau de Parfum"}

                      </p>


                      <h2
                        className="cart-product-name"
                        onClick={() =>
                          openProduct(
                            itemId
                          )
                        }
                      >

                        {item.name ||
                          "Qaverin fragrance"}

                      </h2>


                      <p className="cart-item-price">

                        ${price.toFixed(2)}

                      </p>

                    </div>


                    {/* =================================
                        QUANTITY
                    ================================= */}

                    <div className="cart-quantity">


                      {/* DECREASE */}

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            itemId
                          )
                        }
                        disabled={
                          quantity <= 1
                        }
                        aria-label={`Decrease quantity of ${
                          item.name ||
                          "product"
                        }`}
                      >

                        −

                      </button>


                      {/* CURRENT QUANTITY */}

                      <span>

                        {quantity}

                      </span>


                      {/* INCREASE */}

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            itemId
                          )
                        }
                        aria-label={`Increase quantity of ${
                          item.name ||
                          "product"
                        }`}
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
                        removeFromCart(
                          itemId
                        )
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
                    {itemTotal.toFixed(2)}

                  </div>

                </article>

              );

            })}

          </div>


          {/* =========================================
              ORDER SUMMARY
          ========================================= */}

          <aside className="cart-summary">


            <p className="summary-eyebrow">

              ORDER SUMMARY

            </p>


            <h2>

              Your order

            </h2>


            {/* =================================
                ITEM COUNT
            ================================= */}

            <div className="summary-line">

              <span>
                Items
              </span>


              <span>
                {cartCount}
              </span>

            </div>


            {/* =================================
                SUBTOTAL
            ================================= */}

            <div className="summary-line">

              <span>
                Subtotal
              </span>


              <span>

                ${safeCartTotal.toFixed(2)}

              </span>

            </div>


            {/* =================================
                SHIPPING
            ================================= */}

            <div className="summary-line">

              <span>
                Shipping
              </span>


              <span>
                FREE
              </span>

            </div>


            <div className="summary-divider">
            </div>


            {/* =================================
                TOTAL
            ================================= */}

            <div className="summary-total">

              <span>
                TOTAL
              </span>


              <strong>

                ${safeCartTotal.toFixed(2)}

              </strong>

            </div>


            {/* =================================
                CHECKOUT
            ================================= */}

            <button
              type="button"
              className="checkout-button"
              onClick={handleCheckout}
            >

              <span>
                PROCEED TO CHECKOUT
              </span>


              <span>
                →
              </span>

            </button>


            {/* =================================
                CONTINUE SHOPPING
            ================================= */}

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