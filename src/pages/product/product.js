// pages/Product/Product.js - COMPLETE WITH BRAND CATEGORIES FROM SELLER DATA

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Button, Form, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";

// ✅ Use consistent API URL
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

  // ✅ Filter and Sort States
  const [sortBy, setSortBy] = useState("newest");
  // const [selectedCategory, setSelectedCategory] = useState("all"); // COMMENTED
  // const [categories, setCategories] = useState([]); // COMMENTED
  const [searchTerm, setSearchTerm] = useState("");
  const [brandStats, setBrandStats] = useState({
    totalBrands: 0,
    totalCategories: 0
  });

  // ✅ Get image URL
  const getImageUrl = (logo) => {
    if (!logo) return null;

    const image = Array.isArray(logo) ? logo[0] : logo;
    if (!image || typeof image !== 'string') return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/images")) {
      return `https://api-admin.native91.com${image}`;
    }
    if (image.startsWith("/uploads")) {
      return `https://api-vendor.native91.com${image}`;
    }
    return null;
  };

  const handleImageError = (brandId) => {
    setImageErrors(prev => ({ ...prev, [brandId]: true }));
  };

  // ✅ Extract categories from brands - COMMENTED
  // const extractCategories = (brandsData) => {
  //   const categorySet = new Set();
  //   brandsData.forEach(brand => {
  //     if (brand.category) {
  //       if (Array.isArray(brand.category)) {
  //         brand.category.forEach(cat => {
  //           if (cat && cat.trim()) categorySet.add(cat.trim());
  //         });
  //       } else if (typeof brand.category === 'string') {
  //         const cats = brand.category.split(',').map(c => c.trim());
  //         cats.forEach(cat => {
  //           if (cat) categorySet.add(cat);
  //         });
  //       }
  //     }
  //   });
  //   return Array.from(categorySet).sort();
  // };

  // ✅ Apply filters and sorting
  const applyFiltersAndSort = (brandsData) => {
    let result = [...brandsData];

    // ✅ Filter by category - COMMENTED
    // if (selectedCategory !== "all") {
    //   result = result.filter(brand => {
    //     if (brand.category) {
    //       if (Array.isArray(brand.category)) {
    //         return brand.category.some(cat => 
    //           cat.toLowerCase() === selectedCategory.toLowerCase()
    //         );
    //       } else if (typeof brand.category === 'string') {
    //         return brand.category.toLowerCase().includes(selectedCategory.toLowerCase());
    //       }
    //     }
    //     return false;
    //   });
    // }

    // ✅ Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(brand => 
        brand.name?.toLowerCase().includes(term) ||
        brand.description?.toLowerCase().includes(term) ||
        brand.category?.toString().toLowerCase().includes(term)
      );
    }

    // ✅ Apply sorting
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

  // ✅ FETCH BRANDS - Using /companies endpoint
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(`🟢 Fetching brands (attempt ${retryCount + 1}) from: ${API_URL}/companies`);

      const response = await axios.get(`${API_URL}/companies`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log("🟢 Response status:", response.status);

      let brandsData = [];

      // ✅ Handle different response formats
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
          console.log(`✅ Found ${brandsData.length} companies in data.companies`);
        } else if (Array.isArray(response.data)) {
          brandsData = response.data;
          console.log(`✅ Found ${brandsData.length} companies (direct array)`);
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
          console.log(`✅ Found ${brandsData.length} companies in nested property`);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
          brandsData = [];
        }
      }

      setBrands(brandsData);
      
      // ✅ Extract categories - COMMENTED
      // const extractedCategories = extractCategories(brandsData);
      // setCategories(extractedCategories);
      setBrandStats({
        totalBrands: brandsData.length,
        totalCategories: 0 // COMMENTED
      });

      // ✅ Apply filters and sorting
      const filtered = applyFiltersAndSort(brandsData);
      setFilteredBrands(filtered);

      if (brandsData.length === 0) {
        setError("No brands found in the database.");
      }

      console.log(`✅ Found ${brandsData.length} brands`);

    } catch (err) {
      console.error("🔴 ERROR FETCHING BRANDS:", err);
      
      let errorMessage = "Failed to load brands. ";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Please check your network connection.";
      } else if (err.response) {
        errorMessage += `Server responded with status ${err.response.status}.`;
      } else if (err.request) {
        errorMessage += "No response from server. Please check if the server is running.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }

      setError(errorMessage);
      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply filters whenever dependencies change
  useEffect(() => {
    if (brands.length > 0) {
      const filtered = applyFiltersAndSort(brands);
      setFilteredBrands(filtered);
    }
  }, [sortBy, searchTerm, brands]); // selectedCategory removed

  // ✅ Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchBrands();
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
          {retryCount > 0 && (
            <p className="text-muted small">Retry attempt {retryCount}</p>
          )}
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
                <small className="text-muted d-block">
                  Brands found: {brands.length}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-danger" size="sm" onClick={handleRetry}>
                  🔄 Retry
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
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
  if (brands.length === 0) {
    return (
      <div>
        <Header />
        <Container className="py-5 text-center">
          <h4>No brands available</h4>
          <p className="text-muted">Check back soon for new brands.</p>
          <Button variant="outline-primary" size="sm" onClick={handleRetry}>
            Refresh
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  // ✅ Success State - Render Brands with Filters
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

          {/* ✅ FILTERS AND SORTING SECTION */}
          <div className="filters-section mb-5 p-4 bg-light rounded">
            <Row className="g-3 align-items-end">
              {/* Search */}
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

              {/* Sort By */}
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

              {/* Clear Filters */}
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100 rounded-pill"
                  onClick={() => {
                    setSearchTerm("");
                    // setSelectedCategory("all"); // COMMENTED
                    setSortBy("newest");
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                </Button>
              </Col>

              {/* Category Filter - COMMENTED */}
              {/* <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="bi bi-tag me-1"></i> Category
                  </Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-pill"
                  >
                    <option value="all">📂 All Categories</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col> */}
            </Row>

            {/* Active Filters Display */}
            {(searchTerm || sortBy !== "newest") && (
              <div className="active-filters mt-3 d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small">Active filters:</span>
                {searchTerm && (
                  <Badge bg="primary" className="d-flex align-items-center gap-1">
                    🔍 {searchTerm}
                    <span className="ms-1" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm("")}>✕</span>
                  </Badge>
                )}
                {sortBy !== "newest" && (
                  <Badge bg="info" className="d-flex align-items-center gap-1">
                    {sortBy === "oldest" && "📅 Oldest"}
                    {sortBy === "name_asc" && "🔤 A to Z"}
                    {sortBy === "name_desc" && "🔤 Z to A"}
                    <span className="ms-1" style={{ cursor: 'pointer' }} onClick={() => setSortBy("newest")}>✕</span>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* ✅ BRAND GRID DISPLAY */}
          {filteredBrands.length === 0 ? (
            <div className="text-center py-5">
              <h5>No brands match your filters</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline-primary"
                className="rounded-pill"
                onClick={() => {
                  setSearchTerm("");
                  // setSelectedCategory("all"); // COMMENTED
                  setSortBy("newest");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {filteredBrands.map((item, index) => {
                const imageUrl = getImageUrl(item.logo);
                const hasError = imageErrors[item._id];
                const showImage = imageUrl && !hasError;
                const isEven = index % 2 !== 0;

                // Format category display
                let categoryDisplay = "—";
                if (item.category) {
                  if (Array.isArray(item.category)) {
                    categoryDisplay = item.category.join(", ");
                  } else if (typeof item.category === 'string') {
                    categoryDisplay = item.category;
                  }
                }

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
                        
                        {/* Category Badge - COMMENTED */}
                        {/* {categoryDisplay !== "—" && (
                          <div className="brand-category-badge mt-2 text-center">
                            <Badge bg="secondary" className="rounded-pill">
                              {categoryDisplay}
                            </Badge>
                          </div>
                        )} */}
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
                          {/* {item.plan && (
                            <Badge bg="gold" className="rounded-pill text-dark">
                              ⭐ {item.plan}
                            </Badge>
                          )}
                          {item.status === 'active' && (
                            <Badge bg="success" className="rounded-pill">
                              Active
                            </Badge>
                          )} */}
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
                          
                          {/* {item.productCount !== undefined && (
                            <span className="text-muted small">
                              <i className="bi bi-box-seam me-1"></i>
                              {item.productCount} products
                            </span>
                          )}
                          
                          {item.createdAt && (
                            <span className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i>
                              Joined: {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )} */}
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                );
              })}
            </Row>
          )}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
