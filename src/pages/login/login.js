// Login.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
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
  const navigate = useNavigate();
  const location = useLocation();

  // Check for Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    } else if (error) {
      alert("Google login failed. Please try again.");
    }
  }, [location, navigate]);

// Login.js - Updated handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

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
      alert("Login failed: No token received");
    }
  } catch (error) {
    console.error("Login error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    setLoading(false);
    const message = error.response?.data?.message || "Something went wrong! Try again.";
    alert(message);
  } finally {
    setLoading(false);
  }
};
  // Handle Google One-Tap Login
  const handleGoogleLogin = () => {
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
      const message = error.response?.data?.message || "Google login failed";
      alert(message);
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
      <Footer />
    </section>
  );
};

export default Login;