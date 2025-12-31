import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaPinterestP,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
  FaArrowUp,
} from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      <footer className="footer-section">
        <Container fluid>
          {/* DESKTOP VIEW */}
          <Row className="d-none d-md-flex">
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/images/logo.png"
                  alt="Refresh"
                  className="footer-logo"
                  onClick={refreshPage}
                />
                <p className="footer-text">
                 Gourmet Bazar brings you handpicked, high-quality foods, crafted for taste lovers who value freshness, authenticity, and exceptional culinary experiences.
                </p>
              </motion.div>
            </Col>

            <Col md={2}>
              <h5>INFO</h5>
              <ul>
                <li>Our Story</li>
                <li>Contact Us</li>
                <li>Track Order</li>
                <li>FAQ</li>
                <li>Naturopedia</li>
                <li>Shop All</li>
                <li>Store Locator</li>
                <li>Re:fresh Certifications</li>
              </ul>
            </Col>

            <Col md={3}>
              <h5>OUR PROGRAMS</h5>
              <ul>
                <li>E-Gift Voucher</li>
              </ul>

              <h5 className="mt-4">FOLLOW US ON</h5>
              <div className="social-icons">
                {/* <a href="https://facebook.com" target="_blank">
                  <FaFacebookF />
                </a>
                <a href="https://pinterest.com" target="_blank">
                  <FaPinterestP />
                </a> */}
                <a href="https://instagram.com" target="_blank">
                  <FaInstagram />
                </a>
                <a href="https://youtube.com" target="_blank">
                  <FaYoutube />
                </a>
                <a href="https://linkedin.com" target="_blank">
                  <FaLinkedinIn />
                </a>
              </div>
            </Col>

            <Col md={3}>
              <h5>POLICY</h5>
              <ul>
                <li>Disclaimer</li>
                <li>Terms & Conditions</li>
                <li>Corporate Governance</li>
                <li>Shipping Policy</li>
                <li>Return, Refund & Cancellation</li>
                <li>Privacy Policy</li>
                <li>Refresh Social Handles</li>
              </ul>
            </Col>
          </Row>

          {/* MOBILE VIEW */}
          {/* MOBILE VIEW */}
          <Row className="d-md-none">
            <Col>
              {/* LOGO */}
              <img
                src="/images/logo.png"
                alt="Refresh"
                className="footer-logo mb-3"
                onClick={refreshPage}
              />

              {/* TEXT (FULL TEXT LIKE SCREENSHOT) */}
              <p className="footer-text">
               Gourmet Bazar brings you handpicked, high-quality foods, crafted for taste lovers who value freshness, authenticity, and exceptional culinary experiences.
              </p>

              {/* MOBILE MENU */}
              <div className="mobile-footer">
                <details>
                  <summary>INFO</summary>
                  <div className="mobile-footer-content">
                    <p>Our Story</p>
                    <p>Contact Us</p>
                    <p>Track Order</p>
                    <p>FAQ</p>
                    <p>Naturopedia</p>
                    <p>Shop All</p>
                    <p>Store Locator</p>
                    <p>Re:fresh Certifications</p>
                  </div>
                </details>

                <details>
                  <summary>OUR PROGRAMS</summary>
                  <div className="mobile-footer-content">
                    <p>E-Gift Voucher</p>
                  </div>
                </details>

                <details>
                  <summary>FOLLOW US ON</summary>
                  <div className="mobile-footer-content">
                    <div className="social-icons">
                      {/* <a href="https://facebook.com" target="_blank">
                        <FaFacebookF />
                      </a>
                      <a href="https://pinterest.com" target="_blank">
                        <FaPinterestP />
                      </a> */}
                      <a href="https://instagram.com" target="_blank">
                        <FaInstagram />
                      </a>
                      <a href="https://youtube.com" target="_blank">
                        <FaYoutube />
                      </a>
                      <a href="https://linkedin.com" target="_blank">
                        <FaLinkedinIn />
                      </a>
                    </div>
                  </div>
                </details>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* WHATSAPP BUTTON */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        className="whatsapp-btn"
      >
        <FaWhatsapp />
      </a>

      {/* SCROLL TO TOP */}
      <button className="scroll-top" onClick={scrollToTop}>
        <FaArrowUp />
      </button>
    </>
  );
};

export default Footer;
