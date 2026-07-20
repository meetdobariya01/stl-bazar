import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaUserLock,
  FaCookieBite,
  FaCreditCard,
  FaDatabase,
  FaEnvelope,
  FaLock,
  FaGlobe,
  FaChildren,
  FaBalanceScale,
  FaPhoneAlt,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./privacypolicy.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const sections = [
  {
    icon: <FaUserLock />,
    title: "Information We Collect",
    content: (
      <>
        <h6>Personal Information</h6>
        <ul>
          <li>Full Name</li>
          <li>Email Address</li>
          <li>Mobile Number</li>
          <li>Billing Address</li>
          <li>Shipping Address</li>
          <li>PIN Code</li>
          <li>GST Number (if applicable)</li>
        </ul>

        <h6>Payment Information</h6>
        <p>
          Payments are securely processed through trusted third-party payment
          gateways. We never store your debit card, credit card, UPI PIN, CVV,
          or banking credentials.
        </p>

        <h6>Device Information</h6>
        <ul>
          <li>IP Address</li>
          <li>Browser</li>
          <li>Device Type</li>
          <li>Operating System</li>
          <li>Language</li>
          <li>Access Time</li>
        </ul>
      </>
    ),
  },

  {
    icon: <FaDatabase />,
    title: "How We Use Your Information",
    content: (
      <ul>
        <li>Process Orders</li>
        <li>Deliver Products</li>
        <li>Customer Support</li>
        <li>Fraud Prevention</li>
        <li>Improve Website Performance</li>
        <li>Personalize Shopping Experience</li>
        <li>Marketing Communications (Optional)</li>
      </ul>
    ),
  },

  {
    icon: <FaCookieBite />,
    title: "Cookies & Tracking",
    content: (
      <p>
        We use cookies to keep you logged in, remember your shopping cart,
        improve website performance, analyze traffic, and personalize your
        shopping experience.
      </p>
    ),
  },

  {
    icon: <FaCreditCard />,
    title: "Payment Security",
    content: (
      <p>
        Your payments are encrypted using secure payment gateways. We never
        store card details, CVV numbers, or UPI PINs.
      </p>
    ),
  },

  {
    icon: <FaLock />,
    title: "Data Security",
    content: (
      <ul>
        <li>SSL Encryption</li>
        <li>Firewall Protection</li>
        <li>Secure Password Encryption</li>
        <li>Limited Employee Access</li>
        <li>Regular Security Monitoring</li>
      </ul>
    ),
  },

  {
    icon: <FaBalanceScale />,
    title: "Your Rights",
    content: (
      <ul>
        <li>Access Your Data</li>
        <li>Update Personal Information</li>
        <li>Delete Your Account</li>
        <li>Withdraw Consent</li>
        <li>Restrict Processing</li>
        <li>Request Data Portability</li>
      </ul>
    ),
  },

  {
    icon: <FaGlobe />,
    title: "International Transfers",
    content: (
      <p>
        If you access our services outside India, your information may be
        transferred and processed in India in accordance with applicable laws.
      </p>
    ),
  },

  {
    icon: <FaEnvelope />,
    title: "Marketing Emails",
    content: (
      <p>
        We may send promotional offers, discounts, and newsletters. You can
        unsubscribe anytime using the unsubscribe link.
      </p>
    ),
  },

  {
    icon: <FaFileAlt />,
    title: "Policy Updates",
    content: (
      <p>
        We may update this Privacy Policy periodically. Any changes will be
        reflected by updating the "Last Updated" date.
      </p>
    ),
  },

  {
    icon: <FaPhoneAlt />,
    title: "Contact Us",
    content: (
      <>
        <p>
          <strong>Your Store Name</strong>
        </p>
        <p>Email : support@native91.com</p>
        <p>Phone : +91 70169 29807</p>
        <p>Address : Ahmedabad, India</p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <>
      <div>
        {/* Header */}
        <Header />

        <section className="privacy-hero lexend">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <FaShieldAlt className="hero-icon" />
              <h1>Privacy Policy</h1>
              <p>
                Your privacy matters to us. We are committed to protecting your
                personal information and ensuring a secure shopping experience.
              </p>
            </motion.div>
          </Container>
        </section>

        <section className="privacy-section lexend">
          <Container>
            <Row>
              <Col lg={3}>
                <div className="toc">
                  <h5>Contents</h5>

                  {sections.map((item, index) => (
                    <a href={`#section-${index}`} key={index}>
                      {item.title}
                    </a>
                  ))}
                </div>
              </Col>

              <Col lg={9}>
                {sections.map((item, index) => (
                  <motion.div
                    key={index}
                    id={`section-${index}`}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="privacy-card">
                      <Card.Body>
                        <div className="card-title">
                          <span>{item.icon}</span>
                          <h3>{item.title}</h3>
                        </div>

                        <div>{item.content}</div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}

                <motion.div
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="consent-card">
                    <Card.Body>
                      <FaCheckCircle />

                      <h3>Consent</h3>

                      <p>
                        By using our website, creating an account, or placing an
                        order, you acknowledge that you have read, understood,
                        and agreed to this Privacy Policy.
                      </p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
