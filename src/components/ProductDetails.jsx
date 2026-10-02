import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./ProductDetails.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


// =========================================
// COMPONENT
// =========================================

function ProductDetails() {

  const { id } = useParams();


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
  } = useWishlist();


  // =========================================
  // PRODUCT STATE
  // =========================================

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [productError, setProductError] = useState(false);


  // =========================================
  // OTHER STATE
  // =========================================

  const [quantity, setQuantity] = useState(1);

  const [cartMessage, setCartMessage] = useState("");

  const [wishlistMessage, setWishlistMessage] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);

  const [activeNote, setActiveNote] = useState(null);


  // =========================================
  // FETCH PRODUCT
  // =========================================

  useEffect(() => {

    let cancelled = false;

    const getProduct = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:5000/api/products"
        );


        const data = await response.json();


        if (!response.ok) {

          if (!cancelled) {
            setProductError(true);
          }

          return;
        }


        // =====================================
        // FIND PRODUCT
        // =====================================

        const databaseProduct =
          data.products.find(
            (item) =>
              String(item.id) === String(id)
          );


        if (!databaseProduct) {

          if (!cancelled) {
            setProduct(null);
          }

          return;
        }


        // =====================================
        // PRODUCT NAME
        // =====================================

        const productName =
          databaseProduct.name
            ? databaseProduct.name.toLowerCase()
            : "";


        // =====================================
        // PRODUCT IMAGE
        // =====================================

        let productImage = null;


        if (productName.includes("noir")) {

          productImage = noir;

        } else if (productName.includes("rose")) {

          productImage = rose;

        } else if (productName.includes("oud")) {

          productImage = oud;

        } else if (
          productName.includes("éclat") ||
          productName.includes("eclat")
        ) {

          productImage = eclat;

        }


        // =====================================
        // DEFAULT DETAILS
        // =====================================

        let notes = [
          "Signature",
          "Fragrance",
          "Essence",
        ];


        let mood =
          "Elegant · Sophisticated · Timeless";


        // =====================================
        // PRODUCT-SPECIFIC DETAILS
        // =====================================

        if (productName.includes("noir")) {

          notes = [
            "Cedarwood",
            "Amber",
            "Black Pepper",
          ];

          mood =
            "Mysterious · Warm · Sophisticated";

        } else if (productName.includes("rose")) {

          notes = [
            "Rose",
            "Jasmine",
            "Vanilla",
          ];

          mood =
            "Elegant · Soft · Romantic";

        } else if (productName.includes("oud")) {

          notes = [
            "Oud",
            "Sandalwood",
            "Amber",
          ];

          mood =
            "Rich · Bold · Intense";

        } else if (
          productName.includes("éclat") ||
          productName.includes("eclat")
        ) {

          notes = [
            "Bergamot",
            "Musk",
            "Citrus",
          ];

          mood =
            "Fresh · Bright · Effortless";
        }


        // =====================================
        // FRONTEND PRODUCT
        // =====================================

        const formattedProduct = {

          id:
            String(databaseProduct.id),

          name:
            databaseProduct.name,

          type:
            databaseProduct.description ||
            databaseProduct.brand ||
            "Eau de Parfum",

          price:
            Number(databaseProduct.price),

          image:
            productImage,

          notes:
            notes,

          description:
            databaseProduct.description ||
            "A refined Qaverin fragrance created for those who leave a lasting impression.",

          mood:
            mood,

        };


        if (!cancelled) {

          setProduct(formattedProduct);

        }

      } catch (error) {

        console.error(
          "Product details error:",
          error
        );

        if (!cancelled) {
          setProductError(true);
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    };


    getProduct();


    return () => {

      cancelled = true;

    };

  }, [id]);


  // =========================================
  // PRODUCT SEO
  // =========================================

  useEffect(() => {

    if (!product) {
      return;
    }


    const siteUrl =
      "https://qaverin-perfume-ecommerce.vercel.app";


    const productUrl =
      `${siteUrl}/product/${product.id}`;


    const productTitle =
      `${product.name} | Qaverin Perfume`;


    const productDescription =
      `${product.name} by Qaverin. ${product.description} Discover the Qaverin fine fragrance collection.`;


    // =======================================
    // PAGE TITLE
    // =======================================

    document.title = productTitle;


    // =======================================
    // HELPER
    // =======================================

    const setMetaTag = (
      attribute,
      value,
      content
    ) => {

      let element =
        document.head.querySelector(
          `meta[${attribute}="${value}"]`
        );


      if (!element) {

        element =
          document.createElement("meta");

        element.setAttribute(
          attribute,
          value
        );

        document.head.appendChild(
          element
        );

      }


      element.setAttribute(
        "content",
        content
      );

      return element;

    };


    // =======================================
    // META DESCRIPTION
    // =======================================

    const descriptionMeta =
      setMetaTag(
        "name",
        "description",
        productDescription
      );


    // =======================================
    // OPEN GRAPH
    // =======================================

    const ogTitle =
      setMetaTag(
        "property",
        "og:title",
        productTitle
      );


    const ogDescription =
      setMetaTag(
        "property",
        "og:description",
        productDescription
      );


    const ogUrl =
      setMetaTag(
        "property",
        "og:url",
        productUrl
      );


    const ogType =
      setMetaTag(
        "property",
        "og:type",
        "product"
      );


    // =======================================
    // PRODUCT IMAGE
    // =======================================

    let absoluteImageUrl = "";


    if (product.image) {

      absoluteImageUrl =
        product.image.startsWith("http")
          ? product.image
          : `${window.location.origin}${product.image}`;

    }


    let ogImage = null;


    if (absoluteImageUrl) {

      ogImage =
        setMetaTag(
          "property",
          "og:image",
          absoluteImageUrl
        );

    }


    // =======================================
    // CANONICAL URL
    // =======================================

    let canonical =
      document.head.querySelector(
        'link[rel="canonical"]'
      );


    if (!canonical) {

      canonical =
        document.createElement("link");

      canonical.setAttribute(
        "rel",
        "canonical"
      );

      document.head.appendChild(
        canonical
      );

    }


    canonical.setAttribute(
      "href",
      productUrl
    );


    // =======================================
    // PRODUCT STRUCTURED DATA
    // =======================================

    const existingSchema =
      document.getElementById(
        "qaverin-product-schema"
      );


    if (existingSchema) {

      existingSchema.remove();

    }


    const productSchema =
      document.createElement("script");


    productSchema.id =
      "qaverin-product-schema";


    productSchema.type =
      "application/ld+json";


    productSchema.textContent =
      JSON.stringify({

        "@context":
          "https://schema.org",

        "@type":
          "Product",

        name:
          product.name,

        description:
          product.description,

        image:
          absoluteImageUrl
            ? [absoluteImageUrl]
            : [],

        brand: {

          "@type":
            "Brand",

          name:
            "Qaverin",

        },

        sku:
          String(product.id),

        offers: {

          "@type":
            "Offer",

          url:
            productUrl,

          priceCurrency:
            "USD",

          price:
            product.price.toFixed(2),

          seller: {

            "@type":
              "Organization",

            name:
              "Qaverin",

          },

        },

      });


    document.head.appendChild(
      productSchema
    );


    // =======================================
    // CLEANUP
    // =======================================

    return () => {

      document.title =
        "Qaverin | Luxury Perfumes & Fine Fragrances";


      if (descriptionMeta) {
        descriptionMeta.remove();
      }


      if (ogTitle) {
        ogTitle.remove();
      }


      if (ogDescription) {
        ogDescription.remove();
      }


      if (ogUrl) {
        ogUrl.remove();
      }


      if (ogType) {
        ogType.remove();
      }


      if (ogImage) {
        ogImage.remove();
      }


      if (canonical) {
        canonical.remove();
      }


      const schema =
        document.getElementById(
          "qaverin-product-schema"
        );


      if (schema) {
        schema.remove();
      }

    };

  }, [product]);


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <main className="product-not-found">

        <span>
          ✦
        </span>

        <p>
          QAVERIN · FINE FRAGRANCE
        </p>

        <h1>
          Loading fragrance...
        </h1>

      </main>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (productError) {

    return (

      <main className="product-not-found">

        <span>
          ✦
        </span>

        <p>
          QAVERIN · FINE FRAGRANCE
        </p>

        <h1>
          Unable to load fragrance.
        </h1>

        <p>
          Please make sure the Flask backend
          is running.
        </p>

        <Link to="/shop">
          BACK TO SHOP →
        </Link>

      </main>

    );

  }


  // =========================================
  // PRODUCT NOT FOUND
  // =========================================

  if (!product) {

    return (

      <main className="product-not-found">

        <span>
          ✦
        </span>

        <p>
          QAVERIN · FINE FRAGRANCE
        </p>

        <h1>
          Fragrance not found.
        </h1>

        <Link to="/shop">
          BACK TO SHOP →
        </Link>

      </main>

    );

  }


  // =========================================
  // WISHLIST STATUS
  // =========================================

  const wishlisted =
    isWishlisted(
      Number(product.id)
    );


  // =========================================
  // QUANTITY
  // =========================================

  const increaseQuantity = () => {

    setQuantity(
      (current) =>
        current + 1
    );

  };


  const decreaseQuantity = () => {

    setQuantity(
      (current) =>
        current > 1
          ? current - 1
          : 1
    );

  };


  // =========================================
  // ADD TO BAG
  // =========================================

  const handleAddToCart = async () => {

    if (addingToCart) {
      return;
    }


    const alreadyInCart =
      cartItems.some(
        (item) =>
          String(item.id) ===
          String(product.id)
      );


    if (alreadyInCart) {

      setCartMessage(
        `✓ ${product.name} is already in your bag`
      );


      setTimeout(() => {

        setCartMessage("");

      }, 2200);


      return;

    }


    setAddingToCart(true);

    setCartMessage("");


    try {

      const success =
        await addToCart(
          product,
          quantity
        );


      if (success) {

        setCartMessage(
          `✓ ${quantity} × ${product.name} added to your bag`
        );

      }

    } catch (error) {

      console.error(
        "Product add to cart error:",
        error
      );

      setCartMessage(
        "Unable to add product to your bag."
      );

    } finally {

      setAddingToCart(false);


      setTimeout(() => {

        setCartMessage("");

      }, 2200);

    }

  };


  // =========================================
  // WISHLIST
  // =========================================

  const handleWishlist = () => {

    const currentlyWishlisted =
      isWishlisted(
        Number(product.id)
      );


    toggleWishlist({

      ...product,

      id:
        Number(product.id),

    });


    if (currentlyWishlisted) {

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

    }, 2200);

  };


  // =========================================
  // FRAGRANCE NOTE
  // =========================================

  const handleNoteClick = (note) => {

    setActiveNote(
      activeNote === note
        ? null
        : note
    );

  };


  // =========================================
  // RENDER
  // =========================================

  return (

    <main className="product-details">


      {/* =====================================
          CART NOTIFICATION
      ===================================== */}

      {cartMessage && (

        <div className="product-cart-message">

          <span>
            {cartMessage}
          </span>

        </div>

      )}


      {/* =====================================
          WISHLIST NOTIFICATION
      ===================================== */}

      {wishlistMessage && (

        <div className="product-wishlist-message">

          <span>
            ♥
          </span>

          <span>
            {wishlistMessage}
          </span>

        </div>

      )}


      {/* =====================================
          BREADCRUMB
      ===================================== */}

      <div className="product-breadcrumb">

        <Link to="/">
          HOME
        </Link>

        <span>
          /
        </span>

        <Link to="/shop">
          SHOP
        </Link>

        <span>
          /
        </span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =====================================
          PRODUCT LAYOUT
      ===================================== */}

      <section className="product-layout">


        {/* ===================================
            PRODUCT IMAGE
        =================================== */}

        <div className="product-detail-image">

          <div className="product-detail-glow">
          </div>


          <div className="product-image-frame">

            {product.image ? (

              <img
                src={product.image}
                alt={`${product.name} perfume by Qaverin`}
              />

            ) : (

              <div>
                No Image
              </div>

            )}

          </div>


          <span className="product-detail-number">

            0{product.id}

          </span>


          <span className="product-image-label">

            QAVERIN

          </span>


          <span className="product-floating-star">

            ✦

          </span>

        </div>


        {/* ===================================
            PRODUCT INFORMATION
        =================================== */}

        <div className="product-detail-info">


          <p className="product-detail-eyebrow">

            QAVERIN · FINE FRAGRANCE

          </p>


          <h1>

            {product.name}

          </h1>


          <p className="product-detail-type">

            {product.type}

          </p>


          {/* RATING */}

          <div className="product-detail-rating">

            <span className="rating-stars">

              ★★★★★

            </span>

            <span>

              4.9 / 5

            </span>

            <span className="rating-divider">

              ·

            </span>

            <span>

              Signature fragrance

            </span>

          </div>


          {/* PRICE */}

          <div className="product-detail-price">

            ${product.price}

          </div>


          {/* DESCRIPTION */}

          <p className="product-detail-description">

            {product.description}

          </p>


          {/* MOOD */}

          <div className="product-mood">

            <span>

              THE CHARACTER

            </span>

            <strong>

              {product.mood}

            </strong>

          </div>


          {/* =================================
              FRAGRANCE NOTES
          ================================= */}

          <div className="fragrance-notes">

            <p className="notes-title">

              FRAGRANCE NOTES

            </p>


            <div className="notes-list">

              {product.notes.map(
                (note, index) => (

                  <button
                    type="button"
                    key={note}
                    className={
                      `fragrance-note ${
                        activeNote === note
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      handleNoteClick(note)
                    }
                  >

                    <span>

                      0{index + 1}

                    </span>

                    {note}

                  </button>

                )
              )}

            </div>


            {activeNote && (

              <div className="active-note-message">

                <span>

                  ✦

                </span>

                <p>

                  {activeNote} creates part of
                  the distinctive QAVERIN
                  fragrance character.

                </p>

              </div>

            )}

          </div>


          {/* =================================
              PURCHASE
          ================================= */}

          <div className="purchase-row">


            {/* QUANTITY */}

            <div className="quantity-control">

              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
              >

                −

              </button>


              <span>

                {quantity}

              </span>


              <button
                type="button"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
              >

                +

              </button>

            </div>


            {/* WISHLIST */}

            <button
              type="button"
              className={
                `detail-wishlist ${
                  wishlisted
                    ? "active"
                    : ""
                }`
              }
              onClick={handleWishlist}
              aria-label={
                wishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >

              <span>

                {wishlisted
                  ? "♥"
                  : "♡"}

              </span>

            </button>

          </div>


          {/* =================================
              ADD TO BAG
          ================================= */}

          <button
            type="button"
            className={
              `detail-add-button ${
                addingToCart
                  ? "added"
                  : ""
              }`
            }
            onClick={handleAddToCart}
            disabled={addingToCart}
          >

            <span>

              {addingToCart
                ? "ADDING..."
                : "ADD TO BAG"}

            </span>


            <span className="add-button-arrow">

              {addingToCart
                ? "..."
                : "→"}

            </span>

          </button>


          {/* =================================
              EXTRA INFORMATION
          ================================= */}

          <div className="product-extra">


            <div>

              <span>

                FREE SHIPPING

              </span>

              <small>

                On orders over $100

              </small>

            </div>


            <div>

              <span>

                LONG LASTING

              </span>

              <small>

                Eau de Parfum concentration

              </small>

            </div>


            <div>

              <span>

                SIGNATURE QUALITY

              </span>

              <small>

                Crafted for lasting impression

              </small>

            </div>

          </div>


        </div>

      </section>


      {/* =====================================
          BRAND MESSAGE
      ===================================== */}

      <section className="product-brand-message">

        <span>
          ✦
        </span>

        <p>

          A fragrance is more than a scent.

          <br />

          It becomes part of your story.

        </p>

        <span>
          ✦
        </span>

      </section>


    </main>

  );

}


export default ProductDetails;