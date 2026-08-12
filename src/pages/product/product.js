// pages/Product/Product.js - FIXED

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000/api";

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

const Product = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------- IMAGE HELPER ----------------
  const getImageUrl = (logo) => {
    if (!logo) return "/images/default-company.png";

    const image = Array.isArray(logo) ? logo[0] : logo;

    // already full URL
    if (image.startsWith("http")) { 
      return image;
    }

    // uploaded backend images
    if (image.includes("Screenshot") || image.includes("-")) {
      return `https://api-vendor.native91.com${image}`;
    }

    // old frontend/public images
    return image;
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/companies`);
        
        console.log("Companies API Response:", response.data);

        // ✅ Handle different response formats
        let companiesData = [];
        
        if (response.data && response.data.success) {
          // ✅ New format: { success: true, companies: [...] }
          companiesData = response.data.companies || [];
        } else if (Array.isArray(response.data)) {
          // ✅ Old format: direct array
          companiesData = response.data;
        } else if (response.data && Array.isArray(response.data.companies)) {
          // ✅ Alternative format: { companies: [...] }
          companiesData = response.data.companies;
        } else {
          companiesData = [];
          console.warn("Unexpected API response format:", response.data);
        }

        console.log("✅ Companies loaded:", companiesData.length);
        setCompanies(companiesData);
        setError("");
      } catch (err) {
        console.error("Company fetch error:", err);
        setError("Failed to load companies. Please try again.");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading brands...</p>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <h4>No brands available</h4>
          <p className="text-muted">Check back soon for new brands.</p>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      <section className="values-section">
        <motion.img
          src="./images/product-banner.png"
          alt="Nature"
          className="simple-image w-100"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
        <Container>
          <h2 className="text-center funnel-sans my-5 display-2">Our Brands</h2>
          <p className="text-center text-muted mb-5">
            {companies.length} brands available
          </p>
          
          {companies.map((item, index) => (
            <Row
              key={item._id || index}
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
                    src={getImageUrl(item.logo)}
                    alt={item.name}
                    className="value-image"
                  />
                </motion.div>
              </Col>

              {/* CONTENT */}
              <Col md={8}>
                <motion.div
                  className="value-content light mt-2 mt-md-0"
                  variants={index % 2 === 0 ? fadeRight : fadeLeft}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h4 className="funnel-sans">{item.name}</h4>

                  <p className="lexend">{item.description}</p>

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
                      Explore Brand
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