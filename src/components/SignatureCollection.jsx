import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./SignatureCollection.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";


function SignatureCollection() {

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isWishlisted,
    wishlistCount,
  } = useWishlist();


  const [addedProduct, setAddedProduct] =
    useState(null);

  const [wishlistMessage, setWishlistMessage] =
    useState("");


  /* =================================
     PRODUCTS
  ================================= */

  const products = [

    {
      id: 1,
      name: "QAVERIN NOIR",
      type: "Woody Eau de Parfum",
      price: 129,
      image: noir,
      rating: "★★★★★",
    },

    {
      id: 2,
      name: "QAVERIN ROSE",
      type: "Floral Eau de Parfum",
      price: 119,
      image: rose,
      rating: "★★★★★",
    },

    {
      id: 3,
      name: "QAVERIN OUD",
      type: "Oud Eau de Parfum",
      price: 149,
      image: oud,
      rating: "★★★★★",
    },

    {
      id: 4,
      name: "QAVERIN ÉCLAT",
      type: "Fresh Eau de Parfum",
      price: 109,
      image: eclat,
      rating: "★★★★★",
    },

  ];


  /* =================================
     OPEN PRODUCT
  ================================= */

  const openProduct = (id) => {

    navigate(`/product/${id}`);

  };


  /* =================================
     ADD TO CART
  ================================= */

  const handleAddToCart = (product) => {

    addToCart(product, 1);

    setAddedProduct(product.id);

    setTimeout(() => {

      setAddedProduct(null);

    }, 2000);

  };


  /* =================================
     WISHLIST
  ================================= */

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


  return (

    <section className="signature">


      {/* =================================
          WISHLIST NOTIFICATION
      ================================= */}

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


      {/* =================================
          CART NOTIFICATION
      ================================= */}

      {addedProduct && (

        <div className="shop-cart-message">

          <span>
            ✓
          </span>

          <span>
            Added to your Qaverin bag
          </span>

        </div>

      )}


      {/* =================================
          HEADING
      ================================= */}

      <div className="signature-heading">

        <p className="signature-eyebrow">
          OUR COLLECTION
        </p>

        <h2>
          OUR SIGNATURE COLLECTION
        </h2>

        <p className="signature-subtitle">
          Discover fragrances created to become
          uniquely yours.
        </p>

      </div>


      {/* =================================
          PRODUCT GRID
      ================================= */}

      <div className="product-grid">

        {products.map((product) => {

          const active =
            isWishlisted(product.id);


          return (

            <article
              className="product-card"
              key={product.id}
            >


              {/* =================================
                  IMAGE
              ================================= */}

              <div
                className="product-image"
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
                  className={`wishlist-button ${
                    active ? "active" : ""
                  }`}
                  onClick={(event) => {

                    event.preventDefault();

                    event.stopPropagation();

                    handleWishlist(product);

                  }}
                  aria-label={
                    active
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                >

                  {active
                    ? "♥"
                    : "♡"}

                </button>

              </div>


              {/* =================================
                  PRODUCT INFORMATION
              ================================= */}

              <div className="product-info">

                <div
                  className="product-name-row"
                  onClick={() =>
                    openProduct(product.id)
                  }
                >

                  <h3>
                    {product.name}
                  </h3>

                </div>


                <p className="product-type">
                  {product.type}
                </p>


                <div className="product-rating">

                  <span>
                    {product.rating}
                  </span>

                </div>


                <div className="product-bottom">

                  <span className="product-price">
                    ${product.price}
                  </span>


                  <button
                    type="button"
                    className="add-to-bag"
                    onClick={() =>
                      handleAddToCart(product)
                    }
                  >

                    {addedProduct === product.id
                      ? "ADDED TO BAG"
                      : "ADD TO BAG"}

                  </button>

                </div>

              </div>

            </article>

          );

        })}

      </div>


      {/* =================================
          WISHLIST STATUS
      ================================= */}

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

    </section>

  );

}


export default SignatureCollection;