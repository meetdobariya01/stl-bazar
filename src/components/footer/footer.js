import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
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
      <footer className="footer-section lexend ">
        <Container fluid>
          {/* DESKTOP VIEW */}
          <Row className="d-none d-md-flex ">
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/images/native.jpg"
                  alt="Refresh"
                  className="footer-logo"
                  onClick={refreshPage}
                />

                <p className="footer-text">
                  Native91 brings you handpicked, high-quality foods, crafted
                  for taste lovers who value freshness, authenticity, and
                  exceptional culinary experiences.
                </p>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="/images/india.png"
                    alt="Refresh"
                    className="footer-logo w-50"
                    onClick={refreshPage}
                  />{" "}
                  {/* <img
                    src="/images/brandel.png"
                    alt="Refresh"
                    className="footer-logo w-50"
                    onClick={refreshPage}
                  /> */}
                </div>
              </motion.div>
            </Col>

            <Col md={2}>
              <h5 className="lexend">INFO</h5>
              <ul className="footer-links">
                <li>
                  <NavLink to="/aboutus">Our Story</NavLink>
                </li>
                <li>
                  <NavLink to="/contactus">Contact Us</NavLink>
                </li>
                <li>
                  {/* <NavLink to="/track-order">Track Order</NavLink> */}
                </li>
                <li>
                  <NavLink to="/faqs">FAQ</NavLink>
                </li>
                <li>
                  <NavLink to="/orderhistory">Order History</NavLink>
                </li>
              </ul>
            </Col>

            <Col md={3}>
              <h5 className="lexend">OUR PROGRAMS</h5>
              <ul>
                <li className="footer-links">
                  <NavLink to="/category/Gifts%20%26%20Hamper">
                    {" "}
                    E-Gift Voucher
                  </NavLink>
                </li>
              </ul>

              <h5 className="mt-4 lexend">FOLLOW US ON</h5>
              <div className="social-icons">
                {/* <a href="https://facebook.com" target="_blank">
                  <FaFacebookF />
                </a>
                <a href="https://pinterest.com" target="_blank">
                  <FaPinterestP />
                </a> */}
                <a
                  href="https://www.instagram.com/brandel_india_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                >
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
              <h5 className="lexend">POLICY</h5>
              <ul className="footer-links">
                <li>{/* <NavLink to="/disclaimer">Disclaimer</NavLink> */}</li>

                <li>
                  <NavLink to="/terms-and-conditions">
                    Terms & Conditions
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/shipping-policy">Shipping Policy</NavLink>
                </li>

                <li>
                  <NavLink to="/return-policy">
                    Return, Refund & Cancellation
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/privacypolicy">Privacy Policy</NavLink>
                </li>
              </ul>
            </Col>
          </Row>

          {/* MOBILE VIEW */}
          {/* MOBILE VIEW */}
          <Row className="d-md-none">
            <Col>
              {/* LOGO */}
              <img
                src="/images/native.jpg"
                alt="Refresh"
                className="footer-logo w-25"
                onClick={refreshPage}
              />

              {/* TEXT (FULL TEXT LIKE SCREENSHOT) */}
              <p className="footer-text">
                Native91 brings you handpicked, high-quality foods, crafted for
                taste lovers who value freshness, authenticity, and exceptional
                culinary experiences.
              </p>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/images/india.png"
                  alt="Refresh"
                  className="footer-logo w-50"
                />{" "}
                {/* <img
                    src="/images/brandel.png"
                    alt="Refresh"
                    className="footer-logo w-50"
                    onClick={refreshPage}
                  /> */}
              </div>

              {/* MOBILE MENU */}
              <div className="mobile-footer">
                <details>
                  <summary>INFO</summary>
                  <div className="mobile-footer-content">
                    <ul className="footer-links">
                      <li>
                        <NavLink to="/aboutus">Our Story</NavLink>
                      </li>
                      <li>
                        <NavLink to="/contactus">Contact Us</NavLink>
                      </li>
                      <li>
                        {/* <NavLink to="/track-order">Track Order</NavLink> */}
                      </li>
                      <li>
                        <NavLink to="/faqs">FAQ</NavLink>
                      </li>
                      <li>
                        <NavLink to="/orderhistory">Order History</NavLink>
                      </li>
                    </ul>
                  </div>
                </details>

                <details>
                  <summary>OUR PROGRAMS</summary>
                  <ul>
                    <li className="footer-links">
                      <NavLink to="/category/Gifts%20%26%20Hamper">
                        {" "}
                        E-Gift Voucher
                      </NavLink>
                    </li>
                  </ul>
                </details>

                <details>
                  <summary>POLICY</summary>
                  <div className="mobile-footer-content">
                    <ul className="footer-links">
                      <li>
                        {/* <NavLink to="/disclaimer">Disclaimer</NavLink> */}
                      </li>

                      <li>
                        <NavLink to="/terms-and-conditions">
                          Terms & Conditions
                        </NavLink>
                      </li>

                      <li>
                        <NavLink to="/shipping-policy">Shipping Policy</NavLink>
                      </li>

                      <li>
                        <NavLink to="/return-policy">
                          Return, Refund & Cancellation
                        </NavLink>
                      </li>

                      <li>
                        <NavLink to="/privacypolicy">Privacy Policy</NavLink>
                      </li>
                    </ul>
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
                      <a
                        href="https://www.instagram.com/brandel_india_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                        target="_blank"
                      >
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
        href="https://wa.me/919824018555?text=Hello%20Native91,%20I%20have%20a%20query%20about%20your%20products."
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
