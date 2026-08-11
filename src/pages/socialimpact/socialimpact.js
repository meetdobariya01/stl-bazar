import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import {
  FaHandsHelping,
  FaLeaf,
  FaUsers,
  FaHeart,
  FaPalette,
  FaHome,
  FaShoppingBag,
  FaGift,
  FaCheckCircle,
} from "react-icons/fa";
import "./socialimpact.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const categoriesData = [
  {
    icon: <FaHeart />,
    title: "Handmade Products",
    desc: "Created through traditional craftsmanship and community skills.",
  },
  {
    icon: <FaPalette />,
    title: "Art & Craft",
    desc: "Meaningful creations that celebrate creativity, culture and heritage.",
  },
  {
    icon: <FaShoppingBag />,
    title: "Food & Gourmet",
    desc: "Thoughtfully made food products created through community or livelihood initiatives.",
  },
  {
    icon: <FaHome />,
    title: "Home Décor",
    desc: "Beautiful products that bring craftsmanship and purpose into everyday spaces.",
  },
  {
    icon: <FaLeaf />,
    title: "Sustainable Products",
    desc: "Created with a focus on responsible materials, reuse and sustainability.",
  },
  {
    icon: <FaGift />,
    title: "Gifts & Hampers",
    desc: "Purposeful gifting options that allow customers to support a meaningful cause.",
  },
  {
    icon: <FaUsers />,
    title: "Community-Made Products",
    desc: "Products created by communities as part of livelihood and social development programs.",
  },
];

const faqsData = [
  {
    question: "What is the Native91 Social Impact Initiative?",
    answer:
      "The initiative provides selected NGOs and eligible purpose-led organizations with an opportunity to showcase and sell their products through the Native91 curated marketplace.",
  },
  {
    question: "Is there a commission on NGO sales?",
    answer:
      "Native91 takes 0% commission on eligible NGO product sales under the Social Impact Initiative. The entire value goes toward your organization's mission.",
  },
  {
    question: "What types of NGOs can apply?",
    answer:
      "NGOs and eligible organizations that create, source or develop products as part of livelihood, fundraising, community development or other social initiatives are encouraged to apply.",
  },
  {
    question: "What products can be listed?",
    answer:
      "We are open to a variety of meaningful products, including handmade products, art and craft, food and gourmet products, home décor, sustainable products, gifts, hampers and community-made products.",
  },
  {
    question: "Are all applications accepted?",
    answer:
      "Native91 follows a curation process to ensure participating products meet the marketplace's quality, presentation and category standards.",
  },
  {
    question: "How can an NGO participate?",
    answer:
      "Submit an NGO invitation request with details about your organization and products. Our team will review the information and get in touch with the next steps.",
  },
];

const Socialimpact = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    organizationName: "",
    category: "",
    causeDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be a 10-digit number";
    }
    if (!formData.organizationName.trim()) {
      errors.organizationName = "Organization name is required";
    }
    if (!formData.category) {
      errors.category = "Please select a product category";
    }
    if (!formData.causeDescription.trim()) {
      errors.causeDescription =
        "Please describe the cause or mission supported";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/ngos/register`, formData);
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("NGO registration error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <div className="social-impact-page lexend">
      <Header />

      {/* Hero Section */}
      <section className="si-hero text-center">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="si-hero-content"
          >
            <span className="si-badge">Social Impact Initiative</span>
            <h1>Good Products. Greater Purpose.</h1>
            <h2>
              At Native91, we believe a product can do more than create value
              for the buyer.
            </h2>
            <div className="si-gold-divider"></div>
            <p className="si-hero-desc">
              It can create livelihoods. Support communities. Preserve
              traditional skills. And contribute to a cause that matters. We are
              opening our curated marketplace to selected NGOs and purpose-led
              organizations.
            </p>
            <div className="si-hero-actions">
              <NavLink to="/sell" className="si-btn si-btn-gold">
                Partner With Native91
              </NavLink>
              <button
                onClick={() => scrollToSection("why-section")}
                className="si-btn si-btn-outline"
              >
                Explore the Initiative
              </button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Why Section */}
      <section id="why-section" className="si-why-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="si-section-header">
                  <h6>Why We Are Doing This</h6>
                  <h2>Commerce Can Create Impact Beyond Commerce.</h2>
                </div>
                <p className="si-why-text">
                  Across India, NGOs and community organizations create products
                  that carry stories, skills and purpose. From handmade crafts
                  and sustainable products to food, home décor and
                  community-made goods, these products represent much more than
                  meets the eye.
                </p>
                <p className="si-why-text mt-3">
                  Yet, reaching the right customers can be challenging. Native91
                  wants to help bridge that gap by bringing selected NGO-created
                  products onto a curated marketplace, making them easier to
                  discover while creating another avenue for organizations to
                  generate revenue for their missions.
                </p>
              </motion.div>
            </Col>
            <Col lg={6} className="mt-5 mt-lg-0">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="ps-lg-5"
              >
                <div className="si-highlight-quote">
                  "A marketplace where purpose meets discovery."
                </div>
                <p className="si-why-text">
                  We bring the same thoughtful shopping experience Native91 is
                  known for to products created through meaningful social
                  initiatives.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* What We Provide Section */}
      <section className="si-provides-section">
        <Container>
          <div className="si-section-header text-center">
            <h6>What Native91 Provides</h6>
            <h2>More Visibility. More Access. More Opportunity.</h2>
          </div>
          <Row className="g-4">
            {[
              {
                num: "01",
                title: "Be Discovered",
                desc: "Introduce your products to customers beyond your existing network through a curated marketplace built around discovery.",
              },
              {
                num: "02",
                title: "Sell Online",
                desc: "Get access to a digital marketplace and a premium customer experience without having to build and manage an entire online storefront yourself.",
              },
              {
                num: "03",
                title: "Keep More",
                desc: "As part of our Social Impact Initiative, Native91 takes 0% commission on eligible NGO product sales.",
              },
              {
                num: "04",
                title: "Tell Your Story",
                desc: "We help present the story, craftsmanship and purpose behind your products so customers can understand the impact behind their purchase.",
              },
            ].map((item, idx) => (
              <Col md={6} lg={3} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="si-provide-card"
                >
                  <div className="si-card-num">{item.num}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Our Commitment */}
      <section className="si-commitment-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="si-commitment-box"
          >
            <h6
              className="text-uppercase text-center mb-3"
              style={{ letterSpacing: "3px", color: "#c8a96b" }}
            >
              Our Commitment
            </h6>
            <h2>0% Commission for Eligible NGO Sales.</h2>
            <div className="si-gold-divider"></div>
            <p className="si-stat-desc">
              We believe the value created through your products should
              contribute to the work you are doing. That's why Native91 takes
              zero commission from eligible NGO sales under this initiative.
            </p>
            <div className="si-stat-large">0%</div>
            <div className="si-stat-title">Native91 Commission</div>
            <p className="si-stat-desc">On eligible NGO product sales.</p>
            <p className="si-stat-disclaimer">
              *No profit share is taken by Native91 from eligible NGO product
              sales under the Social Impact Initiative.*
            </p>
          </motion.div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="si-how-section">
        <Container>
          <div className="si-section-header text-center">
            <h6>Simple & Transparent</h6>
            <h2>How It Works</h2>
          </div>
          <div className="si-timeline-row">
            {[
              {
                step: "STEP 01",
                title: "Apply",
                desc: "Tell us about your organization, the products you create and the communities or causes you support.",
              },
              {
                step: "STEP 02",
                title: "Curate",
                desc: "Our team reviews your organization and products to ensure they align with the Native91 marketplace and customer experience.",
              },
              {
                step: "STEP 03",
                title: "Go Live",
                desc: "Once selected, your approved products are presented through the Native91 marketplace with thoughtful product storytelling.",
              },
              {
                step: "STEP 04",
                title: "Grow",
                desc: "Reach new customers, generate product sales and create an additional channel to support your organization's mission.",
              },
            ].map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="si-timeline-item"
                key={idx}
              >
                <div className="si-step-circle">{item.step}</div>
                <h4 className="si-step-title">{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who Can Participate & Product Categories */}
      <section className="si-criteria-section">
        <Container>
          <Row className="g-5">
            <Col lg={5}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="si-section-header">
                  <h6>Eligibility</h6>
                  <h2>Who Can Participate?</h2>
                </div>
                <p className="mb-4">
                  The Native91 Social Impact Initiative is designed for NGOs and
                  eligible purpose-led organizations that create, source or
                  develop products as part of their programs:
                </p>
                <ul className="si-criteria-list">
                  <li>Livelihood & Skill development programs</li>
                  <li>Artisan development & Women empowerment</li>
                  <li>Community & Rural development initiatives</li>
                  <li>Sustainability initiatives & Fundraising activities</li>
                </ul>
              </motion.div>
            </Col>
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="si-section-header">
                  <h6>Product Curation</h6>
                  <h2>Eligible Categories</h2>
                </div>
                <div className="si-category-grid">
                  {categoriesData.map((cat, idx) => (
                    <div className="si-category-card" key={idx}>
                      <div className="si-category-icon">{cat.icon}</div>
                      <h5>{cat.title}</h5>
                      <p>{cat.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Story Separator */}
      <section className="si-quote-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="si-quote-box"
          >
            <blockquote>
              "When a product carries a purpose,{" "}
              <span>the right customer should be able to find it.</span>"
            </blockquote>
            <p>
              Native91 — Supporting homegrown brands, communities and meaningful
              causes.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Registration Request Form */}
      {/* <section id="ngo-form" className="si-form-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="si-form-container"
          >
            {success ? (
              <div className="si-success-box">
                <FaCheckCircle className="si-success-icon" />
                <h3>Application Submitted!</h3>
                <p className="mt-3">
                  Thank you for applying to the Native91 Social Impact Initiative.
                </p>
                <p>
                  A confirmation email has been sent to <strong>{formData.email}</strong>. Our curation team will review your application and get in touch with you shortly.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      phoneNumber: "",
                      organizationName: "",
                      category: "",
                      causeDescription: ""
                    });
                  }}
                  className="si-btn si-btn-gold mt-4"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div>
                <h3>Request an NGO Invitation</h3>
                <p>Tell us about your organization, products, and the cause you support.</p>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="si-form-group">
                        <label className="si-form-label">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="si-form-input"
                          placeholder="Your full name"
                        />
                        {validationErrors.fullName && (
                          <div className="si-form-error">{validationErrors.fullName}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="si-form-group">
                        <label className="si-form-label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="si-form-input"
                          placeholder="Your work email"
                        />
                        {validationErrors.email && (
                          <div className="si-form-error">{validationErrors.email}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="si-form-group">
                        <label className="si-form-label">Phone Number *</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="si-form-input"
                          placeholder="10-digit mobile number"
                        />
                        {validationErrors.phoneNumber && (
                          <div className="si-form-error">{validationErrors.phoneNumber}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="si-form-group">
                        <label className="si-form-label">Organization Name *</label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          className="si-form-input"
                          placeholder="NGO / Organization name"
                        />
                        {validationErrors.organizationName && (
                          <div className="si-form-error">{validationErrors.organizationName}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="si-form-group">
                    <label className="si-form-label">Product Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="si-form-input si-form-select"
                    >
                      <option value="">Select your primary product category</option>
                      <option value="Handmade Products">Handmade Products</option>
                      <option value="Art & Craft">Art & Craft</option>
                      <option value="Food & Gourmet">Food & Gourmet</option>
                      <option value="Home Décor">Home Décor</option>
                      <option value="Sustainable Products">Sustainable Products</option>
                      <option value="Gifts & Hampers">Gifts & Hampers</option>
                      <option value="Community-Made Products">Community-Made Products</option>
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.category && (
                      <div className="si-form-error">{validationErrors.category}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="si-form-group">
                    <label className="si-form-label">Cause / Mission Supported *</label>
                    <textarea
                      name="causeDescription"
                      value={formData.causeDescription}
                      onChange={handleChange}
                      rows="4"
                      className="si-form-input"
                      placeholder="Briefly describe the livelihood program or community cause your products support..."
                    />
                    {validationErrors.causeDescription && (
                      <div className="si-form-error">{validationErrors.causeDescription}</div>
                    )}
                  </Form.Group>

                  <div className="text-center mt-4">
                    <button type="submit" className="si-btn si-btn-gold" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        "Request Invitation"
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            )}
          </motion.div>
        </Container>
      </section> */}

      {/* FAQ Section */}
      <section className="si-faq-section">
        <Container>
          <div className="si-section-header text-center">
            <h6>Got Questions?</h6>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="si-faq-wrapper">
            {faqsData.map((faq, index) => (
              <div
                className={`si-faq-item ${activeFaqIndex === index ? "active" : ""}`}
                key={index}
                onClick={() => toggleFaq(index)}
              >
                <div className="si-faq-header">
                  <span>{faq.question}</span>
                  <span className="si-faq-toggle">+</span>
                </div>
                <AnimatePresence initial={false}>
                  {activeFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="si-faq-body"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section
        className="cta-section py-5 text-center text-white"
        style={{ background: "#08281f" }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Let's Create Impact Through Commerce.</h2>
            <h5 className="mt-3" style={{ color: "#c8a96b" }}>
              Your Products. Your Purpose. A Wider Audience.
            </h5>
            <p className="mt-3">
              If your organization creates products that create meaningful
              impact, we'd love to explore what we can build together.
            </p>
            <NavLink to="/sell" className="si-btn si-btn-gold mt-4">
              Request an NGO Invitation
            </NavLink>
          </motion.div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Socialimpact;
