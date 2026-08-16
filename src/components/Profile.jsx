import { Link } from "react-router-dom";

import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { useOrder } from "../context/useOrder";

import "./Profile.css";


function Profile() {

  const { cartCount } = useCart();

  const { wishlistCount } = useWishlist();

  const { orders } = useOrder();


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

          <div className="profile-avatar">
            Q
          </div>


          <div className="profile-user">

            <p className="profile-label">
              SIGNATURE MEMBER
            </p>

            <h2>
              Qaverin Guest
            </h2>

            <p>
              Your fragrance journey starts here.
            </p>

          </div>


          <div className="profile-mark">
            ✦
          </div>

        </div>


        {/* =================================
            STATS
        ================================= */}

        <div className="profile-stats">


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
              to="/account"
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