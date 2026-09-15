// Mainnavbar.js - FULLY FIXED — Merges Admin + Vendor sub-categories

import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaClock, FaSitemap } from "react-icons/fa";
import axios from "axios";
import "./navbar.css";

// ✅ API URLs
const VENDOR_API_URL = "https://api-vendor.native91.com/api";
const ADMIN_API_URL = "https://api-admin.native91.com/api/category/categories";

// ✅ Auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// 🆕 SUPER parseSubCategories — handles objects, arrays, nested strings
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

  if (typeof input === 'object' && input !== null) {
    if (input.status === 'inactive') return [];
    if (typeof input.name === 'string') {
      return parseSubCategories(input.name, depth + 1);
    }
    return [];
  }

  if (typeof input === 'string') {
    let s = input.trim();
    if (!s) return [];

    if (
      (s.startsWith('[') && s.endsWith(']')) ||
      (s.startsWith('{') && s.endsWith('}')) ||
      (s.startsWith('"') && s.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(s);
        const result = parseSubCategories(parsed, depth + 1);
        if (result.length > 0) return result;
      } catch {
        // not JSON
      }
    }

    let cleaned = s;
    let prev = null;
    while (cleaned !== prev) {
      prev = cleaned;
      cleaned = cleaned
        .replace(/^[\[\]\\"]+/, '')
        .replace(/[\[\]\\"]+$/, '')
        .trim();
    }

    if (cleaned.length === 0 || cleaned.length > 200) return [];

    if (cleaned.includes(',') && !cleaned.includes(' & ')) {
      const parts = cleaned
        .split(',')
        .map(p => p.replace(/^[\[\]\\"]+|[\[\]\\"]+$/g, '').trim())
        .filter(p => p.length > 0 && p.length < 100);
      if (parts.length > 1) return parts;
    }

    return [cleaned];
  }

  return [];
};

// 🆕 Pick subs from response with multiple field names
const pickSubsFromResponse = (data) => {
  if (!data) return [];
  return (
    data.subCategories ||
    data.subcategories ||
    data.sub_categories ||
    data.subCategoryList ||
    []
  );
};

const Mainnavbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categorySubCategories, setCategorySubCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loadingSubCategories, setLoadingSubCategories] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const categoryMenuTimeout = useRef(null);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${ADMIN_API_URL}/categories`, {
        ...getAuthHeaders()
      });

      let categoriesData = [];
      if (response.data.success && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      const activeCategories = categoriesData.filter(cat => cat.status === "active");
      setCategories(activeCategories);

      await fetchAllSubCategories(activeCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message);
      const defaultCategories = [
        { _id: "1", name: "Organic Food & Healthy Snacks" },
        { _id: "2", name: "Beauty & Wellness" },
        { _id: "3", name: "Gifts & Hampers" },
        { _id: "4", name: "Handmade Home Decor" },
        { _id: "5", name: "Sustainable Lifestyle" },
        { _id: "6", name: "Jewellery & Accessories" },
        { _id: "7", name: "Pet Care" },
        { _id: "8", name: "Kids Fashion & Toys" },
        { _id: "9", name: "Desk Essentials" },
        { _id: "10", name: "Ethnic Fashion" },
      ];
      setCategories(defaultCategories);
      await fetchAllSubCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ MERGED: Admin + Vendor products sub-categories
  // ============================================================
  const fetchAllSubCategories = async (categoriesList) => {
    const subMap = {};

    for (const category of categoriesList) {
      const merged = new Set();

      // 1️⃣ Admin predefined
      try {
        const response = await axios.get(
          `${VENDOR_API_URL}/categories/${encodeURIComponent(category.name)}/subcategories`,
          { ...getAuthHeaders() }
        );
        const adminSubs = parseSubCategories(pickSubsFromResponse(response.data));
        adminSubs.forEach(s => merged.add(s));
        console.log(`✅ [Admin] ${category.name}: ${adminSubs.length}`);
      } catch (error) {
        console.warn(`⚠️ [Admin] failed ${category.name}:`, error.message);
      }

      // 2️⃣ Vendor products (public route)
      try {
        const prodRes = await axios.get(
          `${VENDOR_API_URL}/products/public/categories/${encodeURIComponent(category.name)}/subcategories`,
          { ...getAuthHeaders() }
        );
        const productSubs = parseSubCategories(pickSubsFromResponse(prodRes.data));
        productSubs.forEach(s => merged.add(s));
        console.log(`✅ [Products] ${category.name}: ${productSubs.length}`);
      } catch (error) {
        console.warn(`⚠️ [Products] failed ${category.name}:`, error.message);
      }

      const finalSubs = Array.from(merged).filter(s => s && s.length < 200);
      subMap[category.name] = finalSubs;
      console.log(`📦 [Merged] ${category.name}:`, finalSubs);
    }

    setCategorySubCategories(subMap);
    console.log("📂 Final sub-categories map:", subMap);
  };

  // ============================================================
  // ✅ MERGED: Fetch on hover
  // ============================================================
  const fetchSubCategoriesForCategory = async (categoryName) => {
    if (categorySubCategories[categoryName] && categorySubCategories[categoryName].length > 0) {
      return categorySubCategories[categoryName];
    }

    setLoadingSubCategories(prev => ({ ...prev, [categoryName]: true }));

    const merged = new Set();

    // Admin
    try {
      const response = await axios.get(
        `${VENDOR_API_URL}/categories/${encodeURIComponent(categoryName)}/subcategories`,
        { ...getAuthHeaders() }
      );
      const adminSubs = parseSubCategories(pickSubsFromResponse(response.data));
      adminSubs.forEach(s => merged.add(s));
    } catch (error) {
      console.warn(`⚠️ [Admin] failed ${categoryName}:`, error.message);
    }

    // Products
    try {
      const prodRes = await axios.get(
        `${VENDOR_API_URL}/products/public/categories/${encodeURIComponent(categoryName)}/subcategories`,
        { ...getAuthHeaders() }
      );
      const productSubs = parseSubCategories(pickSubsFromResponse(prodRes.data));
      productSubs.forEach(s => merged.add(s));
    } catch (error) {
      console.warn(`⚠️ [Products] failed ${categoryName}:`, error.message);
    }

    const subs = Array.from(merged).filter(s => s && s.length < 200);

    setCategorySubCategories(prev => ({
      ...prev,
      [categoryName]: subs
    }));

    setLoadingSubCategories(prev => ({ ...prev, [categoryName]: false }));
    return subs;
  };

  const handleCategoryHover = (categoryName) => {
    if (categoryMenuTimeout.current) {
      clearTimeout(categoryMenuTimeout.current);
    }
    setHoveredCategory(categoryName);
    fetchSubCategoriesForCategory(categoryName);
  };

  const handleCategoryLeave = () => {
    categoryMenuTimeout.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchSuggestions = async (query) => {
    try {
      const response = await axios.get(`${VENDOR_API_URL}/search-suggestions`, {
        params: { q: query },
        timeout: 5000,
        ...getAuthHeaders()
      });

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const updated = [searchTerm.trim(), ...recentSearches.filter(s => s !== searchTerm.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));

      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

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

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const hasResults = searchResults && searchResults.length > 0;
    const hasRecent = recentSearches && recentSearches.length > 0 && searchTerm.length < 2;

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
            <NavDropdown
              title="Category"
              id="category-dropdown"
              className="nav-link-dropdown"
              as={Nav.Link}
              onMouseEnter={() => handleCategoryHover("Category")}
              onMouseLeave={handleCategoryLeave}
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
                  {categories.map((category) => {
                    const subCategories = categorySubCategories[category.name] || [];
                    const hasSubCategories = subCategories.length > 0;

                    return (
                      <div key={category._id} className="category-with-sub">
                        <NavDropdown.Item
                          as={NavLink}
                          to={`/category/${encodeURIComponent(category.name)}`}
                          className="dropdown-item-custom category-main-item"
                          onMouseEnter={() => handleCategoryHover(category.name)}
                        >
                          <span className="category-name">{category.name}</span>
                          {category.productCount !== undefined && category.productCount > 0 && (
                            <span className="product-count">({category.productCount})</span>
                          )}
                          {hasSubCategories && (
                            <span className="sub-category-arrow">›</span>
                          )}
                        </NavDropdown.Item>

                        {hasSubCategories && hoveredCategory === category.name && (
                          <div className="sub-category-dropdown">
                            <div className="sub-category-header">
                              <FaSitemap className="me-2" />
                              <span className="sub-category-title">{category.name}</span>
                              <span className="sub-category-count">
                                {subCategories.length} sub-categories
                              </span>
                            </div>
                            {loadingSubCategories[category.name] ? (
                              <div className="sub-category-loading">
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <div className="sub-category-list">
                                {subCategories.map((sub, idx) => (
                                  <NavLink
                                    key={idx}
                                    to={`/category/${encodeURIComponent(category.name)}/${encodeURIComponent(sub)}`}
                                    className="sub-category-item"
                                    onClick={() => {
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    <span className="sub-category-dot">•</span>
                                    {sub}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                            <div className="sub-category-footer">
                              <NavLink
                                to={`/category/${encodeURIComponent(category.name)}`}
                                className="view-all-subcategories"
                              >
                                View All Products in {category.name} →
                              </NavLink>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  No categories available
                </NavDropdown.Item>
              )}
            </NavDropdown>

            <Nav.Link as={NavLink} to="/product" className="nav-link">
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
