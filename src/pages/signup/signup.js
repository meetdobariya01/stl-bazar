import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaUser } from "react-icons/fa";
import "./signup.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulated API call
    setTimeout(() => {
      setLoading(false);
      alert(`Account created successfully 🎉\nWelcome ${name}`);
    }, 1500);
  };

  return (
    <section className="signup-section">
      {/* header */}
      <Header />
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={7} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="signup-card">
                <h3 className="text-center mb-3 lexend">Create Account 🚀</h3>
                <p className="text-center text-muted mb-4 funnel-sans">
                  Join us and start shopping smarter
                </p>
                <Button
                  variant="outline-dark"
                  className="w-100 mt-3"
                  onClick={() =>
                    (window.location.href = "https://accounts.google.com")
                  }
                >
                  <FaGoogle className="me-2" /> Login with Google
                </Button>
                <div className="divider funnel-sans">OR</div>
                <Form className="lexend" onSubmit={handleSubmit}>
                  {/* Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Form.Group className="mb-3 input-group-custom underline-input">
                      <FaUser />
                      <Form.Control
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
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Form.Group className="mb-3 input-group-custom underline-input">
                      <FaEnvelope />
                      <Form.Control
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Form.Group className="mb-3 input-group-custom underline-input">
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

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="signup-btn w-100"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </motion.div>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted funnel-sans">
                    Already have an account?
                  </span>
                  <a href="/login" className="ms-1 login-link lexend">
                    Login
                  </a>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
      {/* footer */}
      <Footer />
    </section>
  );
};

export default Signup;
