import { useState } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import "./Login.css";


function Login() {

  const location = useLocation();

  // =========================================
  // LOGIN STATE
  // =========================================

  const [email, setEmail] = useState(() =>
    localStorage.getItem(
      "qaverin-remember-email"
    ) || ""
  );

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(() =>
      Boolean(
        localStorage.getItem(
          "qaverin-remember-email"
        )
      )
    );

  // =========================================
  // FORGOT PASSWORD STATE
  // =========================================

  const [forgotOpen, setForgotOpen] =
    useState(false);

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [forgotMessage, setForgotMessage] =
    useState("");

  const [forgotError, setForgotError] =
    useState("");

  const [forgotStep, setForgotStep] =
    useState("email");

  const [resetCode, setResetCode] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);


  // =========================================
  // OPEN FORGOT PASSWORD
  // =========================================

  const openForgotPassword = () => {

    setForgotEmail(email);

    setResetCode("");

    setNewPassword("");

    setForgotStep("email");

    setForgotMessage("");

    setForgotError("");

    setForgotOpen(true);

  };


  // =========================================
  // CLOSE FORGOT PASSWORD
  // =========================================

  const closeForgotPassword = () => {

    if (forgotLoading) {
      return;
    }

    setForgotOpen(false);

    setForgotStep("email");

    setResetCode("");

    setNewPassword("");

    setForgotMessage("");

    setForgotError("");

  };


  // =========================================
  // FORGOT PASSWORD / RESET PASSWORD
  // =========================================

  const handleForgotPassword = async (event) => {

    event.preventDefault();

    setForgotMessage("");

    setForgotError("");

    const cleanEmail =
      forgotEmail.trim();

    if (!cleanEmail) {

      setForgotError(
        "Please enter your email address."
      );

      return;

    }

    setForgotLoading(true);

    try {

      const response =
        await fetch(
          "http://127.0.0.1:5000/api/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email: cleanEmail,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setForgotError(
          data.message ||
          "Unable to process your request."
        );

        return;

      }

      setResetCode("");

      setForgotStep("reset");

      setForgotMessage(
        data.message ||
        "A 6-digit reset code has been sent to your registered email address."
      );

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );

      setForgotError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setForgotLoading(false);

    }

  };


  const handleResetPassword = async (event) => {

    event.preventDefault();

    setForgotMessage("");

    setForgotError("");

    if (!resetCode.trim()) {

      setForgotError(
        "Please enter the reset code."
      );

      return;

    }

    if (newPassword.length < 6) {

      setForgotError(
        "New password must be at least 6 characters."
      );

      return;

    }

    setForgotLoading(true);

    try {

      const response =
        await fetch(
          "http://127.0.0.1:5000/api/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                forgotEmail.trim(),

              otp:
                resetCode.trim(),

              new_password:
                newPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setForgotError(
          data.message ||
          "Unable to reset password."
        );

        return;

      }

      setForgotMessage(
        data.message ||
        "Password reset successfully. You can now login."
      );

      setForgotStep("success");

      setResetCode("");

      setNewPassword("");

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      setForgotError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setForgotLoading(false);

    }

  };


  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (event) => {

    event.preventDefault();

    try {

      // =====================================
      // SEND LOGIN DATA TO FLASK
      // =====================================

      const response =
        await fetch(
          "http://127.0.0.1:5000/api/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),

              password:
                password,
            }),
          }
        );


      const data =
        await response.json();


      // =====================================
      // LOGIN ERROR
      // =====================================

      if (!response.ok) {

        alert(
          data.message ||
          "Invalid email or password."
        );

        return;

      }


      // =====================================
      // CHECK USER DATA
      // =====================================

      const loggedInUser =
        data.user || null;


      if (!loggedInUser) {

        alert(
          "Unable to identify the logged-in user."
        );

        return;

      }


      // =====================================
      // CHECK TOKEN
      // =====================================

      if (!data.token) {

        alert(
          "Login successful, but authentication token was not received."
        );

        return;

      }


      // =====================================
      // REMEMBER ME
      // =====================================

      if (rememberMe) {

        localStorage.setItem(
          "qaverin-remember-email",
          email.trim()
        );

      } else {

        localStorage.removeItem(
          "qaverin-remember-email"
        );

      }


      // =====================================
      // SAVE JWT TOKEN
      // =====================================

      localStorage.setItem(
        "qaverin-token",
        data.token
      );


      // =====================================
      // SAVE LOGIN STATUS
      // =====================================

      localStorage.setItem(
        "qaverin-logged-in",
        "true"
      );


      // =====================================
      // SAVE CURRENT USER
      // =====================================

      localStorage.setItem(
        "qaverin-current-user",
        JSON.stringify(
          loggedInUser
        )
      );


      // =====================================
      // REMOVE OLD USER KEY
      // =====================================

      localStorage.removeItem(
        "qaverin-user"
      );


      // =====================================
      // TELL NAVBAR AUTH CHANGED
      // =====================================

      window.dispatchEvent(
        new Event(
          "qaverin-auth-change"
        )
      );


      // =====================================
      // ADMIN REDIRECT
      // =====================================

      if (
        loggedInUser.role === "admin"
      ) {

        window.location.replace(
          "/admin"
        );

        return;

      }


      // =====================================
      // NORMAL USER REDIRECT
      // =====================================

      const requestedPath =
        location.state?.from;


      let destination =
        "/";


      if (
        typeof requestedPath ===
          "string" &&
        !requestedPath.startsWith(
          "/admin"
        )
      ) {

        destination =
          requestedPath;

      }


      // =====================================
      // RELOAD AFTER LOGIN
      // =====================================

      window.location.replace(
        destination
      );

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      alert(
        "Unable to connect to the server. Please make sure the Flask backend is running."
      );

    }

  };


  // =========================================
  // RENDER
  // =========================================

  return (

    <main className="login-page">

      <section className="login-container">


        {/* =================================
            HEADER
        ================================= */}

        <div className="login-header">

          <p className="login-eyebrow">
            WELCOME TO QAVERIN
          </p>


          <h1>

            Discover

            <br />

            <em>
              your signature.
            </em>

          </h1>


          <p className="login-description">

            Sign in to continue your fragrance
            journey with Qaverin.

          </p>

        </div>


        {/* =================================
            LOGIN FORM
        ================================= */}

        <form
          className="login-form"
          onSubmit={
            handleLogin
          }
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
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
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


            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                required
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {/* PASSWORD IS SHOWN → NORMAL EYE */}

                {showPassword ? (

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                  </svg>

                ) : (

                  /* PASSWORD IS HIDDEN → CROSSED EYE */

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="M2 2l20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M6.7 6.7C4.6 8.2 3.2 10 2.5 12c1.7 4 5.5 7 9.5 7 1.8 0 3.5-.5 5-1.4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M9.9 5.2C10.6 5 11.3 5 12 5c4 0 7.8 3 9.5 7-.5 1.2-1.2 2.3-2.1 3.3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                  </svg>

                )}

              </button>

            </div>

          </div>


          {/* OPTIONS */}

          <div className="login-options">

            <label className="remember-option">

              <input
                type="checkbox"
                checked={
                  rememberMe
                }
                onChange={(
                  event
                ) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
              />


              <span>
                Remember me
              </span>

            </label>


            <button
              type="button"
              className="forgot-password"
              onClick={
                openForgotPassword
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


      {/* =====================================
          FORGOT PASSWORD MODAL
      ===================================== */}

      {forgotOpen && (

        <div
          className="forgot-modal-overlay"
          onClick={
            closeForgotPassword
          }
        >

          <div
            className="forgot-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="forgot-modal-close"
              onClick={
                closeForgotPassword
              }
              aria-label="Close"
            >
              ×
            </button>


            <p className="login-eyebrow">
              PASSWORD RECOVERY
            </p>


            {forgotStep === "email" ? (

              <>
                <h2>
                  Forgot your password?
                </h2>

                <p className="forgot-modal-description">
                  Enter your registered email address
                  and we'll generate a secure reset code.
                </p>

                <form
                  className="forgot-form"
                  onSubmit={
                    handleForgotPassword
                  }
                >

                  <label htmlFor="forgot-email">
                    EMAIL ADDRESS
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(
                      event
                    ) =>
                      setForgotEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter your email"
                    required
                    autoFocus
                  />

                  {forgotError && (
                    <p className="forgot-error">
                      {forgotError}
                    </p>
                  )}

                  {forgotMessage && (
                    <p className="forgot-success">
                      {forgotMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="forgot-submit"
                    disabled={
                      forgotLoading
                    }
                  >
                    {forgotLoading
                      ? "PLEASE WAIT..."
                      : "GET RESET CODE"}
                  </button>

                </form>
              </>

            ) : forgotStep === "reset" ? (

              <>
                <h2>
                  Create a new password
                </h2>

                <p className="forgot-modal-description">
                  Enter the 6-digit reset code and
                  choose your new password.
                </p>

                <form
                  className="forgot-form"
                  onSubmit={
                    handleResetPassword
                  }
                >

                  <label htmlFor="reset-code">
                    RESET CODE
                  </label>

                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={resetCode}
                    onChange={(
                      event
                    ) =>
                      setResetCode(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                      )
                    }
                    placeholder="Enter 6-digit code"
                    required
                    autoFocus
                  />

                  <label htmlFor="new-password">
                    NEW PASSWORD
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(
                        event
                      ) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {/* NEW PASSWORD IS SHOWN → NORMAL EYE */}

                      {showNewPassword ? (

                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >

                          <path
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                        </svg>

                      ) : (

                        /* NEW PASSWORD IS HIDDEN → CROSSED EYE */

                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >

                          <path
                            d="M2 2l20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          <path
                            d="M6.7 6.7C4.6 8.2 3.2 10 2.5 12c1.7 4 5.5 7 9.5 7 1.8 0 3.5-.5 5-1.4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />

                          <path
                            d="M9.9 5.2C10.6 5 11.3 5 12 5c4 0 7.8 3 9.5 7-.5 1.2-1.2 2.3-2.1 3.3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />

                        </svg>

                      )}

                    </button>

                  </div>

                  {forgotError && (
                    <p className="forgot-error">
                      {forgotError}
                    </p>
                  )}

                  {forgotMessage && (
                    <p className="forgot-success">
                      {forgotMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="forgot-submit"
                    disabled={
                      forgotLoading
                    }
                  >
                    {forgotLoading
                      ? "UPDATING..."
                      : "RESET PASSWORD"}
                  </button>

                  <button
                    type="button"
                    className="forgot-back-button"
                    onClick={() => {
                      setForgotStep("email");
                      setForgotError("");
                      setForgotMessage("");
                    }}
                    disabled={
                      forgotLoading
                    }
                  >
                    ← REQUEST NEW CODE
                  </button>

                </form>
              </>

            ) : (

              <>
                <div className="forgot-reset-success">

                  <div className="forgot-success-icon">
                    ✓
                  </div>

                  <h2>
                    Password reset successfully
                  </h2>

                  <p className="forgot-modal-description">
                    Your password has been changed successfully.
                    You can now login using your new password.
                  </p>

                  <button
                    type="button"
                    className="forgot-submit"
                    onClick={
                      closeForgotPassword
                    }
                  >
                    BACK TO LOGIN
                  </button>

                </div>
              </>

            )}

          </div>

        </div>

      )}

    </main>

  );

}


export default Login;