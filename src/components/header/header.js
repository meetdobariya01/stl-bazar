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
} from "react-bootstrap";
import {
  HiOutlineHeart,
  HiOutlineMenuAlt3,
  HiOutlineSearch,
  HiOutlineUser,
} from "react-icons/hi";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createSlug } from "../../utils/slugUtils";
import "./header.css";

// ✅ API URLs
const VENDOR_API_URL = "https://api-vendor.native91.com/api";
const ADMIN_API_URL = "https://api-admin.native91.com/api/category";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// 🆕 Parse sub-categories
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
    if (typeof input.name === "string") {
      return parseSubCategories(input.name, depth + 1);
    }
    return [];
  }

  if (typeof input === "string") {
    let s = input.trim();
    if (!s) return [];

    if (
      (s.startsWith("[") && s.endsWith("]")) ||
      (s.startsWith("{") && s.endsWith("}")) ||
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

    if (cleaned.includes(",") && !cleaned.includes(" & ")) {
      const parts = cleaned
        .split(",")
        .map((p) => p.replace(/^[\[\]\\"]+|[\[\]\\"]+$/g, "").trim())
        .filter((p) => p.length > 0 && p.length < 100);
      if (parts.length > 1) return parts;
    }

    return [cleaned];
  }

  return [];
};

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

// 🆕 Decode JWT token
const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (err) {
    console.warn("JWT decode failed:", err);
    return null;
  }
};

// 🆕 Extract first letter from user object OR JWT
const extractInitial = (userObj, token = null) => {
  // Step 1: User object
  if (userObj && typeof userObj === "object") {
    const candidates = [
      userObj.email,
      userObj.userEmail,
      userObj.emailId,
      userObj.mail,
      userObj.username,
      userObj.userName,
      userObj.phone,
      userObj.mobile,
      userObj.name,
      userObj.fullName,
      userObj.firstName,
      userObj.given_name,
    ];

    for (const val of candidates) {
      if (val && typeof val === "string" && val.trim().length > 0) {
        const ch = val.trim().charAt(0);
        if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
      }
    }
  }

  // Step 2: JWT fallback
  if (token) {
    const decoded = decodeJWT(token);
    if (decoded) {
      const jwtCandidates = [
        decoded.email,
        decoded.userEmail,
        decoded.username,
        decoded.name,
        decoded.given_name,
        decoded.sub,
      ];

      for (const val of jwtCandidates) {
        if (val && typeof val === "string" && val.trim().length > 0) {
          const ch = val.trim().charAt(0);
          if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
        }
      }
    }
  }

  return "U";
};

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
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
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categorySubCategories, setCategorySubCategories] = useState({});
  const [loadingSubCategories, setLoadingSubCategories] = useState({});

  // 🆕 Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const categoryMenuTimeout = useRef(null);

  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();

  // 🆕 Track login state — PRODUCTION SAFE with JWT
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const userData =
          localStorage.getItem("user") || localStorage.getItem("userData");

        if (!token) {
          setIsLoggedIn(false);
          setUserInitial("");
          return;
        }

        // Try parse user data (may be missing for Google login)
        let parsed = null;
        if (userData) {
          try {
            parsed = JSON.parse(userData);
          } catch (e) {
            console.warn("User data parse failed:", e);
          }
        }

        setIsLoggedIn(true);
        const initial = extractInitial(parsed, token);
        setUserInitial(initial);
      } catch (err) {
        console.error("Header loadUser error:", err);
        setIsLoggedIn(false);
        setUserInitial("");
      }
    };

    loadUser();

    // Delayed loads — production timing fix
    const t1 = setTimeout(loadUser, 100);
    const t2 = setTimeout(loadUser, 500);
    const t3 = setTimeout(loadUser, 1500);

    window.addEventListener("storage", loadUser);
    window.addEventListener("userUpdated", loadUser);
    window.addEventListener("focus", loadUser);
    window.addEventListener("pageshow", loadUser);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userUpdated", loadUser);
      window.removeEventListener("focus", loadUser);
      window.removeEventListener("pageshow", loadUser);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔍 Fetching categories from Admin API...");
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
          (cat) => cat.status === "active",
        );
        setCategories(activeCategories);
        console.log(`📂 Found ${activeCategories.length} categories`);

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
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch sub-categories on hover
  const fetchSubCategoriesForCategory = async (categoryName) => {
    if (
      categorySubCategories[categoryName] &&
      categorySubCategories[categoryName].length > 0
    ) {
      return categorySubCategories[categoryName];
    }

    setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: true }));

    try {
      const response = await axios.get(
        `${VENDOR_API_URL}/categories/${encodeURIComponent(
          categoryName,
        )}/subcategories`,
        { ...getAuthHeaders() },
      );
      const subs = parseSubCategories(pickSubsFromResponse(response.data));

      setCategorySubCategories((prev) => ({
        ...prev,
        [categoryName]: subs,
      }));
      return subs;
    } catch (error) {
      console.warn(
        `Sub-categories fetch failed for ${categoryName}:`,
        error.message,
      );
      return [];
    } finally {
      setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: false }));
    }
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
    fetchCart();
    fetchWishlist();

    const handleCartUpdate = () => fetchCart();
    const handleWishlistUpdate = () => fetchWishlist();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      if (categoryMenuTimeout.current) {
        clearTimeout(categoryMenuTimeout.current);
      }
    };
  }, [fetchCart, fetchWishlist]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecommendations(false);
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLiveSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }
    try {
      const response = await axios.get(`https://api.native91.com/api/search-suggestions`, {
        params: { q: query },
        timeout: 5000,
        ...getAuthHeaders(),
      });
      if (response.data?.products && response.data.products.length > 0) {
        setRecommendations(response.data.products.slice(0, 8));
        setShowRecommendations(true);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      console.error("Live search error:", error);
      setRecommendations([]);
      setShowRecommendations(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchLiveSuggestions(value);
      } else {
        setRecommendations([]);
        setSearchResults([]);
        setShowRecommendations(false);
        setShowSearchResults(false);
      }
    }, 300);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`https://api.native91.com/api/products/search`, {
        params: { keyword: searchQuery },
        ...getAuthHeaders(),
      });
      setSearchResults(response.data?.products || []);
      setShowSearchResults(true);
      setShowRecommendations(false);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
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
    navigate(`/product/${createSlug(product.name)}`);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const menu = [
    { title: "Home", link: "/" },
    { title: "Brands", link: "/product" },
    {
      title: "Category",
      dropdown: categories.map((cat) => ({
        title: cat.name,
        link: `/category/${createSlug(cat.name)}`,
        productCount: cat.productCount || 0,
        subCategories: categorySubCategories[cat.name] || [],
        loading: loadingSubCategories[cat.name] || false,
      })),
    },
    { title: "Social Impact", link: "/social-impact" },
    { title: "Sell With Us", link: "/sell" },
    { title: "About Us", link: "/aboutus" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 🆕 User icon block
  const renderUserIcon = () => {
    if (isLoggedIn) {
      return (
        <NavLink to="/orderhistory" className="icon-link" title="My Profile">
          <button type="button" className="user-btn">
            <span className="user-initial-badge">{userInitial || "U"}</span>
          </button>
        </NavLink>
      );
    }
    return (
      <NavLink to="/login" className="icon-link" title="Login">
        <button type="button" className="user-btn">
          <HiOutlineUser />
        </button>
      </NavLink>
    );
  };

  return (
    <>
      <div className="lexend pe-auto">
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
                <div className="search-box" ref={searchRef}>
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
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </Form>

                  {showRecommendations && recommendations.length > 0 && (
                    <div className="search-recommendations-dropdown">
                      <div className="recommendations-header">
                        <span>Live Recommendations</span>
                        <small>{recommendations.length} products</small>
                      </div>
                      {recommendations.map((product) => (
                        <div
                          key={product._id}
                          className="search-recommendation-item"
                          onClick={() => handleRecommendationClick(product)}
                        >
                          {/* <div className="recommendation-img">
                            <img
                              src={
                                product.image?.[0] || "/images/placeholder.png"
                              }
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/placeholder.png";
                              }}
                            />
                          </div> */}
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

        <Navbar
          expand="lg"
          className={`premium-navbar ${isScrolled ? "navbar-scrolled" : ""}`}
          sticky="top"
        >
          <Container>
            <Navbar.Brand as={NavLink} to="/">
              <img src="/images/native.png" alt="Native91" className="logo" />
            </Navbar.Brand>

            <Nav className="mx-auto desktop-menu ">
              {menu.map((item, index) => (
                <motion.div key={index} whileHover={{ y: -3 }}>
                  {item.dropdown ? (
                    <Dropdown
                      className="premium-dropdown category-dropdown"
                      onMouseEnter={() => handleCategoryHover(item.title)}
                      onMouseLeave={handleCategoryLeave}
                    >
                      <Dropdown.Toggle
                        as="div"
                        className="premium-link dropdown-toggle-custom"
                      >
                        {item.title}
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="category-mega-menu">
                        {loadingCategories ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-loading">
                              Loading categories...
                            </span>
                          </Dropdown.Item>
                        ) : (
                          <div className="category-menu-wrapper">
                            <div className="category-list-column">
                              {item.dropdown.map((sub, i) => (
                                <div
                                  key={i}
                                  className={`category-menu-item ${
                                    hoveredCategory === sub.title
                                      ? "active"
                                      : ""
                                  }`}
                                  onMouseEnter={() =>
                                    handleCategoryHover(sub.title)
                                  }
                                >
                                  <NavLink
                                    to={sub.link}
                                    className="dropdown-item-custom category-link"
                                    onClick={() => setShowMenu(false)}
                                  >
                                    {sub.title}
                                    {sub.subCategories &&
                                      sub.subCategories.length > 0 && (
                                        <span className="sub-category-arrow">
                                          ›
                                        </span>
                                      )}
                                  </NavLink>
                                </div>
                              ))}
                            </div>

                            {hoveredCategory && (
                              <div className="subcategory-list-column">
                                <div className="subcategory-header">
                                  <span className="subcategory-title">
                                    {hoveredCategory}
                                  </span>
                                  <span className="subcategory-count">
                                    {categorySubCategories[hoveredCategory]
                                      ?.length || 0}{" "}
                                    sub-categories
                                  </span>
                                </div>
                                <div className="subcategory-grid">
                                  {categorySubCategories[hoveredCategory]
                                    ?.length > 0 ? (
                                    categorySubCategories[hoveredCategory].map(
                                      (sub, idx) => (
                                        <NavLink
                                          key={idx}
                                          to={`/category/${createSlug(
                                            hoveredCategory,
                                          )}/${createSlug(sub)}`}
                                          className="subcategory-item"
                                          onClick={() => setShowMenu(false)}
                                        >
                                          <span className="subcategory-dot">
                                            •
                                          </span>
                                          {sub}
                                        </NavLink>
                                      ),
                                    )
                                  ) : (
                                    <div className="subcategory-empty">
                                      No sub-categories available
                                    </div>
                                  )}
                                </div>
                                <div className="subcategory-footer">
                                  <NavLink
                                    to={`/category/All`}
                                    className="view-all-subcategories"
                                    onClick={() => setShowMenu(false)}
                                  >
                                    View All Products in {hoveredCategory} →
                                  </NavLink>
                                </div>
                              </div>
                            )}
                          </div>
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

            {/* ✅ DESKTOP ICONS */}
            <div className="desktop-icons">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              {renderUserIcon()}

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

            {/* ✅ MOBILE ICONS */}
            <div className="mobile-right">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              {renderUserIcon()}

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

        <Offcanvas
          show={showMenu}
          placement="end"
          onHide={() => setShowMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <img
                src="/images/native.png"
                className="mobile-logo"
                alt="Native91"
              />
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <div className="offcanvas-user-row mb-3">
              {isLoggedIn ? (
                <NavLink
                  to="/orderhistory"
                  className="mobile-link d-flex align-items-center gap-2"
                  onClick={() => setShowMenu(false)}
                >
                  <span className="user-initial-badge">
                    {userInitial || "U"}
                  </span>
                  <span>My Profile</span>
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className="mobile-link d-flex align-items-center gap-2"
                  onClick={() => setShowMenu(false)}
                >
                  <HiOutlineUser />
                  <span>Login</span>
                </NavLink>
              )}
            </div>

            <Nav className="flex-column lexend">
              {menu.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <>
                      <div className="mobile-link">{item.title}</div>
                      {item.dropdown.map((sub, i) => (
                        <div key={i}>
                          <NavLink
                            to={sub.link}
                            className="mobile-sublink"
                            onClick={() => setShowMenu(false)}
                          >
                            {sub.title}
                          </NavLink>
                          {categorySubCategories[sub.title] &&
                            categorySubCategories[sub.title].length > 0 && (
                              <div className="mobile-sub-subcategories">
                                {categorySubCategories[sub.title].map(
                                  (subCat, idx) => (
                                    <NavLink
                                      key={idx}
                                      to={`/category/${createSlug(
                                        sub.title,
                                      )}/${createSlug(subCat)}`}
                                      className="mobile-sub-sublink"
                                      onClick={() => setShowMenu(false)}
                                    >
                                      • {subCat}
                                    </NavLink>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ))}
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
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default Header;
