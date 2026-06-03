import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaCheckCircle,
  FaFlask,
  FaSeedling,
  FaGlobeAsia,
  FaPagelines,
  // FaLeaf,
} from "react-icons/fa";
import "./details.css";

const promises = [
  {
    title: "100% Natural",
    icon: <FaLeaf />,
  },
  {
    title: "Certified Organic",
    icon: <FaCheckCircle />,
  },
  {
    title: "Chemical Pesticides Free",
    icon: <FaFlask />,
  },
  {
    title: "Preservatives Free",
    icon: <FaSeedling />,
  },
  {
    title: "Sustainably Farmed",
    icon: <FaGlobeAsia />,
  },
  {
    title: "Non-GMO Produce",
    icon: <FaPagelines />,
  },
];
const Details = () => {
  return (
    <div>
      <section className="our-promise-section lexend">
        <Container>
          <h2 className="promise-title funnel-sans mb-5">
            Our Commitment to Excellence
          </h2>

          <Row className="justify-content-center">
            {promises.map((item, index) => (
              <Col
                key={index}
                xs={4}
                sm={4}
                md={3}
                lg={2}
                className="mb-4 d-flex justify-content-center"
              >
                <motion.div
                  className="promise-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.08 }}
                  viewport={{ once: true }}
                >
                  <div className="promise-circle">
                    <span className="promise-icon">{item.icon}</span>
                  </div>
                  <p className="promise-text">{item.title}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Details;
