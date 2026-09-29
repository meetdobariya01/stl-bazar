// Login.js - FULLY FIXED — Google + normal login (email initial + force logout + "already logged in" text)

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import "./login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// 🆕 Decode JWT token
const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (err) {
    console.warn("JWT decode failed:", err);
    return null;
  }
};

// 🆕 Build user object from JWT + fallback (FIXED — guarantees email + name)
const buildUserObject = (token, fallbackEmail = "", fallbackName = "") => {
  const decoded = decodeJWT(token) || {};

  // 🔧 Multiple email field fallbacks
  const email =
    decoded.email ||
    decoded.userEmail ||
    decoded.emailId ||
    decoded.mail ||
    fallbackEmail ||
    "";

  // 🔧 Multiple name field fallbacks
  const name =
    decoded.name ||
    decoded.given_name ||
    decoded.fullName ||
    decoded.username ||
    fallbackName ||
    (email ? email.split("@")[0] : "");

  return {
    ...decoded,
    _id: decoded.id || decoded.sub || decoded._id || "",
    email, // 🔧 our computed email wins
    name,  // 🔧 our computed name wins
    picture: decoded.picture || decoded.avatar || "",
    provider: decoded.provider || "local",
  };
};

// 🆕 Save session + notify navbar (ROBUST — fires multiple times to catch remounted headers)
const saveSession = (token, userObj) => {
  localStorage.setItem("token", token);
  if (userObj) {
    const serialized = JSON.stringify(userObj);
    localStorage.setItem("user", serialized);
    localStorage.setItem("userData", serialized);
  }

  window.dispatchEvent(new Event("userUpdated"));
  window.dispatchEvent(new Event("cartUpdated"));
  window.dispatchEvent(new Event("wishlistUpdated"));

  setTimeout(() => {
    window.dispatchEvent(new Event("userUpdated"));
  }, 100);

  console.log("✅ Session saved:", {
    token: token ? "✓" : "✗",
    user: userObj,
  });
};

// 🆕 Fire event again AFTER navigation so freshly-mounted Header picks it up
const notifyAfterNavigation = () => {
  setTimeout(() => {
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }, 50);
  setTimeout(() => {
    window.dispatchEvent(new Event("userUpdated"));
  }, 300);
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🆕 Track if user is already logged in (shows friendly text instead of popup)
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ============================================
  // 🆕 On mount — detect if already logged in
  // ============================================
  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      console.log("✅ Already logged in — showing friendly text");
      setAlreadyLoggedIn(true);
    }
  }, []);

  // ============================================
  // Google OAuth callback — token from URL
  // ============================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");
    const emailParam = params.get("email");

    if (token) {
      const userObj = buildUserObject(token, emailParam || "");

      // 🔧 Ensure email is always set
      if (!userObj.email && emailParam) {
        userObj.email = emailParam;
      }
      // 🔧 Ensure name is always set
      if (!userObj.name && userObj.email) {
        userObj.name = userObj.email.split("@")[0];
      }

      console.log("💾 OAuth redirect user object:", userObj);

      saveSession(token, userObj);

      window.history.replaceState({}, document.title, "/");
      navigate("/", { replace: true });
      notifyAfterNavigation();
      return;
    }

    // 🆕 If backend says already logged in — show friendly text (no popup)
    if (error === "already_logged_in") {
      setAlreadyLoggedIn(true);
      setErrorMessage(""); // don't show red error alert

      // Remove the query params so refresh doesn't retrigger
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (error && error !== "already_logged_in") {
      setErrorMessage("Google login failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, navigate]);

  // ============================================
  // Normal Login submit (FIXED — always saves email)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Attempting login:", { email, password: "***" });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login response:", response.data);

      if (response.data.token) {
        let userObj = response.data.user;

        // 🔧 CRITICAL: Always guarantee email is present
        const safeEmail =
          userObj?.email ||
          response.data.email ||
          response.data.user?.email ||
          email; // 👈 fallback to the email typed in the form

        const safeName =
          userObj?.name ||
          userObj?.fullName ||
          response.data.name ||
          safeEmail.split("@")[0];

        if (!userObj || !userObj.email) {
          // Build from JWT + guaranteed email
          const fromJwt = buildUserObject(response.data.token, safeEmail, safeName);
          userObj = { ...fromJwt, email: safeEmail, name: safeName };
        } else {
          userObj = {
            _id: userObj.id || userObj._id,
            ...userObj,
            email: safeEmail, // 🔧 force it
            name: safeName,
          };
        }

        console.log("💾 Saving user object:", userObj);

        saveSession(response.data.token, userObj);
        setAlreadyLoggedIn(false);
        navigate("/", { replace: true });
        notifyAfterNavigation();
      } else {
        setErrorMessage("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (
        error.response?.status === 409 &&
        error.response?.data?.code === "ALREADY_LOGGED_IN"
      ) {
        // 🆕 Instead of popup — show friendly text below the button
        setAlreadyLoggedIn(true);
        setErrorMessage("");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Something went wrong! Try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Google login (redirect to backend OAuth)
  // ============================================
  const handleGoogleLogin = () => {
    setErrorMessage("");
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // ============================================
  // Initialize Google One-Tap
  // ============================================
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
    }
  }, []);

  // ============================================
  // Google One-Tap credential response (FIXED — always saves email)
  // ============================================
  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setErrorMessage("");

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google-verify`,
        { credential: response.credential }
      );

      let userObj = result.data.user;

      // 🔧 Build from JWT to guarantee email/name
      const fromJwt = buildUserObject(result.data.token);

      const safeEmail =
        userObj?.email ||
        result.data.email ||
        fromJwt?.email ||
        "";

      const safeName =
        userObj?.name ||
        result.data.name ||
        fromJwt?.name ||
        (safeEmail ? safeEmail.split("@")[0] : "");

      if (!userObj || !userObj.email) {
        userObj = { ...fromJwt, email: safeEmail, name: safeName };
      } else {
        userObj = {
          _id: userObj.id || userObj._id,
          ...userObj,
          email: safeEmail,
          name: safeName,
        };
      }

      console.log("💾 Google user object:", userObj);

      saveSession(result.data.token, userObj);
      setAlreadyLoggedIn(false);
      navigate("/", { replace: true });
      notifyAfterNavigation();
    } catch (error) {
      console.error("Google login error:", error);

      if (
        error.response?.status === 409 &&
        error.response?.data?.code === "ALREADY_LOGGED_IN"
      ) {
        // 🆕 Show friendly text instead of popup
        setAlreadyLoggedIn(true);
        setErrorMessage("");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Google login failed"
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ============================================
  // Scroll to top on route change
  // ============================================
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <section className="login-section">
      <Header />
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5 lexend">
          <Col lg={10}>
            <div className="login-container">
              <div className="login-image-wrapper d-none d-sm-block">
                <img
                  src="./images/login.webp"
                  alt="Premium Grocery"
                  className="login-side-image"
                />
              </div>

              <Card className="login-card border-0">
                <h3 className="text-center mb-4 lexend">Welcome Back</h3>
                <p className="text-center text-muted mb-4">
                  Login to continue shopping
                </p>

                {errorMessage && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <FaExclamationTriangle className="me-2" />
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      className="btn-close ms-auto"
                      onClick={() => setErrorMessage("")}
                    />
                  </div>
                )}

                <Button
                  variant="outline-dark"
                  className="w-100 mt-3 google-login-btn"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  <FaGoogle className="me-2" />
                  {googleLoading ? "Loading..." : "Login with Google"}
                </Button>

                <div className="divider funnel-sans">OR</div>

                <Form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Form.Group className="mb-3 input-group-custom lexend underline-input">
                      <FaEnvelope />
                      <Form.Control
                        className="form-control-custom"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Form.Group className="mb-3 input-group-custom lexend underline-input position-relative">
                      <FaLock />
                      <Form.Control
                        className="form-control-custom pe-5"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#888",
                          zIndex: 10,
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="login-btn w-100 mb-3 lexend"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </motion.div>
                </Form>

                {/* 🆕 Friendly "already logged in" text — appears below Login button */}
                {alreadyLoggedIn && (
                  <div
                    className="already-logged-in-note text-center mt-2 mb-3"
                    role="status"
                  >
                    <FaCheckCircle className="me-2 text-success" />
                    <span>
                      You are already logged in. Please{" "}
                      <a href="/" className="continue-shopping-link">
                        continue shopping
                      </a>
                      .
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div id="googleLoginBtn" className="google-btn"></div>
                </motion.div>

                <div className="text-center mt-4">
                  <span className="text-muted funnel-sans">
                    Don't have an account?
                  </span>
                  <a href="/signup" className="ms-1 register-link lexend">
                    Sign Up
                  </a>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      <Footer />
    </section>
  );
};

export default Login;