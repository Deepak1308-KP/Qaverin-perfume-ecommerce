import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { useOrder } from "../context/useOrder";

import "./Profile.css";


function Profile() {

  /* =========================================
     CONTEXT
  ========================================= */

  const { cartCount } = useCart();

  const { wishlistCount } = useWishlist();

  const { orders } = useOrder();


  /* =========================================
     JWT TOKEN
  ========================================= */

  const token =
    localStorage.getItem("qaverin-token");


  /* =========================================
     USER STATE
  ========================================= */

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [profileError, setProfileError] = useState(false);


  /* =========================================
     FETCH PROFILE FROM FLASK
  ========================================= */

  useEffect(() => {

    /*
      If there is no token, do nothing here.

      The redirect is handled below the hook.
    */

    if (!token) {
      return;
    }


    const getProfile = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:5000/api/profile",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const data = await response.json();


        /* =====================================
           HANDLE API ERROR
        ===================================== */

        if (!response.ok) {

          setProfileError(true);

          return;

        }


        /* =====================================
           SAVE USER FROM MYSQL
        ===================================== */

        setUser(data.user);

      } catch (error) {

        console.error(
          "Profile error:",
          error
        );

        setProfileError(true);

      } finally {

        setLoading(false);

      }

    };


    getProfile();

  }, [token]);


  /* =========================================
     PROTECT PROFILE PAGE
  ========================================= */

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /* =========================================
     INVALID / EXPIRED TOKEN
  ========================================= */

  if (profileError) {

    localStorage.removeItem(
      "qaverin-token"
    );

    localStorage.removeItem(
      "qaverin-logged-in"
    );

    localStorage.removeItem(
      "qaverin-current-user"
    );


    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <main className="profile-page">

        <section className="profile-header">

          <p className="profile-eyebrow">

            QAVERIN · YOUR PROFILE

          </p>


          <h1>

            Loading <em>profile...</em>

          </h1>


          <p className="profile-description">

            Please wait while we load your profile.

          </p>

        </section>

      </main>

    );

  }


  /* =========================================
     USER NAME
  ========================================= */

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    (
      user?.email
        ? user.email.split("@")[0]
        : "Qaverin"
    );


  /* =========================================
     USER EMAIL
  ========================================= */

  const userEmail =
    user?.email || "";


  /* =========================================
     AVATAR LETTER
  ========================================= */

  const avatarLetter =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "Q";


  return (

    <main className="profile-page">


      {/* =================================
          HEADER
      ================================= */}

      <section className="profile-header">

        <p className="profile-eyebrow">

          QAVERIN · YOUR PROFILE

        </p>


        <h1>

          Your <em>profile.</em>

        </h1>


        <p className="profile-description">

          Your personal space for everything
          Qaverin.

        </p>

      </section>



      {/* =================================
          PROFILE CONTENT
      ================================= */}

      <section className="profile-content">


        {/* =================================
            PROFILE CARD
        ================================= */}

        <div className="profile-card">


          {/* AVATAR */}

          <div className="profile-avatar">

            {avatarLetter}

          </div>



          {/* USER INFORMATION */}

          <div className="profile-user">

            <p className="profile-label">

              SIGNATURE MEMBER

            </p>


            <h2>

              {userName}

            </h2>


            <p>

              {userEmail
                ? `Welcome back, ${userName}.`
                : "Welcome back to your personal fragrance space."
              }

            </p>


            {/* EMAIL */}

            {userEmail && (

              <small className="profile-email">

                {userEmail}

              </small>

            )}

          </div>



          {/* MARK */}

          <div className="profile-mark">

            ✦

          </div>


        </div>



        {/* =================================
            STATS
        ================================= */}

        <div className="profile-stats">


          {/* ORDERS */}

          <div className="profile-stat">

            <span>

              ORDERS

            </span>


            <strong>

              {orders.length}

            </strong>


            <small>

              fragrance orders

            </small>

          </div>



          {/* WISHLIST */}

          <div className="profile-stat">

            <span>

              WISHLIST

            </span>


            <strong>

              {wishlistCount}

            </strong>


            <small>

              saved fragrances

            </small>

          </div>



          {/* BAG */}

          <div className="profile-stat">

            <span>

              BAG

            </span>


            <strong>

              {cartCount}

            </strong>


            <small>

              items waiting

            </small>

          </div>


        </div>



        {/* =================================
            QUICK ACTIONS
        ================================= */}

        <div className="profile-actions-wrapper">

          <p className="profile-actions-title">

            QUICK ACCESS

          </p>


          <div className="profile-actions">


            {/* ORDERS */}

            <Link
              to="/orders"
              className="profile-button"
            >

              <div>

                <span>

                  ORDER HISTORY

                </span>


                <small>

                  View your previous purchases

                </small>

              </div>


              <strong>

                →

              </strong>

            </Link>



            {/* WISHLIST */}

            <Link
              to="/wishlist"
              className="profile-button"
            >

              <div>

                <span>

                  YOUR WISHLIST

                </span>


                <small>

                  {wishlistCount} saved fragrances

                </small>

              </div>


              <strong>

                →

              </strong>

            </Link>



            {/* BAG */}

            <Link
              to="/cart"
              className="profile-button"
            >

              <div>

                <span>

                  YOUR BAG

                </span>


                <small>

                  {cartCount} items in your bag

                </small>

              </div>


              <strong>

                →

              </strong>

            </Link>



            {/* SHOP */}

            <Link
              to="/shop"
              className="profile-button"
            >

              <div>

                <span>

                  EXPLORE COLLECTION

                </span>


                <small>

                  Discover your next signature scent

                </small>

              </div>


              <strong>

                →

              </strong>

            </Link>


          </div>

        </div>



        {/* =================================
            PROFILE MESSAGE
        ================================= */}

        <div className="profile-message">

          <span>

            ✦

          </span>


          <p>

            A fragrance is more than a scent.

            <br />

            It is a signature.

          </p>


          <span>

            ✦

          </span>

        </div>


      </section>



      {/* =================================
          BACK HOME
      ================================= */}

      <Link
        to="/"
        className="profile-home"
      >

        ← BACK TO HOME

      </Link>


    </main>

  );

}


export default Profile;