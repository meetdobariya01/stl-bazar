// Mainnavbar.js - WITH WORKING AUTO-SUGGESTIONS

import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaClock } from "react-icons/fa";
import axios from "axios";
import "./navbar.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const Mainnavbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search while typing with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm.trim().length >= 2) {
      setSearchLoading(true);
      searchTimeout.current = setTimeout(() => {
        fetchSearchSuggestions(searchTerm);
      }, 400);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
      if (searchTerm.length === 0) {
        setShowSuggestions(false);
      }
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions from API
  const fetchSearchSuggestions = async (query) => {
    try {
      console.log(`🔍 Fetching suggestions for: "${query}"`);
      
      const response = await axios.get(`${API_URL}/search-suggestions`, {
        params: { q: query },
        timeout: 5000,
      });

      console.log("📥 Suggestions response:", response.data);

      if (response.data.success && response.data.products) {
        setSearchResults(response.data.products);
        setShowSuggestions(true);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("❌ Search suggestions error:", error);
      setSearchResults([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Save to recent searches
      const updated = [searchTerm.trim(), ...recentSearches.filter(s => s !== searchTerm.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    const name = product.name || product.ProductName;
    if (name) {
      const updated = [name, ...recentSearches.filter(s => s !== name)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/product/${product.slug || product._id}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  // Render search suggestions dropdown
  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const hasResults = searchResults && searchResults.length > 0;
    const hasRecent = recentSearches && recentSearches.length > 0 && searchTerm.length < 2;

    // If no results and user typed 2+ chars
    if (!hasResults && !hasRecent && searchTerm.length >= 2 && !searchLoading) {
      return (
        <div className="navbar-search-suggestions">
          <div className="suggestion-item no-results">
            <span>No products found for "{searchTerm}"</span>
          </div>
        </div>
      );
    }

    return (
      <div className="navbar-search-suggestions">
        {searchLoading ? (
          <div className="suggestion-item loading">
            <span className="loading-spinner"></span>
            <span>Searching...</span>
          </div>
        ) : hasResults ? (
          <>
            <div className="suggestion-header">Products</div>
            {searchResults.slice(0, 6).map((product) => (
              <div
                key={product._id}
                className="suggestion-item product-item"
                onClick={() => handleSuggestionClick(product)}
              >
                {product.image && product.image.length > 0 && (
                  <img
                    src={product.image[0] || "/images/placeholder.png"}
                    alt={product.name}
                    className="suggestion-product-image"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                )}
                <div className="suggestion-product-info">
                  <div className="suggestion-product-name">{product.name}</div>
                  {product.company && (
                    <div className="suggestion-product-company">{product.company}</div>
                  )}
                  {product.price && (
                    <div className="suggestion-product-price">₹{product.price}</div>
                  )}
                </div>
                {product.inStock && (
                  <span className="suggestion-instock">In Stock</span>
                )}
              </div>
            ))}
            <div className="suggestion-footer">
              <button
                className="view-all-results"
                onClick={() => {
                  setShowSuggestions(false);
                  navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                }}
              >
                View all results for "{searchTerm}"
              </button>
            </div>
          </>
        ) : hasRecent ? (
          <>
            <div className="suggestion-header">Recent Searches</div>
            {recentSearches.map((term, index) => (
              <div
                key={index}
                className="suggestion-item recent-item"
                onClick={() => {
                  setSearchTerm(term);
                  setShowSuggestions(false);
                  navigate(`/search?q=${encodeURIComponent(term)}`);
                }}
              >
                <FaClock className="recent-icon" />
                <span>{term}</span>
                <button
                  className="remove-recent"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter((_, i) => i !== index);
                    setRecentSearches(updated);
                    localStorage.setItem("recentSearches", JSON.stringify(updated));
                  }}
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            {recentSearches.length > 1 && (
              <div className="suggestion-footer">
                <button
                  className="clear-recent"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem("recentSearches");
                  }}
                >
                  Clear Recent Searches
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <Navbar className="desktop-navbar lexend" expand="lg">
        <Container fluid>
          <Nav className="mx-auto nav-links">
            {/* Category Dropdown */}
            <NavDropdown
              title="Category"
              id="category-dropdown"
              className="nav-link-dropdown"
              as={Nav.Link}
            >
              {loading ? (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  <span className="dropdown-loading">Loading categories...</span>
                </NavDropdown.Item>
              ) : error ? (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  <span className="dropdown-error">Failed to load categories</span>
                </NavDropdown.Item>
              ) : categories.length > 0 ? (
                <>
                  <NavDropdown.Item
                    as={NavLink}
                    to="/category/All"
                    className="dropdown-item-custom"
                  >
                    All Categories
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  {categories.map((category) => (
                    <NavDropdown.Item
                      key={category._id}
                      as={NavLink}
                      to={`/category/${encodeURIComponent(category.name)}`}
                      className="dropdown-item-custom"
                      onClick={() => {
                        document.body.click();
                      }}
                    >
                      {category.name}
                      {category.productCount !== undefined && category.productCount > 0 && (
                        <span className="product-count">({category.productCount})</span>
                      )}
                    </NavDropdown.Item>
                  ))}
                </>
              ) : (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  No categories available
                </NavDropdown.Item>
              )}
            </NavDropdown>

            <Nav.Link
              as={NavLink}
              to="/product"
              className="nav-link"
            >
              Brands
            </Nav.Link>

            <Nav.Link as={NavLink} to="#" className="nav-link">
              Editorial
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

          {/* Search Bar with Auto-Suggestions */}
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
                  onFocus={() => {
                    if (searchTerm.trim().length >= 2 && searchResults.length > 0) {
                      setShowSuggestions(true);
                    } else if (recentSearches.length > 0 && searchTerm.length === 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="navbar-clear-search"
                    onClick={clearSearch}
                  >
                    <FaTimes />
                  </button>
                )}
                <button type="submit" className="navbar-search-btn">
                  <FaSearch />
                </button>
              </div>
              {renderSuggestions()}
            </form>
          </div>
        </Container>
      </Navbar>
    </div>
  );
};

export default Mainnavbar;