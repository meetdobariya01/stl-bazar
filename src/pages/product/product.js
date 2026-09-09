import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Form,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";
import { FaXmark } from "react-icons/fa6";

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
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Filter and Sort States
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all"); // ✅ UNCOMMENTED
  const [categories, setCategories] = useState([]); // ✅ UNCOMMENTED
  const [searchTerm, setSearchTerm] = useState("");
  const [brandStats, setBrandStats] = useState({
    totalBrands: 0,
    totalCategories: 0,
  });

  // ✅ NEW UPGRADED IMAGE LOGIC (Handles Object, Array, String)
  const getImageUrl = (logo) => {
    if (!logo) return null;

    // Object handle karo
    if (typeof logo === "object" && !Array.isArray(logo)) {
      if (logo.image && typeof logo.image === "string") {
        logo = logo.image;
      } else if (logo.url && typeof logo.url === "string") {
        logo = logo.url;
      } else {
        return null;
      }
    }

    // Array handle karo
    if (Array.isArray(logo)) {
      logo = logo[0];
    }

    if (!logo || typeof logo !== "string") return null;

    // Full URL check
    if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;

    // Relative URL fix
    if (logo.startsWith("/images")) return `http://localhost:5177${logo}`;
    if (logo.startsWith("/uploads") || logo.startsWith("/public"))
      return `http://localhost:5177${logo}`;

    // Fallback
    return `http://localhost:5177/uploads/${logo}`;
  };

  const handleImageError = (brandId) => {
    setImageErrors((prev) => ({ ...prev, [brandId]: true }));
  };

  // ✅ Extract categories from brands - ✅ UNCOMMENTED
  const extractCategories = (brandsData) => {
    const categorySet = new Set();
    brandsData.forEach((brand) => {
      if (brand.category) {
        if (Array.isArray(brand.category)) {
          brand.category.forEach((cat) => {
            if (cat && cat.trim()) categorySet.add(cat.trim());
          });
        } else if (typeof brand.category === "string") {
          const cats = brand.category.split(",").map((c) => c.trim());
          cats.forEach((cat) => {
            if (cat) categorySet.add(cat);
          });
        }
      }
    });
    return Array.from(categorySet).sort();
  };

  // ✅ Apply filters and sorting
  const applyFiltersAndSort = (brandsData) => {
    let result = [...brandsData];

    // ✅ Filter by category - ✅ UNCOMMENTED
    if (selectedCategory !== "all") {
      result = result.filter((brand) => {
        if (brand.category) {
          if (Array.isArray(brand.category)) {
            return brand.category.some(
              (cat) => cat.toLowerCase() === selectedCategory.toLowerCase(),
            );
          } else if (typeof brand.category === "string") {
            return brand.category
              .toLowerCase()
              .includes(selectedCategory.toLowerCase());
          }
        }
        return false;
      });
    }

    // ✅ Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (brand) =>
          brand.name?.toLowerCase().includes(term) ||
          brand.description?.toLowerCase().includes(term) ||
          brand.category?.toString().toLowerCase().includes(term),
      );
    }

    // ✅ Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        );
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

      console.log(
        `🟢 Fetching brands (attempt ${retryCount + 1}) from: ${API_URL}/companies`,
      );

      const response = await axios.get(`${API_URL}/companies`, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("🟢 Response status:", response.status);

      let brandsData = [];

      // ✅ Handle different response formats
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
          console.log(
            `✅ Found ${brandsData.length} companies in data.companies`,
          );
        } else if (Array.isArray(response.data)) {
          brandsData = response.data;
          console.log(`✅ Found ${brandsData.length} companies (direct array)`);
        } else if (
          response.data.companies &&
          Array.isArray(response.data.companies)
        ) {
          brandsData = response.data.companies;
          console.log(
            `✅ Found ${brandsData.length} companies in nested property`,
          );
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
          brandsData = [];
        }
      }

      setBrands(brandsData);

      // ✅ Extract categories - ✅ UNCOMMENTED
      const extractedCategories = extractCategories(brandsData);
      setCategories(extractedCategories);
      setBrandStats({
        totalBrands: brandsData.length,
        totalCategories: extractedCategories.length,
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

      if (err.code === "ECONNABORTED") {
        errorMessage += "Request timed out.";
      } else if (err.response) {
        errorMessage += `Server responded with status ${err.response.status}.`;
      } else if (err.request) {
        errorMessage +=
          "No response from server. Please check if the server is running.";
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
  }, [sortBy, searchTerm, selectedCategory, brands]); // ✅ selectedCategory added back

  // ✅ Retry function
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
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
                <small className="text-muted d-block">API URL: {API_URL}</small>
                <small className="text-muted d-block">
                  Brands found: {brands.length}
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
          <div className="our-brands-header position-relative my-5">
            <h2 className="text-center funnel-sans display-2 mb-0">
              Our Brands
            </h2>

            {/* FILTER BUTTON */}
            <div className="filter-trigger-wrapper lexend">
              <Button
                className="filter-trigger-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-sliders me-2"></i>
                Filters
                <span className="filter-trigger-arrow">
                  <i
                    className={`bi ${
                      showFilters ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </span>
              </Button>
            </div>
          </div>
          {/* <p className="text-center text-muted mb-4">
            {filteredBrands.length} of {brands.length} brands available
          </p> */}
          {/* ✅ FILTERS AND SORTING SECTION */}
          {/* FILTER BUTTON */}

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="filters-section lexend">
              <div className="filter-header-product">
                <div>
                  <h5>
                    <i className="bi bi-sliders me-2"></i>
                    Filter & Sort
                  </h5>
                  <p>Find exactly what you're looking for</p>
                </div>
                <Col lg={2} md={12}>
                  <Button
                    className="filter-reset-btn"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSortBy("newest");
                    }}
                  >
                    Reset
                  </Button>
                </Col>
                <button
                  type="button"
                  className="filter-close-btn"
                  onClick={() => setShowFilters(false)}
                >
                  <FaXmark />
                </button>
              </div>

              <Row className="g-3">
                {/* SEARCH */}
                <Col lg={5} md={12}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-search me-2"></i>
                      Search Brands
                    </Form.Label>

                    <div className="filter-input-wrapper">
                      <i className="bi bi-search"></i>

                      <Form.Control
                        type="text"
                        placeholder="Search by name, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* CATEGORY */}
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-tag me-2"></i>
                      Category
                    </Form.Label>

                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>

                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* SORT */}
                <Col lg={2} md={6}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-sort-down me-2"></i>
                      Sort By
                    </Form.Label>

                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name_asc">A to Z</option>
                      <option value="name_desc">Z to A</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* RESET */}
                {/* <Col lg={2} md={12}>
                  <Button
                    className="filter-reset-btn"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSortBy("newest");
                    }}
                  >
                    Reset
                  </Button>
                </Col> */}
              </Row>
            </div>
          )}
          {/* ✅ BRAND GRID DISPLAY */}
          {filteredBrands.length === 0 ? (
            <div className="text-center py-5">
              <h5>No brands match your filters</h5>
              <p className="text-muted">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline-primary"
                className="rounded-pill"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all"); // ✅ UNCOMMENTED
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
                  } else if (typeof item.category === "string") {
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
                            <span className="brand-name-display">
                              {item.name || "Unknown"}
                            </span>
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
                          <h4 className="funnel-sans mb-0">
                            {item.name || "Unnamed Brand"}
                          </h4>
                        </div>

                        <p className="lexend mt-2">
                          {item.description ||
                            `${item.name || "This brand"} - Premium brand on Native91`}
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
            </Row>
          )}
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
