import { useNavigate } from "react-router-dom";
import "./OurStory.css";
import storyImage from "../assets/our-story.png";

function OurStory() {

  const navigate = useNavigate();


  /* =================================
     OPEN ABOUT PAGE
  ================================= */

  const handleDiscoverStory = () => {
    navigate("/about");
  };


  return (
    <section className="our-story">

      {/* BACKGROUND NUMBER */}

      <div className="story-bg-number">
        02
      </div>


      {/* =================================
          LEFT CONTENT
      ================================= */}

      <div className="story-content">

        <p className="story-eyebrow">
          OUR STORY
        </p>


        <h2>
          Crafted for
          <br />
          <em>unforgettable</em>
          <br />
          moments.
        </h2>


        <div className="story-divider">

          <span></span>

          <b>
            ✦
          </b>

          <span></span>

        </div>


        <p className="story-description">
          QAVERIN is born from the belief that scent is
          more than fragrance. It is an expression of
          individuality, memory, and emotion. Each bottle
          is a dedication to timeless elegance and the
          art of fine perfumery.
        </p>


        {/* =================================
            BRAND VALUES
        ================================= */}

        <div className="story-values">


          {/* VALUE 01 */}

          <div className="story-value">

            <div className="value-icon">
              ✧
            </div>

            <h3>
              FINEST
              <br />
              INGREDIENTS
            </h3>

            <p>
              Sourced from carefully
              selected ingredients.
            </p>

          </div>


          {/* VALUE 02 */}

          <div className="story-value">

            <div className="value-icon">
              ◇
            </div>

            <h3>
              EXPERTLY
              <br />
              CRAFTED
            </h3>

            <p>
              Blended with passion
              and precision.
            </p>

          </div>


          {/* VALUE 03 */}

          <div className="story-value">

            <div className="value-icon">
              ✦
            </div>

            <h3>
              TIMELESS
              <br />
              ELEGANCE
            </h3>

            <p>
              Designed to leave
              a lasting impression.
            </p>

          </div>

        </div>


        {/* =================================
            ABOUT BUTTON
        ================================= */}

        <button
          type="button"
          className="story-button"
          onClick={handleDiscoverStory}
        >

          DISCOVER OUR STORY

          <span>
            →
          </span>

        </button>

      </div>


      {/* =================================
          RIGHT IMAGE
      ================================= */}

      <div className="story-visual">

        <div className="story-image-frame">

          <img
            src={storyImage}
            alt="Qaverin luxury fragrance"
          />

        </div>


        {/* ROUND BADGE */}

        <div className="story-badge">

          <span>
            ✦
          </span>

          <p>
            A SCENT
            <br />
            THAT BECOMES
            <br />
            YOU
          </p>

        </div>


        {/* DECORATION */}

        <div className="story-star">
          ✦
        </div>

      </div>

    </section>
  );
}

export default OurStory;