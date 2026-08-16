import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./Navbar.css";


function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  /* =================================
     THEME
  ================================= */

  const [darkMode, setDarkMode] = useState(() => {

    const savedTheme =
      localStorage.getItem("qaverin-theme");

    return savedTheme === "dark";

  });


  const navigate = useNavigate();

  const location = useLocation();

  const { cartCount } = useCart();

  const { wishlistCount } = useWishlist();


  /* =================================
     APPLY THEME
  ================================= */

  useEffect(() => {

    if (darkMode) {

      document.body.classList.add("dark-theme");

      localStorage.setItem(
        "qaverin-theme",
        "dark"
      );

    } else {

      document.body.classList.remove("dark-theme");

      localStorage.setItem(
        "qaverin-theme",
        "light"
      );

    }

  }, [darkMode]);


  /* =================================
     TOGGLE THEME
  ================================= */

  const toggleTheme = () => {

    setDarkMode((previous) => !previous);

  };


  /* =================================
     CHECK ACTIVE PAGE
  ================================= */

  const isActive = (path) => {

    return location.pathname === path;

  };


  /* =================================
     SEARCH
  ================================= */

  const handleSearch = (event) => {

    event.preventDefault();

    const search = searchText.trim();

    if (!search) {

      navigate("/shop");

      setMenuOpen(false);

      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(search)}`
    );

    setMenuOpen(false);

  };


  /* =================================
     SEARCH INPUT
  ================================= */

  const handleSearchChange = (event) => {

    setSearchText(event.target.value);

  };


  /* =================================
     LOGO CLICK
  ================================= */

  const handleLogoClick = () => {

    setSearchText("");

    setMenuOpen(false);

  };


  /* =================================
     NAVIGATION CLICK
  ================================= */

  const handleNavigation = () => {

    setSearchText("");

    setMenuOpen(false);

  };


  return (

    <>

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="navbar">


        {/* =================================
            LOGO
        ================================= */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={handleLogoClick}
        >

          <span className="navbar-logo-main">
            QAVERIN
          </span>

          <span className="navbar-logo-sub">
            FINE FRAGRANCE
          </span>

        </Link>


        {/* =================================
            DESKTOP NAVIGATION
        ================================= */}

        <div className="navbar-links">

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
            onClick={handleNavigation}
          >
            Home
          </Link>


          <Link
            to="/shop"
            className={
              isActive("/shop")
                ? "active"
                : ""
            }
            onClick={handleNavigation}
          >
            Shop
          </Link>


          <Link
            to="/collections"
            className={
              isActive("/collections")
                ? "active"
                : ""
            }
            onClick={handleNavigation}
          >
            Collections
          </Link>


          <Link
            to="/about"
            className={
              isActive("/about")
                ? "active"
                : ""
            }
            onClick={handleNavigation}
          >
            About
          </Link>

        </div>


        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="navbar-actions">


          {/* =================================
              SEARCH
          ================================= */}

          <form
            className="navbar-search"
            onSubmit={handleSearch}
          >

            <button
              type="submit"
              className="navbar-search-button"
              aria-label="Search"
            >

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >

                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />

              </svg>

            </button>


            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search for perfumes"
              aria-label="Search for perfumes"
            />

          </form>


          {/* =================================
              WISHLIST
          ================================= */}

          <button
            type="button"
            className="navbar-icon navbar-wishlist"
            aria-label="Wishlist"
            onClick={() => {

              navigate("/wishlist");

              setMenuOpen(false);

            }}
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >

              <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />

            </svg>


            {wishlistCount > 0 && (

              <span className="wishlist-count">
                {wishlistCount}
              </span>

            )}

          </button>


          {/* =================================
              CART
          ================================= */}

          <button
            type="button"
            className="navbar-icon navbar-cart"
            aria-label="Shopping cart"
            onClick={() => {

              navigate("/cart");

              setMenuOpen(false);

            }}
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >

              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" />

              <circle
                cx="10"
                cy="20"
                r="1.3"
              />

              <circle
                cx="18"
                cy="20"
                r="1.3"
              />

            </svg>


            {cartCount > 0 && (

              <span className="cart-count">
                {cartCount}
              </span>

            )}

          </button>


          {/* =================================
              ACCOUNT
          ================================= */}

          <button
            type="button"
            className={`navbar-icon ${
              isActive("/account")
                ? "account-active"
                : ""
            }`}
            aria-label="User account"
            onClick={() => {

              navigate("/account");

              setMenuOpen(false);

            }}
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >

              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <circle
                cx="12"
                cy="9"
                r="3"
              />

              <path d="M6.5 19c.9-2.7 3-4.2 5.5-4.2s4.6 1.5 5.5 4.2" />

            </svg>

          </button>


          {/* =================================
              THEME TOGGLE
          ================================= */}

          <button
            type="button"
            className={`navbar-theme-toggle ${
              darkMode ? "dark" : ""
            }`}
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
          >

            {darkMode ? (

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.42 1.42" />
                <path d="m17.65 17.65 1.42 1.42" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m4.93 19.07 1.42-1.42" />
                <path d="m17.65 6.35 1.42-1.42" />

              </svg>

            ) : (

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >

                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z" />

              </svg>

            )}

          </button>


          {/* =================================
              MOBILE MENU BUTTON
          ================================= */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
          >

            {menuOpen
              ? "×"
              : "☰"}

          </button>

        </div>

      </nav>


      {/* =================================
          MOBILE MENU
      ================================= */}

      <div
        className={`mobile-menu ${
          menuOpen
            ? "open"
            : ""
        }`}
      >

        <Link
          to="/"
          className={
            isActive("/")
              ? "active"
              : ""
          }
          onClick={handleNavigation}
        >
          Home
        </Link>


        <Link
          to="/shop"
          className={
            isActive("/shop")
              ? "active"
              : ""
          }
          onClick={handleNavigation}
        >
          Shop
        </Link>


        <Link
          to="/collections"
          className={
            isActive("/collections")
              ? "active"
              : ""
          }
          onClick={handleNavigation}
        >
          Collections
        </Link>


        <Link
          to="/about"
          className={
            isActive("/about")
              ? "active"
              : ""
          }
          onClick={handleNavigation}
        >
          About
        </Link>


        <Link
          to="/account"
          className={
            isActive("/account")
              ? "active"
              : ""
          }
          onClick={handleNavigation}
        >
          Account
        </Link>


        {/* THEME IN MOBILE MENU */}

        <button
          type="button"
          className="mobile-theme-toggle"
          onClick={toggleTheme}
        >

          <span>
            {darkMode
              ? "LIGHT MODE"
              : "DARK MODE"}
          </span>

          <span>
            {darkMode ? "☀" : "☾"}
          </span>

        </button>

      </div>

    </>

  );

}


export default Navbar;