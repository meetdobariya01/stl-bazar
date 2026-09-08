import React, { useState, useEffect, useRef } from "react";
import { useLocation, NavLink  } from "react-router-dom";
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
  FaEnvelope,
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
  "Kids Fashion & Toys",
  "Desk Essentials",
];

// ============================================================
// OTP VERIFICATION COMPONENT (inline for simplicity)
// ============================================================
const OTPVerification = ({
  tempId,
  onVerificationComplete,
  onSkip,
  onResendOTP,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  // Start timer
  useEffect(() => {
    if (timeLeft > 0 && !success) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, success]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/sellers/verify-otp`, {
        tempId,
        otp: otpString,
      });

      if (response.data.success) {
        setSuccess(true);
        if (onVerificationComplete) {
          onVerificationComplete(response.data.data);
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");
    setResendCooldown(60);
    setCanResend(false);

    try {
      if (onResendOTP) {
        await onResendOTP(tempId);
      } else {
        const response = await axios.post(`${API_URL}/sellers/resend-otp`, {
          tempId,
        });

        if (response.data.success) {
          setTimeLeft(600);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setError("");
        }
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setIsResending(false);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (success) {
    return (
      <div className="otp-success text-center p-4">
        <FaCheckCircle size={60} color="#0f5132" />
        <h4 className="mt-3">Email Verified!</h4>
        <p className="text-muted">
          Your email address has been verified successfully.
        </p>
        <Button variant="dark" onClick={() => onSkip?.()}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="otp-verification p-4">
      <div className="text-center mb-3">
        <FaEnvelope size={40} color="#073f31" />
        <h5 className="mt-2">Check Your Email</h5>
        <p className="text-muted small">
          We've sent a 6-digit verification code to your email.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <div className="otp-input-group d-flex justify-content-center gap-2 my-4">
        {otp.map((digit, index) => (
          <Form.Control
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="otp-input text-center"
            style={{
              width: "50px",
              height: "60px",
              fontSize: "24px",
              fontWeight: "bold",
              border: error ? "2px solid #dc3545" : "2px solid #dee2e6",
              borderRadius: "8px",
              backgroundColor: digit ? "#f8f9fa" : "white",
            }}
            disabled={loading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="timer text-muted small">
          <span className="me-1">⏱</span>
          {formatTime(timeLeft)} remaining
        </div>
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none"
          onClick={handleResend}
          disabled={!canResend || loading || isResending}
          style={{ fontSize: "14px", color: "#073f31" }}
        >
          {isResending ? (
            <Spinner size="sm" animation="border" />
          ) : canResend ? (
            "Resend OTP"
          ) : (
            `Resend in ${resendCooldown}s`
          )}
        </button>
      </div>

      <Button
        variant="dark"
        className="w-100"
        onClick={handleVerify}
        disabled={loading || otp.some((digit) => digit === "")}
        style={{ padding: "12px" }}
      >
        {loading ? (
          <Spinner size="sm" animation="border" />
        ) : (
          "Verify Phone Number"
        )}
      </Button>

      <div className="text-center mt-3">
        {/* <button
          type="button"
          className="btn btn-link text-muted p-0"
          onClick={() => onSkip?.()}
          style={{ fontSize: '13px' }}
        >
          Skip for now (verify later)
        </button> */}
      </div>

      <div className="text-center mt-3">
        <small className="text-muted">
          Didn't receive the email? Check your spam folder.
        </small>
      </div>
    </div>
  );
};

// ============================================================
// MAIN SELL COMPONENT
// ============================================================
const Sell = () => {
  const { pathname } = useLocation();
  const pricingRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    businessName: "",
    website: "",
    pricingPlan: "",
    category: [],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // OTP State
  const [tempId, setTempId] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isCompletingRegistration, setIsCompletingRegistration] =
    useState(false);

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

  // Handler for category checkboxes
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

    if (formData.category.length === 0) {
      errors.category = "Please select at least one category";
    }

    if (formData.website.trim()) {
      try {
        const website = formData.website.trim();
        const url =
          website.startsWith("http://") || website.startsWith("https://")
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

  // ============================================================
  // HANDLE REGISTRATION SUBMIT (Step 1: Send OTP)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Send OTP without creating seller
      const response = await axios.post(`${API_URL}/sellers/send-otp`, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
        businessName: formData.businessName,
        website: formData.website,
        pricingPlan: formData.pricingPlan,
        category: formData.category,
      });

      console.log("OTP send response:", response.data);

      if (response.data.success) {
        // Store the temp registration ID
        setTempId(response.data.data.tempId);
        setRegistrationData(response.data.data);
        setShowOTP(true);
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OTP VERIFICATION COMPLETE (Step 2: Complete Registration)
  // ============================================================
  const handleOTPVerificationComplete = async (data) => {
    setIsCompletingRegistration(true);
    setError("");

    try {
      // Step 2: Complete registration after OTP verification
      const response = await axios.post(
        `${API_URL}/sellers/complete-registration`,
        {
          tempId: tempId,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
          businessName: formData.businessName,
          website: formData.website,
          pricingPlan: formData.pricingPlan,
          category: formData.category,
        },
      );

      if (response.data.success) {
        setOtpVerified(true);
        setSuccess(true);
        setShowOTP(false);
        setRegistrationData(response.data.data);
      }
    } catch (err) {
      console.error("Registration completion error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to complete registration. Please try again.",
      );
      // If registration fails, go back to form
      setShowOTP(false);
    } finally {
      setIsCompletingRegistration(false);
    }
  };

  // ============================================================
  // SKIP OTP (verify later)
  // ============================================================
  const handleSkipOTP = () => {
    setShowOTP(false);
    setSuccess(true);
  };

  // ============================================================
  // HANDLE RESEND OTP
  // ============================================================
  const handleResendOTP = async (tempId) => {
    const response = await axios.post(`${API_URL}/sellers/resend-otp`, {
      tempId,
    });
    return response.data;
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
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
              {otpVerified && (
                <div className="otp-verified-badge mt-2">
                  <FaCheckCircle size={20} color="#0f5132" className="me-2" />
                  <span style={{ color: "#0f5132", fontWeight: "600" }}>
                    Email Verified ✓
                  </span>
                </div>
              )}
              <p className="mt-3">
                We have sent a confirmation email to{" "}
                <strong>{formData.email}</strong>. Please check your inbox for
                further instructions.
              </p>
              {registrationData?.trackingId && (
                <p className="text-muted small">
                  Your Application ID:{" "}
                  <strong>{registrationData.trackingId}</strong>
                </p>
              )}
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

  // ============================================================
  // OTP VERIFICATION SCREEN
  // ============================================================
  if (showOTP) {
    return (
      <div>
        <Header />
        <div className="seller-register-section lexend">
          <Container>
            <div className="seller-wrapper">
              <Row className="g-0 align-items-center">
                <Col lg={7}>
                  <div className="seller-form-box">
                    <h1 className="funnel-sans">Verify Your Email Address</h1>
                    <p>We've sent a 6-digit verification code to your email.</p>

                    {error && (
                      <Alert
                        variant="danger"
                        onClose={() => setError("")}
                        dismissible
                      >
                        {error}
                      </Alert>
                    )}

                    <OTPVerification
                      tempId={tempId}
                      onVerificationComplete={handleOTPVerificationComplete}
                      onSkip={handleSkipOTP}
                      onResendOTP={handleResendOTP}
                    />

                    {isCompletingRegistration && (
                      <div className="text-center mt-3">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2">Completing registration...</span>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <p className="text-muted small">
                        Having trouble? Contact us at{" "}
                        <a href="mailto:support@native91.com">
                          support@native91.com
                        </a>
                      </p>
                    </div>
                  </div>
                </Col>

                <Col lg={5}>
                  <div className="seller-info-box p-4">
                    <div className="top-icon mb-3">
                      <FaStore size={40} />
                    </div>
                    <h2 className="mb-4">Why verify your email?</h2>
                    <div className="info-item d-flex gap-3 mb-4">
                      <div className="icon-box-ordercomplate">
                        <FaShieldAlt size={24} />
                      </div>
                      <div>
                        <h5>Enhanced Security</h5>
                        <p>Protect your account with two-factor verification</p>
                      </div>
                    </div>
                    <div className="info-item d-flex gap-3 mb-4">
                      <div className="icon-box-ordercomplate">
                        <FaCheckCircle size={24} />
                      </div>
                      <div>
                        <p>Verified sellers build more trust with customers</p>
                      </div>
                    </div>
                    <div className="info-item d-flex gap-3 mb-4">
                      <div className="icon-box-ordercomplate">
                        <FaHeadset size={24} />
                      </div>
                      <div>
                        <h5>Priority Support</h5>
                        <p>Get faster assistance with verified accounts</p>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================================================
  // REGISTRATION FORM
  // ============================================================
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
                      <Form.Label>Your Full Name *</Form.Label>
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
                      <Form.Text className="text-muted">
                        We'll send a verification code to this email via email.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number *</Form.Label>
                      <div className="phone-input d-flex gap-2">
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
                        If you don't have a website or social media presence,
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

                    <div className="privacy-note d-flex align-items-center gap-2">
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
                        "Send OTP & Create Account"
                      )}
                    </Button>
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
                      <NavLink to="/faqseller" className="your-class-name">
                        FAQs for Seller →
                      </NavLink>
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
