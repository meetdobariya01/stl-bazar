import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "./aboutus.css";
import Header from "../../components/header/header";


const Aboutus = () => {
  return (
    <div>
      {/* Header Component */}
      <Header />

      {/* About Us Section */}
      <section className="refresh-section">
        {/* Vision Text */}
        <motion.div
          className="vision-text"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h6 className="section-label">REFRESH STORY</h6>
          <p>
            "Our vision is to be a catalyst for the widespread adoption of a
            natural and organic lifestyle, creating a global impact on health
            and sustainability."
          </p>
        </motion.div>

        {/* Content Area */}
        <Container fluid className="refresh-content">
          <Row className="align-items-center">
            <Col md={6} className="text-area">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9 }}
                viewport={{ once: true }}
              >
                <h2>Refresh</h2>
                <span>Where Lifestyle Meets Nature</span>
              </motion.div>
            </Col>

            <Col md={6} className="image-area">
              <motion.img
                src="/images/aboutus.webp" // replace with your image
                alt="Nature"
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              />
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Aboutus;
