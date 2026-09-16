// Login.js - FULLY FIXED — Google JWT decode + user save

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import "./login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// 🆕 Decode JWT to extract user info
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

// 🆕 Build user object from JWT
const buildUserFromJWT = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  return {
    _id: decoded.id || decoded.sub || decoded._id || "",
    email: decoded.email || decoded.userEmail || "",
    name: decoded.name || decoded.given_name || "",
    picture: decoded.picture || "",
    ...decoded,
  };
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

  // ✅ Save token + user + notify navbar
  const saveSession = (token, userObj) => {
    localStorage.setItem("token", token);
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
    }

    // Notify navbar + cart + wishlist
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));

    console.log("✅ Session saved:", {
      token: token ? "✓" : "✗",
      user: userObj,
    });
  };

  // Check for Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // ✅ Build user from JWT (Google callback may not include user object)
      const userFromJWT = buildUserFromJWT(token);

      // Save session
      saveSession(token, userFromJWT);

      // Clean URL
      window.history.replaceState({}, document.title, "/");
      navigate("/", { replace: true });
    }

    if (error === "already_logged_in") {
      setErrorMessage("This account is already logged in from another device.");
      setShowForceLogoutModal(true);
    }

    if (error && error !== "already_logged_in") {
      setErrorMessage("Google login failed. Please try again.");
    }
  }, [location.search, navigate]);

  // Handle Submit Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.token) {
        let userObj = response.data.user;

        // Fallback — JWT માંથી user બનાવો
        if (!userObj || !userObj.email) {
          userObj = buildUserFromJWT(response.data.token) || {
            email,
            name: email.split("@")[0],
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

      if (error.response?.status === 409 && error.response?.data?.code === "ALREADY_LOGGED_IN") {
        setErrorMessage(error.response?.data?.message || "Already logged in from another device.");
        setShowForceLogoutModal(true);
        setPendingLoginData({ email, password });
      } else {
        setErrorMessage(error.response?.data?.message || "Something went wrong! Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Force Logout — FIXED
  const handleForceLogout = async () => {
    setShowForceLogoutModal(false);
    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Try force logout with email
      if (pendingLoginData?.email) {
        try {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/force-logout`,
            { email: pendingLoginData.email },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 8000,
            }
          );
        } catch (forceErr) {
          console.warn("Force-logout failed (continuing):", forceErr?.message);
        }
      }

      // Step 2: Clear local session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      window.dispatchEvent(new Event("userUpdated"));

      // Step 3: Retry login
      if (pendingLoginData?.email && pendingLoginData?.password) {
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
            userObj = buildUserFromJWT(response.data.token) || {
              email: pendingLoginData.email,
            };
          }

          saveSession(response.data.token, userObj);
          setPendingLoginData(null);
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Force logout error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to force logout.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForceLogout = () => {
    setShowForceLogoutModal(false);
    setPendingLoginData(null);
    setErrorMessage("");
  };

  const handleGoogleLogin = () => {
    setErrorMessage("");
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

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

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setErrorMessage("");

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google-verify`,
        { credential: response.credential }
      );

      let userObj = result.data.user;

      // ✅ Fallback — JWT માંથી user બનાવો
      if (!userObj || !userObj.email) {
        userObj = buildUserFromJWT(result.data.token);
      }

      saveSession(result.data.token, userObj);
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);

      if (error.response?.status === 409 && error.response?.data?.code === "ALREADY_LOGGED_IN") {
        setErrorMessage(error.response?.data?.message || "Already logged in from another device.");
        setShowForceLogoutModal(true);
      } else {
        setErrorMessage(error.response?.data?.message || "Google login failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
                <img src="./images/login.webp" alt="Premium Grocery" className="login-side-image" />
              </div>

              <Card className="login-card border-0">
                <h3 className="text-center mb-4 lexend">Welcome Back</h3>
                <p className="text-center text-muted mb-4">Login to continue shopping</p>

                {errorMessage && !showForceLogoutModal && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FaExclamationTriangle className="me-2" />
                    <span>{errorMessage}</span>
                    <button type="button" className="btn-close ms-auto" onClick={() => setErrorMessage("")} />
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
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
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

                  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                    <Button type="submit" className="login-btn w-100 mb-3 lexend" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </motion.div>
                </Form>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <div id="googleLoginBtn" className="google-btn"></div>
                </motion.div>

                <div className="text-center mt-4">
                  <span className="text-muted funnel-sans">Don't have an account?</span>
                  <a href="/signup" className="ms-1 register-link lexend">Sign Up</a>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showForceLogoutModal} onHide={handleCancelForceLogout} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Already Logged In
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>This account is already logged in from another device.</strong></p>
          <p className="text-muted">For security reasons, only one active session is allowed per account.</p>
          <p className="text-muted">Would you like to log out from the other device and continue with this login?</p>
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
          <Button variant="secondary" onClick={handleCancelForceLogout}>Cancel</Button>
          <Button variant="warning" onClick={handleForceLogout} disabled={loading}>
            {loading ? "Processing..." : "Logout Other Device & Login"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </section>
  );
};

export default Login;
