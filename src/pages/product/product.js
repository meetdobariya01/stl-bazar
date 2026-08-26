// pages/Product/Product.js - FIXED with proper image/name display

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000/api";
// const API_BASE = "https://api-vendor.native91.com";
const API_BASE = "http://localhost:5177"; // For local development

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
  const [imageErrors, setImageErrors] = useState({});

  // ✅ UPDATED IMAGE HELPER - Admin/Vendor support
  const getImageUrl = (logo) => {
    if (!logo) return null;

    const image = Array.isArray(logo) ? logo[0] : logo;

    // ✅ If it's already a full URL (Admin uploaded)
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // ✅ If it's Admin uploaded image (starts with /images)
    if (image.startsWith("/images")) {
      return `https://api-admin.native91.com${image}`;
    }

    // ✅ If it's Vendor uploaded image (starts with /uploads)
    if (image.startsWith("/uploads")) {
      return `https://api-vendor.native91.com${image}`;
    }

    // ✅ Handle production API URL
    if (image.includes("Screenshot") || image.includes("-")) {
      return `https://api-vendor.native91.com${image}`;
    }

    // ✅ Final fallback - treat as relative path
    return image;
  };

  const handleImageError = (companyId) => {
    setImageErrors(prev => ({ ...prev, [companyId]: true }));
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/companies`);
        
        let companiesData = [];
        
        if (response.data && response.data.success) {
          companiesData = response.data.companies || [];
        } else if (Array.isArray(response.data)) {
          companiesData = response.data;
        } else if (response.data && Array.isArray(response.data.companies)) {
          companiesData = response.data.companies;
        } else {
          companiesData = [];
        }

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
          
          {companies.map((item, index) => {
            const imageUrl = getImageUrl(item.logo);
            const hasError = imageErrors[item._id];
            const showImage = imageUrl && !hasError;

            return (
              <Row
                key={item._id || index}
                className={`align-items-center value-row ${
                  index % 2 !== 0 ? "flex-row-reverse" : ""
                }`}
              >
                {/* IMAGE SECTION */}
                <Col md={3}>
                  <motion.div
                    className="value-image-wrapper"
                    variants={index % 2 === 0 ? fadeLeft : fadeRight}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    {showImage ? (
                      // Show Image
                      <div className="brand-image-container">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="brand-image"
                          onError={() => handleImageError(item._id)}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      // Show Name Placeholder (if no image)
                      <div className="brand-placeholder">
                        <span className="brand-initial">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="brand-name-display">{item.name}</span>
                      </div>
                    )}
                  </motion.div>
                </Col>

                {/* CONTENT SECTION */}
                <Col md={9}>
                  <motion.div
                    className="value-content light mt-2 mt-md-0"
                    variants={index % 2 === 0 ? fadeRight : fadeLeft}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="funnel-sans">{item.name}</h4>
                    <p className="lexend">{item.description || "No description available"}</p>
                    
                    <NavLink
                      to={`/company/${encodeURIComponent(item.name)}`}
                      className="nav-link p-0"
                    >
                      <motion.button
                        className="explore-btn lexend"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Explore Brand
                      </motion.button>
                    </NavLink>
                  </motion.div>
                </Col>
              </Row>
            );
          })}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;