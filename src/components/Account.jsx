import { Link, Navigate, useNavigate } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";

import "./Account.css";


function Account() {

  const navigate = useNavigate();


  /* =========================================
     CONTEXT HOOKS
     ALWAYS RUN BEFORE ANY RETURN
  ========================================= */

  const { cartCount } = useCart();

  const { wishlistCount } = useWishlist();


  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";


  /* =========================================
     GET LOGGED-IN USER
  ========================================= */

  let user = null;

  try {

    const savedUser =
      localStorage.getItem("qaverin-current-user") ||
      localStorage.getItem("qaverin-user");

    if (savedUser) {

      user = JSON.parse(savedUser);

    }

  } catch {

    user = null;

  }


  /* =========================================
     PROTECT ACCOUNT PAGE
  ========================================= */

  if (!isLoggedIn) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /* =========================================
     USER NAME
  ========================================= */

  const userName =
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    "Qaverin Guest";


  /* =========================================
     USER EMAIL
  ========================================= */

  const userEmail =
    user?.email ||
    "Welcome to your personal fragrance space.";


  /* =========================================
     USER INITIAL
  ========================================= */

  const userInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "Q";


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    /* Remove login status */

    localStorage.removeItem(
      "qaverin-logged-in"
    );


    /* Remove current logged-in user */

    localStorage.removeItem(
      "qaverin-current-user"
    );


    /* =======================================
       GO TO HOME
    ======================================= */

    navigate("/", {
      replace: true,
    });


    /* =======================================
       ALWAYS START HOME FROM TOP
    ======================================= */

    setTimeout(() => {

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

    }, 0);

  };


  /* =========================================
     MY ORDERS
  ========================================= */

  const handleOrders = () => {

    navigate("/orders");

  };


  return (

    <main className="account-page">


      {/* =========================================
          ACCOUNT HEADER
      ========================================= */}

      <section className="account-header">

        <p className="account-eyebrow">
          QAVERIN · YOUR ACCOUNT
        </p>


        <h1>

          Welcome to

          <br />

          <em>
            Qaverin.
          </em>

        </h1>


        <p className="account-description">

          Manage your collection,
          favorites and shopping experience.

        </p>

      </section>



      {/* =========================================
          ACCOUNT CONTENT
      ========================================= */}

      <section className="account-content">


        {/* =========================================
            PROFILE
        ========================================= */}

        <Link
          to="/profile"
          className="account-profile"
        >

          {/* AVATAR */}

          <div className="account-avatar">

            {userInitial}

          </div>


          {/* USER INFORMATION */}

          <div>

            <p className="account-profile-label">

              YOUR PROFILE

            </p>


            <h2>

              {userName}

            </h2>


            <p>

              {userEmail}

            </p>


            <small className="account-profile-welcome">

              Welcome back to your personal
              fragrance space.

            </small>

          </div>


          {/* ARROW */}

          <strong className="account-profile-arrow">

            →

          </strong>

        </Link>



        {/* =========================================
            ACCOUNT OPTIONS
        ========================================= */}

        <div className="account-options">


          {/* =====================================
              WISHLIST
          ===================================== */}

          <button
            type="button"
            className="account-option"
            onClick={() =>
              navigate("/wishlist")
            }
          >

            <div className="account-option-icon">

              ♡

            </div>


            <div className="account-option-info">

              <span>
                WISHLIST
              </span>


              <p>

                {wishlistCount}{" "}

                {wishlistCount === 1
                  ? "fragrance"
                  : "fragrances"}

                {" "}saved

              </p>

            </div>


            <strong>
              →
            </strong>

          </button>



          {/* =====================================
              YOUR BAG
          ===================================== */}

          <button
            type="button"
            className="account-option"
            onClick={() =>
              navigate("/cart")
            }
          >

            <div className="account-option-icon">

              ♧

            </div>


            <div className="account-option-info">

              <span>
                YOUR BAG
              </span>


              <p>

                {cartCount}{" "}

                {cartCount === 1
                  ? "item"
                  : "items"}

                {" "}in your bag

              </p>

            </div>


            <strong>
              →
            </strong>

          </button>



          {/* =====================================
              MY ORDERS
          ===================================== */}

          <button
            type="button"
            className="account-option"
            onClick={handleOrders}
          >

            <div className="account-option-icon">

              ✦

            </div>


            <div className="account-option-info">

              <span>
                MY ORDERS
              </span>


              <p>
                View and manage your
                fragrance orders
              </p>

            </div>


            <strong>
              →
            </strong>

          </button>



          {/* =====================================
              EXPLORE COLLECTION
          ===================================== */}

          <Link
            to="/shop"
            className="account-option"
          >

            <div className="account-option-icon">

              ✧

            </div>


            <div className="account-option-info">

              <span>
                EXPLORE COLLECTION
              </span>


              <p>
                Discover your next signature
              </p>

            </div>


            <strong>
              →
            </strong>

          </Link>


        </div>



        {/* =========================================
            ACCOUNT MESSAGE
        ========================================= */}

        <div className="account-message">

          <span>
            ✦
          </span>


          <p>

            Your fragrance journey begins
            with finding a scent that feels
            uniquely yours.

          </p>


          <span>
            ✦
          </span>

        </div>



        {/* =========================================
            LOGOUT
        ========================================= */}

        <button
          type="button"
          className="account-logout-button"
          onClick={handleLogout}
        >

          <span>
            LOG OUT
          </span>


          <strong>
            →
          </strong>

        </button>



        {/* =========================================
            BACK HOME
        ========================================= */}

        <Link
          to="/"
          className="account-home-button"
        >

          ← BACK TO HOME

        </Link>


      </section>


    </main>

  );

}


export default Account;