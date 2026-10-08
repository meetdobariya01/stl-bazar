import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaArrowRight,
  FaUsers,
  FaLightbulb,
  FaLeaf,
  FaHeart,
  FaTimes,
  FaUpload,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import "./careers.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL =
  process.env.REACT_APP_API_URL || "https://api-admin.native91.com";

/* =========================================================
   STATIC DATA
========================================================= */

const jobs = [
  {
    title: "Content Writer Intern",
    type: "INTERNSHIP",
    location: "REMOTE",
    description:
      "Help tell the stories behind the brands, products and people on Native91.",
    image: "./images/content-writer.webp",
    responsibilities: [
      "Write engaging content",
      "Create product & brand stories",
      "Social media captions",
      "Blog and campaign copy",
      "Research trends",
    ],
  },
  {
    title: "Social Media Intern",
    type: "INTERNSHIP",
    location: "REMOTE",
    description:
      "Help build the Native91 community and bring remarkable brands to life online.",
    image: "./images/social-media.webp",
    responsibilities: [
      "Create reels, posts & stories",
      "Manage the content calendar",
      "Spot trends and creators",
      "Showcase Native91 brands",
      "Engage with our community",
    ],
  },
];

const benefits = [
  {
    icon: <FaUsers />,
    title: "LEARN",
    description: (
      <>
        Directly from
        <br />
        founders
      </>
    ),
  },
  {
    icon: <FaLightbulb />,
    title: "CREATE",
    description: (
      <>
        For real brands
        <br />
        and creators
      </>
    ),
  },
  {
    icon: <FaLeaf />,
    title: "EXPERIENCE",
    description: (
      <>
        Hands-on
        <br />
        startup exposure
      </>
    ),
  },
  {
    icon: <FaHeart />,
    title: "BELONG",
    description: (
      <>
        Be part of something
        <br />
        meaningful
      </>
    ),
  },
];

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

/* =========================================================
   CAREERS COMPONENT
========================================================= */

const Careers = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  /* =========================================================
     MODAL STATE
  ========================================================= */

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  /* =========================================================
     SUBMISSION STATE
  ========================================================= */

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [submitMessage, setSubmitMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  /* =========================================================
     OPEN MODAL
  ========================================================= */

  const openApplicationModal = (role = "") => {
    setSelectedRole(role);
    setShowApplicationModal(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    setFieldErrors({});
    setResumeFile(null);
    document.body.style.overflow = "hidden";
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeApplicationModal = () => {
    if (submitting) return; // prevent closing during submit
    setShowApplicationModal(false);
    setSelectedRole("");
    setResumeFile(null);
    setSubmitStatus(null);
    setSubmitMessage("");
    setFieldErrors({});
    document.body.style.overflow = "auto";
  };

  /* =========================================================
     ROLE CHANGE
  ========================================================= */

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    if (fieldErrors.applyingFor) {
      setFieldErrors((prev) => ({ ...prev, applyingFor: null }));
    }
  };

  /* =========================================================
     FILE CHANGE
  ========================================================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setResumeFile(null);
      return;
    }

    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setSubmitStatus("error");
      setSubmitMessage("Only PDF, DOC, or DOCX files are allowed.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSubmitStatus("error");
      setSubmitMessage("File is too large. Maximum size is 5 MB.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }

    setSubmitStatus(null);
    setSubmitMessage("");
    setResumeFile(file);
  };

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    setFieldErrors({});

    const formData = new FormData(e.target);

    try {
      const response = await fetch(`${API_URL}/careers/apply`, {
        method: "POST",
        body: formData,
        // ⚠️ Do NOT set Content-Type — browser sets it with the multipart boundary
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle express-validator field errors
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const errorsMap = {};
          data.errors.forEach((err) => {
            errorsMap[err.field] = err.message;
          });
          setFieldErrors(errorsMap);
          setSubmitStatus("error");
          setSubmitMessage("Please fix the highlighted fields.");
        } else {
          setSubmitStatus("error");
          setSubmitMessage(data.message || "Submission failed. Please try again.");
        }
        return;
      }

      setSubmitStatus("success");
      setSubmitMessage(
        data.message ||
          "Application submitted successfully! We'll be in touch soon."
      );

      e.target.reset();
      setResumeFile(null);

      // Auto-close modal after 2.5s on success
      setTimeout(() => {
        setShowApplicationModal(false);
        document.body.style.overflow = "auto";
        setSubmitStatus(null);
        setSubmitMessage("");
      }, 2500);
    } catch (error) {
      console.error("Application submit error:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     ESC KEY + CLEANUP
  ========================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showApplicationModal && !submitting) {
        closeApplicationModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showApplicationModal, submitting]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="lexend">
      <Header />

      {/* =====================================================
          CAREERS HERO SECTION
      ===================================================== */}

      <section className="careers-section">
        <Container fluid className="p-0">
          <Row className="g-0 align-items-stretch">
            <Col lg={6} md={6} className="careers-content-col">
              <motion.div
                className="careers-content"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div
                  className="careers-label"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  CAREERS AT NATIVE91
                </motion.div>

                <div className="careers-line"></div>

                <motion.h1
                  className="careers-title"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  viewport={{ once: true }}
                >
                  Build what
                  <br />
                  matters.
                  <br />
                  <span>Grow together.</span>
                </motion.h1>

                <motion.div
                  className="careers-description"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p>
                    At Native91, we are building a curated marketplace for
                    exceptional Indian brands. We are a small, passionate team
                    on a big mission - to support remarkable brands, celebrate
                    Indian craftsmanship and create a more thoughtful way to
                    shop.
                  </p>

                  <p>
                    If you are curious, creative and excited about meaningful
                    work, we would love to have you on this journey.
                  </p>
                </motion.div>
              </motion.div>
            </Col>

            <Col lg={6} md={6} className="careers-image-col">
              <motion.div
                className="careers-image-wrapper"
                initial={{ opacity: 0, scale: 1.05 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <img
                  src="./images/careers.webp"
                  alt="Careers at Native91"
                  className="careers-image"
                />
                <div className="careers-image-overlay"></div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* =====================================================
          OPEN POSITIONS SECTION
      ===================================================== */}

      <section className="open-positions-section">
        <Container className="open-positions-container">
          <motion.div
            className="open-positions-header"
            initial={{ opacity: 0, y: -35 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="open-position-label">OPEN POSITIONS</div>
            <div className="open-position-line"></div>

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              viewport={{ once: true }}
            >
              Join our growing team
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
            >
              We're looking for curious people who want to build, learn and make
              an impact.
            </motion.p>
          </motion.div>

          <Row className="g-4">
            {jobs.map((job, index) => (
              <Col lg={6} key={job.title}>
                <motion.div
                  className="job-card"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="job-image-wrapper">
                    <motion.img
                      src={job.image}
                      alt={job.title}
                      className="job-image"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="job-content">
                    <h3>{job.title}</h3>

                    <div className="job-meta">
                      <span>{job.type}</span>
                      <i>|</i>
                      <span>{job.location}</span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-divider"></div>

                    <h4>What you'll work on</h4>

                    <ul className="job-responsibilities">
                      {job.responsibilities.map(
                        (responsibility, responsibilityIndex) => (
                          <motion.li
                            key={responsibility}
                            initial={{ opacity: 0, x: -15 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.35 + responsibilityIndex * 0.08,
                            }}
                            viewport={{ once: true }}
                          >
                            <span className="check-icon">
                              <FaCheck />
                            </span>
                            <span>{responsibility}</span>
                          </motion.li>
                        )
                      )}
                    </ul>

                    <motion.button
                      type="button"
                      className="apply-job-btn"
                      onClick={() => openApplicationModal(job.title)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>APPLY NOW</span>
                      <FaArrowRight />
                    </motion.button>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* =====================================================
          WHY NATIVE91 SECTION
      ===================================================== */}

      <section className="why-native-section">
        <Container fluid className="why-native-container">
          <Row className="align-items-center g-0">
            <Col lg={3} md={12} className="why-native-intro">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="why-native-label">WHY NATIVE91</div>
                <div className="why-native-line"></div>
                <h2>
                  More than
                  <br />
                  just a job.
                </h2>
              </motion.div>
            </Col>

            <Col lg={9} md={12}>
              <Row className="why-native-benefits g-0">
                {benefits.map((item, index) => (
                  <Col lg={3} md={6} sm={6} xs={6} key={item.title}>
                    <motion.div
                      className="why-native-item"
                      initial={{ opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.15,
                        ease: "easeOut",
                      }}
                      viewport={{ once: true, amount: 0.25 }}
                      whileHover={{ y: -5 }}
                    >
                      <motion.div
                        className="why-native-icon"
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.15 + index * 0.15,
                        }}
                        viewport={{ once: true }}
                      >
                        {item.icon}
                      </motion.div>

                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* =====================================================
          SHARE PROFILE SECTION
      ===================================================== */}

      <section
        className="share-profile-section"
        style={{
          backgroundImage: "url('./images/careers-banner.webp')",
        }}
      >
        <div className="share-profile-overlay"></div>

        <Container fluid className="share-profile-container">
          <motion.div
            className="share-profile-content"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              viewport={{ once: true }}
            >
              Don't see the right role?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              We're always interested in meeting curious, talented people who
              believe in what Native91 is building.
            </motion.p>

            <motion.button
              type="button"
              className="share-profile-btn"
              onClick={() => openApplicationModal("")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>SHARE YOUR PROFILE</span>
              <FaArrowRight />
            </motion.button>
          </motion.div>
        </Container>
      </section>

      {/* =====================================================
          APPLICATION MODAL
      ===================================================== */}

      <AnimatePresence>
        {showApplicationModal && (
          <motion.div
            className="application-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeApplicationModal}
          >
            <motion.div
              className="application-modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="application-modal-close"
                onClick={closeApplicationModal}
                aria-label="Close application form"
                disabled={submitting}
              >
                <FaTimes />
              </button>

              <div className="application-modal-header">
                <div className="application-modal-label">NATIVE91 CAREERS</div>
                <div className="application-modal-line"></div>
                <h2>Share Your Profile</h2>
                <p>
                  We're always excited to meet curious, creative people who want
                  to be part of Native91. Fill in your details and we'll be in
                  touch.
                </p>
              </div>

              {/* ==============================================
                  STATUS BANNER
              ============================================== */}

              <AnimatePresence>
                {submitStatus && (
                  <motion.div
                    className={`application-status-banner ${submitStatus}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="application-status-icon">
                      {submitStatus === "success" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaExclamationCircle />
                      )}
                    </span>
                    <span>{submitMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                className="application-form"
                onSubmit={handleApplicationSubmit}
                noValidate
              >
                {/* FULL NAME */}

                <div className="application-field full-width">
                  <label htmlFor="fullName">
                    FULL NAME <span>*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    disabled={submitting}
                    className={fieldErrors.fullName ? "input-error" : ""}
                  />
                  {fieldErrors.fullName && (
                    <small className="field-error-message">
                      {fieldErrors.fullName}
                    </small>
                  )}
                </div>

                {/* EMAIL + PHONE */}

                <div className="application-form-row">
                  <div className="application-field">
                    <label htmlFor="email">
                      EMAIL ADDRESS <span>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={submitting}
                      className={fieldErrors.email ? "input-error" : ""}
                    />
                    {fieldErrors.email && (
                      <small className="field-error-message">
                        {fieldErrors.email}
                      </small>
                    )}
                  </div>

                  <div className="application-field">
                    <label htmlFor="phone">
                      PHONE NUMBER <span>*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      required
                      disabled={submitting}
                      className={fieldErrors.phone ? "input-error" : ""}
                    />
                    {fieldErrors.phone && (
                      <small className="field-error-message">
                        {fieldErrors.phone}
                      </small>
                    )}
                  </div>
                </div>

                {/* APPLYING FOR */}

                <div className="application-field full-width">
                  <label htmlFor="applyingFor">
                    APPLYING FOR <span>*</span>
                  </label>
                  <select
                    id="applyingFor"
                    name="applyingFor"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    required
                    disabled={submitting}
                    className={fieldErrors.applyingFor ? "input-error" : ""}
                  >
                    <option value="">Select a role</option>
                    {jobs.map((job) => (
                      <option key={job.title} value={job.title}>
                        {job.title}
                      </option>
                    ))}
                    <option value="General / Other">Other</option>
                  </select>
                  {fieldErrors.applyingFor && (
                    <small className="field-error-message">
                      {fieldErrors.applyingFor}
                    </small>
                  )}
                </div>

                {/* SOCIAL PROFILE */}

                <div className="application-field full-width">
                  <label htmlFor="socialProfile">
                    LINKEDIN / GITHUB <small>(OPTIONAL)</small>
                  </label>
                  <input
                    id="socialProfile"
                    type="url"
                    name="socialProfile"
                    placeholder="https://"
                    disabled={submitting}
                    className={fieldErrors.socialProfile ? "input-error" : ""}
                  />
                  {fieldErrors.socialProfile && (
                    <small className="field-error-message">
                      {fieldErrors.socialProfile}
                    </small>
                  )}
                </div>

                {/* RESUME */}

                <div className="application-field full-width">
                  <label htmlFor="resume-upload">
                    RESUME / PORTFOLIO <span>*</span>
                  </label>

                  <label
                    htmlFor="resume-upload"
                    className={`resume-upload-box ${
                      resumeFile ? "has-file" : ""
                    } ${submitting ? "disabled" : ""}`}
                  >
                    <div className="resume-upload-icon">
                      <FaUpload />
                    </div>

                    <div className="resume-upload-content">
                      {resumeFile ? (
                        <>
                          <strong>{resumeFile.name}</strong>
                          <span>
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB —
                            click to change
                          </span>
                        </>
                      ) : (
                        <>
                          <strong>Upload your resume or portfolio</strong>
                          <span>PDF, DOC, DOCX (Max 5 MB)</span>
                        </>
                      )}
                    </div>

                    <input
                      id="resume-upload"
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>

                {/* MESSAGE */}

                <div className="application-field full-width">
                  <label htmlFor="message">
                    MESSAGE <small>(OPTIONAL)</small>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Tell us a bit about yourself, your interests and why you'd like to join Native91."
                    disabled={submitting}
                  ></textarea>
                </div>

                {/* SUBMIT */}

                <motion.button
                  type="submit"
                  className="application-submit-btn"
                  disabled={submitting}
                  whileHover={!submitting ? { y: -2 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                >
                  {submitting ? (
                    <>
                      <span>SUBMITTING...</span>
                      <FaSpinner className="spin" />
                    </>
                  ) : (
                    <>
                      <span>SUBMIT APPLICATION</span>
                      <FaArrowRight />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Careers;