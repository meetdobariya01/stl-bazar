// Mainnavbar.js - FULLY FIXED — with icons (search, user, wishlist, cart)

import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaSitemap } from "react-icons/fa";
import { HiOutlineUser, HiOutlineHeart } from "react-icons/hi";
import { FiShoppingBag } from "react-icons/fi";
import axios from "axios";
import { createSlug } from "../../utils/slugUtils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./navbar.css";

const VENDOR_API_URL = "https://api-vendor.native91.com/api";
const ADMIN_API_URL = "https://api-admin.native91.com/api/category";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const parseSubCategories = (input, depth = 0) => {
  if (!input || depth > 10) return [];
  if (Array.isArray(input)) {
    const out = [];
    input.forEach((item) => {
      const parsed = parseSubCategories(item, depth + 1);
      parsed.forEach((p) => {
        if (p && !out.includes(p)) out.push(p);
      });
    });
    return out;
  }
  if (typeof input === "object" && input !== null) {
    if (input.status === "inactive") return [];
    if (typeof input.name === "string")
      return parseSubCategories(input.name, depth + 1);
    return [];
  }
  if (typeof input === "string") {
    let s = input.trim();
    if (!s) return [];
    if (
      (s.startsWith("[") && s.endsWith("]")) ||
      (s.startsWith('"') && s.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(s);
        const result = parseSubCategories(parsed, depth + 1);
        if (result.length > 0) return result;
      } catch {}
    }
    let cleaned = s;
    let prev = null;
    while (cleaned !== prev) {
      prev = cleaned;
      cleaned = cleaned
        .replace(/^[\[\]\\"]+/, "")
        .replace(/[\[\]\\"]+$/, "")
        .trim();
    }
    if (cleaned.length === 0 || cleaned.length > 200) return [];
    return [cleaned];
  }
  return [];
};

const Mainnavbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorySubCategories, setCategorySubCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");

  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const categoryMenuTimeout = useRef(null);

  // Cart + Wishlist — Providers wrap થયા છે index.js માં ✅
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();

  // Track login + cart + wishlist
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");
      const userData =
        localStorage.getItem("user") || localStorage.getItem("userData");

      if (token && userData) {
        try {
          const parsed = JSON.parse(userData);
          const name =
            parsed?.name ||
            parsed?.fullName ||
            parsed?.username ||
            parsed?.email ||
            "";
          setIsLoggedIn(true);
          setUserInitial(name ? name.trim().charAt(0).toUpperCase() : "U");
        } catch {
          setIsLoggedIn(true);
          setUserInitial("U");
        }
      } else {
        setIsLoggedIn(false);
        setUserInitial("");
      }
    };

    loadUser();
    fetchCart();
    fetchWishlist();

    const handleCartUpdate = () => fetchCart();
    const handleWishlistUpdate = () => fetchWishlist();

    window.addEventListener("storage", loadUser);
    window.addEventListener("userUpdated", loadUser);
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userUpdated", loadUser);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchCart, fetchWishlist]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ADMIN_API_URL}/categories`, {
          ...getAuthHeaders(),
        });

        let categoriesData = [];
        if (response.data.success && Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        }

        const activeCategories = categoriesData.filter(
          (cat) => cat.status === "active"
        );
        setCategories(activeCategories);

        const subMap = {};
        activeCategories.forEach((cat) => {
          if (Array.isArray(cat.subcategories)) {
            subMap[cat.name] = cat.subcategories
              .filter((sc) => !sc.status || sc.status === "active")
              .map((sc) => (typeof sc === "string" ? sc : sc.name))
              .filter(Boolean);
          } else {
            subMap[cat.name] = [];
          }
        });
        setCategorySubCategories(subMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          { _id: "1", name: "Jewellery & Accessories" },
          { _id: "2", name: "Handmade Home Decor" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryHover = (categoryName) => {
    if (categoryMenuTimeout.current) clearTimeout(categoryMenuTimeout.current);
    setHoveredCategory(categoryName);
  };

  const handleCategoryLeave = () => {
    categoryMenuTimeout.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length >= 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await axios.get(
            `${VENDOR_API_URL}/search-suggestions`,
            {
              params: { q: value },
              ...getAuthHeaders(),
            }
          );
          if (res.data?.products) {
            setSearchResults(res.data.products);
            setShowSuggestions(true);
          }
        } catch {}
      }, 400);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/product/${createSlug(product.name)}`);
  };

  return (
    <div>
      <Navbar className="desktop-navbar lexend" expand="lg">
        <Container fluid className="mainnavbar-container">
          {/* ===== LEFT: Nav Links ===== */}
          <Nav className="nav-links">
            <NavDropdown
              title="Category"
              id="category-dropdown"
              className="nav-link-dropdown"
              as={Nav.Link}
            >
              {loading ? (
                <NavDropdown.Item disabled>Loading...</NavDropdown.Item>
              ) : (
                categories.map((category) => {
                  const subCategories =
                    categorySubCategories[category.name] || [];
                  const hasSubCategories = subCategories.length > 0;

                  return (
                    <div key={category._id} className="category-with-sub">
                      <NavDropdown.Item
                        as={NavLink}
                        to={`/category/${createSlug(category.name)}`}
                        className="dropdown-item-custom category-main-item"
                        onMouseEnter={() => handleCategoryHover(category.name)}
                      >
                        <span className="category-name">{category.name}</span>
                        {hasSubCategories && (
                          <span className="sub-category-arrow">›</span>
                        )}
                      </NavDropdown.Item>

                      {hasSubCategories &&
                        hoveredCategory === category.name && (
                          <div className="sub-category-dropdown">
                            <div className="sub-category-header">
                              <FaSitemap className="me-2" />
                              <span className="sub-category-title">
                                {category.name}
                              </span>
                            </div>
                            <div className="sub-category-list">
                              {subCategories.map((sub, idx) => (
                                <NavLink
                                  key={idx}
                                  to={`/category/${createSlug(
                                    category.name
                                  )}/${createSlug(sub)}`}
                                  className="sub-category-item"
                                >
                                  <span className="sub-category-dot">•</span>
                                  {sub}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </NavDropdown>

            <Nav.Link as={NavLink} to="/product" className="nav-link">
              Brands
            </Nav.Link>
            <Nav.Link as={NavLink} to="/sell" className="nav-link">
              Sell With Us
            </Nav.Link>
            <Nav.Link as={NavLink} to="/aboutus" className="nav-link">
              About Us
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contactus" className="nav-link">
              Contact Us
            </Nav.Link>
          </Nav>

          {/* ===== RIGHT: Search + Icons ===== */}
          <div className="mainnavbar-right">
            {/* 🔍 Search */}
            <div className="navbar-search-container" ref={searchRef}>
              <form onSubmit={handleSearch} className="navbar-search-form">
                <div className="navbar-search-wrapper">
                  <FaSearch className="navbar-search-icon" />
                  <input
                    type="text"
                    className="navbar-search-input"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="navbar-clear-search"
                      onClick={() => {
                        setSearchTerm("");
                        setSearchResults([]);
                        setShowSuggestions(false);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {showSuggestions && searchResults.length > 0 && (
                  <div className="navbar-search-suggestions">
                    {searchResults.slice(0, 6).map((product) => (
                      <div
                        key={product._id}
                        className="suggestion-item product-item"
                        onClick={() => handleSuggestionClick(product)}
                      >
                        {product.image && product.image.length > 0 && (
                          <img
                            src={
                              product.image[0] || "/images/placeholder.png"
                            }
                            alt={product.name}
                            className="suggestion-product-image"
                          />
                        )}
                        <div className="suggestion-product-info">
                          <div className="suggestion-product-name">
                            {product.name}
                          </div>
                          <div className="suggestion-product-price">
                            ₹{product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* ✅ ICONS — unique mnav- classes */}
            <div className="mainnavbar-icons">
              {/* 👤 User / Initial */}
              <NavLink
                to={isLoggedIn ? "/profile" : "/login"}
                className="mnav-icon-link"
                title={isLoggedIn ? "My Profile" : "Login"}
              >
                <button type="button" className="mnav-user-btn">
                  {isLoggedIn ? (
                    <span className="mnav-user-initial">{userInitial}</span>
                  ) : (
                    <HiOutlineUser className="mnav-icon" />
                  )}
                </button>
              </NavLink>

              {/* ❤️ Wishlist */}
              <NavLink
                to="/wishlist"
                className="mnav-icon-link mnav-icon-wrapper"
                title="Wishlist"
              >
                <button type="button" className="mnav-cart-btn">
                  <HiOutlineHeart className="mnav-icon" />
                  {wishlistCount > 0 && (
                    <span className="mnav-badge">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </button>
              </NavLink>

              {/* 🛍️ Cart */}
              <NavLink
                to="/cart"
                className="mnav-icon-link mnav-icon-wrapper"
                title="Cart"
              >
                <button type="button" className="mnav-cart-btn">
                  <FiShoppingBag className="mnav-icon" />
                  {cartCount > 0 && (
                    <span className="mnav-badge">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </NavLink>
            </div>
          </div>
        </Container>
      </Navbar>
    </div>
  );
};

export default Mainnavbar;