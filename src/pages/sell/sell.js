import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaStore,
  FaUsers,
  FaLeaf,
  FaShoppingBag,
  FaShieldAlt,
  FaHeadset,
  FaCheckCircle,
  FaQuestion,
} from "react-icons/fa";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./sell.css";
import Pricing from "../../components/pricing/pricing";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

// All available product categories a seller can offer
const PRODUCT_CATEGORIES = [
  "Organic Food & Healthy Snacks",
  "Natural Skin Care & Wellness",
  "Gifts & Hamper",
  "Handmade Home Decor",
  "Sustainable Lifestyle",
  "Jewelry & Accessories",
  "Pet Care",
];

const Sell = () => {
  const { pathname } = useLocation();
  const pricingRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    businessName: "",
    website: "",
    pricingPlan: "", // renamed from the duplicated "category" field
    category: [], // now an array to support multiple selections
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Standard handler for text/select-one inputs
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

  // Handler for the "What do you sell?" checkbox group (multi-select)
  const handleCategoryToggle = (categoryValue) => {
    setFormData((prev) => {
      const alreadySelected = prev.category.includes(categoryValue);
      const updatedCategories = alreadySelected
        ? prev.category.filter((c) => c !== categoryValue)
        : [...prev.category, categoryValue];

      return { ...prev, category: updatedCategories };
    });

    if (validationErrors.category) {
      setValidationErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10 digits";
    }

    if (!formData.businessName.trim()) {
      errors.businessName = "Business/Brand name is required";
    }

    if (!formData.website.trim()) {
      errors.website = "Website or social media link is required";
    }

    if (!formData.pricingPlan) {
      errors.pricingPlan = "Please select a pricing plan";
    }

   if (formData.website.trim()) {
  try {
    const website = formData.website.trim();

    const url = website.startsWith("http://") || website.startsWith("https://")
      ? website
      : `https://${website}`;

    new URL(url);
  } catch (error) {
    errors.website = "Please enter a valid website or social media URL";
  }
}
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Updated endpoint: /api/sellers/register
      const response = await axios.post(`${API_URL}/sellers/register`, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
        businessName: formData.businessName,
        website: formData.website,
        pricingPlan: formData.pricingPlan,
        category: formData.category, // sent as an array; join(", ") here if backend expects a string
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Failed to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <Header />
        <div className="seller-register-section lexend">
          <Container>
            <div className="success-container text-center py-5">
              <FaCheckCircle
                className="success-icon"
                size={80}
                color="#0f5132"
              />
              <h2 className="mt-4">Registration Successful!</h2>
              <p className="mt-3">
                Thank you for registering as a seller on Native91.
              </p>
              <p>
                We have sent a confirmation email to{" "}
                <strong>{formData.email}</strong>. Please check your inbox for
                further instructions.
              </p>
              <Button
                variant="dark"
                className="mt-3 p-2"
                onClick={() => window.location.reload()}
              >
                Register Another Account
              </Button>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      <section className="seller-banner">
        <img
          src="./images/sell.webp"
          alt="Sell Banner"
          className="banner-image"
        />
      </section>

      <section className="seller-register-section lexend">
        <Container>
          <div className="seller-wrapper">
            <Row className="g-0 align-items-center">
              <Col lg={7}>
                <div className="seller-form-box">
                  <h1 className="funnel-sans">Create Your Seller Account</h1>
                  <p>Get started in just a few simple steps.</p>

                  {error && (
                    <Alert
                      variant="danger"
                      onClose={() => setError("")}
                      dismissible
                    >
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        isInvalid={!!validationErrors.fullName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        isInvalid={!!validationErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number *</Form.Label>
                      <div className="phone-input d-flex gap-2">
                        {/* <Form.Select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          style={{ width: "100px" }}
                        >
                          <option value="+91">+91 (IND)</option>
                          <option value="+1">+1 (USA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+61">+61 (AUS)</option>
                        </Form.Select> */}

                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          isInvalid={!!validationErrors.phoneNumber}
                          style={{ flex: 1 }}
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.phoneNumber}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Business / Brand Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Enter your brand or business name"
                        isInvalid={!!validationErrors.businessName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.businessName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4 website-input">
                      <Form.Label>Website / Social Media Links *</Form.Label>
                      <p>
                        If you don’t have a website or social media presence,
                        please share a Google Drive link containing photos of
                        your bestselling products.
                      </p>
                      <Form.Control
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter your website or social media links"
                        isInvalid={!!validationErrors.website}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.website}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">Pricing Plan *</Form.Label>

                        <button
                          type="button"
                          className="view-plan-btn"
                          onClick={() => {
                            pricingRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                        >
                          View Plan
                        </button>
                      </div>
                      <Form.Select
                        name="pricingPlan"
                        value={formData.pricingPlan}
                        onChange={handleChange}
                        isInvalid={!!validationErrors.pricingPlan}
                      >
                        <option value="">Select your Pricing Plan</option>
                        <option value="STARTER">STARTER</option>
                        <option value="GROWTH">GROWTH</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.pricingPlan}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Multi-select "What do you sell?" implemented as a checkbox group.
                        Checkboxes are far more usable than a native <select multiple>,
                        especially on mobile, where ctrl/cmd-click selection doesn't work. */}
                    <Form.Group className="mb-4">
                      <Form.Label>What do you sell? *</Form.Label>
                      <div
                        className={`category-checkbox-group${
                          validationErrors.category ? " is-invalid" : ""
                        }`}
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <Form.Check
                            key={cat}
                            type="checkbox"
                            id={`category-${cat}`}
                            label={cat}
                            checked={formData.category.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            className="mb-2"
                          />
                        ))}
                      </div>
                      {validationErrors.category && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.category}
                        </div>
                      )}
                    </Form.Group>

                    <div className="privacy-note d-flex align-items-center gap-2 mb-4">
                      <FaShieldAlt />
                      <span>
                        We respect your privacy. Your information is safe with
                        us.
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="create-btn w-100"
                      disabled={loading}
                      style={{ padding: "12px" }}
                    >
                      {loading ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Create My Account"
                      )}
                    </Button>

                    <div className="signin-text text-center mt-3">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        style={{
                          textDecoration: "none",
                          color: "#b08d57",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Sign in
                      </Link>
                    </div>
                  </Form>
                </div>
              </Col>

              <Col lg={5}>
                <div className="seller-info-box p-4">
                  <div className="top-icon mb-3">
                    <FaStore size={40} />
                  </div>

                  <h2 className="mb-4">Why sell on Native91?</h2>

                  <div className="info-item d-flex gap-3 mb-4">
                    <div className="icon-box-ordercomplate">
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <h5>Invite-only marketplace</h5>
                      <p>Reserved exclusively for exceptional brands</p>
                    </div>
                  </div>

                  <div className="info-item d-flex gap-3 mb-4">
                    <div className="icon-box-ordercomplate">
                      <FaLeaf size={24} />
                    </div>
                    <div>
                      <h5>Curated to maintain quality</h5>
                      <p>Carefully selected brands and products</p>
                    </div>
                  </div>

                  <div className="info-item d-flex gap-3 mb-4">
                    <div className="icon-box-ordercomplate">
                      <FaShoppingBag size={24} />
                    </div>
                    <div>
                      <h5>Better visibility for selected brands</h5>
                      <p>Reach customers with enhanced exposure</p>
                    </div>
                  </div>

                  <div className="info-item d-flex gap-3 mb-4">
                    <div className="icon-box-ordercomplate">
                      <FaShieldAlt size={24} />
                    </div>
                    <div>
                      <h5>Founding Seller benefits available</h5>
                      <p>Unlock exclusive early seller advantages</p>
                    </div>
                  </div>

                  <div className="support-card d-flex gap-3 p-3 bg-light rounded mt-4">
                    <FaHeadset size={30} />
                    <div>
                      <h5>Need help getting started?</h5>
                      <p>Our team is here for you.</p>
                      <a href="/contactus">Contact Support →</a>
                    </div>
                  </div>

                  <div className="support-card d-flex gap-3 p-3 bg-light rounded mt-4">
                    <FaQuestion size={30} />
                    <div>
                      <h5>Frequently Asked Questions for Sellers</h5>
                      {/* <p>Our team is here for you.</p> */}
                      <a
                        href="https://faqs.native91.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        FAQs for Seller →
                      </a>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <div ref={pricingRef}>
        <Pricing />
      </div>

      <Footer />
    </div>
  );
};

export default Sell;
