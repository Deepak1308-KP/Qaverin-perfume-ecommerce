import { useState } from "react";
import "./Newsletter.css";

function Newsletter() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");


  /* =================================
     NEWSLETTER SUBMIT
  ================================= */

  const handleSubmit = (event) => {

    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {

      setMessage("Please enter your email address.");

      return;
    }


    // Basic email validation

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(trimmedEmail)) {

      setMessage(
        "Please enter a valid email address."
      );

      return;
    }


    // Success

    setMessage(
      "You're subscribed to the Qaverin journal."
    );

    setEmail("");


    // Remove message after 3 seconds

    setTimeout(() => {

      setMessage("");

    }, 3000);

  };


  return (

    <section className="newsletter">

      <div className="newsletter-content">


        {/* =================================
            EYEBROW
        ================================= */}

        <p className="newsletter-eyebrow">
          QAVERIN · 03
        </p>


        {/* =================================
            HEADING
        ================================= */}

        <h2>
          Find your
          <br />
          <em>signature.</em>
        </h2>


        {/* =================================
            DESCRIPTION
        ================================= */}

        <p className="newsletter-description">
          Discover a fragrance made to become
          uniquely yours.
        </p>


        {/* =================================
            FORM
        ================================= */}

        <form
          className="newsletter-form"
          onSubmit={handleSubmit}
        >

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Your email address"
            aria-label="Email address"
          />


          <button type="submit">

            JOIN

            <span>
              →
            </span>

          </button>

        </form>


        {/* =================================
            MESSAGE
        ================================= */}

        {message && (

          <p
            className="newsletter-message"
            role="status"
          >
            {message}
          </p>

        )}


        {/* =================================
            NOTE
        ================================= */}

        <p className="newsletter-note">
          Receive fragrance stories, new collections
          and exclusive offers.
        </p>

      </div>


      {/* =================================
          DECORATION
      ================================= */}

      <div className="newsletter-decoration">

        <span>
          ✦
        </span>

      </div>

    </section>

  );
}

export default Newsletter;