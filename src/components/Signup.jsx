import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Signup.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    /* =========================================
       CHECK PASSWORD
    ========================================= */

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      /* =========================================
         SEND DATA TO FLASK BACKEND
      ========================================= */

      const response = await fetch(
        `${API_URL}/api/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data =
        await response.json();

      /* =========================================
         HANDLE BACKEND ERROR
      ========================================= */

      if (!response.ok) {
        alert(
          data.message ||
            "Registration failed."
        );

        return;
      }

      /* =========================================
         GET REGISTERED USER
      ========================================= */

      const registeredUser =
        data.user || {
          name: name.trim(),
          email: email.trim(),
          role: "customer",
        };

      /* =========================================
         MAKE SURE ROLE IS CUSTOMER
      ========================================= */

      const customerUser = {
        ...registeredUser,
        name:
          registeredUser.name ||
          name.trim(),

        email:
          registeredUser.email ||
          email.trim(),

        role: "customer",
      };

      /* =========================================
         CLEAR OLD LOGIN DATA
      ========================================= */

      localStorage.removeItem(
        "qaverin-token"
      );

      localStorage.removeItem(
        "qaverin-current-user"
      );

      localStorage.removeItem(
        "qaverin-logged-in"
      );

      /* =========================================
         SAVE CUSTOMER LOGIN STATUS
      ========================================= */

      localStorage.setItem(
        "qaverin-logged-in",
        "true"
      );

      /* =========================================
         SAVE CUSTOMER USER
      ========================================= */

      localStorage.setItem(
        "qaverin-current-user",
        JSON.stringify(customerUser)
      );

      /* =========================================
         SAVE TOKEN IF BACKEND RETURNS ONE
      ========================================= */

      if (data.token) {
        localStorage.setItem(
          "qaverin-token",
          data.token
        );
      }

      /* =========================================
         REGISTRATION SUCCESS
      ========================================= */

      alert(
        "Account created successfully!"
      );

      /* =========================================
         GO TO HOME
      ========================================= */

      navigate("/", {
        replace: true,
      });

      /* =========================================
         SCROLL TO TOP
      ========================================= */

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      }, 50);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to the server. Please make sure the Flask backend is running."
      );
    }
  };

  return (
    <main className="signup-page">
      <section className="signup-container">

        {/* =================================
            HEADER
        ================================= */}

        <div className="signup-header">

          <p className="signup-eyebrow">
            JOIN QAVERIN
          </p>

          <h1>
            Create
            <br />
            <em>your account.</em>
          </h1>

          <p className="signup-description">
            Begin your personal fragrance
            journey with Qaverin.
          </p>

        </div>


        {/* =================================
            FORM
        ================================= */}

        <form
          className="signup-form"
          onSubmit={handleSignup}
        >

          {/* NAME */}

          <div className="signup-field">

            <label htmlFor="signup-name">
              FULL NAME
            </label>

            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your full name"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="signup-field">

            <label htmlFor="signup-email">
              EMAIL ADDRESS
            </label>

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="signup-field">

            <label htmlFor="signup-password">
              PASSWORD
            </label>

            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Create a password"
              minLength="6"
              required
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="signup-field">

            <label htmlFor="signup-confirm-password">
              CONFIRM PASSWORD
            </label>

            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm your password"
              minLength="6"
              required
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="signup-button"
          >
            CREATE ACCOUNT

            <span>
              →
            </span>
          </button>

        </form>


        {/* =================================
            LOGIN LINK
        ================================= */}

        <div className="signup-login">

          <p>
            ALREADY HAVE AN ACCOUNT?
          </p>

          <Link to="/login">
            SIGN IN

            <span>
              →
            </span>
          </Link>

        </div>


        {/* =================================
            HOME
        ================================= */}

        <Link
          to="/"
          className="signup-home"
        >
          ← BACK TO QAVERIN
        </Link>

      </section>
    </main>
  );
}

export default Signup;