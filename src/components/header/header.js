// Header.jsx - WITH CART & WISHLIST COUNTS
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
  HiOutlineHeart,
  HiOutlineMenuAlt3,
  HiOutlineSearch,
  HiOutlineUser,
} from "react-icons/hi";
import { FiHeart, FiShoppingBag, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
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

  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch {
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

  useEffect(() => {
    fetchCart();
    fetchWishlist();

    const handleCartUpdate = () => fetchCart();
    const handleWishlistUpdate = () => fetchWishlist();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchCart, fetchWishlist]);

  // 🔥 LIVE SEARCH: Fetch suggestions while typing
  const fetchLiveSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/search-suggestions`, {
        params: { q: query },
      });

      console.log("🔍 LIVE SEARCH API Response:", response.data);

      // Only use API data, no fallback
      if (response.data?.products && response.data.products.length > 0) {
        setRecommendations(response.data.products.slice(0, 8));
        setShowRecommendations(true);
      } else {
        // API returned empty - show nothing
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      console.log("❌ Live search error:", error);
      // On error, show nothing (no fallback)
      setRecommendations([]);
      setShowRecommendations(false);
    }
  };

  // 🔥 Handle search change with live suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        // Only fetch live suggestions from API
        fetchLiveSuggestions(value);
      } else {
        setRecommendations([]);
        setSearchResults([]);
        setShowRecommendations(false);
        setShowSearchResults(false);
      }
    }, 300);
  };

  // 🔥 Search on button click or Enter
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { keyword: searchQuery },
      });
      setSearchResults(response.data?.products || []);
      setShowSearchResults(true);
      setShowRecommendations(false);
    } catch {
      try {
        const response = await axios.get(`${API_URL}/search`, {
          params: { keyword: searchQuery },
        });
        setSearchResults(response.data?.products || []);
        setShowSearchResults(true);
      } catch {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationClick = (product) => {
    setShowSearch(false);
    setShowSearchResults(false);
    setShowRecommendations(false);
    setSearchQuery("");
    setRecommendations([]);
    window.location.href = `/product/${product._id}`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-box")) {
        setShowSearchResults(false);
        setShowRecommendations(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const menu = [
    { title: "Brands", link: "/product" },
    {
      title: "Category",
      dropdown: categories.map((cat) => ({
        title: cat.name,
        link: `/category/${encodeURIComponent(cat.name)}`,
        productCount: cat.productCount || 0,
      })),
    },
    { title: "Sell With Us", link: "/sell" },
    { title: "About Us", link: "/aboutus" },
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
                    <Button
                      type="submit"
                      variant="dark"
                      className="ms-2"
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : "Search"}
                    </Button>
                  </Form>

                  {/* 🔥 Live Recommendations from API while typing */}
                  {showRecommendations && recommendations.length > 0 && (
                    <div className="search-recommendations-dropdown">
                      <div className="recommendations-header">
                        {/* <span>Live Recommendations</span> */}
                        <small>{recommendations.length} products</small>
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
                            <div className="recommendation-name">
                              {product.name}
                            </div>
                            <div className="recommendation-price">
                              ₹{product.price}
                            </div>
                            <div className="recommendation-company">
                              {product.company || "Native91"}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="recommendations-footer">
                        <div className="view-all-text">
                          {/* Showing live suggestions for "{searchQuery}" */}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🔥 Search Results after button click */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results-dropdown">
                      <div className="recommendations-header">
                        <span>Search Results</span>
                        <small>{searchResults.length} products</small>
                      </div>
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
                            <div className="search-result-name">
                              {product.name}
                            </div>
                            <div className="search-result-price">
                              ₹{product.price}
                            </div>
                            <div className="search-result-company">
                              {product.company}
                            </div>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}

                  {isLoading && !recommendations.length && (
                    <div className="search-loading">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Searching...</span>
                    </div>
                  )}

                  {/* 🔥 No results message - Only from API */}
                  {!isLoading && 
                   searchQuery.length >= 2 && 
                   !showRecommendations && 
                   !showSearchResults && 
                   recommendations.length === 0 && 
                   searchResults.length === 0 && (
                    <div className="search-no-results">
                      <span>No products found for "{searchQuery}"</span>
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
                      setSearchResults([]);
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
            <Navbar.Brand as={NavLink} to="/">
              <img src="/images/native.jpg" alt="Native91" className="logo" />
            </Navbar.Brand>

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
                          <span className="ms-1" style={{ fontSize: "10px" }}>
                            WITING...
                          </span>
                        )}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {loadingCategories ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-loading">
                              Loading categories...
                            </span>
                          </Dropdown.Item>
                        ) : item.dropdown.length === 0 ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-error">
                              No categories available
                            </span>
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
                                <span className="product-count">
                                  ({sub.productCount})
                                </span>
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

            {/* Desktop Icons */}
            <div className="desktop-icons">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

              {/* Wishlist Icon with Count */}
              <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
                <button type="button" className="cart-btn-with-badge">
                  <HiOutlineHeart className="cart-icon" />
                  {wishlistCount > 0 && (
                    <span className="cart-badge wishlist-badge">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </button>
              </NavLink>

              {/* Cart Icon with Count */}
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

            {/* Mobile Right */}
            <div className="mobile-right">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

              {/* Mobile Wishlist Icon with Count */}
              <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
                <button type="button" className="cart-btn-with-badge">
                  <HiOutlineHeart className="cart-icon" />
                  {wishlistCount > 0 && (
                    <span className="cart-badge wishlist-badge">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </button>
              </NavLink>

              {/* Mobile Cart Icon with Count */}
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
              <img
                src="/images/native.jpg"
                className="mobile-logo"
                alt="Native91"
              />
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
                          <span className="ms-1" style={{ fontSize: "12px" }}>
                            WITING...
                          </span>
                        )}
                      </div>

                      {loadingCategories ? (
                        <div
                          className="mobile-sublink text-muted"
                          style={{ paddingLeft: "20px" }}
                        >
                          Loading categories...
                        </div>
                      ) : item.dropdown.length === 0 ? (
                        <div
                          className="mobile-sublink text-danger"
                          style={{ paddingLeft: "20px" }}
                        >
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
                              <span className="product-count">
                                ({sub.productCount})
                              </span>
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
                {wishlistCount > 0 && (
                  <Badge
                    pill
                    bg=""
                    className="ms-1"
                    style={{ fontSize: "10px" ,backgroundColor: "#0f5132" }}
                  >
                    {wishlistCount}
                  </Badge>
                )}
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
                    // bg="danger"
                    className="ms-1"
                    style={{ fontSize: "10px",backgroundColor: "#0f5132"  }}
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