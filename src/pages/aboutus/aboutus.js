import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEye, FaBullseye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./aboutus.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const Aboutus = () => {
  const navigate = useNavigate();

  return (
    <div className="aboutus-wrapper lexend">
      {/* Header Component */}
      <Header />

      {/* 1. Hero Section */}
      <section
        className="about-hero-section"
        style={{ backgroundImage: `url('/images/product-banner.png')` }}
      >
        {/* <div className="about-hero-overlay"></div> */}
        {/* <Container>
          <div className="about-hero-content">
            <motion.span 
              className="about-hero-tag"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our Vision & Brand
            </motion.span>
            <motion.h1 
              className="about-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              About Us
            </motion.h1>
            <motion.p 
              className="about-hero-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Our vision is to promote a natural and organic lifestyle that
              supports better health and sustainability.
            </motion.p>
          </div>
        </Container> */}
      </section>

      {/* 2. Intro Section */}
      <section className="about-intro-section">
        <Container>
          <div className="intro-content-wrapper">
            <motion.div
              className="intro-text-box"
              initial={{ opacity: 0, x: -45 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="section-label">Premium Quick Commerce</span>
              <h2 className="intro-title">
                Fast, Fresh & Designed for Modern Living
              </h2>
              <p className="intro-desc">
                We are building a new-age quick commerce platform inspired by
                today’s fast-paced lifestyle. Our mission is simple - to deliver
                daily essentials, groceries, and household needs faster than
                ever, without compromising on quality.
              </p>
            </motion.div>

            <motion.div
              className="intro-img-box"
              initial={{ opacity: 0, x: 45 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="intro-img-container">
                <img
                  src="/images/aboutus.webp"
                  alt="Organic natural and fresh lifestyle"
                />
              </div>
              {/* <div className="intro-img-deco"></div> */}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 3. Story & What Makes Us Different */}
      <section className="about-cards-section">
        <Container>
          <Row className="g-4">
            <Col lg={6}>
              <motion.div
                className="about-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="card-num">01</div>
                <h3 className="card-title">Our Story</h3>
                <div className="card-text">
                  <p>
                    The idea behind our platform was born from a simple
                    observation - people want convenience, speed, and trust in
                    one place. Traditional shopping takes time, and modern
                    consumers demand better solutions.
                  </p>
                  <p>
                    By combining smart logistics, local partnerships, and modern
                    technology, we created a system that brings stores closer to
                    your home. What started as a small idea has now evolved into
                    a powerful delivery ecosystem.
                  </p>
                </div>
              </motion.div>
            </Col>

            <Col lg={6}>
              <motion.div
                className="about-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="card-num">02</div>
                <h3 className="card-title">What Makes Us Different</h3>
                <div className="card-text">
                  <p>
                    Speed is at the heart of everything we do. Our optimized
                    delivery network ensures that your essentials reach you in
                    minutes, not hours.
                  </p>
                  <p>
                    We work closely with trusted sellers and local stores to
                    maintain freshness, quality, and fair pricing - creating a
                    win-win ecosystem for customers and partners.
                  </p>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. Visual Divider 1 - Delivery and logistics banner */}
      <section className="about-wide-visual">
        <Container>
          <motion.div
            className="wide-img-wrapper"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <img
              src="/images/123.jpg"
              alt="Fast logistics and smart delivery ecosystem"
            />
          </motion.div>
        </Container>
      </section>

      {/* 5. Vision & Mission Cards */}
      <section className="about-vm-section">
        <Container>
          <div className="vm-grid">
            <motion.div
              className="vm-card vm-card-light"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="vm-header">
                <div className="vm-icon-box">
                  <FaEye />
                </div>
                <h3 className="vm-title">Our Vision</h3>
              </div>
              <div className="vm-content">
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
              </div>
            </motion.div>

            <motion.div
              className="vm-card vm-card-dark"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="vm-header">
                <div className="vm-icon-box">
                  <FaBullseye />
                </div>
                <h3 className="vm-title">Our Mission</h3>
              </div>
              <div className="vm-content">
                <p>
                  Our mission is to deliver quality products at lightning speed
                  while maintaining transparency, affordability, and customer
                  satisfaction.
                </p>
                <p>
                  Every order we deliver reflects our commitment to excellence,
                  innovation, and continuous improvement.
                </p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 6. Visual Divider 2 - Fresh products & shopping concept banner */}
      <section className="about-wide-visual">
        <Container>
          <motion.div
            className="wide-img-wrapper"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <img
              src="/images/online-shopping-concept.jpg"
              alt="Premium fresh groceries and everyday shopping"
            />
          </motion.div>
        </Container>
      </section>

      {/* 7. Closing / Grow With Us Section */}
      <section className="about-closing-section">
        <Container>
          <motion.div
            className="closing-banner"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="closing-title">Growing With You</h3>
            <p className="closing-desc">
              We are constantly evolving to serve you better. As cities grow and
              lifestyles change, our platform adapts to meet new expectations.
              Thank you for being a part of our journey. Together, we are
              building a faster, smarter, and more connected future.
            </p>
            <button
              className="closing-btn"
              onClick={() => navigate("/category/All")}
            >
              Explore Our Products
            </button>
          </motion.div>
        </Container>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Aboutus;
