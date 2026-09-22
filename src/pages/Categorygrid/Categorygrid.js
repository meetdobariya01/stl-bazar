import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaSitemap,
  FaShoppingCart,
} from "react-icons/fa";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { createSlug } from "../../utils/slugUtils";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import "./categorygrid.css";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const VENDOR_BEND_URL = "https://api-vendor.native91.com";
const ADMIN_CATEGORY_API = "https://api-admin.native91.com/api/category";

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
  const { categoryName: categorySlug, subCategoryName: subCategorySlug } =
    useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const { isInWishlist, toggleWishlist, fetchWishlist } = useWishlist();
  const { addToCart, setShowCart } = useCart();

  // 🆕 RESOLVED names from slug
  const [decodedCategory, setDecodedCategory] = useState("All");
  const [decodedSubCategory, setDecodedSubCategory] = useState(null);
  const [resolvingNames, setResolvingNames] = useState(true);

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

  // ============================================================
  // 🆕 RESOLVE SLUGS → REAL NAMES
  // ============================================================
  useEffect(() => {
    const resolveSlugs = async () => {
      setResolvingNames(true);
      try {
        if (!categorySlug || categorySlug === "All") {
          setDecodedCategory("All");
          setDecodedSubCategory(null);
          setResolvingNames(false);
          return;
        }

        const res = await axios.get(`${ADMIN_CATEGORY_API}/categories`);
        const cats = res.data?.categories || [];

        // Try slug match first
        let matchedCat = cats.find((c) => createSlug(c.name) === categorySlug);

        // Fallback — encoded name match
        if (!matchedCat) {
          const decoded = decodeURIComponent(categorySlug);
          matchedCat = cats.find(
            (c) => c.name.toLowerCase() === decoded.toLowerCase(),
          );
        }

        if (matchedCat) {
          setDecodedCategory(matchedCat.name);

          if (subCategorySlug && matchedCat.subcategories) {
            // Try slug match
            let matchedSub = matchedCat.subcategories.find(
              (sc) => createSlug(sc.name) === subCategorySlug,
            );

            // Fallback — encoded name
            if (!matchedSub) {
              const decodedSub = decodeURIComponent(subCategorySlug);
              matchedSub = matchedCat.subcategories.find(
                (sc) => sc.name.toLowerCase() === decodedSub.toLowerCase(),
              );
            }

            // Final fallback — rough slug conversion
            if (!matchedSub) {
              const rough = decodeURIComponent(subCategorySlug)
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              setDecodedSubCategory(rough);
            } else {
              setDecodedSubCategory(matchedSub.name);
            }
          }
        } else {
          // Total fallback
          setDecodedCategory(decodeURIComponent(categorySlug));
          if (subCategorySlug) {
            setDecodedSubCategory(decodeURIComponent(subCategorySlug));
          }
        }
      } catch (err) {
        console.warn("Slug resolve failed:", err.message);
        // Fallback to raw params
        setDecodedCategory(decodeURIComponent(categorySlug || "All"));
        if (subCategorySlug) {
          setDecodedSubCategory(decodeURIComponent(subCategorySlug));
        }
      } finally {
        setResolvingNames(false);
      }
    };

    resolveSlugs();
  }, [categorySlug, subCategorySlug]);

  // ============================================================
  // FETCH PRODUCTS (જ્યારે names resolve થાય)
  // ============================================================
  useEffect(() => {
    if (resolvingNames) return;
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
            (p) =>
              p.category &&
              p.category.toLowerCase() === decodedCategory.toLowerCase(),
          );
        }

        // Filter by sub-category
        if (decodedSubCategory) {
          const targetSub = decodedSubCategory.toLowerCase().trim();

          allProducts = allProducts.filter((p) => {
            const allSubs = [];
            if (p.subCategory) allSubs.push(p.subCategory);
            if (p.subcategory) allSubs.push(p.subcategory);
            if (Array.isArray(p.subCategories))
              allSubs.push(...p.subCategories);
            if (Array.isArray(p.subcategories))
              allSubs.push(...p.subcategories);

            if (
              p.categorySubcategoryMap &&
              typeof p.categorySubcategoryMap === "object"
            ) {
              Object.values(p.categorySubcategoryMap).forEach((arr) => {
                if (Array.isArray(arr)) allSubs.push(...arr);
              });
            }

            const cleanSubs = allSubs
              .filter(Boolean)
              .map((s) =>
                String(s)
                  .replace(/[\[\]"']/g, "")
                  .trim()
                  .toLowerCase(),
              )
              .filter(Boolean);

            return cleanSubs.includes(targetSub);
          });

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
  }, [decodedCategory, decodedSubCategory, resolvingNames, fetchWishlist]);

  // ============================================================
  // FETCH CATEGORIES + SUB-CATEGORIES (for filter drawer)
  // ============================================================
  useEffect(() => {
    const fetchCategoriesAndSubs = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/categories`);
        setAllCategories(catRes.data || []);

        const subMap = {};
        const categories = catRes.data || [];

        for (const cat of categories) {
          try {
            const subRes = await axios.get(
              `${API_URL}/categories/${encodeURIComponent(cat.name)}/subcategories`,
            );
            if (subRes.data && subRes.data.subCategories) {
              subMap[cat.name] = subRes.data.subCategories;
            }
          } catch (err) {
            subMap[cat.name] = [];
          }
        }

        setAllSubCategories(subMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategoriesAndSubs();
  }, []);

  // ============================================================
  // APPLY FILTERS
  // ============================================================
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.some(
          (cat) => p.category && p.category.toLowerCase() === cat.toLowerCase(),
        ),
      );
    }

    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) => {
        const allSubs = [];
        if (p.subCategory) allSubs.push(p.subCategory);
        if (p.subcategory) allSubs.push(p.subcategory);
        if (Array.isArray(p.subCategories)) allSubs.push(...p.subCategories);
        if (Array.isArray(p.subcategories)) allSubs.push(...p.subcategories);

        if (
          p.categorySubcategoryMap &&
          typeof p.categorySubcategoryMap === "object"
        ) {
          Object.values(p.categorySubcategoryMap).forEach((arr) => {
            if (Array.isArray(arr)) allSubs.push(...arr);
          });
        }

        const cleanSubs = allSubs
          .filter(Boolean)
          .map((s) =>
            String(s)
              .replace(/[\[\]"']/g, "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean);

        return selectedSubCategories.some((selectedSub) =>
          cleanSubs.includes(selectedSub.toLowerCase().trim()),
        );
      });
    }

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

  // ============================================================
  // SORT
  // ============================================================
  const getSortedProducts = () => {
    let sorted = [...filteredProducts];
    switch (sortBy) {
      case "alphabetical-a-z":
        return sorted.sort((a, b) =>
          (a.name?.toLowerCase() || "").localeCompare(
            b.name?.toLowerCase() || "",
          ),
        );
      case "alphabetical-z-a":
        return sorted.sort((a, b) =>
          (b.name?.toLowerCase() || "").localeCompare(
            a.name?.toLowerCase() || "",
          ),
        );
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
        return sorted.sort((a, b) =>
          (a.name?.toLowerCase() || "").localeCompare(
            b.name?.toLowerCase() || "",
          ),
        );
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    setIsTogglingWishlist((prev) => ({ ...prev, [productId]: true }));
    try {
      const product = products.find((p) => p._id === productId);
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
      setIsTogglingWishlist((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    setIsAddingToCart((prev) => ({ ...prev, [item._id]: true }));
    try {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId =
          "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      const primaryImage =
        Array.isArray(item.image) && item.image.length > 0
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
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const handleCategorySelect = (category) => {
    if (category === "All") {
      navigate("/category/All");
    } else {
      navigate(`/category/${createSlug(category)}`);
    }
    setShowMobileFilters(false);
  };

  const handleSubCategoryToggle = (subCategory) => {
    setSelectedSubCategories((prev) => {
      if (prev.includes(subCategory)) {
        return prev.filter((s) => s !== subCategory);
      } else {
        return [...prev, subCategory];
      }
    });
  };

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

  const checkIsInWishlist = (productId) => isInWishlist(productId);

  const getCategorySubCategories = () => {
    if (decodedCategory === "All") {
      const allSubs = new Set();
      Object.values(allSubCategories).forEach((subs) => {
        subs.forEach((s) => allSubs.add(s));
      });
      return Array.from(allSubs);
    }
    return allSubCategories[decodedCategory] || [];
  };

  const categorySubCategories = getCategorySubCategories();

  // ============================================================
  // LOADING STATES
  // ============================================================
  if (resolvingNames || loading) {
    return (
      <>
        <Header />
        <div className="category-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>
            {resolvingNames ? "Loading category..." : "Loading products..."}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <Header />

      <Breadcrumb />
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
                      onClick={() =>
                        navigate(`/category/${createSlug(decodedCategory)}`)
                      }
                      style={{
                        cursor: "pointer",
                        color: "#0D3B2E",
                        textDecoration: "underline",
                      }}
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
            {/* MOBILE FILTER DRAWER */}
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
                    {/* Categories */}
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

                    {/* Sub-Categories */}
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
                      </div>
                    )}

                    {/* Price */}
                    <div className="filter-group">
                      <h6>Price</h6>
                      {[
                        { val: "under-500", label: "Under ₹500" },
                        { val: "500-1000", label: "₹500 - ₹1,000" },
                        { val: "1000-2000", label: "₹1,000 - ₹2,000" },
                        { val: "2000-5000", label: "₹2,000 - ₹5,000" },
                        { val: "above-5000", label: "Above ₹5,000" },
                      ].map(({ val, label }) => (
                        <Form.Check
                          key={val}
                          type="radio"
                          name="priceRangeMobile"
                          label={label}
                          checked={selectedPriceRange === val}
                          onChange={() => setSelectedPriceRange(val)}
                        />
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="filter-group">
                      <h6>Rating</h6>
                      {[4, 3, 2].map((r) => (
                        <Form.Check
                          key={r}
                          type="radio"
                          name="ratingMobile"
                          label={`${r}★ & above`}
                          checked={selectedRating === r}
                          onChange={() => setSelectedRating(r)}
                        />
                      ))}
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

            {/* PRODUCTS GRID */}
            <Col lg={12}>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No products found</h5>
                  <p className="text-muted">
                    {decodedSubCategory
                      ? `No products found in "${decodedSubCategory}" under "${decodedCategory}"`
                      : `No products found in "${decodedCategory}"`}
                  </p>
                  <Button
                    variant="outline-dark"
                    onClick={() => navigate("/category/All")}
                  >
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
                      <Col
                        key={item._id}
                        xs={6}
                        md={4}
                        lg={3}
                        className="text-center"
                      >
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
                                onClick={(e) =>
                                  handleToggleWishlist(e, item._id)
                                }
                                style={{
                                  cursor: isToggling
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              >
                                {isToggling ? (
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                ) : inWishlist ? (
                                  <FaHeart color="#e74c3c" />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </div>

                              {/* Sub-Category Badge */}
                              {/* {(() => {
                                const allSubs = [];
                                if (item.subCategory)
                                  allSubs.push(item.subCategory);
                                if (item.subcategory)
                                  allSubs.push(item.subcategory);
                                if (Array.isArray(item.subCategories))
                                  allSubs.push(...item.subCategories);
                                if (Array.isArray(item.subcategories))
                                  allSubs.push(...item.subcategories);
                                if (
                                  item.categorySubcategoryMap &&
                                  typeof item.categorySubcategoryMap ===
                                    "object"
                                ) {
                                  Object.values(
                                    item.categorySubcategoryMap,
                                  ).forEach((arr) => {
                                    if (Array.isArray(arr))
                                      allSubs.push(...arr);
                                  });
                                }

                                const cleanSubs = allSubs
                                  .filter(Boolean)
                                  .map((s) =>
                                    String(s)
                                      .replace(/[\[\]"']/g, "")
                                      .trim(),
                                  )
                                  .filter(Boolean);

                                const uniqueSubs = [...new Set(cleanSubs)];
                                if (uniqueSubs.length === 0) return null;

                                return (
                                  <div className="sub-category-badge">
                                    {uniqueSubs[0]}
                                    {uniqueSubs.length > 1 &&
                                      ` +${uniqueSubs.length - 1}`}
                                  </div>
                                );
                              })()} */}
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
