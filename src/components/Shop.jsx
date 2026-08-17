import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./Shop.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


function Shop() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();


  /* =========================================
     CART
  ========================================= */

  const {
    cartItems,
    addToCart,
  } = useCart();


  /* =========================================
     WISHLIST
  ========================================= */

  const {
    toggleWishlist,
    isWishlisted,
    wishlistCount,
  } = useWishlist();


  /* =========================================
     STATE
  ========================================= */

  const [activeCategory, setActiveCategory] =
    useState("ALL");

  const [addedProduct, setAddedProduct] =
    useState(null);

  const [cartMessage, setCartMessage] =
    useState("");

  const [wishlistMessage, setWishlistMessage] =
    useState("");


  /* =========================================
     SEARCH
  ========================================= */

  const searchText =
    searchParams.get("search") || "";

  const normalizedSearch =
    searchText.trim().toLowerCase();


  /* =========================================
     PRODUCTS
  ========================================= */

  const products = [

    {
      id: 1,
      name: "QAVERIN NOIR",
      type: "Woody Eau de Parfum",
      category: "WOODY",
      price: 129,
      image: noir,
    },

    {
      id: 2,
      name: "QAVERIN ROSE",
      type: "Floral Eau de Parfum",
      category: "FLORAL",
      price: 119,
      image: rose,
    },

    {
      id: 3,
      name: "QAVERIN OUD",
      type: "Oud Eau de Parfum",
      category: "OUD",
      price: 149,
      image: oud,
    },

    {
      id: 4,
      name: "QAVERIN ÉCLAT",
      type: "Fresh Eau de Parfum",
      category: "FRESH",
      price: 109,
      image: eclat,
    },

  ];


  /* =========================================
     CATEGORIES
  ========================================= */

  const categories = [
    "ALL",
    "WOODY",
    "FLORAL",
    "OUD",
    "FRESH",
  ];


  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  const filteredProducts =
    products.filter((product) => {

      const matchesCategory =
        activeCategory === "ALL" ||
        product.category === activeCategory;


      const matchesSearch =
        normalizedSearch === "" ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.type
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch);


      return (
        matchesCategory &&
        matchesSearch
      );

    });


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

    /* =======================================
       CHECK CURRENT CART
    ======================================= */

    const alreadyInCart =
      cartItems.some(
        (item) =>
          String(item.id) ===
          String(product.id)
      );


    /* =======================================
       ALREADY IN BAG
    ======================================= */

    if (alreadyInCart) {

      setAddedProduct(
        `already-${product.id}`
      );

      setCartMessage(
        `✓ ${product.name} is already in your bag`
      );


      setTimeout(() => {

        setAddedProduct(null);

        setCartMessage("");

      }, 2200);


      return;

    }


    /* =======================================
       ADD NEW PRODUCT
    ======================================= */

    addToCart(product, 1);


    setAddedProduct(product.id);

    setCartMessage(
      `✓ 1 × ${product.name} added to your bag`
    );


    setTimeout(() => {

      setAddedProduct(null);

      setCartMessage("");

    }, 2200);

  };


  /* =========================================
     WISHLIST
  ========================================= */

  const handleWishlist = (product) => {

    const alreadyWishlisted =
      isWishlisted(product.id);


    toggleWishlist(product);


    if (alreadyWishlisted) {

      setWishlistMessage(
        `${product.name} removed from your wishlist`
      );

    } else {

      setWishlistMessage(
        `${product.name} added to your wishlist`
      );

    }


    setTimeout(() => {

      setWishlistMessage("");

    }, 2000);

  };


  /* =========================================
     RENDER
  ========================================= */

  return (

    <main className="shop">


      {/* =====================================
          WISHLIST NOTIFICATION
      ===================================== */}

      {wishlistMessage && (

        <div className="shop-wishlist-message">

          <span>
            ♥
          </span>

          <span>
            {wishlistMessage}
          </span>

        </div>

      )}


      {/* =====================================
          CART NOTIFICATION
      ===================================== */}

      {cartMessage && (

        <div className="shop-cart-message">

          <span>
            ✓
          </span>

          <span>
            {cartMessage}
          </span>

        </div>

      )}


      {/* =====================================
          SHOP HEADER
      ===================================== */}

      <section className="shop-header">

        <span className="shop-particle particle-one">
          ✦
        </span>

        <span className="shop-particle particle-two">
          ✧
        </span>

        <span className="shop-particle particle-three">
          ·
        </span>

        <span className="shop-particle particle-four">
          ✦
        </span>


        <p className="shop-eyebrow">
          THE QAVERIN COLLECTION
        </p>


        <h1>
          Discover your
          <br />
          <em>signature.</em>
        </h1>


        <p className="shop-description">
          Explore fragrances carefully crafted
          to become uniquely yours.
        </p>

      </section>


      {/* =====================================
          SEARCH RESULT
      ===================================== */}

      {normalizedSearch && (

        <div className="shop-search-result">

          <span>
            SEARCH RESULTS FOR
          </span>

          <strong>
            "{searchText}"
          </strong>

        </div>

      )}


      {/* =====================================
          CATEGORY FILTER
      ===================================== */}

      <div className="shop-filters">

        {categories.map((category) => (

          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveCategory(category)
            }
          >

            {category}

          </button>

        ))}

      </div>


      {/* =====================================
          PRODUCT COUNT
      ===================================== */}

      <div className="shop-top-row">

        <span>

          {filteredProducts.length}{" "}

          {filteredProducts.length === 1
            ? "FRAGRANCE"
            : "FRAGRANCES"}

        </span>


        <span>

          {activeCategory}

        </span>

      </div>


      {/* =====================================
          NO RESULTS
      ===================================== */}

      {filteredProducts.length === 0 ? (

        <section className="shop-no-results">

          <div className="shop-no-results-icon">
            ♡
          </div>

          <h2>
            No fragrance found.
          </h2>

          <p>
            We couldn't find a fragrance
            matching "{searchText}".
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
          >

            VIEW ALL FRAGRANCES

            <span>
              →
            </span>

          </button>

        </section>

      ) : (

        /* =================================
           PRODUCT GRID
        ================================= */

        <section className="shop-grid">

          {filteredProducts.map((product) => {

            const active =
              isWishlisted(product.id);


            return (

              <article
                className="shop-product"
                key={product.id}
              >


                {/* =========================
                    PRODUCT IMAGE
                ========================= */}

                <div
                  className="shop-product-image"
                  onClick={() =>
                    openProduct(product.id)
                  }
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />


                  {/* WISHLIST */}

                  <button
                    type="button"
                    className={
                      `shop-wishlist ${
                        active ? "active" : ""
                      }`
                    }
                    aria-label={
                      active
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    onClick={(event) => {

                      event.preventDefault();

                      event.stopPropagation();

                      handleWishlist(product);

                    }}
                  >

                    {active
                      ? "♥"
                      : "♡"}

                  </button>

                </div>


                {/* =========================
                    PRODUCT INFORMATION
                ========================= */}

                <div className="shop-product-info">

                  <div
                    className="shop-product-name"
                    onClick={() =>
                      openProduct(product.id)
                    }
                  >

                    <h2>
                      {product.name}
                    </h2>

                    <p>
                      {product.type}
                    </p>

                  </div>


                  <span className="shop-price">
                    ${product.price}
                  </span>

                </div>


                {/* =========================
                    ADD TO BAG
                ========================= */}

                <button
                  type="button"
                  className="shop-add-button"
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


              </article>

            );

          })}

        </section>

      )}


      {/* =====================================
          WISHLIST STATUS
      ===================================== */}

      {wishlistCount > 0 && (

        <div className="wishlist-status">

          <span className="wishlist-status-heart">
            ♥
          </span>


          <span>

            {wishlistCount}{" "}

            {wishlistCount === 1
              ? "fragrance"
              : "fragrances"}{" "}

            saved to your wishlist

          </span>

        </div>

      )}

    </main>

  );

}


export default Shop;