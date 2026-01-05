import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaUser } from "react-icons/fa";
import "./signup.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // <-- initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the API URL from frontend .env
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        { name, email, password }
      );

      setLoading(false);
      alert(response.data.message); // e.g., "User registered successfully 🎉"
      
      // Optionally, reset form
      setName("");
      setEmail("");
      setPassword("");

      // Redirect to login page after signup
      navigate("/login"); // <-- redirect to login page

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message); // backend error message
      } else {
        alert("Something went wrong! Try again.");
      }
    }
  };

  return (
    <section className="signup-section">
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
      <Footer />
    </section>
  );
};

export default Signup;
