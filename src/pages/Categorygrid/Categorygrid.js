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
  FaShoppingCart,
  FaSitemap,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { createSlug } from "../../utils/slugUtils";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import "./categorygrid.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const VENDOR_BEND_URL = "https://api-vendor.native91.com";

// const VENDOR_BEND_URL = "http://localhost:5177"; // Adjust this to your backend URL

const formatImagePath = (image) => {
  if (!image) return "/images/placeholder.png";
  
  let imgPath = image;
  if (Array.isArray(image)) {
    if (image.length === 0) return "/images/placeholder.png";
    imgPath = image[0];
  }
  
  if (typeof imgPath !== "string") return "/images/placeholder.png";
  if (imgPath.trim() === "") return "/images/placeholder.png";
  if (imgPath.startsWith("http")) return imgPath;
  if (imgPath.startsWith("/uploads")) return `${VENDOR_BEND_URL}${imgPath}`;
  if (imgPath.startsWith("/images")) return imgPath;
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

  const { categoryName, subCategoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName || "All");
  const decodedSubCategory = subCategoryName ? decodeURIComponent(subCategoryName) : null;
  const navigate = useNavigate();

  const { isInWishlist, toggleWishlist, fetchWishlist } = useWishlist();
  const { addToCart, setShowCart } = useCart();

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch products
  useEffect(() => {
    if (!decodedCategory) return;

    setLoading(true);
    
    const fetchProducts = async () => {
      try {
        let url = `${API_URL}/products`;
        let response = await axios.get(url);
        let allProducts = response.data || [];

        // Filter by category
        if (decodedCategory !== "All") {
          allProducts = allProducts.filter(
            (p) => p.category && p.category.toLowerCase() === decodedCategory.toLowerCase()
          );
        }

        // Filter by sub-category if specified (from URL)
        if (decodedSubCategory) {
          allProducts = allProducts.filter((p) => {
            if (p.subCategory && p.subCategory.toLowerCase() === decodedSubCategory.toLowerCase()) {
              return true;
            }
            if (p.subCategories && Array.isArray(p.subCategories)) {
              return p.subCategories.some(
                (sub) => sub.toLowerCase() === decodedSubCategory.toLowerCase()
              );
            }
            return false;
          });
          // Set the selected sub-category filter to match URL
          setSelectedSubCategories([decodedSubCategory]);
        }

        setProducts(allProducts);
        setFilteredProducts(allProducts);
        fetchWishlist();
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [decodedCategory, decodedSubCategory, fetchWishlist]);

  // Fetch categories and sub-categories
  useEffect(() => {
    const fetchCategoriesAndSubs = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/categories`);
        setAllCategories(catRes.data || []);

        const subMap = {};
        const categories = catRes.data || [];
        
        for (const cat of categories) {
          try {
            const subRes = await axios.get(`${API_URL}/categories/${encodeURIComponent(cat.name)}/subcategories`);
            if (subRes.data && subRes.data.subCategories) {
              subMap[cat.name] = subRes.data.subCategories;
            }
          } catch (err) {
            try {
              const prodRes = await axios.get(`${API_URL}/products/by-category/${encodeURIComponent(cat.name)}`);
              if (prodRes.data && prodRes.data.products) {
                const subs = new Set();
                prodRes.data.products.forEach(p => {
                  if (p.subCategory) subs.add(p.subCategory);
                  if (p.subCategories) p.subCategories.forEach(s => subs.add(s));
                });
                subMap[cat.name] = Array.from(subs);
              }
            } catch (prodErr) {
              subMap[cat.name] = [];
            }
          }
        }
        
        setAllSubCategories(subMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategoriesAndSubs();
  }, []);

  // Apply filters - FIXED
  useEffect(() => {
    let filtered = [...products];

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.some(cat => 
          p.category && p.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Filter by selected sub-categories - FIXED
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) => {
        // Check if product matches ANY selected sub-category
        return selectedSubCategories.some(selectedSub => {
          // Check primary subCategory
          if (p.subCategory && p.subCategory.toLowerCase() === selectedSub.toLowerCase()) {
            return true;
          }
          // Check subCategories array
          if (p.subCategories && Array.isArray(p.subCategories)) {
            return p.subCategories.some(s => s.toLowerCase() === selectedSub.toLowerCase());
          }
          return false;
        });
      });
    }

    // Filter by price range
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

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter(
        (p) => (p.averageRating || 0) >= selectedRating,
      );
    }

    setFilteredProducts(filtered);
  }, [
    selectedCategories,
    selectedSubCategories,
    selectedPriceRange,
    priceMin,
    priceMax,
    selectedRating,
    products,
  ]);

  // Get sorted products
  const getSortedProducts = () => {
    let sorted = [...filteredProducts];
    switch (sortBy) {
      case "alphabetical-a-z":
        return sorted.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
      case "alphabetical-z-a":
        return sorted.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameB.localeCompare(nameA);
        });
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
        return sorted.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    
    setIsTogglingWishlist(prev => ({ ...prev, [productId]: true }));
    
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;
      
      await toggleWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        company: product.company || "Native91",
      });
      
      await fetchWishlist();
      
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    
    setIsAddingToCart(prev => ({ ...prev, [item._id]: true }));
    
    try {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      const primaryImage = Array.isArray(item.image) && item.image.length > 0
        ? item.image[0]
        : item.image || "";

      await addToCart({
        productId: item._id,
        name: item.name,
        price: parseFloat(item.price),
        originalPrice: parseFloat(item.price),
        image: primaryImage,
        quantity: 1,
        discountAmount: 0,
        couponCode: null,
      });

      setShowCart(true);
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const handleCategorySelect = (category) => {
    if (category === "All") {
      navigate("/category/All");
    } else {
      navigate(`/category/${encodeURIComponent(category)}`);
    }
    setShowMobileFilters(false);
  };

  // Handle sub-category checkbox change - FIXED
  const handleSubCategoryToggle = (subCategory) => {
    setSelectedSubCategories(prev => {
      if (prev.includes(subCategory)) {
        return prev.filter(s => s !== subCategory);
      } else {
        return [...prev, subCategory];
      }
    });
  };

  // Handle "All Sub-Categories" toggle
  const handleAllSubCategoriesToggle = () => {
    setSelectedSubCategories([]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedPriceRange("");
    setPriceMin("");
    setPriceMax("");
    setSelectedRating(0);
  };

  const sortedProducts = getSortedProducts();

  const checkIsInWishlist = (productId) => {
    return isInWishlist(productId);
  };

  // Get unique sub-categories for the current category
  const getCategorySubCategories = () => {
    if (decodedCategory === "All") {
      const allSubs = new Set();
      Object.values(allSubCategories).forEach(subs => {
        subs.forEach(s => allSubs.add(s));
      });
      return Array.from(allSubs);
    }
    return allSubCategories[decodedCategory] || [];
  };

  const categorySubCategories = getCategorySubCategories();

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
                <h1 className="hero-title funnel-sans">
                  {decodedSubCategory || decodedCategory}
                </h1>
                {decodedSubCategory && (
                  <p className="hero-breadcrumb">
                    <span 
                      onClick={() => navigate(`/category/${encodeURIComponent(decodedCategory)}`)}
                      style={{ cursor: "pointer", color: "#0D3B2E", textDecoration: "underline" }}
                    >
                      {decodedCategory}
                    </span>
                    {" › "}
                    <span>{decodedSubCategory}</span>
                  </p>
                )}
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
            <div className="d-flex justify-content-end align-items-center flex-wrap gap-3">
              <Button
                variant="outline-secondary"
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <FaFilter /> Filters
                {selectedSubCategories.length > 0 && (
                  <span className="filter-count-badge">
                    {selectedSubCategories.length}
                  </span>
                )}
              </Button>

              <div className="d-flex align-items-center gap-3 ms-auto">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Alphabetical (A-Z)</option>
                  <option value="alphabetical-z-a">Alphabetical (Z-A)</option>
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          <Row className="g-4">
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
                      className="text-dark text-decoration-none"
                    >
                      ✘
                    </Button>
                  </div>
                  <div className="drawer-body">
                    {/* Categories Filter */}
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
                            <span>► {cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-Categories Filter - Now inside the filter drawer */}
                    {categorySubCategories.length > 0 && (
                      <div className="filter-group">
                        <h6>
                          <FaSitemap className="me-1" /> Sub-Categories
                        </h6>
                        <div className="sub-category-filter-list">
                          <Form.Check
                            type="checkbox"
                            label="All Sub-Categories"
                            checked={selectedSubCategories.length === 0}
                            onChange={handleAllSubCategoriesToggle}
                          />
                          {categorySubCategories.map((sub, index) => (
                            <Form.Check
                              key={index}
                              type="checkbox"
                              label={sub}
                              checked={selectedSubCategories.includes(sub)}
                              onChange={() => handleSubCategoryToggle(sub)}
                            />
                          ))}
                        </div>
                        {selectedSubCategories.length > 0 && (
                          <div className="selected-filters-info">
                            <small className="text-muted">
                              {selectedSubCategories.length} sub-category(s) selected
                            </small>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Filter */}
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

                    {/* Rating Filter */}
                    <div className="filter-group">
                      <h6>Rating</h6>
                      <Form.Check
                        type="radio"
                        name="ratingMobile"
                        label="4★ & above"
                        checked={selectedRating === 4}
                        onChange={() => setSelectedRating(4)}
                      />
                      <Form.Check
                        type="radio"
                        name="ratingMobile"
                        label="3★ & above"
                        checked={selectedRating === 3}
                        onChange={() => setSelectedRating(3)}
                      />
                      <Form.Check
                        type="radio"
                        name="ratingMobile"
                        label="2★ & above"
                        checked={selectedRating === 2}
                        onChange={() => setSelectedRating(2)}
                      />
                      <Form.Check
                        type="radio"
                        name="ratingMobile"
                        label="All Ratings"
                        checked={selectedRating === 0}
                        onChange={() => setSelectedRating(0)}
                      />
                    </div>
                  </div>
                  <div className="drawer-footer">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button
                      variant="outline-success"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <Col lg={12}>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No products found</h5>
                  <p className="text-muted">
                    {decodedSubCategory 
                      ? `No products found in "${decodedSubCategory}" under "${decodedCategory}"`
                      : `No products found in "${decodedCategory}"`
                    }
                  </p>
                  <p className="text-muted">Try adjusting your filters or select another category</p>
                  <Button variant="outline-dark" onClick={() => navigate("/category/All")}>
                    View All Products
                  </Button>
                </div>
              ) : (
                <Row className="g-4">
                  {sortedProducts.map((item) => {
                    const inWishlist = checkIsInWishlist(item._id);
                    const imageUrl = formatImagePath(item.image);
                    const productSlug = createSlug(item.name);
                    const isToggling = isTogglingWishlist[item._id] || false;
                    const isAdding = isAddingToCart[item._id] || false;

                    return (
                      <Col key={item._id} xs={6} md={4} lg={3} className="text-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            className="product-card-grid"
                            onClick={() => navigate(`/product/${productSlug}`)}
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
                                className="wishlist-btn-category"
                                onClick={(e) => handleToggleWishlist(e, item._id)}
                                style={{ cursor: isToggling ? 'not-allowed' : 'pointer' }}
                              >
                                {isToggling ? (
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                ) : inWishlist ? (
                                  <FaHeart color="#e74c3c" />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </div>
                              {/* Sub-Category Badge */}
                              {item.subCategory && (
                                <div className="sub-category-badge">
                                  {item.subCategory}
                                </div>
                              )}
                            </div>
                            <Card.Body>
                              <div className="product-brand">
                                {item.company || "Artisan Craft"}
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
                              <Button 
                                className="add-to-cart-btn-category"
                                onClick={(e) => handleAddToCart(e, item)}
                                disabled={isAdding}
                              >
                                {isAdding ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <FaShoppingCart /> Add to Cart
                                  </>
                                )}
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

      <Footer />
    </>
  );
};

export default CategoryProducts;