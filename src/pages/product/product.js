// pages/Product/Product.js - COMPLETE FIXED VERSION

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";

// ✅ Use consistent API URL - FIXED
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
  const [imageErrors, setImageErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  // ✅ IMPROVED IMAGE HELPER - More robust
  const getImageUrl = (logo) => {
    if (!logo) return null;

    // Handle array
    const image = Array.isArray(logo) ? logo[0] : logo;
    
    // Handle non-string
    if (!image || typeof image !== 'string') return null;

    // ✅ Already full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // ✅ Admin uploaded (starts with /images)
    if (image.startsWith("/images")) {
      return `https://api-admin.native91.com${image}`;
    }

    // ✅ Vendor uploaded (starts with /uploads)
    if (image.startsWith("/uploads")) {
      return `https://api-vendor.native91.com${image}`;
    }

    // ✅ Handle production API URL
    if (image.includes("Screenshot") || image.includes("-")) {
      return `https://api-vendor.native91.com${image}`;
    }

    // ✅ Fallback - return null if cannot determine
    return null;
  };

  const handleImageError = (companyId) => {
    setImageErrors(prev => ({ ...prev, [companyId]: true }));
  };

  // ✅ FETCH COMPANIES WITH BETTER ERROR HANDLING
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(`🟢 Fetching companies (attempt ${retryCount + 1}) from: ${API_URL}/companies`);

      const response = await axios.get(`${API_URL}/companies`, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log("🟢 Response status:", response.status);
      console.log("🟢 Response data structure:", Object.keys(response.data));

      let companiesData = [];

      // ✅ Handle different response formats
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          companiesData = response.data.companies;
          console.log(`✅ Found ${companiesData.length} companies in data.companies`);
        } else if (Array.isArray(response.data)) {
          companiesData = response.data;
          console.log(`✅ Found ${companiesData.length} companies (direct array)`);
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          companiesData = response.data.companies;
          console.log(`✅ Found ${companiesData.length} companies in nested property`);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
          companiesData = [];
        }
      }

      setCompanies(companiesData);
      
      if (companiesData.length === 0) {
        setError("No companies found in the database.");
      }

    } catch (err) {
      console.error("🔴 ERROR FETCHING COMPANIES:", err);
      
      let errorMessage = "Failed to load companies. ";
      
      // ✅ Detailed error handling
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Please check your network connection.";
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("🔴 Response data:", err.response.data);
        console.error("🔴 Response status:", err.response.status);
        console.error("🔴 Response headers:", err.response.headers);
        
        if (err.response.status === 404) {
          errorMessage += "API endpoint not found. Please check the server URL.";
        } else if (err.response.status === 500) {
          errorMessage += "Server error. Please try again later.";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage += "You don't have permission to access this data.";
        } else {
          errorMessage += `Server responded with status ${err.response.status}.`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error("🔴 No response received:", err.request);
        errorMessage += "No response from server. Please check if the server is running.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += err.message || "Unknown error occurred.";
      }

      setError(errorMessage);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchCompanies();
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Loading State
  if (loading) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading brands...</p>
          {retryCount > 0 && (
            <p className="text-muted small">Retry attempt {retryCount}</p>
          )}
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Error State with Retry Button
  if (error) {
    return (
      <div>
        <Header />
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>⚠️ Error Loading Brands</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
              <div>
                <small className="text-muted d-block">
                  API URL: {API_URL}
                </small>
                <small className="text-muted d-block">
                  Companies found: {companies.length}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleRetry}
                >
                  🔄 Retry
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Page
                </Button>
              </div>
            </div>
          </Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Empty State
  if (companies.length === 0) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <h4>No brands available</h4>
          <p className="text-muted">Check back soon for new brands.</p>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleRetry}
          >
            Refresh
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Success State - Render Companies
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
                          {item.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                        <span className="brand-name-display">{item.name || "Unknown"}</span>
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
                    <h4 className="funnel-sans">{item.name || "Unnamed Brand"}</h4>
                    <p className="lexend">
                      {item.description || `${item.name || "This brand"} - Premium brand on Native91`}
                    </p>
                    
                    <NavLink
                      to={`/company/${encodeURIComponent(item.name || item._id)}`}
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
            );
          })}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;