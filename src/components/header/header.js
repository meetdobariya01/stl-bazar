import React, { useState, useEffect, useRef } from "react";
import { Container, Offcanvas, Dropdown, Spinner } from "react-bootstrap";
import {
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineSearch,
  HiOutlineMenuAlt2,
} from "react-icons/hi";
import {
  FiShoppingCart,
  FiChevronDown,
  FiX,
  FiLogOut,
  FiShoppingBag,
  FiChevronRight,
} from "react-icons/fi";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createSlug } from "../../utils/slugUtils";
import "./header.css";

// ======================================================
// API URLS
// ======================================================

const API_URL = process.env.REACT_APP_API_URL || "https://api.native91.com/api";
const VENDOR_API_URL = "https://api-vendor.native91.com/api";
const ADMIN_API_URL = "https://api-admin.native91.com/api/category";
// const VENDOR_API_URL = "https://localhost:5177/api";
// const ADMIN_API_URL = "https://localhost:7001/api/category";

// Categories shown in the desktop top navigation only
const HEADER_CATEGORIES = [
  "Beauty & Wellness",
  "Organic Food & Healthy Snacks",
  "Jewellery & Accessories",
  "Handmade Home Decor",
  "Ethnic Fashion",
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

// ======================================================
// JWT DECODER
// ======================================================

const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (error) {
    console.warn("JWT decode failed:", error);
    return null;
  }
};

// ======================================================
// EXTRACT USER INITIAL
// ======================================================

const extractInitial = (userObj, token = null) => {
  const candidates = [
    userObj?.name,
    userObj?.fullName,
    userObj?.firstName,
    userObj?.email,
    userObj?.userEmail,
    userObj?.emailId,
    userObj?.mail,
    userObj?.username,
    userObj?.userName,
    userObj?.phone,
    userObj?.mobile,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim().charAt(0).toUpperCase();
    }
  }

  const decoded = decodeJWT(token);

  const jwtCandidates = [
    decoded?.email,
    decoded?.userEmail,
    decoded?.username,
    decoded?.name,
    decoded?.given_name,
    decoded?.sub,
  ];

  for (const value of jwtCandidates) {
    if (typeof value === "string" && value.trim()) {
      const firstChar = value.trim().charAt(0);
      if (/[a-zA-Z0-9]/.test(firstChar)) return firstChar.toUpperCase();
    }
  }

  return "U";
};

// ======================================================
// PARSE SUBCATEGORIES
// ======================================================

const parseSubCategories = (input, depth = 0) => {
  if (!input || depth > 10) return [];

  if (Array.isArray(input)) {
    const out = [];
    input.forEach((item) => {
      parseSubCategories(item, depth + 1).forEach((p) => {
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
    const s = input.trim();
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

    if (!cleaned || cleaned.length > 200) return [];

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

// ======================================================
// PRODUCT IMAGE FORMATTER
// ======================================================

const formatProductImage = (image) => {
  if (!image) return null;
  let img = image;
  if (Array.isArray(image)) {
    if (image.length === 0) return null;
    img = image[0];
  }
  if (typeof img !== "string" || !img.trim()) return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("/uploads")) return `https://api-vendor.native91.com${img}`;
  if (img.startsWith("/images")) return img;
  return `https://api-vendor.native91.com${img}`;
};

// ======================================================
// HEADER COMPONENT
// ======================================================

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------
  // SCROLL & UI STATES
  // ----------------------------------------------------

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // ----------------------------------------------------
  // DROPDOWN STATES
  // ----------------------------------------------------

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [megaActiveCategory, setMegaActiveCategory] = useState(0);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);

  // ----------------------------------------------------
  // SEARCH STATES
  // ----------------------------------------------------

  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------------------------
  // CATEGORY STATES
  // ----------------------------------------------------

  const [backendCategories, setBackendCategories] = useState([]);
  const [backendSubcategories, setBackendSubcategories] = useState({});
  const [loadingSubcats, setLoadingSubcats] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ----------------------------------------------------
  // AUTH STATES
  // ----------------------------------------------------

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // ----------------------------------------------------
  // REFS
  // ----------------------------------------------------

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  // ----------------------------------------------------
  // CONTEXTS
  // ----------------------------------------------------

  const { cartCount = 0, fetchCart } = useCart() || {};
  const { wishlistCount = 0, fetchWishlist } = useWishlist() || {};

  // ======================================================
  // AUTHENTICATION STATE
  // ======================================================

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const userData =
          localStorage.getItem("user") || localStorage.getItem("userData");

        if (!token) {
          setIsLoggedIn(false);
          setUserInitial("");
          setUserName("");
          setUserEmail("");
          return;
        }

        let parsed = null;
        if (userData) {
          try {
            parsed = JSON.parse(userData);
          } catch (error) {
            console.warn("User data parse failed:", error);
          }
        }

        setIsLoggedIn(true);
        setUserInitial(extractInitial(parsed, token));
        setUserName(
          parsed?.name || parsed?.fullName || parsed?.firstName || "User",
        );
        setUserEmail(
          parsed?.email || parsed?.userEmail || parsed?.emailId || "",
        );
      } catch (error) {
        console.error("Header authentication error:", error);
        setIsLoggedIn(false);
        setUserInitial("");
        setUserName("");
        setUserEmail("");
      }
    };

    loadUser();

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
  }, [location.pathname]);

  // ======================================================
  // CART & WISHLIST SYNCHRONIZATION
  // ======================================================

  useEffect(() => {
    if (fetchCart) fetchCart();
    if (fetchWishlist) fetchWishlist();

    const handleCartUpdate = () => {
      if (fetchCart) fetchCart();
    };
    const handleWishlistUpdate = () => {
      if (fetchWishlist) fetchWishlist();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchCart, fetchWishlist]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    if (loggingOut) return;
    if (!window.confirm("Are you sure you want to logout?")) return;

    setLoggingOut(true);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.post(
            `${API_URL}/auth/logout`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (apiError) {
          console.warn("Backend logout failed (continuing):", apiError);
        }
      }
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("discountedPrice");
      localStorage.removeItem("appliedProductId");

      setIsLoggedIn(false);
      setUserInitial("");
      setUserName("");
      setUserEmail("");

      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));

      setLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  // ======================================================
  // FETCH BACKEND CATEGORIES
  // ======================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${ADMIN_API_URL}/categories`, {
          ...getAuthHeaders(),
          timeout: 5000,
        });

        let cats = [];
        if (
          response.data?.success &&
          Array.isArray(response.data?.categories)
        ) {
          cats = response.data.categories;
        } else if (Array.isArray(response.data)) {
          cats = response.data;
        }

        const activeCats = cats.filter((cat) => {
          const name = String(cat.name || "").trim().toLowerCase();
          return cat.status === "active" && name && name !== "all";
        });

        setBackendCategories(activeCats);

        const initialSubs = {};
        activeCats.forEach((cat) => {
          if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
            initialSubs[cat.name] = cat.subcategories
              .filter((sc) => !sc.status || sc.status === "active")
              .map((sc) => {
                const name = typeof sc === "string" ? sc : sc.name;
                return { name, slug: createSlug(name) };
              })
              .filter((sc) => sc.name);
          }
        });

        setBackendSubcategories((prev) => ({ ...initialSubs, ...prev }));
      } catch (error) {
        console.warn("Backend categories unavailable:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ======================================================
  // FETCH SUBCATEGORIES
  // ======================================================

  const fetchSubCategoriesForCategory = async (catTitle, backendCatName) => {
    const key = backendCatName || catTitle;
    if (!key) return;

    if (backendSubcategories[key] && backendSubcategories[key].length > 0) {
      return;
    }

    setLoadingSubcats((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await axios.get(
        `${VENDOR_API_URL}/categories/${encodeURIComponent(key)}/subcategories`,
        { ...getAuthHeaders(), timeout: 5000 },
      );

      const raw = pickSubsFromResponse(response.data);
      const parsed = parseSubCategories(raw).map((name) => ({
        name,
        slug: createSlug(name),
      }));

      setBackendSubcategories((prev) => ({ ...prev, [key]: parsed }));
    } catch (error) {
      console.warn(`Subcategory fetch failed for ${key}:`, error.message);
      setBackendSubcategories((prev) => ({ ...prev, [key]: prev[key] || [] }));
    } finally {
      setLoadingSubcats((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ======================================================
  // STICKY HEADER
  // ======================================================

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======================================================
  // SEARCH CLICK OUTSIDE
  // ======================================================

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

  // ======================================================
  // CLEANUP TIMEOUTS
  // ======================================================

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // ======================================================
  // LIVE SEARCH RECOMMENDATIONS
  // ======================================================

  const fetchLiveSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/search-suggestions`, {
        params: { q: query.trim() },
        timeout: 5000,
        ...getAuthHeaders(),
      });

      if (response.data?.products && response.data.products.length > 0) {
        setRecommendations(response.data.products.slice(0, 8));
        setShowRecommendations(true);
        setShowSearchResults(false);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      try {
        const fallbackResponse = await axios.get(
          "https://api.native91.com/api/search-suggestions",
          {
            params: { q: query.trim() },
            timeout: 5000,
            ...getAuthHeaders(),
          },
        );
        if (
          fallbackResponse.data?.products &&
          fallbackResponse.data.products.length > 0
        ) {
          setRecommendations(fallbackResponse.data.products.slice(0, 8));
          setShowRecommendations(true);
          setShowSearchResults(false);
          return;
        }
      } catch (fallbackError) {
        console.warn("Search suggestions fallback failed.");
      }

      console.error("Live search recommendations error:", error);
      setRecommendations([]);
      setShowRecommendations(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // SEARCH INPUT CHANGE
  // ======================================================

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

  // ======================================================
  // SEARCH SUBMIT
  // ======================================================

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowRecommendations(false);

    try {
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { keyword: searchQuery.trim() },
        timeout: 5000,
        ...getAuthHeaders(),
      });

      const products = response.data?.products || response.data?.data || [];

      if (products.length > 0) {
        setSearchResults(products);
        setShowSearchResults(true);
      } else {
        navigate(
          `/category/All?search=${encodeURIComponent(searchQuery.trim())}`,
        );
        setShowSearchResults(false);
      }
    } catch (error) {
      try {
        const fallback = await axios.get(
          "https://api.native91.com/api/products/search",
          {
            params: { keyword: searchQuery.trim() },
            timeout: 5000,
            ...getAuthHeaders(),
          },
        );
        const products = fallback.data?.products || fallback.data?.data || [];
        if (products.length > 0) {
          setSearchResults(products);
          setShowSearchResults(true);
          return;
        }
      } catch (fallbackError) {
        console.warn("Search fallback failed.");
      }

      console.error("Search error:", error);
      navigate(`/category/All?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // SEARCH RESULT CLICK
  // ======================================================

  const handleRecommendationClick = (product) => {
    setShowRecommendations(false);
    setShowSearchResults(false);
    setSearchQuery("");
    setRecommendations([]);
    setSearchResults([]);
    navigate(`/product/${createSlug(product.name)}`);
  };

  // ======================================================
  // COMBINE BACKEND CATEGORIES INTO NAV LIST
  // ======================================================

  // All active categories from Admin Panel (used in All Categories and mobile menu)
  const allCategoryList = backendCategories.map((cat) => {
    const key = cat.name;
    const subs = backendSubcategories[key] || [];
    return {
      title: cat.name,
      backendName: key,
      categorySlug: createSlug(cat.name),
      subcategories: subs,
      loading: !!loadingSubcats[key],
    };
  });

  // Only these five categories appear in the desktop top navigation
  const headerCategoryList = allCategoryList.filter((cat) =>
    HEADER_CATEGORIES.some(
      (name) => name.toLowerCase().trim() === cat.title.toLowerCase().trim(),
    ),
  );

  // ======================================================
  // DROPDOWN HOVER HELPERS
  // ======================================================

  const handleDropdownEnter = (id) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(id);

    if (typeof id === "number" && headerCategoryList[id]) {
      const cat = headerCategoryList[id];
      fetchSubCategoriesForCategory(cat.title, cat.backendName);
    } else if (id === "all" && allCategoryList[megaActiveCategory]) {
      const cat = allCategoryList[megaActiveCategory];
      fetchSubCategoriesForCategory(cat.title, cat.backendName);
    }
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // ======================================================
  // HOMEPAGE CHECK
  // ======================================================

  const isHomePage = location.pathname === "/";

  // ======================================================
  // JSX
  // ======================================================

  return (
    <header
      className={`native-header-root ${
        isHomePage ? "is-home-overlay" : ""
      } ${isScrolled ? "is-scrolled" : ""}`}
    >
      {/* TOP ANNOUNCEMENT / TRUST BAR */}
      <div className="native-top-bar">
        <Container className="native-top-bar-container">
          <div className="native-trust-badges">
            <span className="native-trust-item">
              <svg className="native-trust-icon leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              <span>Free Shipping on orders above ₹599</span>
            </span>
            <span className="native-trust-divider">|</span>
            <span className="native-trust-item">
              <svg className="native-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Shiprocket Secure Payments</span>
            </span>
            {/* <span className="native-trust-divider">|</span>
            <span className="native-trust-item">
              <svg className="native-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span>Easy Returns</span>
            </span> */}
          </div>
        </Container>
      </div>

      {/* MAIN HEADER */}
      <div className="native-main-header">
        <Container className="native-main-header-container">
          <button
            type="button"
            className="native-mobile-toggle-btn d-lg-none"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Toggle navigation"
          >
            <HiOutlineMenuAlt2 />
          </button>

          <NavLink to="/" className="native-brand-logo-link">
            <img
              src="/images/native.png"
              alt="native 91 - Reserved for the Remarkable"
              className="native-brand-logo-img"
            />
          </NavLink>

          {/* SEARCH */}
          <div className="native-search-container" ref={searchRef}>
            <form onSubmit={handleSearch} className="native-search-pill">
              <button
                type="submit"
                className="native-search-submit-btn"
                title="Search"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" className="native-search-spinner" />
                ) : (
                  <HiOutlineSearch className="native-search-glass-icon" />
                )}
              </button>

              <input
                type="text"
                className="native-search-input"
                placeholder="Search for brands, products and more..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (recommendations.length > 0) setShowRecommendations(true);
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  className="native-search-clear-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setRecommendations([]);
                    setSearchResults([]);
                    setShowRecommendations(false);
                    setShowSearchResults(false);
                  }}
                  title="Clear"
                >
                  <FiX />
                </button>
              )}
            </form>

            {/* LIVE RECOMMENDATIONS */}
            {showRecommendations && recommendations.length > 0 && (
              <div className="search-recommendations-dropdown">
                <div className="recommendations-header">
                  <span>Live Recommendations</span>
                  <small>{recommendations.length} products</small>
                </div>
                {recommendations.map((product) => {
                  const imgUrl = formatProductImage(
                    product.image || product.images || product.thumbnail,
                  );
                  return (
                    <div
                      key={product._id}
                      className="search-recommendation-item"
                      onClick={() => handleRecommendationClick(product)}
                    >
                      {imgUrl && (
                        <div className="recommendation-img">
                          <img src={imgUrl} alt={product.name} />
                        </div>
                      )}
                      <div className="recommendation-info">
                        <div className="recommendation-name">{product.name}</div>
                        <div className="recommendation-price">₹{product.price}</div>
                        <div className="recommendation-company">
                          {product.company || "Native91"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="recommendations-footer">
                  <span
                    className="view-all-btn"
                    onClick={handleSearch}
                    style={{ cursor: "pointer" }}
                  >
                    View all results for "{searchQuery}" →
                  </span>
                </div>
              </div>
            )}

            {/* SEARCH RESULTS */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                <div className="recommendations-header">
                  <span>Search Results</span>
                  <small>{searchResults.length} products</small>
                </div>
                {searchResults.map((product) => {
                  const imgUrl = formatProductImage(
                    product.image || product.images || product.thumbnail,
                  );
                  return (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleRecommendationClick(product)}
                    >
                      {imgUrl && (
                        <div className="search-result-img">
                          <img src={imgUrl} alt={product.name} />
                        </div>
                      )}
                      <div className="search-result-info">
                        <div className="search-result-name">{product.name}</div>
                        <div className="search-result-price">₹{product.price}</div>
                        <div className="search-result-company">
                          {product.company || "Native91"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="recommendations-footer">
                  <span
                    className="view-all-btn"
                    onClick={() => {
                      setShowSearchResults(false);
                      navigate(
                        `/category/All?search=${encodeURIComponent(
                          searchQuery.trim(),
                        )}`,
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Explore all products matching "{searchQuery}" →
                  </span>
                </div>
              </div>
            )}

            {/* EMPTY SEARCH STATE */}
            {searchQuery.trim().length >= 2 &&
              !isLoading &&
              recommendations.length === 0 &&
              searchResults.length === 0 &&
              (showRecommendations || showSearchResults) && (
                <div className="search-recommendations-dropdown">
                  <div className="search-no-results">
                    No products found matching "{searchQuery}"
                  </div>
                </div>
              )}
          </div>

          {/* ACCOUNT, WISHLIST & CART */}
          <div className="native-actions-wrapper">
            {isLoggedIn ? (
              <Dropdown align="end" className="native-account-dropdown">
                <Dropdown.Toggle as="button" className="native-action-item native-account-btn">
                  <div className="native-user-avatar">{userInitial || "U"}</div>
                  <span className="native-action-label">
                    {userName ? userName.split(" ")[0] : "Account"}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="native-user-menu">
                  <div className="native-user-menu-header">
                    <div className="user-name">{userName || "User"}</div>
                    {userEmail && <div className="user-email">{userEmail}</div>}
                  </div>
                  <Dropdown.Item
                    onClick={() => navigate("/orderhistory")}
                    className="user-menu-link"
                  >
                    <HiOutlineUser />
                    <span>My Profile & Orders</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => navigate("/wishlist")}
                    className="user-menu-link"
                  >
                    <HiOutlineHeart />
                    <span>My Wishlist ({wishlistCount})</span>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handleLogout}
                    className="user-menu-link logout-link"
                    disabled={loggingOut}
                  >
                    <FiLogOut />
                    <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <NavLink to="/login" className="native-action-item">
                <HiOutlineUser className="native-action-icon" />
                <span className="native-action-label">Account</span>
              </NavLink>
            )}

            <NavLink to="/wishlist" className="native-action-item">
              <div className="native-action-icon-box">
                <HiOutlineHeart className="native-action-icon" />
                <span className="native-action-badge wishlist-badge">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              </div>
              <span className="native-action-label">Wishlist</span>
            </NavLink>

            <NavLink to="/cart" className="native-action-item">
              <div className="native-action-icon-box">
                <FiShoppingCart className="native-action-icon" />
                <span className="native-action-badge cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </div>
              <span className="native-action-label">Cart</span>
            </NavLink>
          </div>
        </Container>
      </div>

      {/* DESKTOP CATEGORY NAVIGATION */}
      <nav className="native-category-nav d-none d-lg-block">
        <Container className="native-category-nav-container">
          {/* ALL CATEGORIES */}
          <div
            className="native-all-categories-wrapper"
            onMouseEnter={() => handleDropdownEnter("all")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className={`native-all-categories-btn ${
                activeDropdown === "all" ? "active" : ""
              }`}
              onClick={() =>
                setActiveDropdown(activeDropdown === "all" ? null : "all")
              }
            >
              <span>All Categories</span>
              <FiChevronDown className="native-caret-icon" />
            </button>

            {activeDropdown === "all" && (
              <div
                className="native-mega-menu"
                onMouseEnter={() => handleDropdownEnter("all")}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="mega-menu-inner">
                  <div className="mega-menu-categories-col">
                    <NavLink
                      to="/category/All"
                      className="mega-cat-item is-all"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <span>All Products</span>
                      <FiChevronRight className="mega-arrow" />
                    </NavLink>

                    {loadingCategories ? (
                      <div className="px-3 py-3 text-muted small">
                        Loading categories...
                      </div>
                    ) : allCategoryList.length === 0 ? (
                      <div className="px-3 py-3 text-muted small">
                        No categories available
                      </div>
                    ) : (
                      allCategoryList.map((cat, idx) => (
                        <div
                          key={cat.categorySlug}
                          className={`mega-cat-item ${
                            megaActiveCategory === idx ? "active" : ""
                          }`}
                          onMouseEnter={() => {
                            setMegaActiveCategory(idx);
                            fetchSubCategoriesForCategory(cat.title, cat.backendName);
                          }}
                        >
                          <NavLink
                            to={`/category/${cat.categorySlug}`}
                            className="mega-cat-link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span>{cat.title}</span>
                            <FiChevronRight className="mega-arrow" />
                          </NavLink>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mega-menu-subcategories-col">
                    {allCategoryList[megaActiveCategory] && (
                      <div className="mega-subcat-content">
                        <div className="mega-subcat-header">
                          <h4 className="mega-subcat-title">
                            {allCategoryList[megaActiveCategory].title}
                          </h4>
                          <NavLink
                            to={`/category/${allCategoryList[megaActiveCategory].categorySlug}`}
                            className="mega-view-all-link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            View All {allCategoryList[megaActiveCategory].title} →
                          </NavLink>
                        </div>

                        {allCategoryList[megaActiveCategory].loading ? (
                          <div className="text-muted small py-2">
                            Loading subcategories...
                          </div>
                        ) : allCategoryList[megaActiveCategory].subcategories.length > 0 ? (
                          <div className="mega-subcat-grid">
                            {allCategoryList[megaActiveCategory].subcategories.map(
                              (sub, sIdx) => (
                                <NavLink
                                  key={sIdx}
                                  to={`/category/${allCategoryList[megaActiveCategory].categorySlug}/${sub.slug}`}
                                  className="mega-subcat-item"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span className="mega-bullet">•</span>
                                  <span>{sub.name}</span>
                                </NavLink>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-muted small py-2">
                            No sub-categories available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY LINKS */}
          <div className="native-nav-categories-list">
            {loadingCategories ? (
              <div className="px-3 py-2 text-muted small">Loading categories...</div>
            ) : headerCategoryList.length === 0 ? (
              <div className="px-3 py-2 text-muted small">No categories available</div>
            ) : (
              headerCategoryList.map((cat, idx) => (
                <div
                  key={cat.categorySlug}
                  className="native-nav-category-item"
                  onMouseEnter={() => handleDropdownEnter(idx)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <NavLink
                    to={`/category/${cat.categorySlug}`}
                    className="native-nav-category-link"
                  >
                    <span>{cat.title}</span>
                    <FiChevronDown className="native-nav-caret" />
                  </NavLink>

                  {activeDropdown === idx && (
                    <div
                      className="native-category-dropdown"
                      onMouseEnter={() => handleDropdownEnter(idx)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="category-dropdown-header">
                        <span>{cat.title}</span>
                      </div>
                      <div className="category-dropdown-list">
                        {cat.loading ? (
                          <div className="px-3 py-2 text-muted small">Loading...</div>
                        ) : cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub, sIdx) => (
                            <NavLink
                              key={sIdx}
                              to={`/category/${cat.categorySlug}/${sub.slug}`}
                              className="category-dropdown-subitem"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className="subitem-bullet">•</span>
                              <span>{sub.name}</span>
                            </NavLink>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-muted small">
                            No sub-categories available
                          </div>
                        )}
                      </div>
                      <div className="category-dropdown-footer">
                        <NavLink
                          to={`/category/${cat.categorySlug}`}
                          className="category-dropdown-viewall"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Explore all in {cat.title} →
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Container>
      </nav>

      {/* MOBILE OFFCANVAS DRAWER */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="start"
        className="native-mobile-drawer"
      >
        <Offcanvas.Header closeButton className="native-drawer-header">
          <Offcanvas.Title>
            <img src="/images/native.png" alt="Native 91" className="native-drawer-logo" />
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="native-drawer-body">
          {/* USER STATUS */}
          <div className="native-drawer-user-card">
            {isLoggedIn ? (
              <div className="drawer-user-info">
                <div className="native-user-avatar">{userInitial || "U"}</div>
                <div>
                  <div className="drawer-user-name">{userName || "User"}</div>
                  {userEmail && <small className="drawer-user-email">{userEmail}</small>}
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="drawer-login-btn"
                onClick={() => setShowMobileMenu(false)}
              >
                <HiOutlineUser />
                <span>Login / Register</span>
              </NavLink>
            )}
          </div>

          {/* CATEGORY ACCORDION */}
          <div className="native-drawer-categories">
            <div className="drawer-section-title">Shop by Category</div>

            <NavLink
              to="/category/All"
              className="drawer-cat-link all-products"
              onClick={() => setShowMobileMenu(false)}
            >
              <span>All Products</span>
              <FiChevronRight />
            </NavLink>

            {loadingCategories ? (
              <div className="px-3 py-3 text-muted small">Loading categories...</div>
            ) : allCategoryList.length === 0 ? (
              <div className="px-3 py-3 text-muted small">No categories available</div>
            ) : (
              allCategoryList.map((cat, idx) => {
                const isExpanded = mobileExpandedCat === idx;
                return (
                  <div key={cat.categorySlug} className="drawer-cat-accordion-group">
                    <div className="drawer-cat-accordion-header">
                      <NavLink
                        to={`/category/${cat.categorySlug}`}
                        className="drawer-cat-title-link"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {cat.title}
                      </NavLink>
                      <button
                        type="button"
                        className="drawer-cat-toggle-btn"
                        onClick={() => {
                          setMobileExpandedCat(isExpanded ? null : idx);
                          if (!isExpanded) {
                            fetchSubCategoriesForCategory(cat.title, cat.backendName);
                          }
                        }}
                      >
                        <FiChevronDown
                          className={`drawer-chevron ${isExpanded ? "rotated" : ""}`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="drawer-subcat-list">
                        {cat.loading ? (
                          <div className="px-3 py-2 text-muted small">
                            Loading subcategories...
                          </div>
                        ) : cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub, sIdx) => (
                            <NavLink
                              key={sIdx}
                              to={`/category/${cat.categorySlug}/${sub.slug}`}
                              className="drawer-subcat-link"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              {sub.name}
                            </NavLink>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-muted small">
                            No sub-categories available
                          </div>
                        )}
                        <NavLink
                          to={`/category/${cat.categorySlug}`}
                          className="drawer-subcat-viewall"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          View All {cat.title} →
                        </NavLink>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* QUICK LINKS */}
          <div className="native-drawer-footer-links">
            <NavLink
              to="/wishlist"
              className="drawer-footer-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <HiOutlineHeart />
              <span>Wishlist ({wishlistCount})</span>
            </NavLink>
            <NavLink
              to="/sell"
              className="drawer-footer-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <FiShoppingBag />
              <span>Sell With Us</span>
            </NavLink>
            <NavLink
              to="/aboutus"
              className="drawer-footer-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <span>About Us</span>
            </NavLink>
            {isLoggedIn && (
              <button
                type="button"
                className="drawer-logout-btn"
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                disabled={loggingOut}
              >
                <FiLogOut />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;
