import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "./shopus.css";

const features = [
  {
    image: "./images/shopus-1.png",
    title: "Fast Delivery",
    desc: "Quick and safe doorstep delivery",
  },
  {
    image: "./images/shopus-2.png",
    title: "Secure Payments",
    desc: "100% secure transactions",
  },
  {
    image: "./images/shopus-3.png",
    title: "Easy Exchange",
    desc: "Hassle-free Exchange",
  },
  {
    image: "./images/shopus-4.png",
    title: "Quality Assured",
    desc: "Only genuine products",
  },
];

const Shopus = () => {
  return (
    <div>
      <section className="why-shop-section funnel-sans">
        <Container>
          {/* Heading */}
          <motion.div
            className="why-header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="funnel-sans">The Experience We Deliver</h2>
          </motion.div>

          {/* Cards */}
          <Row className="gy-4 mt-4 lexend">
            {features.map((item, index) => (
              <Col lg={3} md={6} sm={6} xs={6} key={index}>
                <motion.div
                  className="why-card-shop"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.03,
                  }}
                  viewport={{ once: true }}
                >
                  <div className="why-icon-landingpage">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="why-feature-image"
                    />
                  </div>

                  <h5 className="text-uppercase">{item.title}</h5>
                  {/* <p>{item.desc}</p> */}
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Shopus;
