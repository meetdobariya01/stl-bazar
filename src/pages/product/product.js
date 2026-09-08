
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Button, Form, Badge } from "react-bootstrap";
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
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  // ✅ Filter and Sort States (No Category, Search, Sort used)
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandStats, setBrandStats] = useState({
    totalBrands: 0,
    totalCategories: 0
  });

  // ✅ UPGRADED IMAGE LOGIC (Handles Object, Array, String)
  const getImageUrl = (logo) => {
    if (!logo) return null;

    if (typeof logo === 'object' && !Array.isArray(logo)) {
      if (logo.image && typeof logo.image === 'string') {
        logo = logo.image;
      } else if (logo.url && typeof logo.url === 'string') {
        logo = logo.url;
      } else {
        return null;
      }
    }

    if (Array.isArray(logo)) {
      logo = logo[0];
    }

    if (!logo || typeof logo !== 'string') return null;

    if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;

    if (logo.startsWith("/images")) return `https://api-admin.native91.com${logo}`;
    if (logo.startsWith("/uploads") || logo.startsWith("/public")) return `https://api-vendor.native91.com${logo}`;

    return `https://api-vendor.native91.com/uploads/${logo}`;
  };

  const handleImageError = (brandId) => {
    setImageErrors(prev => ({ ...prev, [brandId]: true }));
  };

  // ✅ No extra filter logic (Only sorting)
  const applyFiltersAndSort = (brandsData) => {
    let result = [...brandsData];

    // ✅ Sort by newest/oldest/name (Basic sorting)
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "name_asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        break;
    }

    return result;
  };
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchBrands();
  };
  // ✅ FETCH BRANDS
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/companies`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      let brandsData = [];

      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
        } else if (Array.isArray(response.data)) {
          brandsData = response.data;
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
        } else {
          brandsData = [];
        }
      }

      setBrands(brandsData);
      setBrandStats({
        totalBrands: brandsData.length,
        totalCategories: 0
      });

      const filtered = applyFiltersAndSort(brandsData);
      setFilteredBrands(filtered);

      if (brandsData.length === 0) {
        setError("No brands found in the database.");
      }

    } catch (err) {
      let errorMessage = "Failed to load brands. ";
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timed out.";
      } else if (err.response) {
        errorMessage += `Server responded with status ${err.response.status}.`;
      } else if (err.request) {
        errorMessage += "No response from server.";
      } else {
        errorMessage += err.message || "Unknown error.";
      }

      setError(errorMessage);
      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchBrands();
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
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Error State
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
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-danger" size="sm" onClick={handleRetry}>
                  🔄 Retry
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
  if (brands.length === 0) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <h4>No brands available</h4>
          <Button variant="outline-primary" size="sm" onClick={handleRetry}>
            Refresh
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Success State - Only Brand Cards (No Filters)
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
          <p className="text-center text-muted mb-4">
            {filteredBrands.length} of {brands.length} brands available
          </p>

          {/* ✅ FILTERS SECTION - COMMENTED OUT (Search & Sort removed) */}
          {/* <div className="filters-section mb-5 p-4 bg-light rounded">
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-search me-1"></i> Search Brands
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-sort-down me-1"></i> Sort By
                  </Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-pill"
                  >
                    <option value="newest">🆕 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                    <option value="name_asc">🔤 A to Z</option>
                    <option value="name_desc">🔤 Z to A</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100 rounded-pill"
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("newest");
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                </Button>
              </Col>
            </Row>
          </div> */}

          {/* ✅ BRANDS DISPLAY */}
          {filteredBrands.length === 0 ? (
            <div className="text-center py-5">
              <h5>No brands match your filters</h5>
              <Button
                variant="outline-primary"
                className="rounded-pill"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("newest");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              {filteredBrands.map((item, index) => {
                const imageUrl = getImageUrl(item.logo);
                const hasError = imageErrors[item._id];
                const showImage = imageUrl && !hasError;
                const isEven = index % 2 !== 0;

                return (
                  <Row
                    key={item._id || index}
                    className={`align-items-center value-row mb-5 ${
                      isEven ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* IMAGE SECTION */}
                    <Col md={3}>
                      <motion.div
                        className="value-image-wrapper"
                        variants={!isEven ? fadeLeft : fadeRight}
                        initial="hidden"
                        whileInView="visible"
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                      >
                        {showImage ? (
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
                        variants={!isEven ? fadeRight : fadeLeft}
                        initial="hidden"
                        whileInView="visible"
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <h4 className="funnel-sans mb-0">{item.name || "Unnamed Brand"}</h4>
                        </div>
                        
                        <p className="lexend mt-2">
                          {item.description || `${item.name || "This brand"} - Premium brand on Native91`}
                        </p>
                        
                        <div className="d-flex flex-wrap gap-3 align-items-center mt-3">
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
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                );
              })}
            </>
          )}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
