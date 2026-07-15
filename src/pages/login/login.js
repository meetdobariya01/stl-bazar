import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // <-- import useNavigate

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // <-- initialize navigate
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password },
      );

      setLoading(false);

      // Store JWT in localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect user to home page
      navigate("/"); // <-- redirect to home
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong! Try again.");
      }
    }
  };

  // GOOGLE LOGIN INIT
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
        },
      );
    }
  }, []);

  const handleGoogleResponse = (response) => {
    console.log("Google Token:", response.credential);
    alert("Google Login Successful ✅");
    // You can also send response.credential to backend for JWT
  };
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  return (
    <section className="login-section">
      <Header />
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5 4 lexend">
          <Col lg={10}>
            <div className="login-container">
              {/* Left Image */}
              <div className="login-image-wrapper">
                <img
                  src="./images/login.png"
                  alt="Premium Grocery"
                  className="login-side-image"
                />
              </div>

              {/* Right Form */}
              <Card className="login-card border-0">
                <h3 className="text-center mb-4 lexend">Welcome Back </h3>
                <p className="text-center text-muted mb-">
                  Login to continue shopping
                </p>

                <Button
                  variant="outline-dark"
                  className="w-100 mt-3"
                  onClick={() =>
                    (window.location.href = "https://accounts.google.com")
                  }
                >
                  <FaGoogle className="me-2 lexend" /> Login with Google
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
