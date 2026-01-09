import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";

const API_URL = process.env.REACT_APP_API_URL;

const fadeLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
const fadeRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };

const Product = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/companies`)
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Company fetch error", err));
  }, []);

  return (
    <div>
      <Header />

      <section className="values-section">
        <Container>
          {companies.map((item, index) => (
            <Row
              key={item._id}
              className={`align-items-center value-row ${
                index % 2 !== 0 ? "flex-row-reverse" : ""
              }`}
            >
              {/* IMAGE */}
              <Col md={4}>
                <motion.div
                  className="value-image-wrapper"
                  variants={index % 2 === 0 ? fadeLeft : fadeRight}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <img
                    src={item.logo || "/images/default-company.png"}
                    alt={item.name}
                    className="value-image"
                  />
                </motion.div>
              </Col>

              {/* CONTENT */}
              <Col md={8}>
                <motion.div
                  className="value-content light"
                  variants={index % 2 === 0 ? fadeRight : fadeLeft}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h4 className="lexend">{item.name}</h4>
                  <p className="funnel-sans">{item.description}</p>

                  {/* BUY BUTTON */}
                  <NavLink
                    to={`/company/${encodeURIComponent(item.name)}`}
                    className="nav-link p-0"
                  >
                    <motion.button
                      className="buy-btn lexend"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buy Now
                    </motion.button>
                  </NavLink>
                </motion.div>
              </Col>
            </Row>
          ))}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
