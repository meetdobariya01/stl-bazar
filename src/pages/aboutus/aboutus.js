import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "./aboutus.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

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
            <h1 className="text-uppercase lexend">About Us</h1>
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

      <section className="about-section funnel-sans">
        <Container>
          {/* Intro */}
          <motion.div
            className="about-intro"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
              <h2 className="lexend">Fast, Fresh & Designed for Modern Living</h2>
            <p>
              We are building a new-age quick commerce platform inspired by
              today’s fast-paced lifestyle. Our mission is simple — to deliver
              daily essentials, groceries, and household needs faster than ever,
              without compromising on quality.
            </p>
          </motion.div>

          {/* Image 1 */}
          <motion.img
            src="/images/123.jpg"
            alt="About delivery"
            className="about-image"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          />

          {/* Story */}
          <Row className="about-row">
            <Col md={6}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <h3 className="lexend">Our Story</h3>
                <p>
                  The idea behind our platform was born from a simple
                  observation — people want convenience, speed, and trust in one
                  place. Traditional shopping takes time, and modern consumers
                  demand better solutions.
                </p>
                <p>
                  By combining smart logistics, local partnerships, and modern
                  technology, we created a system that brings stores closer to
                  your home. What started as a small idea has now evolved into a
                  powerful delivery ecosystem.
                </p>
              </motion.div>
            </Col>

            <Col md={6}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="lexend">What Makes Us Different</h3>
                <p>
                  Speed is at the heart of everything we do. Our optimized
                  delivery network ensures that your essentials reach you in
                  minutes, not hours.
                </p>
                <p>
                  We work closely with trusted sellers and local stores to
                  maintain freshness, quality, and fair pricing — creating a
                  win-win ecosystem for customers and partners.
                </p>
              </motion.div>
            </Col>
          </Row>

          {/* Image 2 */}
          <motion.img
            src="/images/online-shopping-concept.jpg"
            alt="Fresh products"
            className="about-image"
            initial={{ scale: 1.05, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          />

          {/* Vision & Mission */}
          <Row className="about-row">
            <Col md={6}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <h3 className="lexend">Our Vision</h3>
                <p>
                  Our vision is to redefine everyday shopping by making it
                  faster, simpler, and more reliable. We believe that technology
                  should work silently in the background while customers enjoy
                  effortless experiences.
                </p>
                <p>
                  We aim to become the most trusted on-demand commerce platform,
                  empowering urban communities and supporting local businesses.
                </p>
              </motion.div>
            </Col>

            <Col md={6}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="lexend">Our Mission</h3>
                <p>
                  Our mission is to deliver quality products at lightning speed
                  while maintaining transparency, affordability, and customer
                  satisfaction.
                </p>
                <p>
                  Every order we deliver reflects our commitment to excellence,
                  innovation, and continuous improvement.
                </p>
              </motion.div>
            </Col>
          </Row>

          {/* Image 3 */}
          {/* <motion.img
            src="/images/about-3.jpg"
            alt="Team work"
            className="about-image"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          /> */}

          {/* Closing */}
          <motion.div
            className="about-end"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="lexend">Growing With You</h3>
            <p>
              We are constantly evolving to serve you better. As cities grow and
              lifestyles change, our platform adapts to meet new expectations.
            </p>
            <p>
              Thank you for being a part of our journey. Together, we are
              building a faster, smarter, and more connected future.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Footer Component */}
      <Footer />  
    </div>
  );
};

export default Aboutus;
