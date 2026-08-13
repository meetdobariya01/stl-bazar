import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";

import "./signup.css";
import "../login/login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const Signup = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  // Frontend-only signup
  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    // Frontend-only demo
    setTimeout(() => {
      setLoading(false);

      alert("Account created successfully!");

      // Redirect to login page
      navigate("/login");
    }, 1000);
  };

  // Google button - frontend only
  const handleGoogleLogin = () => {
    alert("Google login will be available soon.");
  };

  return (
    <section className="login-section">
      <Header />

      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5 lexend">
          <Col lg={10}>
            <div className="login-container">
              {/* Signup Form */}
              <Card className="login-card border-0">
                <h3 className="text-center mb-3 lexend">Welcome</h3>

                <p className="text-center text-muted mb-3">
                  Signup to continue shopping
                </p>

                {/* Google Login */}
                <Button
                  variant="outline-dark"
                  className="w-100 mt-3 google-login-btn"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <FaGoogle className="me-2" />
                  Sign up with Google
                </Button>

                {/* Divider */}
                <div className="divider funnel-sans">OR</div>

                <Form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Form.Group className="mb-3 input-group-custom lexend underline-input">
                      <FaCircleUser />

                      <Form.Control
                        className="form-control-custom"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
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

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
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

                  {/* Signup Button */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="login-btn w-100 mb-3 lexend"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </motion.div>
                </Form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <span className="text-muted funnel-sans">
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    className="ms-1 register-link lexend border-0 bg-transparent p-0"
                    onClick={() => navigate("/login")}
                  >
                    Log In
                  </button>
                </div>
              </Card>

              {/* Left Image */}
              <div className="login-image-wrapper d-none d-sm-block">
                <img
                  src="/images/login.webp"
                  alt="Premium Grocery"
                  className="login-side-image"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Footer />
    </section>
  );
};

export default Signup;
