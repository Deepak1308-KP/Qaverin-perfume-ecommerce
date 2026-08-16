import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      {/* =================================
          TOP FOOTER
      ================================= */}

      <div className="footer-main">


        {/* =================================
            BRAND
        ================================= */}

        <div className="footer-brand">

          <Link
            to="/"
            className="footer-brand-link"
          >
            <h2>
              QAVERIN
            </h2>

            <span>
              FINE FRAGRANCE
            </span>
          </Link>

          <p>
            A signature in every
            <br />
            scent.
          </p>

        </div>


        {/* =================================
            EXPLORE
        ================================= */}

        <div className="footer-column">

          <h3>
            EXPLORE
          </h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/collections">
            Collections
          </Link>

          <Link to="/about">
            About
          </Link>

        </div>


        {/* =================================
            SUPPORT
        ================================= */}

        <div className="footer-column">

          <h3>
            SUPPORT
          </h3>

          {/* Temporary links until pages are created */}

          <a
            href="mailto:hello@qaverin.com"
          >
            Contact
          </a>

          <Link to="/shop">
            Shipping
          </Link>

          <Link to="/shop">
            Returns
          </Link>

          <Link to="/shop">
            FAQ
          </Link>

        </div>


        {/* =================================
            SOCIAL
        ================================= */}

        <div className="footer-column footer-social">

          <h3>
            FOLLOW
          </h3>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://www.pinterest.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pinterest
          </a>

          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>

        </div>

      </div>


      {/* =================================
          FOOTER BOTTOM
      ================================= */}

      <div className="footer-bottom">

        <p>
          © 2026 QAVERIN. ALL RIGHTS RESERVED.
        </p>

        <div>

          <Link to="/privacy">
            Privacy
          </Link>

          <span>
            ·
          </span>

          <Link to="/terms">
            Terms
          </Link>

        </div>

      </div>

    </footer>
  );
}

export default Footer;