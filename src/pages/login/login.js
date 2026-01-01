import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import "./login.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert(`Login successful\nEmail: ${email}`);
    }, 1500);
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
        }
      );
    }
  }, []);

  const handleGoogleResponse = (response) => {
    console.log("Google Token:", response.credential);
    alert("Google Login Successful ✅");
  };

  return (
    <section className="login-section">
        {/* header */}
        <Header/>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={7} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="login-card">
                <h3 className="text-center mb-4 lexend">Welcome Back 👋</h3>
                <p className="text-center text-muted mb-4 funnel-sans">
                  Login to continue shopping
                </p>

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Form.Group className="mb-3 input-group-custom funnel-sans  underline-input">
                      <FaEnvelope />
                      <Form.Control
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
                    transition={{ delay: 0.3 }}
                  >
                    <Form.Group className="mb-3 input-group-custom funnel-sans underline-input">
                      <FaLock />
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </motion.div>

                  {/* Login Button */}
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

                {/* Divider */}
                <div className="divider funnel-sans">OR</div>
                <Button
                  variant="outline-dark"
                  className="w-100 mt-3"
                  onClick={() =>
                    (window.location.href = "https://accounts.google.com")
                  }
                >
                  <FaGoogle className="me-2 lexend" /> Login with Google
                </Button>

                {/* Google Login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div id="googleLoginBtn" className="google-btn"></div>
                </motion.div>

                <div className="text-center mt-4">
                  <span className="text-muted funnel-sans">Don't have an account?</span>
                  <a href="/signup" className="ms-1 register-link lexend">
                    Sign Up
                  </a>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
      {/* footer */}
      <Footer/>
    </section>
  );
};

export default Login;
