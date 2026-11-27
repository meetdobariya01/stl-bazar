// pages/Product/Product.js
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Form,
} from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./product.css";
import { FaXmark } from "react-icons/fa6";

// ============================================================
// 🌐 API URLs
// ============================================================
const API_URL =
  process.env.REACT_APP_API_URL || "https://api.native91.com/api";

// 🎯 IMAGE BASES — Admin FIRST (logo admin પર છે)
const ADMIN_IMAGE_BASE =
  process.env.REACT_APP_ADMIN_API_URL || "https://api-admin.native91.com";

const VENDOR_BACKEND_URL =
  process.env.REACT_APP_VENDOR_API_URL || "https://api-vendor.native91.com";

// 🎯 Companies API — try multiple URLs
const COMPANIES_API_CANDIDATES = [
  process.env.REACT_APP_ADMIN_API_URL
    ? `${process.env.REACT_APP_ADMIN_API_URL}/api/companies`
    : null,
  "https://api-admin.native91.com/api/companies",
  "https://api.native91.com/api/companies",
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/companies`
    : null,
  "https://api-vendor.native91.com/api/companies",
].filter(Boolean);

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

// ============================================================
// 🎯 PARSE LOGO
// ============================================================
const parseLogo = (logo) => {
  if (!logo) return { path: null, source: null };

  if (typeof logo === "object" && !Array.isArray(logo)) {
    if (logo.path) return { path: logo.path, source: logo.source || null };
    if (logo.image) return { path: logo.image, source: logo.source || null };
    if (logo.url) return { path: logo.url, source: logo.source || null };
  }

  if (Array.isArray(logo)) logo = logo[0];
  if (typeof logo !== "string") return { path: null, source: null };

  return { path: logo.trim(), source: null };
};

// ============================================================
// 🎯 BUILD CANDIDATE URLs
// - Handles ABSOLUTE URLs (extracts path, tries both backends)
// - ADMIN FIRST, then VENDOR fallback
// ============================================================
const buildImageCandidates = (rawLogo) => {
  const { path, source } = parseLogo(rawLogo);
  if (!path) return [];

  // ============================================================
  // CASE 1: ABSOLUTE URL — extract path, try both backends
  // ============================================================
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      const relativePath = url.pathname; // "/uploads/documents/..."

      const candidates = [];

      // ✅ Admin FIRST
      candidates.push(`${ADMIN_IMAGE_BASE}${relativePath}`);

      // ✅ Original URL
      if (!candidates.includes(path)) {
        candidates.push(path);
      }

      // ✅ Vendor fallback
      if (!path.includes(VENDOR_BACKEND_URL)) {
        const vendorUrl = `${VENDOR_BACKEND_URL}${relativePath}`;
        if (!candidates.includes(vendorUrl)) {
          candidates.push(vendorUrl);
        }
      }

      return candidates;
    } catch (err) {
      return [path];
    }
  }

  // ============================================================
  // CASE 2: Explicit source in DB
  // ============================================================
  if (source === "admin") {
    return [`${ADMIN_IMAGE_BASE}${path}`];
  }
  if (source === "vendor") {
    return [`${VENDOR_BACKEND_URL}${path}`];
  }

  // ============================================================
  // CASE 3: Relative path
  // ============================================================
  const candidates = [];

  if (path.startsWith("/uploads") || path.startsWith("/public")) {
    candidates.push(`${ADMIN_IMAGE_BASE}${path}`);
    candidates.push(`${VENDOR_BACKEND_URL}${path}`);
  } else if (path.startsWith("/images")) {
    candidates.push(`${ADMIN_IMAGE_BASE}${path}`);
    candidates.push(`${VENDOR_BACKEND_URL}${path}`);
  } else if (path.startsWith("/")) {
    candidates.push(`${ADMIN_IMAGE_BASE}${path}`);
    candidates.push(`${VENDOR_BACKEND_URL}${path}`);
  } else {
    candidates.push(`${ADMIN_IMAGE_BASE}/uploads/${path}`);
    candidates.push(`${VENDOR_BACKEND_URL}/uploads/${path}`);
  }

  return candidates;
};

// ============================================================
// 🆕 SMART IMAGE
// - Tries admin first, then vendor
// - Uses ref to avoid async bugs
// - On fail → shows ONLY the image path
// ============================================================
const SmartImage = ({ src, alt, className, onError, style, ...props }) => {
  const candidatesRef = useRef([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [imgKey, setImgKey] = useState(0);

  useEffect(() => {
    const list = buildImageCandidates(src);
    console.log("🖼️ Candidates:", list);
    candidatesRef.current = list;
    setCurrentIdx(0);
    setFailed(list.length === 0);
    setImgKey((k) => k + 1);
  }, [src]);

  const handleError = () => {
    const candidates = candidatesRef.current;
    const nextIdx = currentIdx + 1;

    console.log(`❌ Failed: ${candidates[currentIdx]}`);

    if (nextIdx < candidates.length) {
      console.log(`➡️ Trying next: ${candidates[nextIdx]}`);
      setCurrentIdx(nextIdx);
      setImgKey((k) => k + 1);
    } else {
      console.error("❌ All candidates failed for:", src);
      setFailed(true);
      if (onError) onError();
    }
  };

  const handleLoad = (e) => {
    console.log(
      `✅ Loaded: ${candidatesRef.current[currentIdx]} — ${e.target.naturalWidth}x${e.target.naturalHeight}`
    );
  };

  // ❌ FAIL — Show ONLY the path
  if (failed || candidatesRef.current.length === 0) {
    const { path } = parseLogo(src);
    const displayPath = path || String(src) || "(no image path)";

    return (
      <div
        className={className}
        style={{
          padding: "10px",
          fontSize: "12px",
          color: "#333",
          fontFamily: "monospace",
          wordBreak: "break-all",
          textAlign: "center",
          lineHeight: "1.4",
          ...style,
        }}
        title={displayPath}
      >
        {displayPath}
      </div>
    );
  }

  const currentSrc = candidatesRef.current[currentIdx];

  return (
    <img
      key={`${currentSrc}-${imgKey}`}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
};

// ============================================================
// Component
// ============================================================
const Product = () => {
  const [brands, setBrands] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandStats, setBrandStats] = useState({
    totalBrands: 0,
    totalCategories: 0,
  });

  // ✅ Extract categories
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
      if (Array.isArray(brand.categories)) {
        brand.categories.forEach((cat) => {
          if (cat && cat.trim()) categorySet.add(cat.trim());
        });
      }
    });
    return Array.from(categorySet).sort();
  };

  // ✅ Apply filters and sorting
  const applyFiltersAndSort = (brandsData) => {
    let result = [...brandsData];

    if (selectedCategory !== "all") {
      result = result.filter((brand) => {
        if (brand.category) {
          if (Array.isArray(brand.category)) {
            return brand.category.some(
              (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
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

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (brand) =>
          brand.name?.toLowerCase().includes(term) ||
          brand.description?.toLowerCase().includes(term) ||
          brand.category?.toString().toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
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

  // ============================================================
  // ✅ FETCH BRANDS — try multiple companies URLs
  // ============================================================
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      let response = null;
      let lastError = null;

      for (const url of COMPANIES_API_CANDIDATES) {
        try {
          console.log("📡 Trying:", url);
          response = await axios.get(url, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          console.log("✅ Companies API works:", url);
          break;
        } catch (err) {
          console.warn(
            "❌ Failed:",
            url,
            "—",
            err.response?.status || err.message
          );
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("All companies API URLs failed");
      }

      let brandsData = [];

      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          brandsData = response.data.companies;
        } else if (Array.isArray(response.data)) {
          brandsData = response.data;
        } else if (
          response.data.companies &&
          Array.isArray(response.data.companies)
        ) {
          brandsData = response.data.companies;
        }
      }

      console.log(`📂 Fetched ${brandsData.length} brands`);

      // 🆕 productCount check
      const hasProductCountField = brandsData.some(
        (b) =>
          b.productCount !== undefined ||
          b.productsCount !== undefined ||
          b.totalProducts !== undefined
      );

      const allHaveZeroCount =
        hasProductCountField &&
        brandsData.every((b) => {
          const count =
            b.productCount ?? b.productsCount ?? b.totalProducts ?? 0;
          return count === 0;
        });

      let brandsWithProducts = brandsData;

      if (hasProductCountField && !allHaveZeroCount) {
        console.log("🎯 Using productCount from API");
        brandsWithProducts = brandsData.filter((b) => {
          const count =
            b.productCount ?? b.productsCount ?? b.totalProducts ?? 0;
          return count > 0;
        });
      } else {
        console.log("🔧 productCount unreliable — checking per brand...");
        const brandsToCheck = brandsData.slice(0, 30);

        const checkPromises = brandsToCheck.map(async (brand) => {
          const brandName = brand.name || brand.company;
          if (!brandName) return { brand, hasProducts: false };

          try {
            const endpoints = [
              `${API_URL}/companies/${encodeURIComponent(
                brandName
              )}/products?limit=1`,
              `${API_URL}/products?company=${encodeURIComponent(
                brandName
              )}&limit=1`,
              `${API_URL}/v2/products?company=${encodeURIComponent(
                brandName
              )}&limit=1`,
            ];

            for (const url of endpoints) {
              try {
                const res = await axios.get(url, { timeout: 5000 });
                const products =
                  res.data?.products ||
                  res.data?.data?.products ||
                  res.data?.data ||
                  [];

                if (Array.isArray(products) && products.length > 0) {
                  return { brand, hasProducts: true };
                }
              } catch (e) {
                continue;
              }
            }
            return { brand, hasProducts: false };
          } catch (err) {
            return { brand, hasProducts: true };
          }
        });

        const results = await Promise.all(checkPromises);
        brandsWithProducts = results
          .filter((r) => r.hasProducts)
          .map((r) => r.brand);

        if (brandsWithProducts.length === 0) {
          console.warn("⚠️ All filtered — showing all as fallback");
          brandsWithProducts = brandsData;
        }
      }

      setBrands(brandsWithProducts);

      const extractedCategories = extractCategories(brandsWithProducts);
      setCategories(extractedCategories);
      setBrandStats({
        totalBrands: brandsWithProducts.length,
        totalCategories: extractedCategories.length,
      });

      const filtered = applyFiltersAndSort(brandsWithProducts);
      setFilteredBrands(filtered);

      if (brandsWithProducts.length === 0) {
        setError("No brands with products found.");
      }
    } catch (err) {
      console.error("🔴 ERROR:", err);
      let errorMessage = "Failed to load brands. ";
      if (err.code === "ECONNABORTED") {
        errorMessage += "Request timed out.";
      } else if (err.response) {
        errorMessage += `Status ${err.response.status}.`;
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

  useEffect(() => {
    if (brands.length > 0) {
      const filtered = applyFiltersAndSort(brands);
      setFilteredBrands(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, searchTerm, selectedCategory, brands]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchBrands();
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading
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

  // Error
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
                <Button variant="outline-danger" size="sm" onClick={handleRetry}>
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

  // Empty
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

  // Success
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
              </Row>
            </div>
          )}

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
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {filteredBrands.map((item, index) => {
                const isEven = index % 2 !== 0;

                return (
                  <Row
                    key={item._id || index}
                    className={`align-items-center value-row mb-5 ${
                      isEven ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Col md={3}>
                      <motion.div
                        className="value-image-wrapper"
                        variants={!isEven ? fadeLeft : fadeRight}
                        initial="hidden"
                        whileInView="visible"
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                      >
                        {/* 🆕 SmartImage — admin first, vendor fallback */}
                        {item.logo ? (
                          <div className="brand-image-container">
                            <SmartImage
                              src={item.logo}
                              alt={item.name}
                              className="brand-image"
                            />
                          </div>
                        ) : null}
                      </motion.div>
                    </Col>

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
                          {(() => {
                            const description =
                              item.description ||
                              `${
                                item.name || "This brand"
                              } - Premium brand on Native91`;

                            const words = description.trim().split(/\s+/);
                            const isLong = words.length > 100;

                            return (
                              <>
                                {isLong && !expandedDescriptions[item._id]
                                  ? `${words.slice(0, 50).join(" ")}...`
                                  : description}

                                {isLong && (
                                  <button
                                    type="button"
                                    className="read-more-btn"
                                    onClick={() =>
                                      setExpandedDescriptions((prev) => ({
                                        ...prev,
                                        [item._id]: !prev[item._id],
                                      }))
                                    }
                                  >
                                    {expandedDescriptions[item._id]
                                      ? " Read Less"
                                      : " Read More"}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </p>

                        <div className="d-flex flex-wrap gap-3 align-items-center mt-3">
                          <NavLink
                            to={`/company/${encodeURIComponent(
                              item.name || item._id
                            )}`}
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
