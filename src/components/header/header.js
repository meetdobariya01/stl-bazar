import React, { useState, useEffect, useRef } from "react";
import { Navbar, Container, Form, FormControl } from "react-bootstrap";
import {
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Mainnavbar from "../navbar/navbar";
import axios from "axios";
import "./header.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const Header = () => {
  const navigate = useNavigate();
  const { showCart, setShowCart, cart } = useCart();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const totalQty = cart.reduce((total, item) => total + item.quantity, 0);

  // Fetch search suggestions - CHANGED to work with 1 character
  useEffect(() => {
    // console.log("Search value changed:", search);
    // ✅ Changed from > 1 to > 0
    if (search.trim().length > 0) {
      const delayDebounce = setTimeout(() => {
        // console.log("Fetching suggestions for:", search);
        fetchSuggestions(search);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      // console.log("Search empty, clearing suggestions");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // console.log("Clicked outside, closing suggestions");
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      // console.log("Calling API:", `${API_URL}/search-suggestions?q=${query}`);
      const response = await axios.get(
        `${API_URL}/search-suggestions?q=${query}`,
      );
      // console.log("API Response:", response.data);
      setSuggestions(response.data.products || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setShowSuggestions(false);
      setShowMobileMenu(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    console.log("Suggestion clicked, navigating to product:", productId);
    navigate(`/product/${productId}`);
    setSearch("");
    setShowSuggestions(false);
    setShowMobileMenu(false);
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    let imagePath = Array.isArray(image) ? image[0] : image;
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/images")) return imagePath;
    if (imagePath.startsWith("/uploads")) return `${BACKEND_URL}${imagePath}`;
    return `${BACKEND_URL}/uploads/${imagePath}`;
  };

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  return (
    <>
      {/* HEADER */}
      <Navbar className="main-header">
        <Container fluid className="header-wrapper">
          <div
            className="mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FaBars />
          </div>

          <div className="logo-box" onClick={() => navigate("/")}>
            <img src="/images/brandel.png" alt="logo" />
          </div>

          {/* DESKTOP SEARCH WITH SUGGESTIONS */}
          <div className="search-wrapper desktop-only" ref={searchRef}>
            <Form className="search-form" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search products..."
                className="search-input lexend"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    console.log("Input focused, showing suggestions");
                    setShowSuggestions(true);
                  }
                }}
              />
              <button className="search-btn" type="submit">
                <FaSearch />
              </button>
            </Form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions">
                {loading ? (
                  <div className="suggestion-loading">
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => (
                      <div
                        key={product._id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(product._id)}
                      >
                        <div className="suggestion-image">
                          <img
                            src={
                              getImageUrl(product.image) ||
                              "/images/placeholder-product.jpg"
                            }
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "/images/placeholder-product.jpg";
                            }}
                          />
                        </div>
                        <div className="suggestion-info">
                          <div className="suggestion-name">{product.name}</div>
                          <div className="suggestion-price">
                            ₹{formatPrice(product.price)}
                          </div>
                          <div className="suggestion-company">
                            {product.company}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* <div
                      className="view-all-results"
                      onClick={handleSearch}
                    >
                      View all results for "{search}"
                    </div> */}
                  </>
                ) : (
                  <div className="no-suggestions">
                    <p>No products found for "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="icon-group">
            <FaHeart onClick={() => navigate("/wishlist")} />
            <FaUser onClick={() => navigate("/login")} />
            <div className="cart-icon" onClick={() => setShowCart(true)}>
              <FaShoppingBag />
              {totalQty > 0 && <span className="cart-count">{totalQty}</span>}
            </div>
          </div>
        </Container>
      </Navbar>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Form className="search-form mobile-search" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search products..."
                className="s lexend"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn" type="submit">
                <FaSearch />
              </button>
            </Form>

            {/* ✅ Changed mobile search to work with 1 character */}
            {search.trim().length > 0 && suggestions.length > 0 && (
              <div className="mobile-search-results">
                {suggestions.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="mobile-suggestion-item"
                    onClick={() => handleSuggestionClick(product._id)}
                  >
                    <img
                      src={
                        getImageUrl(product.image) ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={product.name}
                    />
                    <div>
                      <div className="name">{product.name}</div>
                      <div className="price">₹{formatPrice(product.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mobile-links lexend">
              <span onClick={() => navigate("#")}>Shop by Category</span>
              <span onClick={() => navigate("/product")}>New In</span>
              <span onClick={() => navigate("/aboutus")}>Brands</span>
              <span onClick={() => navigate("/contactus")}>Gifting Guides</span>
              <span onClick={() => navigate("/sell")}>Editorial</span>
              <span onClick={() => navigate("/product")}>Sale</span>
              <span onClick={() => navigate("/aboutus")}>Sell With Us</span>
              <span onClick={() => navigate("/aboutus")}>About Us</span>
              <span onClick={() => navigate("/contactus")}>Contact Us</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
          >
            <motion.div
              className="cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-header">
                <h5>Your Shopping Cart</h5>
                <FaTimes onClick={() => setShowCart(false)} />
              </div>

              {cart.length === 0 ? (
                <p className="text-center mt-4">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <span>{item.name}</span>
                    <span>x {item.quantity}</span>
                  </div>
                ))
              )}

              <NavLink to="/checkout" className="checkout-btn">
                Checkout
              </NavLink>

              <NavLink to="/cart" className="outline-btn">
                View Cart
              </NavLink>

              <NavLink to="/" className="outline-btn">
                Continue Shopping
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Mainnavbar />
    </>
  );
};

export default Header;
