import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

import { FaLeaf, FaHandsHelping, FaCrown, FaGem, FaPagelines } from "react-icons/fa";
import { GiOliveBranch } from "react-icons/gi";
import "./explore.css";

const values = [
  {
    icon: <FaLeaf />,
    title: "CURATED",
    text: "Thoughtful curation for a beautiful experience.",
  },
  {
    icon: <FaHandsHelping />,
    title: "AUTHENTIC",
    text: "Real stories. Real people. Real impact.",
  },
  {
    icon: <FaPagelines />,
    title: "CONSCIOUS",
    text: "Better choices for people and our planet.",
  },
  {
    icon: <FaCrown />,
    title: "EXCLUSIVE",
    text: "Invite-only for brands. Curated for you.",
  },
  {
    icon: <FaGem />,
    title: "MEANINGFUL",
    text: "Products that enrich everyday living.",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.18,
      duration: 0.7,
    },
  }),
};

const Explore = () => {
  return (
    <div>
      <section className="values-section-explore lexend">
        <Container className="values-container">
          <Row className="g-0">
            {values.map((item, index) => (
              <Col lg={true} md={4} xs={4} key={index}>
                <motion.div
                  className={`value-item ${index !== values.length - 1 ? "border-right" : ""}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="value-icon">{item.icon}</div>

                  <h4>{item.title}</h4>

                  <p>{item.text}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Explore;
