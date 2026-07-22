// Header.jsx - WITH PROPER CART COUNT
import { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Container,
  Nav,
  Offcanvas,
  Form,
  Button,
  Dropdown,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  HiOutlineMenuAlt3,
  HiOutlineSearch,
  HiOutlineUser,
} from "react-icons/hi";
import { FiHeart, FiShoppingBag, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import "./header.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef(null);

  // ✅ Use Cart Context for cart count
  const { cartCount, fetchCart } = useCart();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          { _id: "1", name: "All Category" },
          { _id: "2", name: "Organic Food & Healthy Snacks" },
          { _id: "3", name: "Natural Skin Care & Wellness" },
          { _id: "4", name: "Gifts & Hamper" },
          { _id: "5", name: "Handmade Home Decor" },
          { _id: "6", name: "Sustainable Lifestyle" },
          { _id: "7", name: "Jewelry & Accessories" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Fetch cart on mount and when cart changes
  useEffect(() => {
    fetchCart();

    // Listen for cart changes from other components
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCart]);

  // ✅ Fetch search recommendations as user types
  const fetchRecommendations = async (query) => {
    if (!query || query.trim().length < 2) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search-suggestions`, {
        params: { q: query }
      });

      if (response.data && response.data.products) {
        setRecommendations(response.data.products.slice(0, 8));
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      try {
        const response = await axios.get(`${API_URL}/products/search`, {
          params: { keyword: query }
        });
        if (response.data && response.data.products) {
          setRecommendations(response.data.products.slice(0, 8));
          setShowRecommendations(true);
        }
      } catch (err2) {
        console.error("Fallback search also failed:", err2);
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchRecommendations(value);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    }, 300);
  };

  // ✅ Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { keyword: searchQuery }
      });
      setSearchResults(response.data.products || []);
      setShowSearchResults(true);
      setShowRecommendations(false);
    } catch (error) {
      console.error("Search error:", error);
      try {
        const response = await axios.get(`${API_URL}/search`, {
          params: { keyword: searchQuery }
        });
        setSearchResults(response.data.products || []);
        setShowSearchResults(true);
      } catch (err2) {
        console.error("Alternative search also failed:", err2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle recommendation click
  const handleRecommendationClick = (product) => {
    setShowSearch(false);
    setShowSearchResults(false);
    setShowRecommendations(false);
    setSearchQuery("");
    setRecommendations([]);
    window.location.href = `/product/${product._id}`;
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-box')) {
        setShowSearchResults(false);
        setShowRecommendations(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Menu items with dynamic categories
  const menu = [
    {
      title: "Brands",
      link: "/product",
    },
    {
      title: "Category",
      dropdown: categories.map((cat) => ({
        title: cat.name,
        link: `/category/${encodeURIComponent(cat.name)}`,
        productCount: cat.productCount || 0
      })),
    },
    {
      title: "Sell With Us",
      link: "/sell",
    },
    {
      title: "About Us",
      link: "/aboutus",
    },
  ];

  return (
    <>
      <div className="lexend">
        {/* SEARCH OVERLAY */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="search-overlay"
              initial={{ y: -120 }}
              animate={{ y: 0 }}
              exit={{ y: -120 }}
              transition={{ duration: 0.35 }}
            >
              <Container>
                <div className="search-box">
                  <Form onSubmit={handleSearch} className="w-100 d-flex">
                    <Form.Control
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="flex-grow-1"
                      autoFocus
                    />
                    <Button type="submit" variant="dark" className="ms-2" disabled={isLoading}>
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </Form>

                  {/* Search Recommendations Dropdown */}
                  {showRecommendations && recommendations.length > 0 && (
                    <div className="search-recommendations-dropdown">
                      <div className="recommendations-header">
                        <span>Recommendations</span>
                        <small>{recommendations.length} results</small>
                      </div>
                      {recommendations.map((product) => (
                        <div
                          key={product._id}
                          className="search-recommendation-item"
                          onClick={() => handleRecommendationClick(product)}
                        >
                          <div className="recommendation-img">
                            <img
                              src={product.image?.[0] || "/images/placeholder.png"}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="recommendation-info">
                            <div className="recommendation-name">{product.name}</div>
                            <div className="recommendation-price">₹{product.price}</div>
                            <div className="recommendation-company">{product.company || "Native91"}</div>
                          </div>
                        </div>
                      ))}
                      {recommendations.length > 0 && (
                        <div className="recommendations-footer">
                          <Button
                            variant="link"
                            onClick={handleSearch}
                            className="view-all-btn"
                          >
                            View all results for "{searchQuery}"
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results-dropdown">
                      {searchResults.map((product) => (
                        <NavLink
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="search-result-item"
                          onClick={() => {
                            setShowSearch(false);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="search-result-img">
                            <img
                              src={product.image?.[0] || "/images/placeholder.png"}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="search-result-info">
                            <div className="search-result-name">{product.name}</div>
                            <div className="search-result-price">₹{product.price}</div>
                            <div className="search-result-company">{product.company}</div>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && !recommendations.length && (
                    <div className="search-loading">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Searching...</span>
                    </div>
                  )}

                  <button
                    className="close-search"
                    onClick={() => {
                      setShowSearch(false);
                      setShowSearchResults(false);
                      setShowRecommendations(false);
                      setSearchQuery("");
                      setRecommendations([]);
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <Navbar expand="lg" className="premium-navbar" sticky="top">
          <Container>
            {/* Logo */}
            <Navbar.Brand as={NavLink} to="/">
              <img src="/images/native.jpg" alt="Native91" className="logo" />
            </Navbar.Brand>

            {/* Desktop Menu */}
            <Nav className="mx-auto desktop-menu">
              {menu.map((item, index) => (
                <motion.div key={index} whileHover={{ y: -3 }}>
                  {item.dropdown ? (
                    <Dropdown className="premium-dropdown">
                      <Dropdown.Toggle
                        as="div"
                        className="premium-link dropdown-toggle-custom"
                      >
                        {item.title}
                        {loadingCategories && (
                          <span className="ms-1" style={{ fontSize: '10px' }}>⏳</span>
                        )}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {loadingCategories ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-loading">Loading categories...</span>
                          </Dropdown.Item>
                        ) : item.dropdown.length === 0 ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-error">No categories available</span>
                          </Dropdown.Item>
                        ) : (
                          item.dropdown.map((sub, i) => (
                            <Dropdown.Item
                              as={NavLink}
                              to={sub.link}
                              key={i}
                              className="dropdown-item-custom"
                              onClick={() => setShowMenu(false)}
                            >
                              {sub.title}
                              {sub.productCount > 0 && (
                                <span className="product-count">({sub.productCount})</span>
                              )}
                            </Dropdown.Item>
                          ))
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <NavLink to={item.link} className="nav-link premium-link">
                      {item.title}
                    </NavLink>
                  )}
                </motion.div>
              ))}
            </Nav>

            {/* ✅ Desktop Icons */}
            <div className="desktop-icons">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

              {/* ✅ Desktop Cart Icon with Count */}
              <NavLink to="/cart" className="icon-link cart-icon-wrapper">
                <button type="button" className="cart-btn-with-badge">
                  <FiShoppingBag className="cart-icon" />

                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </NavLink>
            </div>

            {/* ✅ Mobile Right */}
            <div className="mobile-right">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

              {/* ✅ Mobile Cart Icon with Count */}
              <NavLink to="/cart" className="icon-link cart-icon-wrapper">
                <button type="button" className="cart-btn-with-badge">
                  <FiShoppingBag className="cart-icon" />

                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </NavLink>

              <button onClick={() => setShowMenu(true)}>
                <HiOutlineMenuAlt3 />
              </button>
            </div>
          </Container>
        </Navbar>

        {/* MOBILE MENU */}
        <Offcanvas
          show={showMenu}
          placement="end"
          onHide={() => setShowMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <img src="/images/native.jpg" className="mobile-logo" alt="Native91" />
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="flex-column lexend">
              {menu.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <>
                      <div className="mobile-link">
                        {item.title}
                        {loadingCategories && (
                          <span className="ms-1" style={{ fontSize: '12px' }}>⏳</span>
                        )}
                      </div>

                      {loadingCategories ? (
                        <div className="mobile-sublink text-muted" style={{ paddingLeft: '20px' }}>
                          Loading categories...
                        </div>
                      ) : item.dropdown.length === 0 ? (
                        <div className="mobile-sublink text-danger" style={{ paddingLeft: '20px' }}>
                          No categories available
                        </div>
                      ) : (
                        item.dropdown.map((sub, i) => (
                          <NavLink
                            key={i}
                            to={sub.link}
                            className="mobile-sublink"
                            onClick={() => setShowMenu(false)}
                          >
                            {sub.title}
                            {sub.productCount > 0 && (
                              <span className="product-count">({sub.productCount})</span>
                            )}
                          </NavLink>
                        ))
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.link}
                      className="mobile-link"
                      onClick={() => setShowMenu(false)}
                    >
                      {item.title}
                    </NavLink>
                  )}
                </div>
              ))}
            </Nav>

            <hr />

            <div className="mobile-bottom-icons lexend">
              <NavLink
                to="/wishlist"
                className="mobile-icon-btn"
                onClick={() => setShowMenu(false)}
              >
                <FiHeart />
                <span>Wishlist</span>
              </NavLink>

              <NavLink
                to="/cart"
                className="mobile-icon-btn"
                onClick={() => setShowMenu(false)}
              >
                <FiShoppingBag />
                <span>Cart</span>
                {cartCount > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="ms-1"
                    style={{ fontSize: '10px' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </NavLink>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default Header;