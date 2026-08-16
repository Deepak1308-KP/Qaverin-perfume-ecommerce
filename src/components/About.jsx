import { Link } from "react-router-dom";
import "./About.css";

import storyImage from "../assets/our-story.png";

function About() {
  return (
    <main className="about-page">

      {/* =================================
          HERO
      ================================= */}

      <section className="about-hero">

        <div className="about-hero-content">

          <p className="about-eyebrow">
            THE QAVERIN STORY
          </p>

          <h1>
            More than
            <br />
            <em>a fragrance.</em>
          </h1>

          <p className="about-intro">
            A fragrance is more than something
            you wear. It becomes a memory,
            an emotion, and eventually,
            a part of who you are.
          </p>

        </div>

        <div className="about-hero-number">
          02
        </div>

      </section>


      {/* =================================
          STORY
      ================================= */}

      <section className="about-story">

        <div className="about-story-image">

          <img
            src={storyImage}
            alt="Qaverin fragrance"
          />

        </div>


        <div className="about-story-content">

          <p className="about-section-eyebrow">
            OUR PHILOSOPHY
          </p>

          <h2>
            Crafted for
            <br />
            <em>unforgettable</em>
            <br />
            moments.
          </h2>

          <div className="about-divider">
            <span></span>
            <b>✦</b>
            <span></span>
          </div>

          <p>
            QAVERIN was born from a simple belief:
            the right fragrance has the power to
            become uniquely yours.
          </p>

          <p>
            Every QAVERIN fragrance is created with
            carefully selected ingredients, thoughtful
            composition and a deep appreciation for
            the art of fine perfumery.
          </p>

          <p>
            We believe luxury doesn't need to be loud.
            It lives in the details, the ingredients,
            the craftsmanship and the feeling that
            remains long after the first impression.
          </p>

        </div>

      </section>


      {/* =================================
          VALUES
      ================================= */}

      <section className="about-values">

        <div className="about-values-heading">

          <p className="about-section-eyebrow">
            WHAT DEFINES US
          </p>

          <h2>
            The art behind
            <br />
            <em>every scent.</em>
          </h2>

        </div>


        <div className="about-values-grid">


          {/* VALUE 01 */}

          <article className="about-value">

            <span className="about-value-number">
              01
            </span>

            <div className="about-value-icon">
              ✧
            </div>

            <h3>
              FINEST
              <br />
              INGREDIENTS
            </h3>

            <p>
              Carefully selected ingredients
              form the foundation of every
              QAVERIN composition.
            </p>

          </article>


          {/* VALUE 02 */}

          <article className="about-value">

            <span className="about-value-number">
              02
            </span>

            <div className="about-value-icon">
              ◇
            </div>

            <h3>
              EXPERTLY
              <br />
              CRAFTED
            </h3>

            <p>
              Each fragrance is thoughtfully
              blended to create balance,
              depth and character.
            </p>

          </article>


          {/* VALUE 03 */}

          <article className="about-value">

            <span className="about-value-number">
              03
            </span>

            <div className="about-value-icon">
              ✦
            </div>

            <h3>
              TIMELESS
              <br />
              ELEGANCE
            </h3>

            <p>
              Designed to transcend moments
              and become part of your
              personal signature.
            </p>

          </article>

        </div>

      </section>


      {/* =================================
          CLOSING
      ================================= */}

      <section className="about-closing">

        <p className="about-section-eyebrow">
          YOUR SIGNATURE
        </p>

        <h2>
          A scent that
          <br />
          <em>becomes you.</em>
        </h2>

        <p>
          Discover the QAVERIN collection and
          find the fragrance that feels like yours.
        </p>

        <Link
          to="/shop"
          className="about-shop-button"
        >
          EXPLORE COLLECTION
          <span>→</span>
        </Link>

      </section>

    </main>
  );
}

export default About;