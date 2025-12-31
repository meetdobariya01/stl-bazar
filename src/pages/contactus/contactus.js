import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./contactus.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const ContactUs = () => {
  return (
    <div>
      {/* Header Component */}
      <Header />
      <section className="contact-section lexend">
        <Container>
          {/* Header */}
          <motion.div
            className="contact-header"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h6 className="funnel-sans">CONTACT US</h6>
            <h2>We’d Love to Hear From You</h2>
            <p>
              Whether you have a question, feedback, or partnership inquiry —
              we’re always ready to connect.
            </p>
          </motion.div>

          <Row className="contact-wrapper">
            {/* Contact Info */}
            <Col md={5}>
              <motion.div
                className="contact-info"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="info-box">
                  <FaMapMarkerAlt />
                  <div>
                    <h5 className="funnel-sans">Our Location</h5>
                    <p>Ahmedabad, Gujarat, India</p>
                  </div>
                </div>

                <div className="info-box">
                  <FaPhoneAlt />
                  <div>
                    <h5 className="funnel-sans">Phone</h5>
                    <a href="tel:+9199854XXXXX" className="email-link">
                      +91 99854 XXXXX
                    </a>
                  </div>
                </div>

                <div className="info-box">
                  <FaEnvelope />
                  <div>
                    <h5>Email</h5>
                    <a
                      href="mailto:support@yourstore.com"
                      className="email-link"
                    >
                      support@yourstore.com
                    </a>
                  </div>
                </div>
              </motion.div>
            </Col>

            {/* Contact Form */}
            <Col md={7}>
              <motion.div
                className="contact-form"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          className="underline-input"
                          placeholder="Your Name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="email"
                          className="underline-input"
                          placeholder="Your Email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      className="underline-input"
                      placeholder="Subject"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      className="underline-input"
                      rows={5}
                      placeholder="Your Message"
                    />
                  </Form.Group>

                  <Button className="send-btn" type="submit">
                    Send Message
                  </Button>
                </Form>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactUs;
