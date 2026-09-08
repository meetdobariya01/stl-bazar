import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaHome, FaArrowLeft, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./error.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <Header />

      <section className="not-found-page">
        <Container>
          <div className="not-found-wrapper">
            {/* Animated 404 */}
            <motion.div
              className="error-number"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <span>4</span>

              <motion.div
                className="zero-circle"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 8, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FaSearch />
              </motion.div>

              <span>4</span>
            </motion.div>

            {/* Content */}
            <motion.div
              className="not-found-content"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
              }}
            >
              <span className="error-label">PAGE NOT FOUND</span>

              <h1>
                Oops! This page
                <br />
                <span>got lost.</span>
              </h1>

              <p>
                The page you're looking for doesn't exist, has been moved, or
                may have been temporarily unavailable.
              </p>

              <div className="not-found-buttons">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="home-btn" onClick={() => navigate("/")}>
                    <FaHome />
                    Back to Home
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                    Go Back
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Decorations */}
            <motion.div
              className="floating-shape shape-one"
              animate={{
                y: [0, -25, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="floating-shape shape-two"
              animate={{
                y: [0, 20, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="floating-dot dot-one"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="floating-dot dot-two"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.9, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
          </div>
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
