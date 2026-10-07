// // // import { useState, useEffect, useRef } from "react";
// // // import {
// // //   Navbar,
// // //   Container,
// // //   Nav,
// // //   Offcanvas,
// // //   Form,
// // //   Button,
// // //   Dropdown,
// // //   Spinner,
// // // } from "react-bootstrap";
// // // import {
// // //   HiOutlineHeart,
// // //   HiOutlineMenuAlt3,
// // //   HiOutlineSearch,
// // //   HiOutlineUser,
// // // } from "react-icons/hi";
// // // import { FiShoppingBag, FiX } from "react-icons/fi";
// // // import { motion, AnimatePresence } from "framer-motion";
// // // import { NavLink, useNavigate } from "react-router-dom";
// // // import axios from "axios";
// // // import { useCart } from "../../context/CartContext";
// // // import { useWishlist } from "../../context/WishlistContext";
// // // import { createSlug } from "../../utils/slugUtils";
// // // import "./header.css";

// // // // ✅ API URLs
// // // const VENDOR_API_URL = "https://api-vendor.native91.com/api";
// // // const ADMIN_API_URL = "https://api-admin.native91.com/api/category";

// // // const getAuthHeaders = () => {
// // //   const token = localStorage.getItem("token");
// // //   return {
// // //     headers: { Authorization: `Bearer ${token}` },
// // //   };
// // // };

// // // // 🆕 Parse sub-categories
// // // const parseSubCategories = (input, depth = 0) => {
// // //   if (!input || depth > 10) return [];

// // //   if (Array.isArray(input)) {
// // //     const out = [];
// // //     input.forEach((item) => {
// // //       const parsed = parseSubCategories(item, depth + 1);
// // //       parsed.forEach((p) => {
// // //         if (p && !out.includes(p)) out.push(p);
// // //       });
// // //     });
// // //     return out;
// // //   }

// // //   if (typeof input === "object" && input !== null) {
// // //     if (input.status === "inactive") return [];
// // //     if (typeof input.name === "string") {
// // //       return parseSubCategories(input.name, depth + 1);
// // //     }
// // //     return [];
// // //   }

// // //   if (typeof input === "string") {
// // //     let s = input.trim();
// // //     if (!s) return [];

// // //     if (
// // //       (s.startsWith("[") && s.endsWith("]")) ||
// // //       (s.startsWith("{") && s.endsWith("}")) ||
// // //       (s.startsWith('"') && s.endsWith('"'))
// // //     ) {
// // //       try {
// // //         const parsed = JSON.parse(s);
// // //         const result = parseSubCategories(parsed, depth + 1);
// // //         if (result.length > 0) return result;
// // //       } catch {}
// // //     }

// // //     let cleaned = s;
// // //     let prev = null;
// // //     while (cleaned !== prev) {
// // //       prev = cleaned;
// // //       cleaned = cleaned
// // //         .replace(/^[\[\]\\"]+/, "")
// // //         .replace(/[\[\]\\"]+$/, "")
// // //         .trim();
// // //     }

// // //     if (cleaned.length === 0 || cleaned.length > 200) return [];

// // //     if (cleaned.includes(",") && !cleaned.includes(" & ")) {
// // //       const parts = cleaned
// // //         .split(",")
// // //         .map((p) => p.replace(/^[\[\]\\"]+|[\[\]\\"]+$/g, "").trim())
// // //         .filter((p) => p.length > 0 && p.length < 100);
// // //       if (parts.length > 1) return parts;
// // //     }

// // //     return [cleaned];
// // //   }

// // //   return [];
// // // };

// // // const pickSubsFromResponse = (data) => {
// // //   if (!data) return [];
// // //   return (
// // //     data.subCategories ||
// // //     data.subcategories ||
// // //     data.sub_categories ||
// // //     data.subCategoryList ||
// // //     []
// // //   );
// // // };

// // // // 🆕 Decode JWT token
// // // const decodeJWT = (token) => {
// // //   try {
// // //     if (!token || typeof token !== "string") return null;
// // //     const parts = token.split(".");
// // //     if (parts.length !== 3) return null;

// // //     const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
// // //     const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
// // //     return JSON.parse(atob(padded));
// // //   } catch (err) {
// // //     console.warn("JWT decode failed:", err);
// // //     return null;
// // //   }
// // // };

// // // // 🆕 Extract first letter from user object OR JWT
// // // const extractInitial = (userObj, token = null) => {
// // //   if (userObj && typeof userObj === "object") {
// // //     const candidates = [
// // //       userObj.email,
// // //       userObj.userEmail,
// // //       userObj.emailId,
// // //       userObj.mail,
// // //       userObj.username,
// // //       userObj.userName,
// // //       userObj.phone,
// // //       userObj.mobile,
// // //       userObj.name,
// // //       userObj.fullName,
// // //       userObj.firstName,
// // //       userObj.given_name,
// // //     ];

// // //     for (const val of candidates) {
// // //       if (val && typeof val === "string" && val.trim().length > 0) {
// // //         const ch = val.trim().charAt(0);
// // //         if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
// // //       }
// // //     }
// // //   }

// // //   if (token) {
// // //     const decoded = decodeJWT(token);
// // //     if (decoded) {
// // //       const jwtCandidates = [
// // //         decoded.email,
// // //         decoded.userEmail,
// // //         decoded.username,
// // //         decoded.name,
// // //         decoded.given_name,
// // //         decoded.sub,
// // //       ];

// // //       for (const val of jwtCandidates) {
// // //         if (val && typeof val === "string" && val.trim().length > 0) {
// // //           const ch = val.trim().charAt(0);
// // //           if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
// // //         }
// // //       }
// // //     }
// // //   }

// // //   return "U";
// // // };

// // // const Header = () => {
// // //   const navigate = useNavigate();
// // //   const [isScrolled, setIsScrolled] = useState(false);
// // //   const [showMenu, setShowMenu] = useState(false);
// // //   const [showSearch, setShowSearch] = useState(false);
// // //   const [categories, setCategories] = useState([]);
// // //   const [loadingCategories, setLoadingCategories] = useState(true);
// // //   const [searchQuery, setSearchQuery] = useState("");
// // //   const [searchResults, setSearchResults] = useState([]);
// // //   const [showSearchResults, setShowSearchResults] = useState(false);
// // //   const [recommendations, setRecommendations] = useState([]);
// // //   const [showRecommendations, setShowRecommendations] = useState(false);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [hoveredCategory, setHoveredCategory] = useState(null);
// // //   const [categorySubCategories, setCategorySubCategories] = useState({});
// // //   const [loadingSubCategories, setLoadingSubCategories] = useState({});

// // //   // 🆕 Login state
// // //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// // //   const [userInitial, setUserInitial] = useState("");

// // //   const searchTimeout = useRef(null);
// // //   const searchRef = useRef(null);
// // //   const categoryMenuTimeout = useRef(null);

// // //   const { cartCount, fetchCart } = useCart();
// // //   const { wishlistCount, fetchWishlist } = useWishlist();

// // //   // 🆕 Track login state
// // //   useEffect(() => {
// // //     const loadUser = () => {
// // //       try {
// // //         const token = localStorage.getItem("token");
// // //         const userData =
// // //           localStorage.getItem("user") || localStorage.getItem("userData");

// // //         if (!token) {
// // //           setIsLoggedIn(false);
// // //           setUserInitial("");
// // //           return;
// // //         }

// // //         let parsed = null;
// // //         if (userData) {
// // //           try {
// // //             parsed = JSON.parse(userData);
// // //           } catch (e) {
// // //             console.warn("User data parse failed:", e);
// // //           }
// // //         }

// // //         setIsLoggedIn(true);
// // //         const initial = extractInitial(parsed, token);
// // //         setUserInitial(initial);
// // //       } catch (err) {
// // //         console.error("Header loadUser error:", err);
// // //         setIsLoggedIn(false);
// // //         setUserInitial("");
// // //       }
// // //     };

// // //     loadUser();

// // //     const t1 = setTimeout(loadUser, 100);
// // //     const t2 = setTimeout(loadUser, 500);
// // //     const t3 = setTimeout(loadUser, 1500);

// // //     window.addEventListener("storage", loadUser);
// // //     window.addEventListener("userUpdated", loadUser);
// // //     window.addEventListener("focus", loadUser);
// // //     window.addEventListener("pageshow", loadUser);

// // //     return () => {
// // //       clearTimeout(t1);
// // //       clearTimeout(t2);
// // //       clearTimeout(t3);
// // //       window.removeEventListener("storage", loadUser);
// // //       window.removeEventListener("userUpdated", loadUser);
// // //       window.removeEventListener("focus", loadUser);
// // //       window.removeEventListener("pageshow", loadUser);
// // //     };
// // //   }, []);

// // //   // 🆕 Fetch categories + build sub-categories map in one shot
// // //   useEffect(() => {
// // //     const fetchCategories = async () => {
// // //       try {
// // //         console.log("🔍 Fetching categories from Admin API...");
// // //         const response = await axios.get(`${ADMIN_API_URL}/categories`, {
// // //           ...getAuthHeaders(),
// // //         });

// // //         let categoriesData = [];
// // //         if (response.data.success && Array.isArray(response.data.categories)) {
// // //           categoriesData = response.data.categories;
// // //         } else if (Array.isArray(response.data)) {
// // //           categoriesData = response.data;
// // //         }

// // //         const activeCategories = categoriesData.filter(
// // //           (cat) => cat.status === "active"
// // //         );

// // //         console.log(`📂 Found ${activeCategories.length} categories`);

// // //         // 🆕 Build sub-categories map directly from category object
// // //         const subMap = {};
// // //         activeCategories.forEach((cat) => {
// // //           if (Array.isArray(cat.subcategories)) {
// // //             subMap[cat.name] = cat.subcategories
// // //               .filter((sc) => !sc.status || sc.status === "active")
// // //               .map((sc) => (typeof sc === "string" ? sc : sc.name))
// // //               .filter(Boolean);
// // //           } else {
// // //             subMap[cat.name] = [];
// // //           }
// // //         });

// // //         console.log("📊 Sub-categories map:");
// // //         Object.entries(subMap).forEach(([name, subs]) => {
// // //           console.log(`   ${name}: ${subs.length} subs`);
// // //         });

// // //         setCategories(activeCategories);
// // //         setCategorySubCategories(subMap);
// // //       } catch (error) {
// // //         console.error("Error fetching categories:", error);
// // //         const defaultCategories = [
// // //           { _id: "1", name: "Organic Food & Healthy Snacks" },
// // //           { _id: "2", name: "Beauty & Wellness" },
// // //           { _id: "3", name: "Gifts & Hampers" },
// // //           { _id: "4", name: "Handmade Home Decor" },
// // //           { _id: "5", name: "Sustainable Lifestyle" },
// // //           { _id: "6", name: "Jewellery & Accessories" },
// // //           { _id: "7", name: "Pet Care" },
// // //           { _id: "8", name: "Kids Fashion & Toys" },
// // //           { _id: "9", name: "Desk Essentials" },
// // //           { _id: "10", name: "Ethnic Fashion" },
// // //         ];
// // //         setCategories(defaultCategories);
// // //       } finally {
// // //         setLoadingCategories(false);
// // //       }
// // //     };
// // //     fetchCategories();
// // //   }, []);

// // //   // 🆕 Fetch sub-categories on hover (fuzzy match + fallback)
// // //   const fetchSubCategoriesForCategory = async (categoryName) => {
// // //     if (!categoryName) return [];

// // //     console.log(`🔍 Fetching subs for: "${categoryName}"`);

// // //     // STEP 1: Local data use karo (fuzzy match with trim + lowercase)
// // //     const normalizedName = String(categoryName).trim().toLowerCase();

// // //     const localCategory = categories.find((cat) => {
// // //       const catName = String(cat.name || "").trim().toLowerCase();
// // //       return catName === normalizedName;
// // //     });

// // //     if (localCategory) {
// // //       console.log(`✅ Found local category: "${localCategory.name}"`);

// // //       if (
// // //         Array.isArray(localCategory.subcategories) &&
// // //         localCategory.subcategories.length > 0
// // //       ) {
// // //         const localSubs = localCategory.subcategories
// // //           .filter((sc) => !sc.status || sc.status === "active")
// // //           .map((sc) => (typeof sc === "string" ? sc : sc.name))
// // //           .filter(Boolean);

// // //         console.log(`✅ Local subs for "${categoryName}":`, localSubs.length);

// // //         setCategorySubCategories((prev) => ({
// // //           ...prev,
// // //           [categoryName]: localSubs,
// // //         }));
// // //         return localSubs;
// // //       } else {
// // //         console.warn(`⚠️ "${categoryName}" has no subcategories field`);
// // //       }
// // //     } else {
// // //       console.warn(`⚠️ Category "${categoryName}" not found in local data`);
// // //       console.log(
// // //         `   Available:`,
// // //         categories.map((c) => c.name)
// // //       );
// // //     }

// // //     // STEP 2: Cache check
// // //     if (
// // //       categorySubCategories[categoryName] &&
// // //       categorySubCategories[categoryName].length > 0
// // //     ) {
// // //       console.log(`✅ Using cached subs for "${categoryName}"`);
// // //       return categorySubCategories[categoryName];
// // //     }

// // //     // STEP 3: Fallback — VENDOR API
// // //     console.log(`🌐 Trying VENDOR API for "${categoryName}"...`);
// // //     setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: true }));
// // //     try {
// // //       const response = await axios.get(
// // //         `${VENDOR_API_URL}/categories/${encodeURIComponent(
// // //           categoryName
// // //         )}/subcategories`,
// // //         { ...getAuthHeaders(), timeout: 5000 }
// // //       );
// // //       console.log(`📦 VENDOR API response:`, response.data);

// // //       const subs = parseSubCategories(pickSubsFromResponse(response.data));
// // //       console.log(`✅ VENDOR API subs for "${categoryName}":`, subs.length);

// // //       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: subs }));
// // //       return subs;
// // //     } catch (error) {
// // //       console.warn(`❌ VENDOR API failed for "${categoryName}":`, error.message);
// // //       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: [] }));
// // //       return [];
// // //     } finally {
// // //       setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: false }));
// // //     }
// // //   };

// // //   const handleCategoryHover = (categoryName) => {
// // //     if (!categoryName || categoryName === "Category") return;

// // //     if (categoryMenuTimeout.current) {
// // //       clearTimeout(categoryMenuTimeout.current);
// // //     }

// // //     setHoveredCategory(categoryName);

// // //     // 🆕 Sub-categories already loaded from initial fetch — no need to call API
// // //     const existing = categorySubCategories[categoryName];
// // //     if (!existing || existing.length === 0) {
// // //       fetchSubCategoriesForCategory(categoryName);
// // //     }
// // //   };

// // //   const handleCategoryLeave = () => {
// // //     categoryMenuTimeout.current = setTimeout(() => {
// // //       setHoveredCategory(null);
// // //     }, 300);
// // //   };

// // //   useEffect(() => {
// // //     fetchCart();
// // //     fetchWishlist();

// // //     const handleCartUpdate = () => fetchCart();
// // //     const handleWishlistUpdate = () => fetchWishlist();

// // //     window.addEventListener("cartUpdated", handleCartUpdate);
// // //     window.addEventListener("wishlistUpdated", handleWishlistUpdate);

// // //     return () => {
// // //       window.removeEventListener("cartUpdated", handleCartUpdate);
// // //       window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
// // //       if (categoryMenuTimeout.current) {
// // //         clearTimeout(categoryMenuTimeout.current);
// // //       }
// // //     };
// // //   }, [fetchCart, fetchWishlist]);

// // //   useEffect(() => {
// // //     const handleClickOutside = (event) => {
// // //       if (searchRef.current && !searchRef.current.contains(event.target)) {
// // //         setShowRecommendations(false);
// // //         setShowSearchResults(false);
// // //       }
// // //     };
// // //     document.addEventListener("mousedown", handleClickOutside);
// // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // //   }, []);

// // //   const fetchLiveSuggestions = async (query) => {
// // //     if (!query || query.trim().length < 2) {
// // //       setRecommendations([]);
// // //       setShowRecommendations(false);
// // //       return;
// // //     }
// // //     try {
// // //       const response = await axios.get(
// // //         `https://api.native91.com/api/search-suggestions`,
// // //         {
// // //           params: { q: query },
// // //           timeout: 5000,
// // //           ...getAuthHeaders(),
// // //         },
// // //       );
// // //       if (response.data?.products && response.data.products.length > 0) {
// // //         setRecommendations(response.data.products.slice(0, 8));
// // //         setShowRecommendations(true);
// // //       } else {
// // //         setRecommendations([]);
// // //         setShowRecommendations(false);
// // //       }
// // //     } catch (error) {
// // //       console.error("Live search error:", error);
// // //       setRecommendations([]);
// // //       setShowRecommendations(false);
// // //     }
// // //   };

// // //   const handleSearchChange = (e) => {
// // //     const value = e.target.value;
// // //     setSearchQuery(value);
// // //     if (searchTimeout.current) clearTimeout(searchTimeout.current);
// // //     searchTimeout.current = setTimeout(() => {
// // //       if (value.trim().length >= 2) {
// // //         fetchLiveSuggestions(value);
// // //       } else {
// // //         setRecommendations([]);
// // //         setSearchResults([]);
// // //         setShowRecommendations(false);
// // //         setShowSearchResults(false);
// // //       }
// // //     }, 300);
// // //   };

// // //   const handleSearch = async (e) => {
// // //     e.preventDefault();
// // //     if (!searchQuery.trim()) return;
// // //     setIsLoading(true);
// // //     try {
// // //       const response = await axios.get(
// // //         `https://api.native91.com/api/products/search`,
// // //         {
// // //           params: { keyword: searchQuery },
// // //           ...getAuthHeaders(),
// // //         },
// // //       );
// // //       setSearchResults(response.data?.products || []);
// // //       setShowSearchResults(true);
// // //       setShowRecommendations(false);
// // //     } catch (error) {
// // //       console.error("Search error:", error);
// // //       setSearchResults([]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const handleRecommendationClick = (product) => {
// // //     setShowSearch(false);
// // //     setShowSearchResults(false);
// // //     setShowRecommendations(false);
// // //     setSearchQuery("");
// // //     setRecommendations([]);
// // //     navigate(`/product/${createSlug(product.name)}`);
// // //   };

// // //   useEffect(() => {
// // //     return () => {
// // //       if (searchTimeout.current) clearTimeout(searchTimeout.current);
// // //     };
// // //   }, []);

// // //   // 🆕 Menu — sub-categories directly from category object
// // //   const menu = [
// // //     { title: "Home", link: "/" },
// // //     { title: "Brands", link: "/product" },
// // //     {
// // //       title: "Category",
// // //       dropdown: categories.map((cat) => {
// // //         // 🆕 Direct sub-categories (no lookup needed)
// // //         const catSubs = Array.isArray(cat.subcategories)
// // //           ? cat.subcategories
// // //               .filter((sc) => !sc.status || sc.status === "active")
// // //               .map((sc) => (typeof sc === "string" ? sc : sc.name))
// // //               .filter(Boolean)
// // //           : [];

// // //         return {
// // //           title: cat.name,
// // //           link: `/category/${createSlug(cat.name)}`,
// // //           productCount: cat.productCount || 0,
// // //           subCategories: catSubs,
// // //           loading: loadingSubCategories[cat.name] || false,
// // //         };
// // //       }),
// // //     },
// // //     { title: "Social Impact", link: "/social-impact" },
// // //     { title: "Sell With Us", link: "/sell" },
// // //     { title: "About Us", link: "/aboutus" },
// // //   ];

// // //   useEffect(() => {
// // //     const handleScroll = () => {
// // //       setIsScrolled(window.scrollY > 30);
// // //     };
// // //     handleScroll();
// // //     window.addEventListener("scroll", handleScroll);
// // //     return () => {
// // //       window.removeEventListener("scroll", handleScroll);
// // //     };
// // //   }, []);

// // //   const renderUserIcon = () => {
// // //     if (isLoggedIn) {
// // //       return (
// // //         <NavLink to="/orderhistory" className="icon-link" title="My Profile">
// // //           <button type="button" className="user-btn">
// // //             <span className="user-initial-badge">{userInitial || "U"}</span>
// // //           </button>
// // //         </NavLink>
// // //       );
// // //     }
// // //     return (
// // //       <NavLink to="/login" className="icon-link" title="Login">
// // //         <button type="button" className="user-btn">
// // //           <HiOutlineUser />
// // //         </button>
// // //       </NavLink>
// // //     );
// // //   };

// // //   return (
// // //     <>
// // //       <div className="lexend pe-auto">
// // //         <AnimatePresence>
// // //           {showSearch && (
// // //             <motion.div
// // //               className="search-overlay"
// // //               initial={{ y: -120 }}
// // //               animate={{ y: 0 }}
// // //               exit={{ y: -120 }}
// // //               transition={{ duration: 0.35 }}
// // //             >
// // //               <Container>
// // //                 <div className="search-box" ref={searchRef}>
// // //                   <Form onSubmit={handleSearch} className="w-100 d-flex">
// // //                     <Form.Control
// // //                       placeholder="Search products..."
// // //                       value={searchQuery}
// // //                       onChange={handleSearchChange}
// // //                       className="flex-grow-1"
// // //                       autoFocus
// // //                     />
// // //                     <Button
// // //                       type="submit"
// // //                       variant="dark"
// // //                       className="ms-2"
// // //                       disabled={isLoading}
// // //                     >
// // //                       {isLoading ? (
// // //                         <Spinner animation="border" size="sm" />
// // //                       ) : (
// // //                         "Search"
// // //                       )}
// // //                     </Button>
// // //                   </Form>

// // //                   {showRecommendations && recommendations.length > 0 && (
// // //                     <div className="search-recommendations-dropdown">
// // //                       <div className="recommendations-header">
// // //                         <span>Live Recommendations</span>
// // //                         <small>{recommendations.length} products</small>
// // //                       </div>
// // //                       {recommendations.map((product) => (
// // //                         <div
// // //                           key={product._id}
// // //                           className="search-recommendation-item"
// // //                           onClick={() => handleRecommendationClick(product)}
// // //                         >
// // //                           <div className="recommendation-info">
// // //                             <div className="recommendation-name">
// // //                               {product.name}
// // //                             </div>
// // //                             <div className="recommendation-price">
// // //                               ₹{product.price}
// // //                             </div>
// // //                             <div className="recommendation-company">
// // //                               {product.company || "Native91"}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   )}

// // //                   <button
// // //                     className="close-search"
// // //                     onClick={() => {
// // //                       setShowSearch(false);
// // //                       setShowSearchResults(false);
// // //                       setShowRecommendations(false);
// // //                       setSearchQuery("");
// // //                       setRecommendations([]);
// // //                       setSearchResults([]);
// // //                     }}
// // //                   >
// // //                     <FiX />
// // //                   </button>
// // //                 </div>
// // //               </Container>
// // //             </motion.div>
// // //           )}
// // //         </AnimatePresence>

// // //         <Navbar
// // //           expand="lg"
// // //           className={`premium-navbar ${isScrolled ? "navbar-scrolled" : ""}`}
// // //           sticky="top"
// // //         >
// // //           <Container>
// // //             <Navbar.Brand as={NavLink} to="/">
// // //               <img src="/images/native.png" alt="Native91" className="logo" />
// // //             </Navbar.Brand>

// // //             <Nav className="mx-auto desktop-menu ">
// // //               {menu.map((item, index) => (
// // //                 <motion.div key={index} whileHover={{ y: -3 }}>
// // //                   {item.dropdown ? (
// // //                     <Dropdown
// // //                       className="premium-dropdown category-dropdown"
// // //                       show={hoveredCategory !== null}
// // //                       onMouseEnter={() => {
// // //                         if (categoryMenuTimeout.current) {
// // //                           clearTimeout(categoryMenuTimeout.current);
// // //                         }

// // //                         if (!hoveredCategory) {
// // //                           setHoveredCategory(item.title);
// // //                         }
// // //                       }}
// // //                       onMouseLeave={handleCategoryLeave}
// // //                     >
// // //                       <Dropdown.Toggle
// // //                         as="div"
// // //                         className="premium-link dropdown-toggle-custom"
// // //                       >
// // //                         {item.title}
// // //                       </Dropdown.Toggle>

// // //                       <Dropdown.Menu className="category-mega-menu">
// // //                         {loadingCategories ? (
// // //                           <Dropdown.Item className="dropdown-item-custom text-center">
// // //                             <span className="dropdown-loading">
// // //                               Loading categories...
// // //                             </span>
// // //                           </Dropdown.Item>
// // //                         ) : (
// // //                           <div className="category-menu-wrapper">
// // //                             <div className="category-list-column">
// // //                               {item.dropdown.map((sub, i) => (
// // //                                 <div
// // //                                   key={i}
// // //                                   className={`category-menu-item ${
// // //                                     hoveredCategory === sub.title
// // //                                       ? "active"
// // //                                       : ""
// // //                                   }`}
// // //                                   onMouseEnter={() =>
// // //                                     handleCategoryHover(sub.title)
// // //                                   }
// // //                                 >
// // //                                   <NavLink
// // //                                     to={sub.link}
// // //                                     className="dropdown-item-custom category-link"
// // //                                     onClick={() => setShowMenu(false)}
// // //                                   >
// // //                                     {sub.title}
// // //                                     {sub.subCategories &&
// // //                                       sub.subCategories.length > 0 && (
// // //                                         <span className="sub-category-arrow ms-1">
// // //                                           ›
// // //                                         </span>
// // //                                       )}
// // //                                   </NavLink>
// // //                                 </div>
// // //                               ))}
// // //                             </div>

// // //                             {hoveredCategory && (
// // //                               <div className="subcategory-list-column">
// // //                                 <div className="subcategory-header">
// // //                                   <span className="subcategory-title">
// // //                                     {hoveredCategory}
// // //                                   </span>
// // //                                   <span className="subcategory-count">
// // //                                     {categorySubCategories[hoveredCategory]
// // //                                       ?.length || 0}{" "}
// // //                                     sub-categories
// // //                                   </span>
// // //                                 </div>
// // //                                 <div className="subcategory-grid">
// // //                                   {categorySubCategories[hoveredCategory]
// // //                                     ?.length > 0 ? (
// // //                                     categorySubCategories[hoveredCategory].map(
// // //                                       (sub, idx) => (
// // //                                         <NavLink
// // //                                           key={idx}
// // //                                           to={`/category/${createSlug(
// // //                                             hoveredCategory
// // //                                           )}/${createSlug(sub)}`}
// // //                                           className="subcategory-item"
// // //                                           onClick={() => setShowMenu(false)}
// // //                                         >
// // //                                           <span className="subcategory-dot">
// // //                                             •
// // //                                           </span>
// // //                                           {sub}
// // //                                         </NavLink>
// // //                                       )
// // //                                     )
// // //                                   ) : (
// // //                                     <div className="subcategory-empty">
// // //                                       No sub-categories available
// // //                                     </div>
// // //                                   )}
// // //                                 </div>
// // //                                 <div className="subcategory-footer">
// // //                                   <NavLink
// // //                                     to={`/category/${createSlug(
// // //                                       hoveredCategory
// // //                                     )}`}
// // //                                     className="view-all-subcategories"
// // //                                     onClick={() => setShowMenu(false)}
// // //                                   >
// // //                                     View All Products in {hoveredCategory} →
// // //                                   </NavLink>
// // //                                 </div>
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                         )}
// // //                       </Dropdown.Menu>
// // //                     </Dropdown>
// // //                   ) : (
// // //                     <NavLink to={item.link} className="nav-link premium-link">
// // //                       {item.title}
// // //                     </NavLink>
// // //                   )}
// // //                 </motion.div>
// // //               ))}
// // //             </Nav>

// // //             {/* ✅ DESKTOP ICONS */}
// // //             <div className="desktop-icons">
// // //               <button onClick={() => setShowSearch(true)}>
// // //                 <HiOutlineSearch />
// // //               </button>

// // //               {renderUserIcon()}

// // //               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
// // //                 <button type="button" className="cart-btn-with-badge">
// // //                   <HiOutlineHeart className="cart-icon" />
// // //                   {wishlistCount > 0 && (
// // //                     <span className="cart-badge wishlist-badge">
// // //                       {wishlistCount > 99 ? "99+" : wishlistCount}
// // //                     </span>
// // //                   )}
// // //                 </button>
// // //               </NavLink>

// // //               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
// // //                 <button type="button" className="cart-btn-with-badge">
// // //                   <FiShoppingBag className="cart-icon" />
// // //                   {cartCount > 0 && (
// // //                     <span className="cart-badge">
// // //                       {cartCount > 99 ? "99+" : cartCount}
// // //                     </span>
// // //                   )}
// // //                 </button>
// // //               </NavLink>
// // //             </div>

// // //             {/* ✅ MOBILE ICONS */}
// // //             <div className="mobile-right">
// // //               <button onClick={() => setShowSearch(true)}>
// // //                 <HiOutlineSearch />
// // //               </button>

// // //               {renderUserIcon()}

// // //               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
// // //                 <button type="button" className="cart-btn-with-badge">
// // //                   <HiOutlineHeart className="cart-icon" />
// // //                   {wishlistCount > 0 && (
// // //                     <span className="cart-badge wishlist-badge">
// // //                       {wishlistCount > 99 ? "99+" : wishlistCount}
// // //                     </span>
// // //                   )}
// // //                 </button>
// // //               </NavLink>

// // //               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
// // //                 <button type="button" className="cart-btn-with-badge">
// // //                   <FiShoppingBag className="cart-icon" />
// // //                   {cartCount > 0 && (
// // //                     <span className="cart-badge">
// // //                       {cartCount > 99 ? "99+" : cartCount}
// // //                     </span>
// // //                   )}
// // //                 </button>
// // //               </NavLink>

// // //               <button onClick={() => setShowMenu(true)}>
// // //                 <HiOutlineMenuAlt3 />
// // //               </button>
// // //             </div>
// // //           </Container>
// // //         </Navbar>

// // //         <Offcanvas
// // //           show={showMenu}
// // //           placement="end"
// // //           onHide={() => setShowMenu(false)}
// // //         >
// // //           <Offcanvas.Header closeButton>
// // //             <Offcanvas.Title>
// // //               <img
// // //                 src="/images/native.png"
// // //                 className="mobile-logo"
// // //                 alt="Native91"
// // //               />
// // //             </Offcanvas.Title>
// // //           </Offcanvas.Header>

// // //           <Offcanvas.Body>
// // //             <div className="offcanvas-user-row mb-3">
// // //               {isLoggedIn ? (
// // //                 <NavLink
// // //                   to="/orderhistory"
// // //                   className="mobile-link d-flex align-items-center gap-2"
// // //                   onClick={() => setShowMenu(false)}
// // //                 >
// // //                   <span className="user-initial-badge">
// // //                     {userInitial || "U"}
// // //                   </span>
// // //                   <span>My Profile</span>
// // //                 </NavLink>
// // //               ) : (
// // //                 <NavLink
// // //                   to="/login"
// // //                   className="mobile-link d-flex align-items-center gap-2"
// // //                   onClick={() => setShowMenu(false)}
// // //                 >
// // //                   <HiOutlineUser />
// // //                   <span>Login</span>
// // //                 </NavLink>
// // //               )}
// // //             </div>

// // //             <Nav className="flex-column lexend">
// // //               {menu.map((item, index) => (
// // //                 <div key={index}>
// // //                   {item.dropdown ? (
// // //                     <>
// // //                       <div className="mobile-link">{item.title}</div>
// // //                       {item.dropdown.map((sub, i) => (
// // //                         <div key={i}>
// // //                           <NavLink
// // //                             to={sub.link}
// // //                             className="mobile-sublink"
// // //                             onClick={() => setShowMenu(false)}
// // //                           >
// // //                             {sub.title}
// // //                           </NavLink>
// // //                           {sub.subCategories &&
// // //                             sub.subCategories.length > 0 && (
// // //                               <div className="mobile-sub-subcategories">
// // //                                 {sub.subCategories.map((subCat, idx) => (
// // //                                   <NavLink
// // //                                     key={idx}
// // //                                     to={`/category/${createSlug(
// // //                                       sub.title
// // //                                     )}/${createSlug(subCat)}`}
// // //                                     className="mobile-sub-sublink"
// // //                                     onClick={() => setShowMenu(false)}
// // //                                   >
// // //                                     • {subCat}
// // //                                   </NavLink>
// // //                                 ))}
// // //                               </div>
// // //                             )}
// // //                         </div>
// // //                       ))}
// // //                     </>
// // //                   ) : (
// // //                     <NavLink
// // //                       to={item.link}
// // //                       className="mobile-link"
// // //                       onClick={() => setShowMenu(false)}
// // //                     >
// // //                       {item.title}
// // //                     </NavLink>
// // //                   )}
// // //                 </div>
// // //               ))}
// // //             </Nav>
// // //           </Offcanvas.Body>
// // //         </Offcanvas>
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default Header;
// // import { useState, useEffect, useRef } from "react";
// // import {
// //   Navbar,
// //   Container,
// //   Nav,
// //   Offcanvas,
// //   Form,
// //   Button,
// //   Dropdown,
// //   Spinner,
// // } from "react-bootstrap";
// // import {
// //   HiOutlineHeart,
// //   HiOutlineMenuAlt3,
// //   HiOutlineSearch,
// //   HiOutlineUser,
// // } from "react-icons/hi";
// // import { FiShoppingBag, FiX } from "react-icons/fi";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { NavLink, useNavigate, useLocation } from "react-router-dom";
// // import axios from "axios";
// // import { useCart } from "../../context/CartContext";
// // import { useWishlist } from "../../context/WishlistContext";
// // import { createSlug } from "../../utils/slugUtils";
// // import "./header.css";

// // // ✅ API URLs
// // const VENDOR_API_URL = "https://api-vendor.native91.com/api";
// // const ADMIN_API_URL = "https://api-admin.native91.com/api/category";

// // const getAuthHeaders = () => {
// //   const token = localStorage.getItem("token");
// //   return {
// //     headers: { Authorization: `Bearer ${token}` },
// //   };
// // };

// // // 🆕 Parse sub-categories
// // const parseSubCategories = (input, depth = 0) => {
// //   if (!input || depth > 10) return [];

// //   if (Array.isArray(input)) {
// //     const out = [];
// //     input.forEach((item) => {
// //       const parsed = parseSubCategories(item, depth + 1);
// //       parsed.forEach((p) => {
// //         if (p && !out.includes(p)) out.push(p);
// //       });
// //     });
// //     return out;
// //   }

// //   if (typeof input === "object" && input !== null) {
// //     if (input.status === "inactive") return [];
// //     if (typeof input.name === "string") {
// //       return parseSubCategories(input.name, depth + 1);
// //     }
// //     return [];
// //   }

// //   if (typeof input === "string") {
// //     let s = input.trim();
// //     if (!s) return [];

// //     if (
// //       (s.startsWith("[") && s.endsWith("]")) ||
// //       (s.startsWith("{") && s.endsWith("}")) ||
// //       (s.startsWith('"') && s.endsWith('"'))
// //     ) {
// //       try {
// //         const parsed = JSON.parse(s);
// //         const result = parseSubCategories(parsed, depth + 1);
// //         if (result.length > 0) return result;
// //       } catch {}
// //     }

// //     let cleaned = s;
// //     let prev = null;
// //     while (cleaned !== prev) {
// //       prev = cleaned;
// //       cleaned = cleaned
// //         .replace(/^[\[\]\\"]+/, "")
// //         .replace(/[\[\]\\"]+$/, "")
// //         .trim();
// //     }

// //     if (cleaned.length === 0 || cleaned.length > 200) return [];

// //     if (cleaned.includes(",") && !cleaned.includes(" & ")) {
// //       const parts = cleaned
// //         .split(",")
// //         .map((p) => p.replace(/^[\[\]\\"]+|[\[\]\\"]+$/g, "").trim())
// //         .filter((p) => p.length > 0 && p.length < 100);
// //       if (parts.length > 1) return parts;
// //     }

// //     return [cleaned];
// //   }

// //   return [];
// // };

// // const pickSubsFromResponse = (data) => {
// //   if (!data) return [];
// //   return (
// //     data.subCategories ||
// //     data.subcategories ||
// //     data.sub_categories ||
// //     data.subCategoryList ||
// //     []
// //   );
// // };

// // // 🆕 Decode JWT token
// // const decodeJWT = (token) => {
// //   try {
// //     if (!token || typeof token !== "string") return null;
// //     const parts = token.split(".");
// //     if (parts.length !== 3) return null;

// //     const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
// //     const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
// //     return JSON.parse(atob(padded));
// //   } catch (err) {
// //     console.warn("JWT decode failed:", err);
// //     return null;
// //   }
// // };

// // // 🆕 Extract first letter from user object OR JWT
// // const extractInitial = (userObj, token = null) => {
// //   if (userObj && typeof userObj === "object") {
// //     const candidates = [
// //       userObj.email,
// //       userObj.userEmail,
// //       userObj.emailId,
// //       userObj.mail,
// //       userObj.username,
// //       userObj.userName,
// //       userObj.phone,
// //       userObj.mobile,
// //       userObj.name,
// //       userObj.fullName,
// //       userObj.firstName,
// //       userObj.given_name,
// //     ];

// //     for (const val of candidates) {
// //       if (val && typeof val === "string" && val.trim().length > 0) {
// //         const ch = val.trim().charAt(0);
// //         if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
// //       }
// //     }
// //   }

// //   if (token) {
// //     const decoded = decodeJWT(token);
// //     if (decoded) {
// //       const jwtCandidates = [
// //         decoded.email,
// //         decoded.userEmail,
// //         decoded.username,
// //         decoded.name,
// //         decoded.given_name,
// //         decoded.sub,
// //       ];

// //       for (const val of jwtCandidates) {
// //         if (val && typeof val === "string" && val.trim().length > 0) {
// //           const ch = val.trim().charAt(0);
// //           if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
// //         }
// //       }
// //     }
// //   }

// //   return "U";
// // };

// // const Header = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation(); // 🆕 re-read session on route change
// //   const [isScrolled, setIsScrolled] = useState(false);
// //   const [showMenu, setShowMenu] = useState(false);
// //   const [showSearch, setShowSearch] = useState(false);
// //   const [categories, setCategories] = useState([]);
// //   const [loadingCategories, setLoadingCategories] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [searchResults, setSearchResults] = useState([]);
// //   const [showSearchResults, setShowSearchResults] = useState(false);
// //   const [recommendations, setRecommendations] = useState([]);
// //   const [showRecommendations, setShowRecommendations] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [hoveredCategory, setHoveredCategory] = useState(null);
// //   const [categorySubCategories, setCategorySubCategories] = useState({});
// //   const [loadingSubCategories, setLoadingSubCategories] = useState({});

// //   // 🆕 Login state
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [userInitial, setUserInitial] = useState("");

// //   const searchTimeout = useRef(null);
// //   const searchRef = useRef(null);
// //   const categoryMenuTimeout = useRef(null);

// //   const { cartCount, fetchCart } = useCart();
// //   const { wishlistCount, fetchWishlist } = useWishlist();

// //   // 🆕 Track login state (ROBUST — listens to events + route changes)
// //   useEffect(() => {
// //     const loadUser = () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const userData =
// //           localStorage.getItem("user") || localStorage.getItem("userData");

// //         if (!token) {
// //           setIsLoggedIn(false);
// //           setUserInitial("");
// //           return;
// //         }

// //         let parsed = null;
// //         if (userData) {
// //           try {
// //             parsed = JSON.parse(userData);
// //           } catch (e) {
// //             console.warn("User data parse failed:", e);
// //           }
// //         }

// //         setIsLoggedIn(true);
// //         const initial = extractInitial(parsed, token);
// //         setUserInitial(initial);

// //         // 🆕 Debug log — remove later if noisy
// //         console.log("🔍 Header loadUser:", {
// //           hasToken: true,
// //           hasUser: !!parsed,
// //           initial,
// //         });
// //       } catch (err) {
// //         console.error("Header loadUser error:", err);
// //         setIsLoggedIn(false);
// //         setUserInitial("");
// //       }
// //     };

// //     loadUser();

// //     const t1 = setTimeout(loadUser, 100);
// //     const t2 = setTimeout(loadUser, 500);
// //     const t3 = setTimeout(loadUser, 1500);

// //     window.addEventListener("storage", loadUser);
// //     window.addEventListener("userUpdated", loadUser);
// //     window.addEventListener("focus", loadUser);
// //     window.addEventListener("pageshow", loadUser);

// //     return () => {
// //       clearTimeout(t1);
// //       clearTimeout(t2);
// //       clearTimeout(t3);
// //       window.removeEventListener("storage", loadUser);
// //       window.removeEventListener("userUpdated", loadUser);
// //       window.removeEventListener("focus", loadUser);
// //       window.removeEventListener("pageshow", loadUser);
// //     };
// //   }, []);

// //   // 🆕 Re-read session on every route change (belt-and-suspenders)
// //   useEffect(() => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const userData =
// //         localStorage.getItem("user") || localStorage.getItem("userData");

// //       if (!token) {
// //         setIsLoggedIn(false);
// //         setUserInitial("");
// //         return;
// //       }

// //       let parsed = null;
// //       if (userData) {
// //         try {
// //           parsed = JSON.parse(userData);
// //         } catch (e) {
// //           // ignore
// //         }
// //       }

// //       setIsLoggedIn(true);
// //       const initial = extractInitial(parsed, token);
// //       setUserInitial(initial);
// //     } catch (err) {
// //       // ignore
// //     }
// //   }, [location.pathname]);

// //   // 🆕 Fetch categories + build sub-categories map in one shot
// //   useEffect(() => {
// //     const fetchCategories = async () => {
// //       try {
// //         console.log("🔍 Fetching categories from Admin API...");
// //         const response = await axios.get(`${ADMIN_API_URL}/categories`, {
// //           ...getAuthHeaders(),
// //         });

// //         let categoriesData = [];
// //         if (response.data.success && Array.isArray(response.data.categories)) {
// //           categoriesData = response.data.categories;
// //         } else if (Array.isArray(response.data)) {
// //           categoriesData = response.data;
// //         }

// //         const activeCategories = categoriesData.filter(
// //           (cat) => cat.status === "active"
// //         );

// //         console.log(`📂 Found ${activeCategories.length} categories`);

// //         // 🆕 Build sub-categories map directly from category object
// //         const subMap = {};
// //         activeCategories.forEach((cat) => {
// //           if (Array.isArray(cat.subcategories)) {
// //             subMap[cat.name] = cat.subcategories
// //               .filter((sc) => !sc.status || sc.status === "active")
// //               .map((sc) => (typeof sc === "string" ? sc : sc.name))
// //               .filter(Boolean);
// //           } else {
// //             subMap[cat.name] = [];
// //           }
// //         });

// //         console.log("📊 Sub-categories map:");
// //         Object.entries(subMap).forEach(([name, subs]) => {
// //           console.log(`   ${name}: ${subs.length} subs`);
// //         });

// //         setCategories(activeCategories);
// //         setCategorySubCategories(subMap);
// //       } catch (error) {
// //         console.error("Error fetching categories:", error);
// //         const defaultCategories = [
// //           { _id: "1", name: "Organic Food & Healthy Snacks" },
// //           { _id: "2", name: "Beauty & Wellness" },
// //           { _id: "3", name: "Gifts & Hampers" },
// //           { _id: "4", name: "Handmade Home Decor" },
// //           { _id: "5", name: "Sustainable Lifestyle" },
// //           { _id: "6", name: "Jewellery & Accessories" },
// //           { _id: "7", name: "Pet Care" },
// //           { _id: "8", name: "Kids Fashion & Toys" },
// //           { _id: "9", name: "Desk Essentials" },
// //           { _id: "10", name: "Ethnic Fashion" },
// //         ];
// //         setCategories(defaultCategories);
// //       } finally {
// //         setLoadingCategories(false);
// //       }
// //     };
// //     fetchCategories();
// //   }, []);

// //   // 🆕 Fetch sub-categories on hover (fuzzy match + fallback)
// //   const fetchSubCategoriesForCategory = async (categoryName) => {
// //     if (!categoryName) return [];

// //     console.log(`🔍 Fetching subs for: "${categoryName}"`);

// //     // STEP 1: Local data use karo (fuzzy match with trim + lowercase)
// //     const normalizedName = String(categoryName).trim().toLowerCase();

// //     const localCategory = categories.find((cat) => {
// //       const catName = String(cat.name || "").trim().toLowerCase();
// //       return catName === normalizedName;
// //     });

// //     if (localCategory) {
// //       console.log(`✅ Found local category: "${localCategory.name}"`);

// //       if (
// //         Array.isArray(localCategory.subcategories) &&
// //         localCategory.subcategories.length > 0
// //       ) {
// //         const localSubs = localCategory.subcategories
// //           .filter((sc) => !sc.status || sc.status === "active")
// //           .map((sc) => (typeof sc === "string" ? sc : sc.name))
// //           .filter(Boolean);

// //         console.log(`✅ Local subs for "${categoryName}":`, localSubs.length);

// //         setCategorySubCategories((prev) => ({
// //           ...prev,
// //           [categoryName]: localSubs,
// //         }));
// //         return localSubs;
// //       } else {
// //         console.warn(`⚠️ "${categoryName}" has no subcategories field`);
// //       }
// //     } else {
// //       console.warn(`⚠️ Category "${categoryName}" not found in local data`);
// //       console.log(
// //         `   Available:`,
// //         categories.map((c) => c.name)
// //       );
// //     }

// //     // STEP 2: Cache check
// //     if (
// //       categorySubCategories[categoryName] &&
// //       categorySubCategories[categoryName].length > 0
// //     ) {
// //       console.log(`✅ Using cached subs for "${categoryName}"`);
// //       return categorySubCategories[categoryName];
// //     }

// //     // STEP 3: Fallback — VENDOR API
// //     console.log(`🌐 Trying VENDOR API for "${categoryName}"...`);
// //     setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: true }));
// //     try {
// //       const response = await axios.get(
// //         `${VENDOR_API_URL}/categories/${encodeURIComponent(
// //           categoryName
// //         )}/subcategories`,
// //         { ...getAuthHeaders(), timeout: 5000 }
// //       );
// //       console.log(`📦 VENDOR API response:`, response.data);

// //       const subs = parseSubCategories(pickSubsFromResponse(response.data));
// //       console.log(`✅ VENDOR API subs for "${categoryName}":`, subs.length);

// //       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: subs }));
// //       return subs;
// //     } catch (error) {
// //       console.warn(`❌ VENDOR API failed for "${categoryName}":`, error.message);
// //       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: [] }));
// //       return [];
// //     } finally {
// //       setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: false }));
// //     }
// //   };

// //   const handleCategoryHover = (categoryName) => {
// //     if (!categoryName || categoryName === "Category") return;

// //     if (categoryMenuTimeout.current) {
// //       clearTimeout(categoryMenuTimeout.current);
// //     }

// //     setHoveredCategory(categoryName);

// //     // 🆕 Sub-categories already loaded from initial fetch — no need to call API
// //     const existing = categorySubCategories[categoryName];
// //     if (!existing || existing.length === 0) {
// //       fetchSubCategoriesForCategory(categoryName);
// //     }
// //   };

// //   const handleCategoryLeave = () => {
// //     categoryMenuTimeout.current = setTimeout(() => {
// //       setHoveredCategory(null);
// //     }, 300);
// //   };

// //   useEffect(() => {
// //     fetchCart();
// //     fetchWishlist();

// //     const handleCartUpdate = () => fetchCart();
// //     const handleWishlistUpdate = () => fetchWishlist();

// //     window.addEventListener("cartUpdated", handleCartUpdate);
// //     window.addEventListener("wishlistUpdated", handleWishlistUpdate);

// //     return () => {
// //       window.removeEventListener("cartUpdated", handleCartUpdate);
// //       window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
// //       if (categoryMenuTimeout.current) {
// //         clearTimeout(categoryMenuTimeout.current);
// //       }
// //     };
// //   }, [fetchCart, fetchWishlist]);

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (searchRef.current && !searchRef.current.contains(event.target)) {
// //         setShowRecommendations(false);
// //         setShowSearchResults(false);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   const fetchLiveSuggestions = async (query) => {
// //     if (!query || query.trim().length < 2) {
// //       setRecommendations([]);
// //       setShowRecommendations(false);
// //       return;
// //     }
// //     try {
// //       const response = await axios.get(
// //         `https://api.native91.com/api/search-suggestions`,
// //         {
// //           params: { q: query },
// //           timeout: 5000,
// //           ...getAuthHeaders(),
// //         },
// //       );
// //       if (response.data?.products && response.data.products.length > 0) {
// //         setRecommendations(response.data.products.slice(0, 8));
// //         setShowRecommendations(true);
// //       } else {
// //         setRecommendations([]);
// //         setShowRecommendations(false);
// //       }
// //     } catch (error) {
// //       console.error("Live search error:", error);
// //       setRecommendations([]);
// //       setShowRecommendations(false);
// //     }
// //   };

// //   const handleSearchChange = (e) => {
// //     const value = e.target.value;
// //     setSearchQuery(value);
// //     if (searchTimeout.current) clearTimeout(searchTimeout.current);
// //     searchTimeout.current = setTimeout(() => {
// //       if (value.trim().length >= 2) {
// //         fetchLiveSuggestions(value);
// //       } else {
// //         setRecommendations([]);
// //         setSearchResults([]);
// //         setShowRecommendations(false);
// //         setShowSearchResults(false);
// //       }
// //     }, 300);
// //   };

// //   const handleSearch = async (e) => {
// //     e.preventDefault();
// //     if (!searchQuery.trim()) return;
// //     setIsLoading(true);
// //     try {
// //       const response = await axios.get(
// //         `https://api.native91.com/api/products/search`,
// //         {
// //           params: { keyword: searchQuery },
// //           ...getAuthHeaders(),
// //         },
// //       );
// //       setSearchResults(response.data?.products || []);
// //       setShowSearchResults(true);
// //       setShowRecommendations(false);
// //     } catch (error) {
// //       console.error("Search error:", error);
// //       setSearchResults([]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleRecommendationClick = (product) => {
// //     setShowSearch(false);
// //     setShowSearchResults(false);
// //     setShowRecommendations(false);
// //     setSearchQuery("");
// //     setRecommendations([]);
// //     navigate(`/product/${createSlug(product.name)}`);
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (searchTimeout.current) clearTimeout(searchTimeout.current);
// //     };
// //   }, []);

// //   // 🆕 Menu — sub-categories directly from category object
// //   const menu = [
// //     { title: "Home", link: "/" },
// //     { title: "Brands", link: "/product" },
// //     {
// //       title: "Category",
// //       dropdown: categories.map((cat) => {
// //         // 🆕 Direct sub-categories (no lookup needed)
// //         const catSubs = Array.isArray(cat.subcategories)
// //           ? cat.subcategories
// //               .filter((sc) => !sc.status || sc.status === "active")
// //               .map((sc) => (typeof sc === "string" ? sc : sc.name))
// //               .filter(Boolean)
// //           : [];

// //         return {
// //           title: cat.name,
// //           link: `/category/${createSlug(cat.name)}`,
// //           productCount: cat.productCount || 0,
// //           subCategories: catSubs,
// //           loading: loadingSubCategories[cat.name] || false,
// //         };
// //       }),
// //     },
// //     { title: "Social Impact", link: "/social-impact" },
// //     { title: "Sell With Us", link: "/sell" },
// //     { title: "About Us", link: "/aboutus" },
// //   ];

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       setIsScrolled(window.scrollY > 30);
// //     };
// //     handleScroll();
// //     window.addEventListener("scroll", handleScroll);
// //     return () => {
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, []);

// //   const renderUserIcon = () => {
// //     if (isLoggedIn) {
// //       return (
// //         <NavLink to="/orderhistory" className="icon-link" title="My Profile">
// //           <button type="button" className="user-btn">
// //             <span className="user-initial-badge">{userInitial || "U"}</span>
// //           </button>
// //         </NavLink>
// //       );
// //     }
// //     return (
// //       <NavLink to="/login" className="icon-link" title="Login">
// //         <button type="button" className="user-btn">
// //           <HiOutlineUser />
// //         </button>
// //       </NavLink>
// //     );
// //   };

// //   return (
// //     <>
// //       <div className="lexend pe-auto">
// //         <AnimatePresence>
// //           {showSearch && (
// //             <motion.div
// //               className="search-overlay"
// //               initial={{ y: -120 }}
// //               animate={{ y: 0 }}
// //               exit={{ y: -120 }}
// //               transition={{ duration: 0.35 }}
// //             >
// //               <Container>
// //                 <div className="search-box" ref={searchRef}>
// //                   <Form onSubmit={handleSearch} className="w-100 d-flex">
// //                     <Form.Control
// //                       placeholder="Search products..."
// //                       value={searchQuery}
// //                       onChange={handleSearchChange}
// //                       className="flex-grow-1"
// //                       autoFocus
// //                     />
// //                     <Button
// //                       type="submit"
// //                       variant="dark"
// //                       className="ms-2"
// //                       disabled={isLoading}
// //                     >
// //                       {isLoading ? (
// //                         <Spinner animation="border" size="sm" />
// //                       ) : (
// //                         "Search"
// //                       )}
// //                     </Button>
// //                   </Form>

// //                   {showRecommendations && recommendations.length > 0 && (
// //                     <div className="search-recommendations-dropdown">
// //                       <div className="recommendations-header">
// //                         <span>Live Recommendations</span>
// //                         <small>{recommendations.length} products</small>
// //                       </div>
// //                       {recommendations.map((product) => (
// //                         <div
// //                           key={product._id}
// //                           className="search-recommendation-item"
// //                           onClick={() => handleRecommendationClick(product)}
// //                         >
// //                           <div className="recommendation-info">
// //                             <div className="recommendation-name">
// //                               {product.name}
// //                             </div>
// //                             <div className="recommendation-price">
// //                               ₹{product.price}
// //                             </div>
// //                             <div className="recommendation-company">
// //                               {product.company || "Native91"}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}

// //                   <button
// //                     className="close-search"
// //                     onClick={() => {
// //                       setShowSearch(false);
// //                       setShowSearchResults(false);
// //                       setShowRecommendations(false);
// //                       setSearchQuery("");
// //                       setRecommendations([]);
// //                       setSearchResults([]);
// //                     }}
// //                   >
// //                     <FiX />
// //                   </button>
// //                 </div>
// //               </Container>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         <Navbar
// //           expand="lg"
// //           className={`premium-navbar ${isScrolled ? "navbar-scrolled" : ""}`}
// //           sticky="top"
// //         >
// //           <Container>
// //             <Navbar.Brand as={NavLink} to="/">
// //               <img src="/images/native.png" alt="Native91" className="logo" />
// //             </Navbar.Brand>

// //             <Nav className="mx-auto desktop-menu ">
// //               {menu.map((item, index) => (
// //                 <motion.div key={index} whileHover={{ y: -3 }}>
// //                   {item.dropdown ? (
// //                     <Dropdown
// //                       className="premium-dropdown category-dropdown"
// //                       show={hoveredCategory !== null}
// //                       onMouseEnter={() => {
// //                         if (categoryMenuTimeout.current) {
// //                           clearTimeout(categoryMenuTimeout.current);
// //                         }

// //                         if (!hoveredCategory) {
// //                           setHoveredCategory(item.title);
// //                         }
// //                       }}
// //                       onMouseLeave={handleCategoryLeave}
// //                     >
// //                       <Dropdown.Toggle
// //                         as="div"
// //                         className="premium-link dropdown-toggle-custom"
// //                       >
// //                         {item.title}
// //                       </Dropdown.Toggle>

// //                       <Dropdown.Menu className="category-mega-menu">
// //                         {loadingCategories ? (
// //                           <Dropdown.Item className="dropdown-item-custom text-center">
// //                             <span className="dropdown-loading">
// //                               Loading categories...
// //                             </span>
// //                           </Dropdown.Item>
// //                         ) : (
// //                           <div className="category-menu-wrapper">
// //                             <div className="category-list-column">
// //                               {item.dropdown.map((sub, i) => (
// //                                 <div
// //                                   key={i}
// //                                   className={`category-menu-item ${
// //                                     hoveredCategory === sub.title
// //                                       ? "active"
// //                                       : ""
// //                                   }`}
// //                                   onMouseEnter={() =>
// //                                     handleCategoryHover(sub.title)
// //                                   }
// //                                 >
// //                                   <NavLink
// //                                     to={sub.link}
// //                                     className="dropdown-item-custom category-link"
// //                                     onClick={() => setShowMenu(false)}
// //                                   >
// //                                     {sub.title}
// //                                     {sub.subCategories &&
// //                                       sub.subCategories.length > 0 && (
// //                                         <span className="sub-category-arrow ms-1">
// //                                           ›
// //                                         </span>
// //                                       )}
// //                                   </NavLink>
// //                                 </div>
// //                               ))}
// //                             </div>

// //                             {hoveredCategory && (
// //                               <div className="subcategory-list-column">
// //                                 <div className="subcategory-header">
// //                                   <span className="subcategory-title">
// //                                     {hoveredCategory}
// //                                   </span>
// //                                   <span className="subcategory-count">
// //                                     {categorySubCategories[hoveredCategory]
// //                                       ?.length || 0}{" "}
// //                                     sub-categories
// //                                   </span>
// //                                 </div>
// //                                 <div className="subcategory-grid">
// //                                   {categorySubCategories[hoveredCategory]
// //                                     ?.length > 0 ? (
// //                                     categorySubCategories[hoveredCategory].map(
// //                                       (sub, idx) => (
// //                                         <NavLink
// //                                           key={idx}
// //                                           to={`/category/${createSlug(
// //                                             hoveredCategory
// //                                           )}/${createSlug(sub)}`}
// //                                           className="subcategory-item"
// //                                           onClick={() => setShowMenu(false)}
// //                                         >
// //                                           <span className="subcategory-dot">
// //                                             •
// //                                           </span>
// //                                           {sub}
// //                                         </NavLink>
// //                                       )
// //                                     )
// //                                   ) : (
// //                                     <div className="subcategory-empty">
// //                                       No sub-categories available
// //                                     </div>
// //                                   )}
// //                                 </div>
// //                                 <div className="subcategory-footer">
// //                                   <NavLink
// //                                     to={`/category/${createSlug(
// //                                       hoveredCategory
// //                                     )}`}
// //                                     className="view-all-subcategories"
// //                                     onClick={() => setShowMenu(false)}
// //                                   >
// //                                     View All Products in {hoveredCategory} →
// //                                   </NavLink>
// //                                 </div>
// //                               </div>
// //                             )}
// //                           </div>
// //                         )}
// //                       </Dropdown.Menu>
// //                     </Dropdown>
// //                   ) : (
// //                     <NavLink to={item.link} className="nav-link premium-link">
// //                       {item.title}
// //                     </NavLink>
// //                   )}
// //                 </motion.div>
// //               ))}
// //             </Nav>

// //             {/* ✅ DESKTOP ICONS */}
// //             <div className="desktop-icons">
// //               <button onClick={() => setShowSearch(true)}>
// //                 <HiOutlineSearch />
// //               </button>

// //               {renderUserIcon()}

// //               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
// //                 <button type="button" className="cart-btn-with-badge">
// //                   <HiOutlineHeart className="cart-icon" />
// //                   {wishlistCount > 0 && (
// //                     <span className="cart-badge wishlist-badge">
// //                       {wishlistCount > 99 ? "99+" : wishlistCount}
// //                     </span>
// //                   )}
// //                 </button>
// //               </NavLink>

// //               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
// //                 <button type="button" className="cart-btn-with-badge">
// //                   <FiShoppingBag className="cart-icon" />
// //                   {cartCount > 0 && (
// //                     <span className="cart-badge">
// //                       {cartCount > 99 ? "99+" : cartCount}
// //                     </span>
// //                   )}
// //                 </button>
// //               </NavLink>
// //             </div>

// //             {/* ✅ MOBILE ICONS */}
// //             <div className="mobile-right">
// //               <button onClick={() => setShowSearch(true)}>
// //                 <HiOutlineSearch />
// //               </button>

// //               {renderUserIcon()}

// //               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
// //                 <button type="button" className="cart-btn-with-badge">
// //                   <HiOutlineHeart className="cart-icon" />
// //                   {wishlistCount > 0 && (
// //                     <span className="cart-badge wishlist-badge">
// //                       {wishlistCount > 99 ? "99+" : wishlistCount}
// //                     </span>
// //                   )}
// //                 </button>
// //               </NavLink>

// //               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
// //                 <button type="button" className="cart-btn-with-badge">
// //                   <FiShoppingBag className="cart-icon" />
// //                   {cartCount > 0 && (
// //                     <span className="cart-badge">
// //                       {cartCount > 99 ? "99+" : cartCount}
// //                     </span>
// //                   )}
// //                 </button>
// //               </NavLink>

// //               <button onClick={() => setShowMenu(true)}>
// //                 <HiOutlineMenuAlt3 />
// //               </button>
// //             </div>
// //           </Container>
// //         </Navbar>

// //         <Offcanvas
// //           show={showMenu}
// //           placement="end"
// //           onHide={() => setShowMenu(false)}
// //         >
// //           <Offcanvas.Header closeButton>
// //             <Offcanvas.Title>
// //               <img
// //                 src="/images/native.png"
// //                 className="mobile-logo"
// //                 alt="Native91"
// //               />
// //             </Offcanvas.Title>
// //           </Offcanvas.Header>

// //           <Offcanvas.Body>
// //             <div className="offcanvas-user-row mb-3">
// //               {isLoggedIn ? (
// //                 <NavLink
// //                   to="/orderhistory"
// //                   className="mobile-link d-flex align-items-center gap-2"
// //                   onClick={() => setShowMenu(false)}
// //                 >
// //                   <span className="user-initial-badge">
// //                     {userInitial || "U"}
// //                   </span>
// //                   <span>My Profile</span>
// //                 </NavLink>
// //               ) : (
// //                 <NavLink
// //                   to="/login"
// //                   className="mobile-link d-flex align-items-center gap-2"
// //                   onClick={() => setShowMenu(false)}
// //                 >
// //                   <HiOutlineUser />
// //                   <span>Login</span>
// //                 </NavLink>
// //               )}
// //             </div>

// //             <Nav className="flex-column lexend">
// //               {menu.map((item, index) => (
// //                 <div key={index}>
// //                   {item.dropdown ? (
// //                     <>
// //                       <div className="mobile-link">{item.title}</div>
// //                       {item.dropdown.map((sub, i) => (
// //                         <div key={i}>
// //                           <NavLink
// //                             to={sub.link}
// //                             className="mobile-sublink"
// //                             onClick={() => setShowMenu(false)}
// //                           >
// //                             {sub.title}
// //                           </NavLink>
// //                           {sub.subCategories &&
// //                             sub.subCategories.length > 0 && (
// //                               <div className="mobile-sub-subcategories">
// //                                 {sub.subCategories.map((subCat, idx) => (
// //                                   <NavLink
// //                                     key={idx}
// //                                     to={`/category/${createSlug(
// //                                       sub.title
// //                                     )}/${createSlug(subCat)}`}
// //                                     className="mobile-sub-sublink"
// //                                     onClick={() => setShowMenu(false)}
// //                                   >
// //                                     • {subCat}
// //                                   </NavLink>
// //                                 ))}
// //                               </div>
// //                             )}
// //                         </div>
// //                       ))}
// //                     </>
// //                   ) : (
// //                     <NavLink
// //                       to={item.link}
// //                       className="mobile-link"
// //                       onClick={() => setShowMenu(false)}
// //                     >
// //                       {item.title}
// //                     </NavLink>
// //                   )}
// //                 </div>
// //               ))}
// //             </Nav>
// //           </Offcanvas.Body>
// //         </Offcanvas>
// //       </div>
// //     </>
// //   );
// // };

// // export default Header;


// import { useState, useEffect, useRef } from "react";
// import {
//   Navbar,
//   Container,
//   Nav,
//   Offcanvas,
//   Form,
//   Button,
//   Dropdown,
//   Spinner,
// } from "react-bootstrap";
// import {
//   HiOutlineHeart,
//   HiOutlineMenuAlt3,
//   HiOutlineSearch,
//   HiOutlineUser,
// } from "react-icons/hi";
// import { FiShoppingBag, FiX, FiLogOut } from "react-icons/fi";
// import { motion, AnimatePresence } from "framer-motion";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { useCart } from "../../context/CartContext";
// import { useWishlist } from "../../context/WishlistContext";
// import { createSlug } from "../../utils/slugUtils";
// import "./header.css";

// // ✅ API URLs
// const VENDOR_API_URL = "https://api-vendor.native91.com/api";
// const ADMIN_API_URL = "https://api-admin.native91.com/api/category";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     headers: { Authorization: `Bearer ${token}` },
//   };
// };

// // 🆕 Parse sub-categories
// const parseSubCategories = (input, depth = 0) => {
//   if (!input || depth > 10) return [];

//   if (Array.isArray(input)) {
//     const out = [];
//     input.forEach((item) => {
//       const parsed = parseSubCategories(item, depth + 1);
//       parsed.forEach((p) => {
//         if (p && !out.includes(p)) out.push(p);
//       });
//     });
//     return out;
//   }

//   if (typeof input === "object" && input !== null) {
//     if (input.status === "inactive") return [];
//     if (typeof input.name === "string") {
//       return parseSubCategories(input.name, depth + 1);
//     }
//     return [];
//   }

//   if (typeof input === "string") {
//     let s = input.trim();
//     if (!s) return [];

//     if (
//       (s.startsWith("[") && s.endsWith("]")) ||
//       (s.startsWith("{") && s.endsWith("}")) ||
//       (s.startsWith('"') && s.endsWith('"'))
//     ) {
//       try {
//         const parsed = JSON.parse(s);
//         const result = parseSubCategories(parsed, depth + 1);
//         if (result.length > 0) return result;
//       } catch {}
//     }

//     let cleaned = s;
//     let prev = null;
//     while (cleaned !== prev) {
//       prev = cleaned;
//       cleaned = cleaned
//         .replace(/^[\[\]\\"]+/, "")
//         .replace(/[\[\]\\"]+$/, "")
//         .trim();
//     }

//     if (cleaned.length === 0 || cleaned.length > 200) return [];

//     if (cleaned.includes(",") && !cleaned.includes(" & ")) {
//       const parts = cleaned
//         .split(",")
//         .map((p) => p.replace(/^[\[\]\\"]+|[\[\]\\"]+$/g, "").trim())
//         .filter((p) => p.length > 0 && p.length < 100);
//       if (parts.length > 1) return parts;
//     }

//     return [cleaned];
//   }

//   return [];
// };

// const pickSubsFromResponse = (data) => {
//   if (!data) return [];
//   return (
//     data.subCategories ||
//     data.subcategories ||
//     data.sub_categories ||
//     data.subCategoryList ||
//     []
//   );
// };

// // 🆕 Decode JWT token
// const decodeJWT = (token) => {
//   try {
//     if (!token || typeof token !== "string") return null;
//     const parts = token.split(".");
//     if (parts.length !== 3) return null;

//     const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//     const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
//     return JSON.parse(atob(padded));
//   } catch (err) {
//     console.warn("JWT decode failed:", err);
//     return null;
//   }
// };

// // 🆕 Extract first letter from user object OR JWT
// const extractInitial = (userObj, token = null) => {
//   if (userObj && typeof userObj === "object") {
//     const candidates = [
//       userObj.email,
//       userObj.userEmail,
//       userObj.emailId,
//       userObj.mail,
//       userObj.username,
//       userObj.userName,
//       userObj.phone,
//       userObj.mobile,
//       userObj.name,
//       userObj.fullName,
//       userObj.firstName,
//       userObj.given_name,
//     ];

//     for (const val of candidates) {
//       if (val && typeof val === "string" && val.trim().length > 0) {
//         const ch = val.trim().charAt(0);
//         if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
//       }
//     }
//   }

//   if (token) {
//     const decoded = decodeJWT(token);
//     if (decoded) {
//       const jwtCandidates = [
//         decoded.email,
//         decoded.userEmail,
//         decoded.username,
//         decoded.name,
//         decoded.given_name,
//         decoded.sub,
//       ];

//       for (const val of jwtCandidates) {
//         if (val && typeof val === "string" && val.trim().length > 0) {
//           const ch = val.trim().charAt(0);
//           if (/[a-zA-Z0-9]/.test(ch)) return ch.toUpperCase();
//         }
//       }
//     }
//   }

//   return "U";
// };

// const Header = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const [recommendations, setRecommendations] = useState([]);
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hoveredCategory, setHoveredCategory] = useState(null);
//   const [categorySubCategories, setCategorySubCategories] = useState({});
//   const [loadingSubCategories, setLoadingSubCategories] = useState({});

//   // 🆕 Login state
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userInitial, setUserInitial] = useState("");
//   const [userName, setUserName] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [loggingOut, setLoggingOut] = useState(false);

//   const searchTimeout = useRef(null);
//   const searchRef = useRef(null);
//   const categoryMenuTimeout = useRef(null);

//   const { cartCount, fetchCart } = useCart();
//   const { wishlistCount, fetchWishlist } = useWishlist();

//   // 🆕 Track login state
//   useEffect(() => {
//     const loadUser = () => {
//       try {
//         const token = localStorage.getItem("token");
//         const userData =
//           localStorage.getItem("user") || localStorage.getItem("userData");

//         if (!token) {
//           setIsLoggedIn(false);
//           setUserInitial("");
//           setUserName("");
//           setUserEmail("");
//           return;
//         }

//         let parsed = null;
//         if (userData) {
//           try {
//             parsed = JSON.parse(userData);
//           } catch (e) {
//             console.warn("User data parse failed:", e);
//           }
//         }

//         setIsLoggedIn(true);
//         const initial = extractInitial(parsed, token);
//         setUserInitial(initial);
//         setUserName(parsed?.name || parsed?.fullName || "");
//         setUserEmail(parsed?.email || "");

//         console.log("🔍 Header loadUser:", {
//           hasToken: true,
//           hasUser: !!parsed,
//           initial,
//           name: parsed?.name,
//         });
//       } catch (err) {
//         console.error("Header loadUser error:", err);
//         setIsLoggedIn(false);
//         setUserInitial("");
//         setUserName("");
//         setUserEmail("");
//       }
//     };

//     loadUser();

//     const t1 = setTimeout(loadUser, 100);
//     const t2 = setTimeout(loadUser, 500);
//     const t3 = setTimeout(loadUser, 1500);

//     window.addEventListener("storage", loadUser);
//     window.addEventListener("userUpdated", loadUser);
//     window.addEventListener("focus", loadUser);
//     window.addEventListener("pageshow", loadUser);

//     return () => {
//       clearTimeout(t1);
//       clearTimeout(t2);
//       clearTimeout(t3);
//       window.removeEventListener("storage", loadUser);
//       window.removeEventListener("userUpdated", loadUser);
//       window.removeEventListener("focus", loadUser);
//       window.removeEventListener("pageshow", loadUser);
//     };
//   }, []);

//   // 🆕 Re-read session on route change
//   useEffect(() => {
//     try {
//       const token = localStorage.getItem("token");
//       const userData =
//         localStorage.getItem("user") || localStorage.getItem("userData");

//       if (!token) {
//         setIsLoggedIn(false);
//         setUserInitial("");
//         setUserName("");
//         setUserEmail("");
//         return;
//       }

//       let parsed = null;
//       if (userData) {
//         try {
//           parsed = JSON.parse(userData);
//         } catch (e) {
//           // ignore
//         }
//       }

//       setIsLoggedIn(true);
//       const initial = extractInitial(parsed, token);
//       setUserInitial(initial);
//       setUserName(parsed?.name || parsed?.fullName || "");
//       setUserEmail(parsed?.email || "");
//     } catch (err) {
//       // ignore
//     }
//   }, [location.pathname]);

//   // 🆕 LOGOUT HANDLER
//   const handleLogout = async () => {
//     if (loggingOut) return;
//     if (!window.confirm("Are you sure you want to logout?")) return;

//     setLoggingOut(true);

//     try {
//       const token = localStorage.getItem("token");

//       // Try to notify backend (best effort — don't block logout)
//       if (token) {
//         try {
//           await axios.post(
//             `${process.env.REACT_APP_API_URL}/auth/logout`,
//             {},
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//         } catch (apiErr) {
//           console.warn("Backend logout failed (continuing anyway):", apiErr);
//         }
//       }
//     } catch (err) {
//       console.warn("Logout API error:", err);
//     } finally {
//       // Always clear local state regardless of API result
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("userData");
//       localStorage.removeItem("appliedCoupon");
//       localStorage.removeItem("discountedPrice");
//       localStorage.removeItem("appliedProductId");

//       // Update UI
//       setIsLoggedIn(false);
//       setUserInitial("");
//       setUserName("");
//       setUserEmail("");

//       // Notify listeners
//       window.dispatchEvent(new Event("userUpdated"));
//       window.dispatchEvent(new Event("cartUpdated"));
//       window.dispatchEvent(new Event("wishlistUpdated"));

//       setLoggingOut(false);

//       // Redirect to home
//       navigate("/", { replace: true });

//       // Optional toast
//       setTimeout(() => alert("Logged out successfully"), 100);
//     }
//   };

//   // 🆕 Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         console.log("🔍 Fetching categories from Admin API...");
//         const response = await axios.get(`${ADMIN_API_URL}/categories`, {
//           ...getAuthHeaders(),
//         });

//         let categoriesData = [];
//         if (response.data.success && Array.isArray(response.data.categories)) {
//           categoriesData = response.data.categories;
//         } else if (Array.isArray(response.data)) {
//           categoriesData = response.data;
//         }

//         const activeCategories = categoriesData.filter(
//           (cat) => cat.status === "active"
//         );

//         console.log(`📂 Found ${activeCategories.length} categories`);

//         const subMap = {};
//         activeCategories.forEach((cat) => {
//           if (Array.isArray(cat.subcategories)) {
//             subMap[cat.name] = cat.subcategories
//               .filter((sc) => !sc.status || sc.status === "active")
//               .map((sc) => (typeof sc === "string" ? sc : sc.name))
//               .filter(Boolean);
//           } else {
//             subMap[cat.name] = [];
//           }
//         });

//         setCategories(activeCategories);
//         setCategorySubCategories(subMap);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//         const defaultCategories = [
//           { _id: "1", name: "Organic Food & Healthy Snacks" },
//           { _id: "2", name: "Beauty & Wellness" },
//           { _id: "3", name: "Gifts & Hampers" },
//           { _id: "4", name: "Handmade Home Decor" },
//           { _id: "5", name: "Sustainable Lifestyle" },
//           { _id: "6", name: "Jewellery & Accessories" },
//           { _id: "7", name: "Pet Care" },
//           { _id: "8", name: "Kids Fashion & Toys" },
//           { _id: "9", name: "Desk Essentials" },
//           { _id: "10", name: "Ethnic Fashion" },
//         ];
//         setCategories(defaultCategories);
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // 🆕 Fetch sub-categories on hover
//   const fetchSubCategoriesForCategory = async (categoryName) => {
//     if (!categoryName) return [];

//     const normalizedName = String(categoryName).trim().toLowerCase();

//     const localCategory = categories.find((cat) => {
//       const catName = String(cat.name || "").trim().toLowerCase();
//       return catName === normalizedName;
//     });

//     if (localCategory) {
//       if (
//         Array.isArray(localCategory.subcategories) &&
//         localCategory.subcategories.length > 0
//       ) {
//         const localSubs = localCategory.subcategories
//           .filter((sc) => !sc.status || sc.status === "active")
//           .map((sc) => (typeof sc === "string" ? sc : sc.name))
//           .filter(Boolean);

//         setCategorySubCategories((prev) => ({
//           ...prev,
//           [categoryName]: localSubs,
//         }));
//         return localSubs;
//       }
//     }

//     if (
//       categorySubCategories[categoryName] &&
//       categorySubCategories[categoryName].length > 0
//     ) {
//       return categorySubCategories[categoryName];
//     }

//     setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: true }));
//     try {
//       const response = await axios.get(
//         `${VENDOR_API_URL}/categories/${encodeURIComponent(
//           categoryName
//         )}/subcategories`,
//         { ...getAuthHeaders(), timeout: 5000 }
//       );

//       const subs = parseSubCategories(pickSubsFromResponse(response.data));
//       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: subs }));
//       return subs;
//     } catch (error) {
//       console.warn(`❌ VENDOR API failed for "${categoryName}":`, error.message);
//       setCategorySubCategories((prev) => ({ ...prev, [categoryName]: [] }));
//       return [];
//     } finally {
//       setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: false }));
//     }
//   };

//   const handleCategoryHover = (categoryName) => {
//     if (!categoryName || categoryName === "Category") return;

//     if (categoryMenuTimeout.current) {
//       clearTimeout(categoryMenuTimeout.current);
//     }

//     setHoveredCategory(categoryName);

//     const existing = categorySubCategories[categoryName];
//     if (!existing || existing.length === 0) {
//       fetchSubCategoriesForCategory(categoryName);
//     }
//   };

//   const handleCategoryLeave = () => {
//     categoryMenuTimeout.current = setTimeout(() => {
//       setHoveredCategory(null);
//     }, 300);
//   };

//   useEffect(() => {
//     fetchCart();
//     fetchWishlist();

//     const handleCartUpdate = () => fetchCart();
//     const handleWishlistUpdate = () => fetchWishlist();

//     window.addEventListener("cartUpdated", handleCartUpdate);
//     window.addEventListener("wishlistUpdated", handleWishlistUpdate);

//     return () => {
//       window.removeEventListener("cartUpdated", handleCartUpdate);
//       window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
//       if (categoryMenuTimeout.current) {
//         clearTimeout(categoryMenuTimeout.current);
//       }
//     };
//   }, [fetchCart, fetchWishlist]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setShowRecommendations(false);
//         setShowSearchResults(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchLiveSuggestions = async (query) => {
//     if (!query || query.trim().length < 2) {
//       setRecommendations([]);
//       setShowRecommendations(false);
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `https://api.native91.com/api/search-suggestions`,
//         {
//           params: { q: query },
//           timeout: 5000,
//           ...getAuthHeaders(),
//         }
//       );
//       if (response.data?.products && response.data.products.length > 0) {
//         setRecommendations(response.data.products.slice(0, 8));
//         setShowRecommendations(true);
//       } else {
//         setRecommendations([]);
//         setShowRecommendations(false);
//       }
//     } catch (error) {
//       console.error("Live search error:", error);
//       setRecommendations([]);
//       setShowRecommendations(false);
//     }
//   };

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);
//     if (searchTimeout.current) clearTimeout(searchTimeout.current);
//     searchTimeout.current = setTimeout(() => {
//       if (value.trim().length >= 2) {
//         fetchLiveSuggestions(value);
//       } else {
//         setRecommendations([]);
//         setSearchResults([]);
//         setShowRecommendations(false);
//         setShowSearchResults(false);
//       }
//     }, 300);
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `https://api.native91.com/api/products/search`,
//         {
//           params: { keyword: searchQuery },
//           ...getAuthHeaders(),
//         }
//       );
//       setSearchResults(response.data?.products || []);
//       setShowSearchResults(true);
//       setShowRecommendations(false);
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchResults([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRecommendationClick = (product) => {
//     setShowSearch(false);
//     setShowSearchResults(false);
//     setShowRecommendations(false);
//     setSearchQuery("");
//     setRecommendations([]);
//     navigate(`/product/${createSlug(product.name)}`);
//   };

//   useEffect(() => {
//     return () => {
//       if (searchTimeout.current) clearTimeout(searchTimeout.current);
//     };
//   }, []);

//   const menu = [
//     { title: "Home", link: "/" },
//     { title: "Brands", link: "/product" },
//     {
//       title: "Category",
//       dropdown: categories.map((cat) => {
//         const catSubs = Array.isArray(cat.subcategories)
//           ? cat.subcategories
//               .filter((sc) => !sc.status || sc.status === "active")
//               .map((sc) => (typeof sc === "string" ? sc : sc.name))
//               .filter(Boolean)
//           : [];

//         return {
//           title: cat.name,
//           link: `/category/${createSlug(cat.name)}`,
//           productCount: cat.productCount || 0,
//           subCategories: catSubs,
//           loading: loadingSubCategories[cat.name] || false,
//         };
//       }),
//     },
//     { title: "Social Impact", link: "/social-impact" },
//     { title: "Sell With Us", link: "/sell" },
//     { title: "About Us", link: "/aboutus" },
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 30);
//     };
//     handleScroll();
//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   // 🆕 UPDATED: User icon with dropdown (Profile + Logout)
//   const renderUserIcon = () => {
//     if (isLoggedIn) {
//       return (
//         <Dropdown align="end" className="user-dropdown">
//           <Dropdown.Toggle
//             as="button"
//             type="button"
//             className="user-btn dropdown-toggle-no-caret"
//             title="My Account"
//             bsPrefix="user-btn-wrapper"
//             style={{
//               background: "transparent",
//               border: "none",
//               padding: 0,
//               cursor: "pointer",
//             }}
//           >
//             <span className="user-initial-badge">{userInitial || "U"}</span>
//           </Dropdown.Toggle>

//           <Dropdown.Menu
//             className="user-dropdown-menu"
//             style={{
//               minWidth: "220px",
//               padding: "8px",
//               borderRadius: "10px",
//               boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
//               border: "1px solid #eee",
//               marginTop: "8px",
//             }}
//           >
//             {/* Header section */}
//             <div
//               className="user-info-header"
//               style={{
//                 padding: "10px 12px",
//                 borderBottom: "1px solid #eee",
//                 marginBottom: "6px",
//               }}
//             >
//               <div
//                 style={{
//                   fontWeight: "600",
//                   fontSize: "14px",
//                   color: "#0D3B2E",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 {userName || "User"}
//               </div>
//               {userEmail && (
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: "#888",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {userEmail}
//                 </div>
//               )}
//             </div>

//             {/* My Profile */}
//             <Dropdown.Item
//               onClick={() => navigate("/orderhistory")}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "9px 12px",
//                 borderRadius: "6px",
//                 fontSize: "14px",
//               }}
//             >
//               <HiOutlineUser style={{ fontSize: "16px" }} />
//               <span>My Profile</span>
//             </Dropdown.Item>

//             {/* My Orders shortcut */}
//             <Dropdown.Item
//               onClick={() => navigate("/orderhistory")}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "9px 12px",
//                 borderRadius: "6px",
//                 fontSize: "14px",
//               }}
//             >
//               <FiShoppingBag style={{ fontSize: "16px" }} />
//               <span>My Orders</span>
//             </Dropdown.Item>

//             <Dropdown.Divider style={{ margin: "6px 0" }} />

//             {/* Logout */}
//             <Dropdown.Item
//               onClick={handleLogout}
//               disabled={loggingOut}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "9px 12px",
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 color: "#dc3545",
//                 fontWeight: "500",
//               }}
//             >
//               {loggingOut ? (
//                 <>
//                   <Spinner animation="border" size="sm" />
//                   <span>Logging out...</span>
//                 </>
//               ) : (
//                 <>
//                   <FiLogOut style={{ fontSize: "16px" }} />
//                   <span>Logout</span>
//                 </>
//               )}
//             </Dropdown.Item>
//           </Dropdown.Menu>
//         </Dropdown>
//       );
//     }
//     return (
//       <NavLink to="/login" className="icon-link" title="Login">
//         <button type="button" className="user-btn">
//           <HiOutlineUser />
//         </button>
//       </NavLink>
//     );
//   };

//   return (
//     <>
//       <div className="lexend pe-auto">
//         <AnimatePresence>
//           {showSearch && (
//             <motion.div
//               className="search-overlay"
//               initial={{ y: -120 }}
//               animate={{ y: 0 }}
//               exit={{ y: -120 }}
//               transition={{ duration: 0.35 }}
//             >
//               <Container>
//                 <div className="search-box" ref={searchRef}>
//                   <Form onSubmit={handleSearch} className="w-100 d-flex">
//                     <Form.Control
//                       placeholder="Search products..."
//                       value={searchQuery}
//                       onChange={handleSearchChange}
//                       className="flex-grow-1"
//                       autoFocus
//                     />
//                     <Button
//                       type="submit"
//                       variant="dark"
//                       className="ms-2"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? (
//                         <Spinner animation="border" size="sm" />
//                       ) : (
//                         "Search"
//                       )}
//                     </Button>
//                   </Form>

//                   {showRecommendations && recommendations.length > 0 && (
//                     <div className="search-recommendations-dropdown">
//                       <div className="recommendations-header">
//                         <span>Live Recommendations</span>
//                         <small>{recommendations.length} products</small>
//                       </div>
//                       {recommendations.map((product) => (
//                         <div
//                           key={product._id}
//                           className="search-recommendation-item"
//                           onClick={() => handleRecommendationClick(product)}
//                         >
//                           <div className="recommendation-info">
//                             <div className="recommendation-name">
//                               {product.name}
//                             </div>
//                             <div className="recommendation-price">
//                               ₹{product.price}
//                             </div>
//                             <div className="recommendation-company">
//                               {product.company || "Native91"}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <button
//                     className="close-search"
//                     onClick={() => {
//                       setShowSearch(false);
//                       setShowSearchResults(false);
//                       setShowRecommendations(false);
//                       setSearchQuery("");
//                       setRecommendations([]);
//                       setSearchResults([]);
//                     }}
//                   >
//                     <FiX />
//                   </button>
//                 </div>
//               </Container>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <Navbar
//           expand="lg"
//           className={`premium-navbar ${isScrolled ? "navbar-scrolled" : ""}`}
//           sticky="top"
//         >
//           <Container>
//             <Navbar.Brand as={NavLink} to="/">
//               <img src="/images/native.png" alt="Native91" className="logo" />
//             </Navbar.Brand>

//             <Nav className="mx-auto desktop-menu ">
//               {menu.map((item, index) => (
//                 <motion.div key={index} whileHover={{ y: -3 }}>
//                   {item.dropdown ? (
//                     <Dropdown
//                       className="premium-dropdown category-dropdown"
//                       show={hoveredCategory !== null}
//                       onMouseEnter={() => {
//                         if (categoryMenuTimeout.current) {
//                           clearTimeout(categoryMenuTimeout.current);
//                         }

//                         if (!hoveredCategory) {
//                           setHoveredCategory(item.title);
//                         }
//                       }}
//                       onMouseLeave={handleCategoryLeave}
//                     >
//                       <Dropdown.Toggle
//                         as="div"
//                         className="premium-link dropdown-toggle-custom"
//                       >
//                         {item.title}
//                       </Dropdown.Toggle>

//                       <Dropdown.Menu className="category-mega-menu">
//                         {loadingCategories ? (
//                           <Dropdown.Item className="dropdown-item-custom text-center">
//                             <span className="dropdown-loading">
//                               Loading categories...
//                             </span>
//                           </Dropdown.Item>
//                         ) : (
//                           <div className="category-menu-wrapper">
//                             <div className="category-list-column">
//                               {item.dropdown.map((sub, i) => (
//                                 <div
//                                   key={i}
//                                   className={`category-menu-item ${
//                                     hoveredCategory === sub.title
//                                       ? "active"
//                                       : ""
//                                   }`}
//                                   onMouseEnter={() =>
//                                     handleCategoryHover(sub.title)
//                                   }
//                                 >
//                                   <NavLink
//                                     to={sub.link}
//                                     className="dropdown-item-custom category-link"
//                                     onClick={() => setShowMenu(false)}
//                                   >
//                                     {sub.title}
//                                     {sub.subCategories &&
//                                       sub.subCategories.length > 0 && (
//                                         <span className="sub-category-arrow ms-1">
//                                           ›
//                                         </span>
//                                       )}
//                                   </NavLink>
//                                 </div>
//                               ))}
//                             </div>

//                             {hoveredCategory && (
//                               <div className="subcategory-list-column">
//                                 <div className="subcategory-header">
//                                   <span className="subcategory-title">
//                                     {hoveredCategory}
//                                   </span>
//                                   <span className="subcategory-count">
//                                     {categorySubCategories[hoveredCategory]
//                                       ?.length || 0}{" "}
//                                     sub-categories
//                                   </span>
//                                 </div>
//                                 <div className="subcategory-grid">
//                                   {categorySubCategories[hoveredCategory]
//                                     ?.length > 0 ? (
//                                     categorySubCategories[hoveredCategory].map(
//                                       (sub, idx) => (
//                                         <NavLink
//                                           key={idx}
//                                           to={`/category/${createSlug(
//                                             hoveredCategory
//                                           )}/${createSlug(sub)}`}
//                                           className="subcategory-item"
//                                           onClick={() => setShowMenu(false)}
//                                         >
//                                           <span className="subcategory-dot">
//                                             •
//                                           </span>
//                                           {sub}
//                                         </NavLink>
//                                       )
//                                     )
//                                   ) : (
//                                     <div className="subcategory-empty">
//                                       No sub-categories available
//                                     </div>
//                                   )}
//                                 </div>
//                                 <div className="subcategory-footer">
//                                   <NavLink
//                                     to={`/category/${createSlug(
//                                       hoveredCategory
//                                     )}`}
//                                     className="view-all-subcategories"
//                                     onClick={() => setShowMenu(false)}
//                                   >
//                                     View All Products in {hoveredCategory} →
//                                   </NavLink>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </Dropdown.Menu>
//                     </Dropdown>
//                   ) : (
//                     <NavLink to={item.link} className="nav-link premium-link">
//                       {item.title}
//                     </NavLink>
//                   )}
//                 </motion.div>
//               ))}
//             </Nav>

//             {/* ✅ DESKTOP ICONS */}
//             <div className="desktop-icons">
//               <button onClick={() => setShowSearch(true)}>
//                 <HiOutlineSearch />
//               </button>

//               {renderUserIcon()}

//               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
//                 <button type="button" className="cart-btn-with-badge">
//                   <HiOutlineHeart className="cart-icon" />
//                   {wishlistCount > 0 && (
//                     <span className="cart-badge wishlist-badge">
//                       {wishlistCount > 99 ? "99+" : wishlistCount}
//                     </span>
//                   )}
//                 </button>
//               </NavLink>

//               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
//                 <button type="button" className="cart-btn-with-badge">
//                   <FiShoppingBag className="cart-icon" />
//                   {cartCount > 0 && (
//                     <span className="cart-badge">
//                       {cartCount > 99 ? "99+" : cartCount}
//                     </span>
//                   )}
//                 </button>
//               </NavLink>
//             </div>

//             {/* ✅ MOBILE ICONS */}
//             <div className="mobile-right">
//               <button onClick={() => setShowSearch(true)}>
//                 <HiOutlineSearch />
//               </button>

//               {renderUserIcon()}

//               <NavLink to="/wishlist" className="icon-link cart-icon-wrapper">
//                 <button type="button" className="cart-btn-with-badge">
//                   <HiOutlineHeart className="cart-icon" />
//                   {wishlistCount > 0 && (
//                     <span className="cart-badge wishlist-badge">
//                       {wishlistCount > 99 ? "99+" : wishlistCount}
//                     </span>
//                   )}
//                 </button>
//               </NavLink>

//               <NavLink to="/cart" className="icon-link cart-icon-wrapper">
//                 <button type="button" className="cart-btn-with-badge">
//                   <FiShoppingBag className="cart-icon" />
//                   {cartCount > 0 && (
//                     <span className="cart-badge">
//                       {cartCount > 99 ? "99+" : cartCount}
//                     </span>
//                   )}
//                 </button>
//               </NavLink>

//               <button onClick={() => setShowMenu(true)}>
//                 <HiOutlineMenuAlt3 />
//               </button>
//             </div>
//           </Container>
//         </Navbar>

//         <Offcanvas
//           show={showMenu}
//           placement="end"
//           onHide={() => setShowMenu(false)}
//         >
//           <Offcanvas.Header closeButton>
//             <Offcanvas.Title>
//               <img
//                 src="/images/native.png"
//                 className="mobile-logo"
//                 alt="Native91"
//               />
//             </Offcanvas.Title>
//           </Offcanvas.Header>

//           <Offcanvas.Body>
//             {/* 🆕 Mobile user info row */}
//             <div className="offcanvas-user-row mb-3">
//               {isLoggedIn ? (
//                 <>
//                   <NavLink
//                     to="/orderhistory"
//                     className="mobile-link d-flex align-items-center gap-2"
//                     onClick={() => setShowMenu(false)}
//                   >
//                     <span className="user-initial-badge">
//                       {userInitial || "U"}
//                     </span>
//                     <div className="d-flex flex-column">
//                       <span style={{ fontWeight: 600 }}>
//                         {userName || "My Profile"}
//                       </span>
//                       {userEmail && (
//                         <small style={{ fontSize: "11px", color: "#888" }}>
//                           {userEmail}
//                         </small>
//                       )}
//                     </div>
//                   </NavLink>

//                   {/* 🆕 Mobile Logout Button */}
//                   <button
//                     type="button"
//                     className="mobile-logout-btn d-flex align-items-center gap-2 mt-3"
//                     onClick={() => {
//                       setShowMenu(false);
//                       handleLogout();
//                     }}
//                     disabled={loggingOut}
//                     style={{
//                       background: "#fff5f5",
//                       border: "1px solid #ffcccc",
//                       color: "#dc3545",
//                       padding: "10px 14px",
//                       borderRadius: "8px",
//                       fontWeight: 600,
//                       width: "100%",
//                       justifyContent: "center",
//                     }}
//                   >
//                     {loggingOut ? (
//                       <>
//                         <Spinner animation="border" size="sm" />
//                         <span>Logging out...</span>
//                       </>
//                     ) : (
//                       <>
//                         <FiLogOut />
//                         <span>Logout</span>
//                       </>
//                     )}
//                   </button>
//                 </>
//               ) : (
//                 <NavLink
//                   to="/login"
//                   className="mobile-link d-flex align-items-center gap-2"
//                   onClick={() => setShowMenu(false)}
//                 >
//                   <HiOutlineUser />
//                   <span>Login</span>
//                 </NavLink>
//               )}
//             </div>

//             <Nav className="flex-column lexend">
//               {menu.map((item, index) => (
//                 <div key={index}>
//                   {item.dropdown ? (
//                     <>
//                       <div className="mobile-link">{item.title}</div>
//                       {item.dropdown.map((sub, i) => (
//                         <div key={i}>
//                           <NavLink
//                             to={sub.link}
//                             className="mobile-sublink"
//                             onClick={() => setShowMenu(false)}
//                           >
//                             {sub.title}
//                           </NavLink>
//                           {sub.subCategories &&
//                             sub.subCategories.length > 0 && (
//                               <div className="mobile-sub-subcategories">
//                                 {sub.subCategories.map((subCat, idx) => (
//                                   <NavLink
//                                     key={idx}
//                                     to={`/category/${createSlug(
//                                       sub.title
//                                     )}/${createSlug(subCat)}`}
//                                     className="mobile-sub-sublink"
//                                     onClick={() => setShowMenu(false)}
//                                   >
//                                     • {subCat}
//                                   </NavLink>
//                                 ))}
//                               </div>
//                             )}
//                         </div>
//                       ))}
//                     </>
//                   ) : (
//                     <NavLink
//                       to={item.link}
//                       className="mobile-link"
//                       onClick={() => setShowMenu(false)}
//                     >
//                       {item.title}
//                     </NavLink>
//                   )}
//                 </div>
//               ))}
//             </Nav>
//           </Offcanvas.Body>
//         </Offcanvas>
//       </div>
//     </>
//   );
// };

// export default Header;
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
import { FiShoppingBag, FiX, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

  // ✅ Dedicated boolean for opening/closing the mega menu
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // 🆕 Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const categoryMenuTimeout = useRef(null);

  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();

  // 🆕 Track login state
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
          } catch (e) {
            console.warn("User data parse failed:", e);
          }
        }

        setIsLoggedIn(true);
        const initial = extractInitial(parsed, token);
        setUserInitial(initial);
        setUserName(parsed?.name || parsed?.fullName || "");
        setUserEmail(parsed?.email || "");
      } catch (err) {
        console.error("Header loadUser error:", err);
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
  }, []);

  // 🆕 Re-read session on route change
  useEffect(() => {
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
        } catch (e) {
          // ignore
        }
      }

      setIsLoggedIn(true);
      const initial = extractInitial(parsed, token);
      setUserInitial(initial);
      setUserName(parsed?.name || parsed?.fullName || "");
      setUserEmail(parsed?.email || "");
    } catch (err) {
      // ignore
    }
  }, [location.pathname]);

  // 🆕 LOGOUT HANDLER
  const handleLogout = async () => {
    if (loggingOut) return;
    if (!window.confirm("Are you sure you want to logout?")) return;

    setLoggingOut(true);

    try {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/logout`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (apiErr) {
          console.warn("Backend logout failed (continuing anyway):", apiErr);
        }
      }
    } catch (err) {
      console.warn("Logout API error:", err);
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

      setTimeout(() => alert("Logged out successfully"), 100);
    }
  };

  // 🆕 Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${ADMIN_API_URL}/categories`, {
          ...getAuthHeaders(),
        });

        let categoriesData = [];
        if (response.data.success && Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        }

        // ✅ Filter out "All" pseudo-categories
        const activeCategories = categoriesData.filter((cat) => {
          const name = String(cat.name || "").trim().toLowerCase();
          return cat.status === "active" && name && name !== "all";
        });

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

        setCategories(activeCategories);
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

  // 🆕 Fetch sub-categories on hover
  const fetchSubCategoriesForCategory = async (categoryName) => {
    if (!categoryName) return [];

    const normalizedName = String(categoryName).trim().toLowerCase();

    const localCategory = categories.find((cat) => {
      const catName = String(cat.name || "").trim().toLowerCase();
      return catName === normalizedName;
    });

    if (localCategory) {
      if (
        Array.isArray(localCategory.subcategories) &&
        localCategory.subcategories.length > 0
      ) {
        const localSubs = localCategory.subcategories
          .filter((sc) => !sc.status || sc.status === "active")
          .map((sc) => (typeof sc === "string" ? sc : sc.name))
          .filter(Boolean);

        setCategorySubCategories((prev) => ({
          ...prev,
          [categoryName]: localSubs,
        }));
        return localSubs;
      }
    }

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
          categoryName
        )}/subcategories`,
        { ...getAuthHeaders(), timeout: 5000 }
      );

      const subs = parseSubCategories(pickSubsFromResponse(response.data));
      setCategorySubCategories((prev) => ({ ...prev, [categoryName]: subs }));
      return subs;
    } catch (error) {
      console.warn(`❌ VENDOR API failed for "${categoryName}":`, error.message);
      setCategorySubCategories((prev) => ({ ...prev, [categoryName]: [] }));
      return [];
    } finally {
      setLoadingSubCategories((prev) => ({ ...prev, [categoryName]: false }));
    }
  };

  // ✅ Hover handler — skips "All" (virtual item, no sub-categories)
  const handleCategoryHover = (categoryName) => {
    if (!categoryName) return;

    if (categoryName.trim().toLowerCase() === "all") {
      setHoveredCategory("All");
      return;
    }

    if (categoryMenuTimeout.current) {
      clearTimeout(categoryMenuTimeout.current);
    }

    setHoveredCategory(categoryName);

    const existing = categorySubCategories[categoryName];
    if (!existing || existing.length === 0) {
      fetchSubCategoriesForCategory(categoryName);
    }
  };

  // ✅ Close menu + clear hovered category
  const handleCategoryLeave = () => {
    categoryMenuTimeout.current = setTimeout(() => {
      setShowCategoryMenu(false);
      setHoveredCategory(null);
    }, 300);
  };

  // ✅ Open menu, auto-highlight first real category
  const handleCategoryMenuEnter = (dropdownItems) => {
    if (categoryMenuTimeout.current) {
      clearTimeout(categoryMenuTimeout.current);
    }
    setShowCategoryMenu(true);

    if (
      !hoveredCategory &&
      Array.isArray(dropdownItems) &&
      dropdownItems.length > 0
    ) {
      // ✅ Skip "All" — highlight the first real category
      const firstReal = dropdownItems.find((d) => {
        const n = String(d.title || "").trim().toLowerCase();
        return n && n !== "all" && n !== "category";
      });

      if (firstReal) {
        const first = firstReal.title;
        setHoveredCategory(first);
        if (
          !categorySubCategories[first] ||
          categorySubCategories[first].length === 0
        ) {
          fetchSubCategoriesForCategory(first);
        }
      }
    }
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
      const response = await axios.get(
        `https://api.native91.com/api/search-suggestions`,
        {
          params: { q: query },
          timeout: 5000,
          ...getAuthHeaders(),
        }
      );
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
      const response = await axios.get(
        `https://api.native91.com/api/products/search`,
        {
          params: { keyword: searchQuery },
          ...getAuthHeaders(),
        }
      );
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

  // ✅ MENU — now includes "All" as the first dropdown item
  const menu = [
    { title: "Home", link: "/" },
    { title: "Brands", link: "/product" },
    {
      title: "Category",
      dropdown: [
        // ✅ NEW: "All" pseudo-item → navigates to /product (all products)
        {
          title: "All",
          link: "category/All",
          productCount: 0,
          subCategories: [],
          loading: false,
          isAll: true,
        },
        ...categories.map((cat) => {
          const catSubs = Array.isArray(cat.subcategories)
            ? cat.subcategories
                .filter((sc) => !sc.status || sc.status === "active")
                .map((sc) => (typeof sc === "string" ? sc : sc.name))
                .filter(Boolean)
            : [];

          return {
            title: cat.name,
            link: `/category/${createSlug(cat.name)}`,
            productCount: cat.productCount || 0,
            subCategories: catSubs,
            loading: loadingSubCategories[cat.name] || false,
            isAll: false,
          };
        }),
      ],
    },
    { title: "Social Impact", link: "/social-impact" },
    { title: "Sell With Us", link: "/sell" },
    { title: "Careers", link: "/careers" },
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

  // 🆕 User icon with dropdown (Profile + Logout)
  const renderUserIcon = () => {
    if (isLoggedIn) {
      return (
        <Dropdown align="end" className="user-dropdown">
          <Dropdown.Toggle
            as="button"
            type="button"
            className="user-btn dropdown-toggle-no-caret"
            title="My Account"
            bsPrefix="user-btn-wrapper"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span className="user-initial-badge">{userInitial || "U"}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="user-dropdown-menu"
            style={{
              minWidth: "220px",
              padding: "8px",
              borderRadius: "10px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              border: "1px solid #eee",
              marginTop: "8px",
            }}
          >
            <div
              className="user-info-header"
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#0D3B2E",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName || "User"}
              </div>
              {userEmail && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userEmail}
                </div>
              )}
            </div>

            <Dropdown.Item
              onClick={() => navigate("/orderhistory")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <HiOutlineUser style={{ fontSize: "16px" }} />
              <span>My Profile</span>
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => navigate("/orderhistory")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <FiShoppingBag style={{ fontSize: "16px" }} />
              <span>My Orders</span>
            </Dropdown.Item>

            <Dropdown.Divider style={{ margin: "6px 0" }} />

            <Dropdown.Item
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#dc3545",
                fontWeight: "500",
              }}
            >
              {loggingOut ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <FiLogOut style={{ fontSize: "16px" }} />
                  <span>Logout</span>
                </>
              )}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
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
                      show={showCategoryMenu}
                      onMouseEnter={() =>
                        handleCategoryMenuEnter(item.dropdown)
                      }
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
                        ) : item.dropdown.length === 0 ? (
                          <Dropdown.Item className="dropdown-item-custom text-center">
                            <span className="dropdown-loading">
                              No categories available
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
                                        <span className="sub-category-arrow ms-1">
                                          ›
                                        </span>
                                      )}
                                  </NavLink>
                                </div>
                              ))}
                            </div>

                            {hoveredCategory && (
                              <div className="subcategory-list-column">
                                {hoveredCategory.trim().toLowerCase() ===
                                "all" ? (
                                  // ✅ "All" hover → single CTA to /product
                                  <div style={{ padding: "20px" }}>
                                    <div className="subcategory-header">
                                      <span className="subcategory-title">
                                        All Products
                                      </span>
                                    </div>
                                    <div style={{ marginTop: "16px" }}>
                                      <NavLink
                                        to="category/All"
                                        className="view-all-subcategories"
                                        onClick={() => setShowMenu(false)}
                                      >
                                        View All Products →
                                      </NavLink>
                                    </div>
                                  </div>
                                ) : (
                                  <>
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
                                        categorySubCategories[
                                          hoveredCategory
                                        ].map((sub, idx) => (
                                          <NavLink
                                            key={idx}
                                            to={`/category/${createSlug(
                                              hoveredCategory
                                            )}/${createSlug(sub)}`}
                                            className="subcategory-item"
                                            onClick={() => setShowMenu(false)}
                                          >
                                            <span className="subcategory-dot">
                                              •
                                            </span>
                                            {sub}
                                          </NavLink>
                                        ))
                                      ) : (
                                        <div className="subcategory-empty">
                                          No sub-categories available
                                        </div>
                                      )}
                                    </div>
                                    <div className="subcategory-footer">
                                      <NavLink
                                        to={`/category/${createSlug(
                                          hoveredCategory
                                        )}`}
                                        className="view-all-subcategories"
                                        onClick={() => setShowMenu(false)}
                                      >
                                        View All Products in {hoveredCategory}{" "}
                                        →
                                      </NavLink>
                                    </div>
                                  </>
                                )}
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
                <>
                  <NavLink
                    to="/orderhistory"
                    className="mobile-link d-flex align-items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <span className="user-initial-badge">
                      {userInitial || "U"}
                    </span>
                    <div className="d-flex flex-column">
                      <span style={{ fontWeight: 600 }}>
                        {userName || "My Profile"}
                      </span>
                      {userEmail && (
                        <small style={{ fontSize: "11px", color: "#888" }}>
                          {userEmail}
                        </small>
                      )}
                    </div>
                  </NavLink>

                  <button
                    type="button"
                    className="mobile-logout-btn d-flex align-items-center gap-2 mt-3"
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    style={{
                      background: "#fff5f5",
                      border: "1px solid #ffcccc",
                      color: "#dc3545",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    {loggingOut ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <FiLogOut />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </>
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
                          {sub.subCategories &&
                            sub.subCategories.length > 0 && (
                              <div className="mobile-sub-subcategories">
                                {sub.subCategories.map((subCat, idx) => (
                                  <NavLink
                                    key={idx}
                                    to={`/category/${createSlug(
                                      sub.title
                                    )}/${createSlug(subCat)}`}
                                    className="mobile-sub-sublink"
                                    onClick={() => setShowMenu(false)}
                                  >
                                    • {subCat}
                                  </NavLink>
                                ))}
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