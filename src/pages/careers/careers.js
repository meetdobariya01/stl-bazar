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
} from "react-icons/fa";

import "./careers.css"; 
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

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

const Careers = () => {
    const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  /* =========================================================
     APPLICATION MODAL STATE
  ========================================================= */

  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");

  /* =========================================================
     OPEN APPLICATION MODAL
  ========================================================= */

  const openApplicationModal = (role = "") => {
    setSelectedRole(role);
    setShowApplicationModal(true);

    document.body.style.overflow = "hidden";
  };

  /* =========================================================
     CLOSE APPLICATION MODAL
  ========================================================= */

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedRole("");

    document.body.style.overflow = "auto";
  };

  /* =========================================================
     ROLE CHANGE
  ========================================================= */

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleApplicationSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    console.log("Application submitted");

    console.log({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      applyingFor: formData.get("applyingFor"),
      socialProfile: formData.get("socialProfile"),
      resume: formData.get("resume"),
      message: formData.get("message"),
    });

    /*
      Add your API integration here.

      Example:

      const response = await axios.post(
        `${API_URL}/career/apply`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    */
  };

  /* =========================================================
     ESC KEY + BODY SCROLL CLEANUP
  ========================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showApplicationModal) {
        closeApplicationModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = "auto";
    };
  }, [showApplicationModal]);

  return (
    <div className="lexend">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header />

      {/* =====================================================
          CAREERS HERO SECTION
      ===================================================== */}

      <section className="careers-section">
        <Container fluid className="p-0">
          <Row className="g-0 align-items-stretch">
            {/* LEFT CONTENT */}
            <Col lg={6} md={6} className="careers-content-col">
              <motion.div
                className="careers-content"
                initial={{
                  opacity: 0,
                  x: -60,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
              >
                {/* Small Heading */}
                <motion.div
                  className="careers-label"
                  initial={{
                    opacity: 0,
                    y: -20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  viewport={{
                    once: true,
                  }}
                >
                  CAREERS AT NATIVE91
                </motion.div>

                <div className="careers-line"></div>

                {/* Main Heading */}
                <motion.h1
                  className="careers-title"
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15,
                  }}
                  viewport={{
                    once: true,
                  }}
                >
                  Build what
                  <br />
                  matters.
                  <br />
                  <span>Grow together.</span>
                </motion.h1>

                {/* Description */}
                <motion.div
                  className="careers-description"
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                  }}
                  viewport={{
                    once: true,
                  }}
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

            {/* RIGHT IMAGE */}
            <Col lg={6} md={6} className="careers-image-col">
              <motion.div
                className="careers-image-wrapper"
                initial={{
                  opacity: 0,
                  scale: 1.05,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                }}
                viewport={{
                  once: true,
                }}
              >
                <img
                  src="./images/careers.webp"
                  alt="Careers at Native91"
                  className="careers-image"
                />

                {/* Soft Overlay */}
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
          {/* HEADER */}

          <motion.div
            className="open-positions-header"
            initial={{
              opacity: 0,
              y: -35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
          >
            <div className="open-position-label">OPEN POSITIONS</div>

            <div className="open-position-line"></div>

            <motion.h2
              initial={{
                opacity: 0,
                x: -30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.15,
              }}
              viewport={{
                once: true,
              }}
            >
              Join our growing team
            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.3,
              }}
              viewport={{
                once: true,
              }}
            >
              We’re looking for curious people who want to build, learn and make
              an impact.
            </motion.p>
          </motion.div>

          {/* JOB CARDS */}

          <Row className="g-4">
            {jobs.map((job, index) => (
              <Col lg={6} key={job.title}>
                <motion.div
                  className="job-card"
                  initial={{
                    opacity: 0,
                    y: 60,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "easeOut",
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                >
                  {/* IMAGE */}

                  <div className="job-image-wrapper">
                    <motion.img
                      src={job.image}
                      alt={job.title}
                      className="job-image"
                      whileHover={{
                        scale: 1.05,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                    />
                  </div>

                  {/* CONTENT */}

                  <div className="job-content">
                    <h3>{job.title}</h3>

                    <div className="job-meta">
                      <span>{job.type}</span>

                      <i>|</i>

                      <span>{job.location}</span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-divider"></div>

                    <h4>What you’ll work on</h4>

                    <ul className="job-responsibilities">
                      {job.responsibilities.map(
                        (responsibility, responsibilityIndex) => (
                          <motion.li
                            key={responsibility}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            whileInView={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              duration: 0.4,
                              delay: 0.35 + responsibilityIndex * 0.08,
                            }}
                            viewport={{
                              once: true,
                            }}
                          >
                            <span className="check-icon">
                              <FaCheck />
                            </span>

                            <span>{responsibility}</span>
                          </motion.li>
                        ),
                      )}
                    </ul>

                    {/* APPLY BUTTON */}

                    <motion.button
                      type="button"
                      className="apply-job-btn"
                      onClick={() => openApplicationModal(job.title)}
                      whileHover={{
                        y: -3,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
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
            {/* LEFT CONTENT */}

            <Col lg={3} md={12} className="why-native-intro">
              <motion.div
                initial={{
                  opacity: 0,
                  x: -50,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
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

            {/* BENEFITS */}

            <Col lg={9} md={12}>
              <Row className="why-native-benefits g-0">
                {benefits.map((item, index) => (
                  <Col lg={3} md={6} sm={6} xs={6} key={item.title}>
                    <motion.div
                      className="why-native-item"
                      initial={{
                        opacity: 0,
                        y: 35,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.15,
                        ease: "easeOut",
                      }}
                      viewport={{
                        once: true,
                        amount: 0.25,
                      }}
                      whileHover={{
                        y: -5,
                      }}
                    >
                      {/* ICON */}

                      <motion.div
                        className="why-native-icon"
                        initial={{
                          opacity: 0,
                          scale: 0.7,
                        }}
                        whileInView={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 0.15 + index * 0.15,
                        }}
                        viewport={{
                          once: true,
                        }}
                      >
                        {item.icon}
                      </motion.div>

                      {/* TITLE */}

                      <h3>{item.title}</h3>

                      {/* DESCRIPTION */}

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
        {/* Background Overlay */}

        <div className="share-profile-overlay"></div>

        <Container fluid className="share-profile-container">
          <motion.div
            className="share-profile-content"
            initial={{
              opacity: 0,
              x: -60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
          >
            <motion.h2
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.15,
              }}
              viewport={{
                once: true,
              }}
            >
              Don’t see the right role?
            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
              }}
              viewport={{
                once: true,
              }}
            >
              We’re always interested in meeting curious, talented people who
              believe in what Native91 is building.
            </motion.p>

            {/* SHARE PROFILE BUTTON */}

            <motion.button
              type="button"
              className="share-profile-btn"
              onClick={() => openApplicationModal("")}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.45,
              }}
              viewport={{
                once: true,
              }}
              whileHover={{
                y: -3,
              }}
              whileTap={{
                scale: 0.98,
              }}
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
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={closeApplicationModal}
          >
            <motion.div
              className="application-modal"
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* =================================================
                  CLOSE BUTTON
              ================================================= */}

              <button
                type="button"
                className="application-modal-close"
                onClick={closeApplicationModal}
                aria-label="Close application form"
              >
                <FaTimes />
              </button>

              {/* =================================================
                  FORM HEADER
              ================================================= */}

              <div className="application-modal-header">
                <div className="application-modal-label">NATIVE91 CAREERS</div>

                <div className="application-modal-line"></div>

                <h2>Share Your Profile</h2>

                <p>
                  We’re always excited to meet curious, creative people who want
                  to be part of Native91. Fill in your details and we’ll be in
                  touch.
                </p>
              </div>

              {/* =================================================
                  APPLICATION FORM
              ================================================= */}

              <form
                className="application-form"
                onSubmit={handleApplicationSubmit}
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
                  />
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
                    />
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
                    />
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
                  >
                    <option value="">Select a role</option>

                    {jobs.map((job) => (
                      <option key={job.title} value={job.title}>
                        {job.title}
                      </option>
                    ))}

                    <option value="General / Other"> Other</option>
                  </select>
                </div>

                {/* LINKEDIN / INSTAGRAM */}

                <div className="application-field full-width">
                  <label htmlFor="socialProfile">
                    LINKEDIN / GITHUB <small>(OPTIONAL)</small>
                  </label>

                  <input
                    id="socialProfile"
                    type="url"
                    name="socialProfile"
                    placeholder="https://"
                  />
                </div>

                {/* RESUME */}

                <div className="application-field full-width">
                  <label htmlFor="resume-upload">
                    RESUME / PORTFOLIO <span>*</span>
                  </label>

                  <label htmlFor="resume-upload" className="resume-upload-box">
                    <div className="resume-upload-icon">
                      <FaUpload />
                    </div>

                    <div className="resume-upload-content">
                      <strong>Upload your resume or portfolio</strong>

                      <span>PDF, DOC, DOCX (Max 5 MB)</span>
                    </div>

                    <input
                      id="resume-upload"
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      required
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
                    placeholder="Tell us a bit about yourself, your interests and why you’d like to join Native91."
                  ></textarea>
                </div>

                {/* SUBMIT */}

                <motion.button
                  type="submit"
                  className="application-submit-btn"
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                >
                  <span>SUBMIT APPLICATION</span>

                  <FaArrowRight />
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </div>
  );
};

export default Careers;
