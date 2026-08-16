import { useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./ProductDetails.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


function ProductDetails() {

  const { id } = useParams();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();


  /* =================================
     STATE
  ================================= */

  const [quantity, setQuantity] = useState(1);

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  const [cartMessage, setCartMessage] =
    useState("");

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [activeNote, setActiveNote] =
    useState(null);


  /* =================================
     PRODUCTS
  ================================= */

  const products = [
    {
      id: "1",
      name: "QAVERIN NOIR",
      type: "Woody Eau de Parfum",
      price: 129,
      image: noir,
      notes: [
        "Cedarwood",
        "Amber",
        "Black Pepper",
      ],
      description:
        "A deep and sophisticated fragrance created for those who leave a lasting impression.",
      mood:
        "Mysterious · Warm · Sophisticated",
    },

    {
      id: "2",
      name: "QAVERIN ROSE",
      type: "Floral Eau de Parfum",
      price: 119,
      image: rose,
      notes: [
        "Rose",
        "Jasmine",
        "Vanilla",
      ],
      description:
        "A refined floral fragrance that balances elegance, softness and timeless beauty.",
      mood:
        "Elegant · Soft · Romantic",
    },

    {
      id: "3",
      name: "QAVERIN OUD",
      type: "Oud Eau de Parfum",
      price: 149,
      image: oud,
      notes: [
        "Oud",
        "Sandalwood",
        "Amber",
      ],
      description:
        "A rich and powerful oud composition with a warm and unforgettable character.",
      mood:
        "Rich · Bold · Intense",
    },

    {
      id: "4",
      name: "QAVERIN ÉCLAT",
      type: "Fresh Eau de Parfum",
      price: 109,
      image: eclat,
      notes: [
        "Bergamot",
        "Musk",
        "Citrus",
      ],
      description:
        "A fresh and luminous fragrance designed for effortless everyday elegance.",
      mood:
        "Fresh · Bright · Effortless",
    },
  ];


  /* =================================
     FIND PRODUCT
  ================================= */

  const product = products.find(
    (item) => item.id === id
  );


  /* =================================
     PRODUCT NOT FOUND
  ================================= */

  if (!product) {

    return (
      <main className="product-not-found">

        <span>✦</span>

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


  /* =================================
     WISHLIST
  ================================= */

  const wishlisted =
    isWishlisted(Number(product.id));


  /* =================================
     QUANTITY
  ================================= */

  const increaseQuantity = () => {

    setQuantity((current) =>
      current + 1
    );

  };


  const decreaseQuantity = () => {

    setQuantity((current) =>
      current > 1
        ? current - 1
        : 1
    );

  };


  /* =================================
     ADD TO CART
  ================================= */

  const handleAddToCart = () => {

    if (addingToCart) {
      return;
    }

    addToCart(product, quantity);

    setAddingToCart(true);

    setCartMessage(
      `${quantity} × ${product.name} added to your bag`
    );


    setTimeout(() => {

      setAddingToCart(false);

      setCartMessage("");

    }, 2200);

  };


  /* =================================
     WISHLIST
  ================================= */

  const handleWishlist = () => {

    const alreadyWishlisted =
      isWishlisted(Number(product.id));


    toggleWishlist({
      ...product,
      id: Number(product.id),
    });


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

    }, 2200);

  };


  /* =================================
     NOTE CLICK
  ================================= */

  const handleNoteClick = (note) => {

    setActiveNote(
      activeNote === note
        ? null
        : note
    );

  };


  return (

    <main className="product-details">


      {/* =================================
          NOTIFICATIONS
      ================================= */}

      {wishlistMessage && (

        <div className="product-wishlist-message">

          <span>♥</span>

          <span>
            {wishlistMessage}
          </span>

        </div>

      )}


      {cartMessage && (

        <div className="product-cart-message">

          <span>✓</span>

          <span>
            {cartMessage}
          </span>

        </div>

      )}


      {/* =================================
          BREADCRUMB
      ================================= */}

      <div className="product-breadcrumb">

        <Link to="/">
          HOME
        </Link>

        <span>/</span>

        <Link to="/shop">
          SHOP
        </Link>

        <span>/</span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =================================
          PRODUCT LAYOUT
      ================================= */}

      <section className="product-layout">


        {/* =================================
            PRODUCT IMAGE
        ================================= */}

        <div className="product-detail-image">

          <div className="product-detail-glow"></div>


          <div className="product-image-frame">

            <img
              src={product.image}
              alt={product.name}
            />

          </div>


          {/* PRODUCT NUMBER */}

          <span className="product-detail-number">

            0{product.id}

          </span>


          {/* IMAGE LABEL */}

          <span className="product-image-label">

            QAVERIN

          </span>


          {/* FLOATING DECORATION */}

          <span className="product-floating-star">
            ✦
          </span>

        </div>


        {/* =================================
            PRODUCT INFORMATION
        ================================= */}

        <div className="product-detail-info">


          {/* EYEBROW */}

          <p className="product-detail-eyebrow">

            QAVERIN · FINE FRAGRANCE

          </p>


          {/* NAME */}

          <h1>
            {product.name}
          </h1>


          {/* TYPE */}

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

              {product.notes.map((note, index) => (

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

              ))}

            </div>


            {activeNote && (

              <div className="active-note-message">

                <span>✦</span>

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
                ? "ADDED TO BAG"
                : "ADD TO BAG"}

            </span>


            <span className="add-button-arrow">

              {addingToCart
                ? "✓"
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


      {/* =================================
          BOTTOM BRAND MESSAGE
      ================================= */}

      <section className="product-brand-message">

        <span>✦</span>

        <p>
          A fragrance is more than a scent.
          <br />
          It becomes part of your story.
        </p>

        <span>✦</span>

      </section>


    </main>

  );

}


export default ProductDetails;