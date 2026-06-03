import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaChevronRight,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Details from "../../components/details/details";
import "./categorygrid.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
// ✅ USE VENDOR BACKEND URL FOR IMAGES
const VENDOR_BEND_URL = "https://api.brandelvendor.starlighttechlabsindia.com";

// ✅ FIXED: Image formatting function using VENDOR backend
const formatImagePath = (image) => {
  if (!image) {
    return "/images/placeholder.png";
  }

  let imgPath = image;

  if (Array.isArray(image)) {
    if (image.length === 0) {
      return "/images/placeholder.png";
    }
    imgPath = image[0];
  }

  if (typeof imgPath !== "string") {
    return "/images/placeholder.png";
  }

  if (imgPath.trim() === "") {
    return "/images/placeholder.png";
  }

  if (imgPath.startsWith("http")) {
    return imgPath;
  }

  if (imgPath.startsWith("/uploads")) {
    return `${VENDOR_BEND_URL}${imgPath}`;
  }

  if (imgPath.startsWith("/images")) {
    return imgPath;
  }

  return `${VENDOR_BEND_URL}${imgPath}`;
};

const CategoryProducts = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName || "All");
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch products for current category
  useEffect(() => {
    if (!decodedCategory) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, {
        params: {
          category: decodedCategory !== "All" ? decodedCategory : undefined,
        },
      })
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setFilteredProducts([]);
      })
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  // Fetch all categories for sidebar
  useEffect(() => {
    axios
      .get(`${API_URL}/categories`)
      .then((res) => {
        setAllCategories(res.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category),
      );
    }

    if (selectedPriceRange) {
      switch (selectedPriceRange) {
        case "under-500":
          filtered = filtered.filter((p) => p.price < 500);
          break;
        case "500-1000":
          filtered = filtered.filter((p) => p.price >= 500 && p.price <= 1000);
          break;
        case "1000-2000":
          filtered = filtered.filter((p) => p.price >= 1000 && p.price <= 2000);
          break;
        case "2000-5000":
          filtered = filtered.filter((p) => p.price >= 2000 && p.price <= 5000);
          break;
        case "above-5000":
          filtered = filtered.filter((p) => p.price > 5000);
          break;
        default:
          break;
      }
    } else {
      if (priceMin && !isNaN(priceMin)) {
        filtered = filtered.filter((p) => p.price >= Number(priceMin));
      }
      if (priceMax && !isNaN(priceMax)) {
        filtered = filtered.filter((p) => p.price <= Number(priceMax));
      }
    }

    if (selectedRating > 0) {
      filtered = filtered.filter(
        (p) => (p.averageRating || 0) >= selectedRating,
      );
    }

    setFilteredProducts(filtered);
  }, [
    selectedCategories,
    selectedPriceRange,
    priceMin,
    priceMax,
    selectedRating,
    products,
  ]);

  const getSortedProducts = () => {
    let sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-low-high":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case "rating":
        return sorted.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
        );
      default:
        return sorted;
    }
  };

  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const handleCategorySelect = (category) => {
    if (category === decodedCategory) {
      window.location.reload();
    } else {
      navigate(`/category/${encodeURIComponent(category)}`);
    }
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange("");
    setPriceMin("");
    setPriceMax("");
    setSelectedRating(0);
  };

  const sortedProducts = getSortedProducts();

  if (loading) {
    return (
      <>
        <Header />
        <div className="category-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading products...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="category-background lexend px-2">
        <Container className="category-page">
          <div className="category-hero-section">
            <Container>
              <div className="hero-content text-center">
                <h1 className="hero-title funnel-sans">{decodedCategory}</h1>
                <p className="hero-subtitle">
                  Beautiful pieces to style your space and make it truly yours.
                </p>
                <p className="product-count">
                  {filteredProducts.length} Products
                </p>
              </div>
            </Container>
          </div>

          <div className="top-bar">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <Button
                variant="outline-secondary"
                className="mobile-filter-btn d-lg-none"
                onClick={() => setShowMobileFilters(true)}
              >
                <FaFilter /> Filters
              </Button>

              <div className="d-flex align-items-center gap-3 ms-auto">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          <Row className="g-4">
            <Col lg={3} className="d-none d-lg-block">
              <div className="filters-sidebar">
                <div className="filter-header">
                  <h5>Filters</h5>
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="clear-all-btn"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="filter-group">
                  <h6>Categories</h6>
                  <div className="category-list">
                    <div
                      className={`category-item ${decodedCategory === "All" ? "active" : ""}`}
                      onClick={() => handleCategorySelect("All")}
                    >
                      <span>All Categories</span>
                      <FaChevronRight size={12} />
                    </div>
                    {allCategories.map((cat) => (
                      <div
                        key={cat._id}
                        className={`category-item ${decodedCategory === cat.name ? "active" : ""}`}
                        onClick={() => handleCategorySelect(cat.name)}
                      >
                        <span>{cat.name}</span>
                        <FaChevronRight size={12} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h6>Price</h6>
                  <div className="price-options">
                    <Form.Check
                      type="radio"
                      name="priceRange"
                      label="Under ₹500"
                      checked={selectedPriceRange === "under-500"}
                      onChange={() => setSelectedPriceRange("under-500")}
                    />
                    <Form.Check
                      type="radio"
                      name="priceRange"
                      label="₹500 - ₹1,000"
                      checked={selectedPriceRange === "500-1000"}
                      onChange={() => setSelectedPriceRange("500-1000")}
                    />
                    <Form.Check
                      type="radio"
                      name="priceRange"
                      label="₹1,000 - ₹2,000"
                      checked={selectedPriceRange === "1000-2000"}
                      onChange={() => setSelectedPriceRange("1000-2000")}
                    />
                    <Form.Check
                      type="radio"
                      name="priceRange"
                      label="₹2,000 - ₹5,000"
                      checked={selectedPriceRange === "2000-5000"}
                      onChange={() => setSelectedPriceRange("2000-5000")}
                    />
                    <Form.Check
                      type="radio"
                      name="priceRange"
                      label="Above ₹5,000"
                      checked={selectedPriceRange === "above-5000"}
                      onChange={() => setSelectedPriceRange("above-5000")}
                    />
                    <div className="custom-price">
                      <div className="price-inputs">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => {
                            setSelectedPriceRange("");
                            setPriceMin(e.target.value);
                          }}
                        />
                        <span>to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => {
                            setSelectedPriceRange("");
                            setPriceMax(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="filter-group">
                  <h6>Rating</h6>
                  <div className="rating-options">
                    {[4, 3, 2, 1].map((rating) => (
                      <Form.Check
                        key={rating}
                        type="radio"
                        name="rating"
                        label={
                          <span className="rating-label">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                color={i < rating ? "#ffc107" : "#e4e5e9"}
                                size={14}
                              />
                            ))}
                            <span>& up</span>
                          </span>
                        }
                        checked={selectedRating === rating}
                        onChange={() =>
                          setSelectedRating(
                            rating === selectedRating ? 0 : rating,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            {showMobileFilters && (
              <div
                className="mobile-filters-overlay"
                onClick={() => setShowMobileFilters(false)}
              >
                <div
                  className="mobile-filters-drawer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="drawer-header">
                    <h5>Filters</h5>
                    <Button
                      variant="link"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="drawer-body">
                    <div className="filter-group">
                      <h6>Categories</h6>
                      <div className="category-list">
                        <div
                          className="category-item"
                          onClick={() => handleCategorySelect("All")}
                        >
                          <span>All Categories</span>
                        </div>
                        {allCategories.map((cat) => (
                          <div
                            key={cat._id}
                            className="category-item"
                            onClick={() => handleCategorySelect(cat.name)}
                          >
                            <span>{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="filter-group">
                      <h6>Price</h6>
                      <Form.Check
                        type="radio"
                        name="priceRangeMobile"
                        label="Under ₹500"
                        checked={selectedPriceRange === "under-500"}
                        onChange={() => setSelectedPriceRange("under-500")}
                      />
                      <Form.Check
                        type="radio"
                        name="priceRangeMobile"
                        label="₹500 - ₹1,000"
                        checked={selectedPriceRange === "500-1000"}
                        onChange={() => setSelectedPriceRange("500-1000")}
                      />
                      <Form.Check
                        type="radio"
                        name="priceRangeMobile"
                        label="₹1,000 - ₹2,000"
                        checked={selectedPriceRange === "1000-2000"}
                        onChange={() => setSelectedPriceRange("1000-2000")}
                      />
                      <Form.Check
                        type="radio"
                        name="priceRangeMobile"
                        label="₹2,000 - ₹5,000"
                        checked={selectedPriceRange === "2000-5000"}
                        onChange={() => setSelectedPriceRange("2000-5000")}
                      />
                      <Form.Check
                        type="radio"
                        name="priceRangeMobile"
                        label="Above ₹5,000"
                        checked={selectedPriceRange === "above-5000"}
                        onChange={() => setSelectedPriceRange("above-5000")}
                      />
                    </div>
                  </div>
                  <div className="drawer-footer">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Col lg={9}>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No products found</h5>
                  <p className="text-muted">Try adjusting your filters</p>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <Row className="g-4">
                  {sortedProducts.map((item) => {
                    const isInWishlist = wishlist.includes(item._id);
                    const imageUrl = formatImagePath(item.image);

                    return (
                      <Col key={item._id} xs={6} md={4} className="text-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            className=""
                            onClick={() => navigate(`/product/${item._id}`)}
                          >
                            <div className="product-image-wrapper">
                              <Card.Img
                                className="product-card"
                                src={imageUrl}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/placeholder.png";
                                }}
                              />
                              <div
                                className="wishlist-btn"
                                onClick={(e) => toggleWishlist(e, item._id)}
                              >
                                {isInWishlist ? (
                                  <FaHeart color="#e74c3c" />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </div>
                            </div>
                            <Card.Body>
                              <div className="product-brand">
                                {item.brand || "Artisan Craft"}
                              </div>
                              <h6 className="product-name">{item.name}</h6>
                              <div className="product-rating">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    color={
                                      i < Math.round(item.averageRating || 0)
                                        ? "#ffc107"
                                        : "#e4e5e9"
                                    }
                                    size={12}
                                  />
                                ))}
                                <span className="rating-count">
                                  ({item.ratings?.length || 0})
                                </span>
                              </div>
                              <div className="product-price">
                                ₹{item.price?.toLocaleString() || item.price}
                              </div>
                              <Button className="view-details-btn">
                                View Details
                              </Button>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Details />

      <Footer />
    </>
  );
};

export default CategoryProducts;