import { useNavigate } from "react-router-dom";
import "./Hero.css";
import perfumeHero from "../assets/qaverin-hero.png";

function Hero() {

  const navigate = useNavigate();

  const handleShopCollection = () => {
    navigate("/shop");
  };

  return (
    <section className="hero">

      {/* =================================
          HERO CONTENT
      ================================= */}

      <div className="hero-content">

        <p className="hero-eyebrow">
          NEW COLLECTION · 2026
        </p>


        <h1>
          SCENT THAT
          <br />
          <span>DEFINES YOU.</span>
        </h1>


        <p className="hero-description">
          A fragrance crafted to become uniquely yours.
          Discover a scent that stays long after the moment.
        </p>


        {/* =================================
            SHOP BUTTON
        ================================= */}

        <button
          type="button"
          className="hero-button"
          onClick={handleShopCollection}
        >

          <span>
            SHOP COLLECTION
          </span>

          <span>
            →
          </span>

        </button>


        {/* =================================
            HERO META
        ================================= */}

        <div className="hero-meta">

          <span>
            01
          </span>

          <div></div>

          <span>
            QAVERIN NOIR
          </span>

        </div>

      </div>


      {/* =================================
          HERO VISUAL
      ================================= */}

      <div className="hero-visual">

        <div className="hero-glow"></div>


        <div className="hero-image-wrapper">

          <img
            src={perfumeHero}
            alt="Qaverin Noir perfume"
          />

        </div>


        {/* =================================
            FRAGRANCE NOTES
        ================================= */}

        <div className="hero-notes">

          <span>
            WOODY
          </span>

          <span>
            AMBER
          </span>

          <span>
            LONG LASTING
          </span>

        </div>


        <div className="hero-number">
          01
        </div>

      </div>

    </section>
  );
}

export default Hero;