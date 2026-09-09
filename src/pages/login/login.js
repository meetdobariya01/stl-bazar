// Login.js - UPDATED WITH SESSION MANAGEMENT HANDLING

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import "./login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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

  // Check for Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // Save Google token
      localStorage.setItem("token", token);
      // Immediately go to home page and remove token from URL
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
      console.log("Attempting login with:", { email, password: password ? "***" : "missing" });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      } else {
        setErrorMessage("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // ✅ Handle "already logged in" error
      if (error.response?.status === 409 && error.response?.data?.code === "ALREADY_LOGGED_IN") {
        setErrorMessage(error.response?.data?.message || "This account is already logged in from another device.");
        setShowForceLogoutModal(true);
        // Store login data for retry after force logout
        setPendingLoginData({ email, password });
      } else {
        const message = error.response?.data?.message || "Something went wrong! Try again.";
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Force Logout from other devices
  const handleForceLogout = async () => {
    setShowForceLogoutModal(false);
    setLoading(true);

    try {
      // Call logout endpoint to clear session
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Now retry login with stored credentials
      if (pendingLoginData) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/login`,
          { 
            email: pendingLoginData.email, 
            password: pendingLoginData.password 
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setPendingLoginData(null);
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Force logout error:", error);
      setErrorMessage("Failed to force logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel Force Logout
  const handleCancelForceLogout = () => {
    setShowForceLogoutModal(false);
    setPendingLoginData(null);
    setErrorMessage("");
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    setErrorMessage("");
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // Initialize Google One-Tap
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render Google button
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

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      
      // ✅ Handle "already logged in" error for Google login
      if (error.response?.status === 409 && error.response?.data?.code === "ALREADY_LOGGED_IN") {
        setErrorMessage(error.response?.data?.message || "This account is already logged in from another device.");
        setShowForceLogoutModal(true);
      } else {
        const message = error.response?.data?.message || "Google login failed";
        setErrorMessage(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
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

                {/* ✅ Error Message Display */}
                {errorMessage && !showForceLogoutModal && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
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
      <Modal show={showForceLogoutModal} onHide={handleCancelForceLogout} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Already Logged In
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>This account is already logged in from another device.</strong>
          </p>
          <p className="text-muted">
            For security reasons, only one active session is allowed per account.
          </p>
          <p className="text-muted">
            Would you like to log out from the other device and continue with this login?
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