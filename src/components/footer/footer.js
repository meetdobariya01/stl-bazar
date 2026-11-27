// import { useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Container, Row, Col } from "react-bootstrap";
// import { motion } from "framer-motion";
// import { NavLink } from "react-router-dom";
// import {
//   FaFacebookF,
//   FaPinterestP,
//   FaEnvelope,
//   FaInstagram,
//   FaYoutube,
//   FaLinkedinIn,
//   FaWhatsapp,
//   FaArrowUp,
//   FaPhone,
// } from "react-icons/fa";
// import "./footer.css";

// const Footer = () => {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: "instant", // or "smooth"
//     });
//   }, [pathname]);

//   return (
//     <>
//       <footer className="footer-section lexend ">
//         <Container fluid>
//           {/* DESKTOP VIEW */}
//           <Row className="d-none d-md-flex ">
//             <Col md={4}>
//               <motion.div
//                 initial={{ opacity: 0, y: 40 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <NavLink to="/">
//                   <img
//                     src="/images/native.png"
//                     alt="Native91"
//                     className="footer-logo"
//                   />
//                 </NavLink>

//                 <p className="footer-text">
//                   Native91 is a curated marketplace for discovering and shopping
//                   exceptional homegrown Indian brands. Explore thoughtfully made
//                   products across home, lifestyle, fashion, beauty, food,
//                   gifting, and more, while supporting the people and stories
//                   behind them.
//                 </p>
//                 <div className="d-flex align-items-center gap-2">
//                   <img
//                     src="/images/india.png"
//                     alt="Refresh"
//                     className="footer-logo w-50"
//                     // onClick={refreshPage}
//                   />{" "}
//                   {/* <img
//                     src="/images/brandel.png"
//                     alt="Refresh"
//                     className="footer-logo w-50"
//                     onClick={refreshPage}
//                   /> */}
//                 </div>
//               </motion.div>
//             </Col>

//             <Col md={2}>
//               <h5 className="lexend">INFO</h5>
//               <ul className="footer-links">
//                 {/* <li>
//                   <NavLink to="/aboutus">Our Story</NavLink>
//                 </li> */}
//                 <li>
//                   <NavLink to="/contactus">Contact Us</NavLink>
//                 </li>
//                 <li>
//                   {/* <NavLink to="/track-order">Track Order</NavLink> */}
//                 </li>
//                 <li>
//                   <NavLink to="/faqs">User FAQ</NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/faqseller">Seller FAQ</NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/orderhistory">Order History</NavLink>
//                 </li>
//                   <li>
//                         <NavLink to="/sell">Sell With Us</NavLink>
//                   </li>
//               </ul>
//             </Col>

//             <Col md={3}>
//               <h5 className="lexend">OUR PROGRAMS</h5>
//               <ul>
//                 <li className="footer-links">
//                   <NavLink to="#"> E-Gift Voucher</NavLink>
//                 </li>
//                 <li className="footer-links">
//                   <NavLink to="/social-impact"> Social Impact</NavLink>
//                 </li>
//                 <li className="footer-links">
//                   <NavLink to="/careers"> Careers</NavLink>
//                 </li>
//               </ul>
//               <div className="d-flex align-items-center gap-3 mt-4 social-icons">
//                 <h5 className="mb-0 lexend ">FOLLOW US ON</h5>

//                 <a
//                   href="https://www.instagram.com/native91.official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label="Follow us on Instagram"
//                 >
//                   <FaInstagram />
//                 </a>
//               </div>{" "}
//               <div className="social-icons">
//                 {/* <a href="https://facebook.com" target="_blank">
//                   <FaFacebookF />
//                 </a>
//                 <a href="https://pinterest.com" target="_blank">
//                   <FaPinterestP />
//                 </a> */}
//                 {/* <a
//                   href="https://www.instagram.com/native91.official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
//                   target="_blank"
//                 >
//                   <FaInstagram />
//                 </a> */}
//                 {/* <a href="mailto:support@native91.com" target="_blank">
//                   <FaEnvelope />
//                 </a>
//                 <a href="tel:+919998323998" target="_blank">
//                   <FaPhone />
//                 </a> */}
//               </div>
//             </Col>

//             <Col md={3}>
//               <h5 className="lexend">POLICY</h5>
//               <ul className="footer-links">
//                 <li>{/* <NavLink to="/disclaimer">Disclaimer</NavLink> */}</li>

//                 <li>
//                   <NavLink to="/terms-and-conditions">
//                     Terms & Conditions
//                   </NavLink>
//                 </li>

//                 <li>
//                   <NavLink to="/shipping-policy">Shipping Policy</NavLink>
//                 </li>

//                 <li>
//                   <NavLink to="/return-policy">
//                     Return, Refund & Cancellation
//                   </NavLink>
//                 </li>

//                 <li>
//                   <NavLink to="/privacypolicy">Privacy Policy</NavLink>
//                 </li>
//               </ul>
//             </Col>

//             {/* <hr /> */}
//             <p className="text-center mb-0">
//               Copyright © 2026 Native91. All rights reserved.
//             </p>
//           </Row>

//           {/* MOBILE VIEW */}
//           {/* MOBILE VIEW */}
//           <Row className="d-md-none">
//             <Col>
//               {/* LOGO */}
//               <NavLink to="/">
//                 <img
//                   src="/images/native.png"
//                   alt="Native91"
//                   className="footer-logo"
//                 />
//               </NavLink>

//               {/* TEXT (FULL TEXT LIKE SCREENSHOT) */}
//               <p className="footer-text">
//                 Native91 is a curated marketplace for discovering and shopping
//                 exceptional homegrown Indian brands. Explore thoughtfully made
//                 products across home, lifestyle, fashion, beauty, food, gifting,
//                 and more, while supporting the people and stories behind them.
//               </p>
//               <div className="d-flex align-items-center gap-2">
//                 <img
//                   src="/images/india.png"
//                   alt="Refresh"
//                   className="footer-logo w-50"
//                 />{" "}
//                 {/* <img
//                     src="/images/brandel.png"
//                     alt="Refresh"
//                     className="footer-logo w-50"
//                     onClick={refreshPage}
//                   /> */}
//               </div>

//               {/* MOBILE MENU */}
//               <div className="mobile-footer">
//                 <details>
//                   <summary>INFO</summary>
//                   <div className="mobile-footer-content">
//                     <ul className="footer-links">
//                       {/* <li>
//                         <NavLink to="/aboutus">Our Story</NavLink>
//                       </li> */}
//                       <li>
//                         <NavLink to="/contactus">Contact Us</NavLink>
//                       </li>
//                       <li>
//                         {/* <NavLink to="/track-order">Track Order</NavLink> */}
//                       </li>
//                       <li>
//                         <NavLink to="/faqs">User FAQ</NavLink>
//                       </li>
//                       <li>
//                         <NavLink to="/faqseller">Seller FAQ</NavLink>
//                       </li>
//                       <li>
//                         <NavLink to="/orderhistory">Order History</NavLink>
//                       </li>
//                       <li>
//                         <NavLink to="/sell">Sell With Us</NavLink>
//                       </li>
//                     </ul>
//                   </div>
//                 </details>

//                 <details>
//                   <summary>OUR PROGRAMS</summary>
//                   <ul>
//                     <li className="footer-links">
//                       <NavLink to="#"> E-Gift Voucher</NavLink>
//                     </li>
//                     <li className="footer-links">
//                       <NavLink to="/social-impact"> Social Impact</NavLink>
//                     </li>
//                     <li className="footer-links">
//                       <NavLink to="/careers"> Careers</NavLink>
//                     </li>
//                   </ul>
//                 </details>

//                 <details>
//                   <summary>POLICY</summary>
//                   <div className="mobile-footer-content">
//                     <ul className="footer-links">
//                       <li>
//                         {/* <NavLink to="/disclaimer">Disclaimer</NavLink> */}
//                       </li>

//                       <li>
//                         <NavLink to="/terms-and-conditions">
//                           Terms & Conditions
//                         </NavLink>
//                       </li>

//                       <li>
//                         <NavLink to="/shipping-policy">Shipping Policy</NavLink>
//                       </li>

//                       <li>
//                         <NavLink to="/return-policy">
//                           Return, Refund & Cancellation
//                         </NavLink>
//                       </li>

//                       <li>
//                         <NavLink to="/privacypolicy">Privacy Policy</NavLink>
//                       </li>
//                     </ul>
//                   </div>
//                 </details>

//                 <details>
//                   <summary>FOLLOW US ON</summary>
//                   <div className="mobile-footer-content">
//                     <div className="social-icons">
//                       {/* <a href="https://facebook.com" target="_blank">
//                         <FaFacebookF />
//                       </a>
//                       <a href="https://pinterest.com" target="_blank">
//                         <FaPinterestP />
//                       </a> */}
//                       <a
//                         href="https://www.instagram.com/native91.official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
//                         target="_blank"
//                       >
//                         <FaInstagram />
//                       </a>
//                       {/* <a href="https://youtube.com" target="_blank">
//                         <FaYoutube />
//                       </a>
//                       <a href="https://linkedin.com" target="_blank">
//                         <FaLinkedinIn />
//                       </a> */}
//                     </div>
//                   </div>
//                 </details>
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       </footer>

//       {/* WHATSAPP BUTTON */}
//       <a
//         href="https://wa.me/919998323998?text=Hello%20Native91,%20I%20have%20a%20query%20about%20your%20products."
//         target="_blank"
//         className="whatsapp-btn"
//       >
//         <FaWhatsapp />
//       </a>

//       {/* SCROLL TO TOP */}
//       {/* <button className="scroll-top" onClick={scrollToTop}>
//         <FaArrowUp />
//       </button> */}
//     </>
//   );
// };

// export default Footer;


import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  FaFacebookF,
  FaPinterestP,
  FaEnvelope,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
  FaArrowUp,
  FaPhone,
} from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  const { pathname } = useLocation();

  // Sell With Us modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellEmail, setSellEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const closeModal = () => {
    setShowSellModal(false);
    setSellEmail("");
    setEmailError("");
    setLoading(false);
    setSuccess(false);
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setEmailError("");

    try {
      // 🟢 ADDED FALLBACK URL: If env variable is missing, it uses the live API
      const API_URL = process.env.REACT_APP_API_URL || "https://api.native91.com/api";

      const response = await fetch(
        `${API_URL}/sellers/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sellEmail }),
        }
      );

      // Check if the response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server error (${response.status}). Make sure the backend URL is correct.`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong. Try again.");
      }

      setSuccess(true);
    } catch (err) {
      setEmailError(err.message || "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
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
                <NavLink to="/">
                  <img
                    src="/images/native.png"
                    alt="Native91"
                    className="footer-logo"
                  />
                </NavLink>

                <p className="footer-text">
                  Native91 is a curated marketplace for discovering and shopping
                  exceptional homegrown Indian brands. Explore thoughtfully made
                  products across home, lifestyle, fashion, beauty, food,
                  gifting, and more, while supporting the people and stories
                  behind them.
                </p>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="/images/india.png"
                    alt="Refresh"
                    className="footer-logo w-50"
                  />{" "}
                </div>
              </motion.div>
            </Col>

            <Col md={2}>
              <h5 className="lexend">INFO</h5>
              <ul className="footer-links">
                <li>
                  <NavLink to="/contactus">Contact Us</NavLink>
                </li>
                <li></li>
                <li>
                  <NavLink to="/faqs">Buyers FAQ</NavLink>
                </li>
                <li>
                  <NavLink to="/faqseller">Seller FAQ</NavLink>
                </li>
                <li>
                  <NavLink to="/orderhistory">Order History</NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-link-btn fw-medium"
                    onClick={() => setShowSellModal(true)}
                  >
                    Sell With Us
                  </button>
                </li>
              </ul>
            </Col>

            <Col md={3}>
              <h5 className="lexend">OUR PROGRAMS</h5>
              <ul>
                <li className="footer-links">
                  <NavLink to="#"> E-Gift Voucher</NavLink>
                </li>
                <li className="footer-links">
                  <NavLink to="/social-impact"> Social Impact</NavLink>
                </li>
                <li className="footer-links">
                  <NavLink to="/careers"> Careers</NavLink>
                </li>
              </ul>
              <div className="d-flex align-items-center gap-3 mt-4 social-icons">
                <h5 className="mb-0 lexend ">FOLLOW US ON</h5>

                <a
                  href="https://www.instagram.com/native91.official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <FaInstagram />
                </a>
              </div>{" "}
              <div className="social-icons"></div>
            </Col>

            <Col md={3}>
              <h5 className="lexend">POLICY</h5>
              <ul className="footer-links">
                <li></li>

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

            <p className="text-center mb-0">
              Copyright © 2026 Native91. All rights reserved.
            </p>
          </Row>

          {/* MOBILE VIEW */}
          <Row className="d-md-none">
            <Col>
              <NavLink to="/">
                <img
                  src="/images/native.png"
                  alt="Native91"
                  className="footer-logo"
                />
              </NavLink>

              <p className="footer-text">
                Native91 is a curated marketplace for discovering and shopping
                exceptional homegrown Indian brands. Explore thoughtfully made
                products across home, lifestyle, fashion, beauty, food, gifting,
                and more, while supporting the people and stories behind them.
              </p>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/images/india.png"
                  alt="Refresh"
                  className="footer-logo w-50"
                />{" "}
              </div>

              <div className="mobile-footer">
                <details>
                  <summary>INFO</summary>
                  <div className="mobile-footer-content">
                    <ul className="footer-links">
                      <li>
                        <NavLink to="/contactus">Contact Us</NavLink>
                      </li>
                      <li></li>
                      <li>
                        <NavLink to="/faqs">Buyers FAQ</NavLink>
                      </li>
                      <li>
                        <NavLink to="/faqseller">Seller FAQ</NavLink>
                      </li>
                      <li>
                        <NavLink to="/orderhistory">Order History</NavLink>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="footer-link-btn text-dark fw-medium"
                          onClick={() => setShowSellModal(true)}
                        >
                          Sell With Us
                        </button>
                      </li>
                    </ul>
                  </div>
                </details>

                <details>
                  <summary>OUR PROGRAMS</summary>
                  <ul>
                    <li className="footer-links">
                      <NavLink to="#"> E-Gift Voucher</NavLink>
                    </li>
                    <li className="footer-links">
                      <NavLink to="/social-impact"> Social Impact</NavLink>
                    </li>
                    <li className="footer-links">
                      <NavLink to="/careers"> Careers</NavLink>
                    </li>
                  </ul>
                </details>

                <details>
                  <summary>POLICY</summary>
                  <div className="mobile-footer-content">
                    <ul className="footer-links">
                      <li></li>

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
                      <a
                        href="https://www.instagram.com/native91.official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                        target="_blank"
                      >
                        <FaInstagram />
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
        href="https://wa.me/919998323998?text=Hello%20Native91,%20I%20have%20a%20query%20about%20your%20products."
        target="_blank"
        className="whatsapp-btn"
      >
        <FaWhatsapp />
      </a>

      {/* SELL WITH US MODAL */}
      <Modal
        show={showSellModal}
        onHide={closeModal}
        centered
        backdrop="static"
        className="lexend"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sell With Us</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success ? (
            <div className="text-center py-3">
              <h5 className="mb-2">✅ Check your inbox!</h5>
              <p className="mb-0">
                We've sent the seller registration link to{" "}
                <strong>{sellEmail}</strong>.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3">
                Enter your email and we'll send you the seller registration
                link.
              </p>
              <Form onSubmit={handleSellSubmit}>
                <Form.Group controlId="sellEmail" className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={sellEmail}
                    onChange={(e) => {
                      setSellEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    isInvalid={!!emailError}
                    required
                    autoFocus
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {emailError}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  variant="outline-dark"
                  className=""
                  disabled={loading || !sellEmail}
                >
                  {loading ? "Sending..." : "Send Me Link"}
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
        {success && (
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default Footer;
