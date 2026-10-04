import { useEffect, useState } from "react";
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

const API_URL = import.meta.env.VITE_API_BASE_URL;


// =========================================
// SHOP COMPONENT
// =========================================

function Shop() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  // =========================================
  // CART
  // =========================================

  const {
    cartItems,
    addToCart,
  } = useCart();


  // =========================================
  // WISHLIST
  // =========================================

  const {
    toggleWishlist,
    isWishlisted,
    wishlistCount,
  } = useWishlist();


  // =========================================
  // PRODUCTS STATE
  // =========================================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [productError, setProductError] =
    useState(false);


  // =========================================
  // FILTER STATE
  // =========================================

  const [activeCategory, setActiveCategory] =
    useState("ALL");


  // =========================================
  // SORT STATE
  // =========================================

  const [sortOption, setSortOption] =
    useState("default");


  // =========================================
  // MESSAGE STATE
  // =========================================

  const [addedProduct, setAddedProduct] =
    useState(null);

  const [cartMessage, setCartMessage] =
    useState("");

  const [wishlistMessage, setWishlistMessage] =
    useState("");


  // =========================================
  // SEARCH
  // =========================================

  const searchText =
    searchParams.get("search") || "";

  const normalizedSearch =
    searchText.trim().toLowerCase();


  // =========================================
  // CLEAR NOTIFICATIONS AFTER LOGOUT
  // =========================================

  useEffect(() => {

    const checkLoginStatus = () => {

      const token =
        localStorage.getItem(
          "qaverin-token"
        );

      const isLoggedIn =
        localStorage.getItem(
          "qaverin-logged-in"
        ) === "true";


      if (!token || !isLoggedIn) {

        setAddedProduct(null);

        setCartMessage("");

        setWishlistMessage("");

      }

    };


    // Check immediately

    checkLoginStatus();


    // =====================================
    // LOGOUT EVENT
    // =====================================

    const handleLogoutEvent = () => {

      setAddedProduct(null);

      setCartMessage("");

      setWishlistMessage("");

    };


    window.addEventListener(
      "qaverin-logout",
      handleLogoutEvent
    );


    // =====================================
    // CLEANUP
    // =====================================

    return () => {

      window.removeEventListener(
        "qaverin-logout",
        handleLogoutEvent
      );

    };

  }, []);


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  useEffect(() => {

    const getProducts = async () => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/products`
          );


        const data =
          await response.json();


        if (!response.ok) {

          setProductError(true);

          return;

        }


        // =====================================
        // FORMAT DATABASE PRODUCTS
        // =====================================

        const formattedProducts =
          Array.isArray(data.products)
            ? data.products.map(
                (product) => {

                  const productName =
                    product.name
                      ? product.name.toLowerCase()
                      : "";


                  // ===========================
                  // IMAGE
                  // ===========================

                  let productImage =
                    null;


                  if (
                    productName.includes(
                      "noir"
                    )
                  ) {

                    productImage = noir;

                  } else if (
                    productName.includes(
                      "rose"
                    )
                  ) {

                    productImage = rose;

                  } else if (
                    productName.includes(
                      "oud"
                    )
                  ) {

                    productImage = oud;

                  } else if (
                    productName.includes(
                      "éclat"
                    ) ||
                    productName.includes(
                      "eclat"
                    )
                  ) {

                    productImage = eclat;

                  }


                  return {

                    id:
                      product.id,

                    name:
                      product.name,

                    type:
                      product.description ||
                      product.brand ||
                      "Eau de Parfum",

                    category:
                      product.category
                        ? product.category.toUpperCase()
                        : "OTHER",

                    price:
                      Number(
                        product.price
                      ) || 0,

                    image:
                      productImage,

                  };

                }
              )
            : [];


        setProducts(
          formattedProducts
        );

      } catch (error) {

        console.error(
          "Products error:",
          error
        );

        setProductError(true);

      } finally {

        setLoading(false);

      }

    };


    getProducts();

  }, []);


  // =========================================
  // CATEGORIES
  // =========================================

  const categories = [
    "ALL",
    ...new Set(
      products.map(
        (product) =>
          product.category
      )
    ),
  ];


  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts =
    products.filter(
      (product) => {

        const matchesCategory =
          activeCategory === "ALL" ||
          product.category ===
            activeCategory;


        const matchesSearch =
          normalizedSearch === "" ||
          product.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          product.type
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          product.category
            .toLowerCase()
            .includes(
              normalizedSearch
            );


        return (
          matchesCategory &&
          matchesSearch
        );

      }
    );


  // =========================================
  // SORT PRODUCTS
  // =========================================

  const sortedProducts =
    [...filteredProducts].sort(
      (a, b) => {

        if (
          sortOption === "default"
        ) {

          return 0;

        }


        if (
          sortOption === "price-low"
        ) {

          return (
            Number(a.price) -
            Number(b.price)
          );

        }


        if (
          sortOption === "price-high"
        ) {

          return (
            Number(b.price) -
            Number(a.price)
          );

        }


        return 0;

      }
    );


  // =========================================
  // CHECK ACTIVE FILTERS
  // =========================================

  const hasActiveFilters =
    activeCategory !== "ALL" ||
    sortOption !== "default" ||
    normalizedSearch !== "";


  // =========================================
  // CLEAR FILTERS
  // =========================================

  const clearFilters = () => {

    setActiveCategory("ALL");

    setSortOption("default");

    navigate("/shop");

  };


  // =========================================
  // OPEN PRODUCT
  // =========================================

  const openProduct = (id) => {

    navigate(
      `/product/${id}`
    );

  };


  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = async (
    product
  ) => {

    // =======================================
    // CHECK LOGIN
    // =======================================

    const token =
      localStorage.getItem(
        "qaverin-token"
      );


    const isLoggedIn =
      localStorage.getItem(
        "qaverin-logged-in"
      ) === "true";


    // =======================================
    // NOT LOGGED IN
    // =======================================

    if (
      !token ||
      !isLoggedIn
    ) {

      setAddedProduct(null);

      setCartMessage("");

      alert(
        "Please login before adding products to your bag."
      );

      return;

    }


    // =======================================
    // CHECK CURRENT CART
    // =======================================

    const alreadyInCart =
      cartItems.some(
        (item) =>
          String(item.id) ===
          String(product.id)
      );


    // =======================================
    // ALREADY IN BAG
    // =======================================

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


    // =======================================
    // ADD PRODUCT
    // =======================================

    try {

      const success =
        await addToCart(
          product,
          1
        );


      // =====================================
      // ADD FAILED
      // =====================================

      if (!success) {

        setAddedProduct(null);

        setCartMessage("");

        return;

      }


      // =====================================
      // CHECK LOGIN AGAIN
      // =====================================

      const stillLoggedIn =
        localStorage.getItem(
          "qaverin-token"
        ) &&
        localStorage.getItem(
          "qaverin-logged-in"
        ) === "true";


      if (!stillLoggedIn) {

        setAddedProduct(null);

        setCartMessage("");

        return;

      }


      // =====================================
      // SUCCESS
      // =====================================

      setAddedProduct(
        product.id
      );


      setCartMessage(
        `✓ 1 × ${product.name} added to your bag`
      );


      setTimeout(() => {

        setAddedProduct(null);

        setCartMessage("");

      }, 2200);


    } catch (error) {

      console.error(
        "Shop add to cart error:",
        error
      );


      setAddedProduct(null);


      setCartMessage(
        "Unable to add product to your bag."
      );


      setTimeout(() => {

        setCartMessage("");

      }, 2200);

    }

  };


  // =========================================
  // WISHLIST
  // =========================================

  const handleWishlist = (
    product
  ) => {

    // =======================================
    // CHECK LOGIN
    // =======================================

    const token =
      localStorage.getItem(
        "qaverin-token"
      );


    const isLoggedIn =
      localStorage.getItem(
        "qaverin-logged-in"
      ) === "true";


    // =======================================
    // NOT LOGGED IN
    // =======================================

    if (
      !token ||
      !isLoggedIn
    ) {

      // Clear old wishlist message

      setWishlistMessage("");


      // IMPORTANT:
      // Do NOT call toggleWishlist()
      // when logged out.
      //
      // Just show login alert.

      alert(
        "Please login before adding products to your wishlist."
      );


      return;

    }


    // =======================================
    // CHECK CURRENT WISHLIST
    // =======================================

    const alreadyWishlisted =
      isWishlisted(
        product.id
      );


    // =======================================
    // TOGGLE WISHLIST
    // =======================================

    toggleWishlist(
      product
    );


    // =======================================
    // SHOW MESSAGE
    // =======================================

    if (
      alreadyWishlisted
    ) {

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


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <main className="shop">

        <section className="shop-header">

          <p className="shop-eyebrow">
            THE QAVERIN COLLECTION
          </p>


          <h1>

            Discover your

            <br />

            <em>
              signature.
            </em>

          </h1>


          <p className="shop-description">
            Loading fragrances...
          </p>

        </section>

      </main>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (productError) {

    return (

      <main className="shop">

        <section className="shop-header">

          <p className="shop-eyebrow">
            THE QAVERIN COLLECTION
          </p>


          <h1>

            Unable to load

            <br />

            <em>
              fragrances.
            </em>

          </h1>


          <p className="shop-description">

            Please make sure the Flask backend
            is running.

          </p>

        </section>

      </main>

    );

  }


  // =========================================
  // RENDER
  // =========================================

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

          <em>
            signature.
          </em>

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
          FILTER CONTROLS
      ===================================== */}

      <div className="shop-controls">

        <div className="shop-filters">

          {categories.map(
            (category) => (

              <button
                key={category}
                type="button"
                className={
                  activeCategory ===
                  category
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
              >

                {category}

              </button>

            )
          )}

        </div>


        <div className="shop-sort">

          <label htmlFor="sort-products">
            SORT BY
          </label>


          <select
            id="sort-products"
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value
              )
            }
          >

            <option value="default">
              Default
            </option>


            <option value="price-low">
              Price: Low to High
            </option>


            <option value="price-high">
              Price: High to Low
            </option>

          </select>

        </div>

      </div>


      {/* =====================================
          CLEAR FILTERS
      ===================================== */}

      {hasActiveFilters && (

        <div className="shop-clear-row">

          <button
            type="button"
            className="shop-clear-button"
            onClick={clearFilters}
          >

            CLEAR FILTERS

            <span>
              ×
            </span>

          </button>

        </div>

      )}


      {/* =====================================
          PRODUCT COUNT
      ===================================== */}

      <div className="shop-top-row">

        <span>

          {sortedProducts.length}{" "}

          {sortedProducts.length === 1
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

      {sortedProducts.length === 0 ? (

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
            onClick={clearFilters}
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

          {sortedProducts.map(
            (product) => {

              const active =
                isWishlisted(
                  product.id
                );


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
                      openProduct(
                        product.id
                      )
                    }
                  >

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                      />

                    ) : (

                      <div className="shop-image-placeholder">
                        No Image
                      </div>

                    )}


                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={
                        `shop-wishlist ${
                          active
                            ? "active"
                            : ""
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

                        handleWishlist(
                          product
                        );

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
                        openProduct(
                          product.id
                        )
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

                      $
                      {Number(
                        product.price
                      ).toFixed(2)}

                    </span>

                  </div>


                  {/* =========================
                      ADD TO BAG
                  ========================= */}

                  <button
                    type="button"
                    className="shop-add-button"
                    onClick={() =>
                      handleAddToCart(
                        product
                      )
                    }
                  >

                    <span>

                      {addedProduct ===
                      product.id
                        ? "ADDED TO BAG"
                        : "ADD TO BAG"}

                    </span>


                    <span>
                      →
                    </span>

                  </button>


                </article>

              );

            }
          )}

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