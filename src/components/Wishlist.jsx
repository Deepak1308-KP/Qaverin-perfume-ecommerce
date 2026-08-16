import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./Wishlist.css";


function Wishlist() {

  const navigate = useNavigate();

  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const [addedProduct, setAddedProduct] =
    useState(null);


  /* =========================================
     OPEN PRODUCT
  ========================================= */

  const openProduct = (id) => {

    navigate(`/product/${id}`);

  };


  /* =========================================
     ADD TO CART
  ========================================= */

  const handleAddToCart = (product) => {

    addToCart(product, 1);

    setAddedProduct(product.id);

    setTimeout(() => {

      setAddedProduct(null);

    }, 2000);

  };


  /* =========================================
     EMPTY WISHLIST
  ========================================= */

  if (wishlistItems.length === 0) {

    return (

      <main className="wishlist-page">


        {/* =====================================
            HEADER
        ===================================== */}

        <section className="wishlist-header">

          <p className="wishlist-eyebrow">
            YOUR QAVERIN WISHLIST
          </p>

          <h1>
            Your <em>favorites.</em>
          </h1>

          <p className="wishlist-description">
            Fragrances you've chosen to remember.
          </p>

        </section>


        {/* =====================================
            EMPTY WISHLIST
        ===================================== */}

        <section className="wishlist-empty">

          <div className="wishlist-empty-icon">
            ♡
          </div>

          <h2>
            Your wishlist is empty.
          </h2>

          <p>
            Save fragrances you love and
            find them here later.
          </p>

          <Link
            to="/shop"
            className="wishlist-shop-button"
          >

            <span>
              EXPLORE COLLECTION
            </span>

            <span>
              →
            </span>

          </Link>

        </section>


      </main>

    );

  }


  /* =========================================
     WISHLIST WITH PRODUCTS
  ========================================= */

  return (

    <main className="wishlist-page">


      {/* =====================================
          CART NOTIFICATION
      ===================================== */}

      {addedProduct && (

        <div className="wishlist-cart-message">

          <span>
            ✓
          </span>

          <span>
            Added to your Qaverin bag
          </span>

        </div>

      )}


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="wishlist-header">

        <p className="wishlist-eyebrow">
          YOUR QAVERIN WISHLIST
        </p>

        <h1>
          Your <em>favorites.</em>
        </h1>

        <p className="wishlist-description">
          Fragrances you've chosen to remember.
        </p>

      </section>


      {/* =====================================
          WISHLIST CONTENT
      ===================================== */}

      <section className="wishlist-content">


        {/* =====================================
            TOP ROW
        ===================================== */}

        <div className="wishlist-top-row">

          <span>

            {wishlistItems.length}{" "}

            {wishlistItems.length === 1
              ? "FRAGRANCE"
              : "FRAGRANCES"}

          </span>


          <span>
            QAVERIN
          </span>

        </div>


        {/* =====================================
            PRODUCT GRID
        ===================================== */}

        <div className="wishlist-grid">


          {wishlistItems.map((product, index) => (

            <article
              className={`wishlist-card wishlist-card-${index + 1}`}
              key={product.id}
            >


              {/* =================================
                  PRODUCT IMAGE
              ================================= */}

              <div
                className="wishlist-image"

                onClick={() =>
                  openProduct(product.id)
                }

                role="button"

                tabIndex={0}

                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {

                    openProduct(product.id);

                  }

                }}
              >

                <img
                  src={product.image}
                  alt={product.name}
                />

              </div>


              {/* =================================
                  PRODUCT INFORMATION
              ================================= */}

              <div className="wishlist-info">


                {/* PRODUCT TYPE */}

                <p className="wishlist-type">
                  {product.type}
                </p>


                {/* PRODUCT NAME */}

                <h2
                  className="wishlist-product-name"

                  onClick={() =>
                    openProduct(product.id)
                  }
                >
                  {product.name}
                </h2>


                {/* DECORATIVE LINE */}

                <div className="wishlist-decoration">

                  <span></span>

                  <b>
                    ✦
                  </b>

                  <span></span>

                </div>


                {/* DESCRIPTION */}

                <p className="wishlist-product-description">

                  {product.description ||
                    `A refined ${
                      product.type?.toLowerCase() ||
                      "fragrance"
                    } created for a distinctive signature.`}

                </p>


                {/* PRICE */}

                <p className="wishlist-price">

                  ${Number(product.price).toFixed(2)}

                </p>


                {/* =================================
                    PRODUCT ACTIONS
                ================================= */}

                <div className="wishlist-actions">


                  {/* ADD TO BAG */}

                  <button
                    type="button"
                    className="wishlist-add-button"

                    onClick={() =>
                      handleAddToCart(product)
                    }
                  >

                    <span>

                      {addedProduct === product.id
                        ? "ADDED TO BAG"
                        : "ADD TO BAG"}

                    </span>

                    <span>
                      →
                    </span>

                  </button>


                  {/* REMOVE FROM WISHLIST */}

                  <button
                    type="button"
                    className="wishlist-remove-button"

                    onClick={() =>
                      removeFromWishlist(product.id)
                    }

                    aria-label={
                      `Remove ${product.name}`
                    }
                  >

                    ×

                  </button>


                </div>


              </div>


            </article>

          ))}


        </div>


        {/* =====================================
            CONTINUE SHOPPING
            OUTSIDE PRODUCT GRID
        ===================================== */}

        <div className="wishlist-continue">

          <Link
            to="/shop"
            className="wishlist-continue-button"
          >

            <span>
              CONTINUE SHOPPING
            </span>

            <span className="wishlist-continue-arrow">
              →
            </span>

          </Link>

        </div>


      </section>


    </main>

  );

}


export default Wishlist;