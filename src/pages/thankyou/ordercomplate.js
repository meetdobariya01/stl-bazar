import React from "react";
import "./ordercomplate.css";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaBoxOpen,
  FaShieldAlt,
  FaLeaf,
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaStore,
  FaArrowRight,
} from "react-icons/fa";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const features = [
  {
    icon: <FaBoxOpen />,
    title: "Quality Marketplace",
    desc: "We welcome only authentic, high-quality products.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure & Trusted",
    desc: "Safe payments, clear policies and dedicated support.",
  },
  {
    icon: <FaLeaf />,
    title: "Grow Together",
    desc: "We support sellers in growing their brand.",
  },
  {
    icon: <FaUsers />,
    title: "Community First",
    desc: "Be a part of a community that values craftsmanship.",
  },
];

const steps = [
  {
    icon: <FaEnvelope />,
    title: "1. Review",
    desc: "We'll review your application and details carefully.",
  },
  {
    icon: <FaPhoneAlt />,
    title: "2. Get in Touch",
    desc: "Our team will contact you within 2 business days.",
  },
  {
    icon: <FaStore />,
    title: "3. Onboard & Start Selling",
    desc: "Once approved, we'll help you set up your store.",
  },
];
const Ordercomplate = () => {
  return (
    <div className="lexend">
      <Header />

      <section className="thankyou-banner">
        <img src="./images/thankyou-banner.png" alt="Thank You Banner" />
      </section>

      <section className="features-section">
        <Container>
          <div className="features-wrapper">
            <Row className="g-0">
              {features.map((item, index) => (
                <Col lg={3} md={6} sm={6} xs={12} key={index}>
                  <motion.div
                    className="feature-card-order-complete"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="feature-icon">{item.icon}</div>

                    <h4 className="funnel-sans">{item.title}</h4>

                    <p className="lexend">{item.desc}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      <section className="next-step-section">
        <Container>
          {/* Heading */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-heading funnel-sans">What Happens Next?</h2>
          </motion.div>

          {/* Steps */}
          <Row className="g-4 justify-content-center">
            {steps.map((step, index) => (
              <Col lg={4} md={6} key={index}>
                <motion.div
                  className="step-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -8 }}
                  viewport={{ once: true }}
                >
                  <div className="icon-box">{step.icon}</div>

                  <div className="step-content">
                    <h5>{step.title}</h5>
                    <p>{step.desc}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Support Box */}
          <motion.div
            className="support-box mt-5"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="support-content">
              <h4 className="Funnel-sans">Have questions?</h4>
              <p>Our support team is here to help.</p>

              <Button as={NavLink} to="/contactus" className="support-btn">
                Contact Support <FaArrowRight className="ms-2" />
              </Button>
            </div>

            <div className="leaf-design">
              <img src="./images/rose.png" alt="leaf" />
            </div>
          </motion.div>
        </Container>
      </section>
      <Footer />
    </div>
  );
};

export default Ordercomplate;
