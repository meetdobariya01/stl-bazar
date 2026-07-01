import React, { useState, useEffect  } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import axios from "axios";

import "./contactus.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const ContactUs = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SEND MAIL
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:9000/api/contact/send-mail",
        formData,
      );

      alert(res.data.message);

      // RESET FORM
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.log(error);

      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);

  return (
    <div>
      <Header />

      <section className="contact-section lexend">
        <Container>
          {/* HEADER */}
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
              Whether you have a question, feedback, or partnership inquiry -
              we’re always ready to connect.
            </p>
          </motion.div>

          <Row className="contact-wrapper">
            {/* LEFT INFO */}
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

                    <p>Ahmedabad, India</p>
                  </div>
                </div>

                <div className="info-box">
                  <FaPhoneAlt />

                  <div>
                    <h5 className="funnel-sans">Phone</h5>
                    <a href="tel:+919824018555" className="email-link">
                      +91 98240 18555
                    </a>
                  </div>
                </div>

                <div className="info-box">
                  <FaEnvelope />

                  <div>
                    <h5 className="funnel-sans">Email</h5>

                    <a href="mailto:care@brandel.shop" className="email-link">
                      care@brandel.shop
                    </a>
                  </div>
                </div>
              </motion.div>
            </Col>

            {/* FORM */}
            <Col md={7}>
              <motion.div
                className="contact-form"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="underline-input"
                          placeholder="Your Name"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="underline-input"
                          placeholder="Your Email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="underline-input"
                      placeholder="Subject"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="underline-input"
                      placeholder="Your Message"
                      required
                    />
                  </Form.Group>

                  <Button className="send-btn" type="submit">
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </Form>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
