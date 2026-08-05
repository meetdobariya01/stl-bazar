import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./email.css";

const bannerData = [
  {
    id: 1,
    title: "For remarkable brands",
    description:
      "Do you create remarkable products? We'd love to hear your story.",
    button: "APPLY TO JOIN",
    link: "/sell",
    bgImage: "./images/email-box-1.webp",
    // image: "/images/vase.png",
  },
  {
    id: 2,
    title: "The finest edits.\nStraight to your inbox.",
    description: "",
    button: "JOIN THE PRIVATE LIST",
    link: "/contactus",
    bgImage: "./images/email-box-2.webp",
    image: "/images/mail.png",
  },
  {
    id: 3,
    title: "",
    description: "",
    button: "",
    link: "/",
    bgImage: "./images/email-box-3.webp",
    logo: "/images/native-bg.png",
    image: "/images/plant.png",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.2,
    },
  }),
};

const Email = () => {
  return (
    <div>
      <section className="brand-banner-section py-5 lexend">
        {/* <Container fluid> */}
          <Row className="g-4">
            {bannerData.map((item, index) => (
              <Col lg={4} md={6} xs={12} key={item.id}>
                <motion.div
                  className="brand-card"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index}
                  whileHover={{ y: -8 }}
                  style={{
                    backgroundImage: `url(${item.bgImage})`,
                  }}
                >
                  <div className="brand-overlay">
                    <div className="brand-content">
                      {item.logo && (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={item.logo}
                          alt="Logo"
                          className="brand-logo-email w-25 w-md-50 w-lg-50"
                        />
                      )}

                      {item.title && (
                        <h2 className="brand-title">
                          {item.title.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        </h2>
                      )}

                      {item.description && (
                        <p className="brand-description">{item.description}</p>
                      )}

                      {item.button && (
                        <NavLink to={item.link} className="brand-btn">
                          {item.button}

                          <motion.span
                            whileHover={{ x: 6 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FaArrowRight />
                          </motion.span>
                        </NavLink>
                      )}
                    </div>

                    <motion.div
                      className="brand-image-wrapper"
                      whileHover={{
                        scale: 1.08,
                        rotate: 2,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                    >
                      {/* <img
                        src={item.image}
                        alt={item.title}
                        className="brand-image"
                      /> */}
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        {/* </Container> */}
      </section>
    </div>
  );
};

export default Email;
