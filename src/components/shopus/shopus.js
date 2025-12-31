import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaTruck,
  FaCreditCard,
  FaUndoAlt,
  FaShieldAlt,
} from "react-icons/fa";
import "./shopus.css";

const features = [
  {
    icon: <FaTruck />,
    title: "Fast Delivery",
    desc: "Quick and safe doorstep delivery",
  },
  {
    icon: <FaCreditCard />,
    title: "Secure Payments",
    desc: "100% secure transactions",
  },
  {
    icon: <FaUndoAlt />,
    title: "Easy Returns",
    desc: "Hassle-free returns",
  },
  {
    icon: <FaShieldAlt />,
    title: "Quality Assured",
    desc: "Only genuine products",
  },
];


const Shopus = () => {
  return (
    <div>
          <section className="why-shop-section">
      <Container>
        {/* Heading */}
        <motion.div
          className="why-header text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Why Shop With Us?</h2>
          <p>Trusted by thousands of happy customers</p>
        </motion.div>

        {/* Cards */}
        <Row className="gy-4 mt-4">
          {features.map((item, index) => (
            <Col lg={3} md={6} sm={6} xs={12} key={index}>
              <motion.div
                className="why-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                viewport={{ once: true }}
              >
                <div className="why-icon">{item.icon}</div>
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
    </div>
  )
}

export default Shopus;