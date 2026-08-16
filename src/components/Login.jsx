import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./Login.css";


function Login() {

  const navigate = useNavigate();

  const location = useLocation();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");


  const handleLogin = (event) => {

    event.preventDefault();


    /* =========================================
       GET SAVED USER
    ========================================= */

    const savedUser = JSON.parse(
      localStorage.getItem("qaverin-user")
    );


    /* =========================================
       CHECK ACCOUNT
    ========================================= */

    if (!savedUser) {

      alert(
        "No account found. Please create an account first."
      );

      navigate("/signup");

      return;
    }


    /* =========================================
       CHECK LOGIN DETAILS
    ========================================= */

    if (
      email.trim().toLowerCase() !==
        savedUser.email.trim().toLowerCase() ||
      password !== savedUser.password
    ) {

      alert(
        "Invalid email or password."
      );

      return;
    }


    /* =========================================
       SAVE LOGIN STATUS
    ========================================= */

    localStorage.setItem(
      "qaverin-logged-in",
      "true"
    );


    /* =========================================
       SAVE CURRENT LOGGED-IN USER
    ========================================= */

    localStorage.setItem(
      "qaverin-current-user",
      JSON.stringify(savedUser)
    );


    /* =========================================
       FIND WHERE USER CAME FROM
    ========================================= */

    const redirectTo =
      location.state?.from || "/";


    /* =========================================
       GO TO PREVIOUS PAGE
    ========================================= */

    navigate(
      redirectTo,
      {
        replace: true,
      }
    );

  };


  return (

    <main className="login-page">

      <section className="login-container">


        {/* =================================
            HEADER
        ================================= */}

        <div className="login-header">

          <p className="login-eyebrow">
            WELCOME BACK
          </p>


          <h1>

            Welcome

            <br />

            <em>
              back.
            </em>

          </h1>


          <p className="login-description">

            Sign in to continue your fragrance journey
            with Qaverin.

          </p>

        </div>



        {/* =================================
            LOGIN FORM
        ================================= */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

          <div className="login-field">

            <label htmlFor="email">

              EMAIL ADDRESS

            </label>


            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />

          </div>



          {/* PASSWORD */}

          <div className="login-field">

            <label htmlFor="password">

              PASSWORD

            </label>


            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

          </div>



          {/* OPTIONS */}

          <div className="login-options">

            <label className="remember-option">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>


            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert(
                  "Password recovery will be added later."
                )
              }
            >

              Forgot password?

            </button>

          </div>



          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
          >

            SIGN IN

            <span>
              →
            </span>

          </button>

        </form>



        {/* =================================
            DIVIDER
        ================================= */}

        <div className="login-divider">

          <span></span>

          <b>
            OR
          </b>

          <span></span>

        </div>



        {/* =================================
            SIGNUP
        ================================= */}

        <div className="signup-link">

          <p>
            DON'T HAVE AN ACCOUNT?
          </p>


          <Link to="/signup">

            CREATE ACCOUNT

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
          className="login-home"
        >

          ← BACK TO QAVERIN

        </Link>


      </section>

    </main>

  );

}


export default Login;