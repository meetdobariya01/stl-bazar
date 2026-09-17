// Login.js - FULLY FIXED — Google + normal login (email initial + force logout)

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
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

// 🆕 Build user object from JWT + fallback
const buildUserObject = (token, fallbackEmail = "", fallbackName = "") => {
  const decoded = decodeJWT(token);
  return {
    _id: decoded?.id || decoded?.sub || decoded?._id || "",
    email: decoded?.email || fallbackEmail || "",
    name: decoded?.name || decoded?.given_name || fallbackName || "",
    picture: decoded?.picture || "",
    provider: decoded?.provider || "local",
    ...(decoded || {}),
  };
};

// 🆕 Save session + notify navbar
const saveSession = (token, userObj) => {
  localStorage.setItem("token", token);
  if (userObj) {
    localStorage.setItem("user", JSON.stringify(userObj));
  }
  // ✅ Notify all listeners
  window.dispatchEvent(new Event("userUpdated"));
  window.dispatchEvent(new Event("cartUpdated"));
  window.dispatchEvent(new Event("wishlistUpdated"));

  console.log("✅ Session saved:", {
    token: token ? "✓" : "✗",
    user: userObj,
  });
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================
  // Google OAuth callback — token from URL
  // ============================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");
    const emailParam = params.get("email");

    if (token) {
      // ✅ Build user from JWT
      const userObj = buildUserObject(token, emailParam || "");
      saveSession(token, userObj);

      // Clean URL
      window.history.replaceState({}, document.title, "/");
      navigate("/", { replace: true });
    }

    if (error === "already_logged_in") {
      setErrorMessage("This account is already logged in from another device.");
      setShowForceLogoutModal(true);

      // Store email for retry
      if (emailParam) {
        setPendingLoginData({
          email: emailParam,
          password: null,
          isGoogle: true,
        });
      }
    }

    if (error && error !== "already_logged_in") {
      setErrorMessage("Google login failed. Please try again.");
    }
  }, [location.search, navigate]);

  // ============================================
  // Normal Login submit
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
        // ✅ Backend user object
        let userObj = response.data.user;

        // ⚠️ Fallback — જો email missing → JWT decode
        if (!userObj || !userObj.email) {
          userObj = buildUserObject(
            response.data.token,
            email,
            email.split("@")[0]
          );
        } else {
          // Backend `id` field → `_id` (consistency)
          userObj = {
            _id: userObj.id || userObj._id,
            ...userObj,
          };
        }

        saveSession(response.data.token, userObj);
        navigate("/");
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
        setErrorMessage(
          error.response?.data?.message ||
            "This account is already logged in from another device."
        );
        setShowForceLogoutModal(true);
        setPendingLoginData({ email, password, isGoogle: false });
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
  // Force Logout + Retry Login
  // ============================================
  const handleForceLogout = async () => {
    console.log("🚀 Force logout START");
    console.log("pendingLoginData:", pendingLoginData);

    setShowForceLogoutModal(false);
    setLoading(true);
    setErrorMessage("");

    const targetEmail = pendingLoginData?.email;

    // Step 1: Try backend /force-logout (fail થાય તો પણ continue)
    if (targetEmail) {
      try {
        console.log("📡 Calling /auth/force-logout...");
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/force-logout`,
          { email: targetEmail },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
          }
        );
        console.log("✅ Backend force-logout:", res.data);
      } catch (forceErr) {
        console.warn(
          "⚠️ Backend force-logout failed (continuing):",
          forceErr?.response?.status,
          forceErr?.message
        );
      }
    }

    // Step 2: ALWAYS clear local
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    localStorage.removeItem("guestId");
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    console.log("✅ Local session cleared");

    // Step 3: Retry login (only if password available)
    if (pendingLoginData?.email && pendingLoginData?.password) {
      try {
        console.log("📡 Retrying login...");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/login`,
          {
            email: pendingLoginData.email,
            password: pendingLoginData.password,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 8000,
          }
        );

        if (response.data.token) {
          let userObj = response.data.user;
          if (!userObj || !userObj.email) {
            userObj = buildUserObject(
              response.data.token,
              pendingLoginData.email,
              pendingLoginData.email.split("@")[0]
            );
          } else {
            userObj = {
              _id: userObj.id || userObj._id,
              ...userObj,
            };
          }

          saveSession(response.data.token, userObj);
          setPendingLoginData(null);
          navigate("/");
          console.log("✅ Login retry successful");
        }
      } catch (loginErr) {
        console.error(
          "❌ Retry login failed:",
          loginErr.response?.data || loginErr.message
        );
        setErrorMessage(
          loginErr.response?.data?.message ||
            "Backend still has active session. Please try again later."
        );
      }
    } else if (pendingLoginData?.isGoogle) {
      // Google login — redirect to OAuth
      console.log("📡 Google login — redirecting to OAuth");
      setPendingLoginData(null);
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
      return;
    } else {
      console.warn("⚠️ No password — cannot retry");
      setErrorMessage("Other device logged out. Please login again.");
    }

    setLoading(false);
    console.log("🏁 Force logout END");
  };

  const handleCancelForceLogout = () => {
    setShowForceLogoutModal(false);
    setPendingLoginData(null);
    setErrorMessage("");
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
  // Google One-Tap credential response
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

      // ⚠️ Fallback — JWT decode
      if (!userObj || !userObj.email) {
        userObj = buildUserObject(result.data.token);
      } else {
        userObj = {
          _id: userObj.id || userObj._id,
          ...userObj,
        };
      }

      saveSession(result.data.token, userObj);
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);

      if (
        error.response?.status === 409 &&
        error.response?.data?.code === "ALREADY_LOGGED_IN"
      ) {
        setErrorMessage(
          error.response?.data?.message ||
            "This account is already logged in from another device."
        );
        setShowForceLogoutModal(true);

        const emailFromErr = error.response?.data?.email;
        if (emailFromErr) {
          setPendingLoginData({
            email: emailFromErr,
            password: null,
            isGoogle: true,
          });
        }
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

                {errorMessage && !showForceLogoutModal && (
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

      {/* ✅ Force Logout Modal */}
      <Modal
        show={showForceLogoutModal}
        onHide={handleCancelForceLogout}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Already Logged In
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>
              This account is already logged in from another device.
            </strong>
          </p>
          <p className="text-muted">
            For security reasons, only one active session is allowed per
            account.
          </p>
          <p className="text-muted">
            Would you like to log out from the other device and continue with
            this login?
          </p>
          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted">
              <strong>What will happen:</strong>
              <ul className="mb-0 mt-1">
                <li>The other device will be logged out</li>
                <li>You will be logged in on this device</li>
                <li>Your session will remain active for 7 days</li>
              </ul>
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelForceLogout}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleForceLogout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Logout Other Device & Login"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </section>
  );
};

export default Login;