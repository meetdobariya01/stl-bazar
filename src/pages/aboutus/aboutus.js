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
      <section className="simple-section">
        <Container>
          <motion.div
            className="simple-text"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-uppercase">About Us</h1>
            <p>
              Our vision is to promote a natural and organic lifestyle that
              supports better health and sustainability.
            </p>
          </motion.div>
        </Container>

        <motion.img
          src="/images/aboutus.webp"
          alt="Nature"
          className="simple-image"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
      </section>
    </div>
  );
};

export default Aboutus;
