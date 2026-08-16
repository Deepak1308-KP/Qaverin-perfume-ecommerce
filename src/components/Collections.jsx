import { useNavigate } from "react-router-dom";
import "./Collections.css";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";

function Collections() {

  const navigate = useNavigate();

  const collections = [
    {
      id: 1,
      name: "THE DARK COLLECTION",
      subtitle: "DEPTH · MYSTERY · CHARACTER",
      description:
        "Intense compositions created for those who prefer a deeper, unforgettable signature.",
      product: "QAVERIN NOIR",
      image: noir,
      productId: 1,
    },

    {
      id: 2,
      name: "THE FLORAL COLLECTION",
      subtitle: "ELEGANCE · SOFTNESS · BEAUTY",
      description:
        "Delicate floral compositions that express timeless elegance with a modern touch.",
      product: "QAVERIN ROSE",
      image: rose,
      productId: 2,
    },

    {
      id: 3,
      name: "THE OUD COLLECTION",
      subtitle: "RICH · WARM · TIMELESS",
      description:
        "A powerful interpretation of oud blended with warm woods and refined amber.",
      product: "QAVERIN OUD",
      image: oud,
      productId: 3,
    },

    {
      id: 4,
      name: "THE FRESH COLLECTION",
      subtitle: "LIGHT · CLEAN · LUMINOUS",
      description:
        "Fresh and effortless fragrances designed for everyday elegance.",
      product: "QAVERIN ÉCLAT",
      image: eclat,
      productId: 4,
    },
  ];


  const openProduct = (id) => {
    navigate(`/product/${id}`);
  };


  return (
    <main className="collections-page">

      {/* =================================
          HEADER
      ================================= */}

      <section className="collections-header">

        <p className="collections-eyebrow">
          THE WORLD OF QAVERIN
        </p>

        <h1>
          Discover our
          <br />
          <em>collections.</em>
        </h1>

        <p className="collections-description">
          Explore carefully crafted fragrance families,
          each created to express a different side of you.
        </p>

      </section>


      {/* =================================
          COLLECTIONS
      ================================= */}

      <section className="collections-grid">

        {collections.map((collection) => (

          <article
            className="collection-card"
            key={collection.id}
          >

            {/* IMAGE */}

            <div
              className="collection-image"
              onClick={() =>
                openProduct(collection.productId)
              }
            >

              <img
                src={collection.image}
                alt={collection.name}
              />

              {/* <span className="collection-number">
                0{index + 1}
              </span> */}

            </div>


            {/* CONTENT */}

            <div className="collection-content">

              <p className="collection-subtitle">
                {collection.subtitle}
              </p>

              <h2>
                {collection.name}
              </h2>

              <div className="collection-divider">
                <span></span>
                <b>✦</b>
                <span></span>
              </div>

              <p className="collection-description">
                {collection.description}
              </p>

              <button
                type="button"
                className="collection-button"
                onClick={() =>
                  openProduct(collection.productId)
                }
              >
                EXPLORE {collection.product}
                <span>→</span>
              </button>

            </div>

          </article>

        ))}

      </section>


      {/* =================================
          BOTTOM MESSAGE
      ================================= */}

      <section className="collections-footer">

        <span>✦</span>

        <p>
          EVERY FRAGRANCE TELLS
          <br />
          <em>A DIFFERENT STORY.</em>
        </p>

        <span>✦</span>

      </section>

    </main>
  );
}

export default Collections;