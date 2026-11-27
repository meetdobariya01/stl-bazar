// pages/Grid/Grid.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Dropdown,
  Form,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaSlidersH,
  FaBan,
  FaPlus,
  FaMinus,
  FaSitemap,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createSlug } from "../../utils/slugUtils";
import "./grid.css";
import Details from "../../components/details/details";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";

const API_URL = process.env.REACT_APP_API_URL;
const VENDOR_BACKEND_URL = "https://api-vendor.native91.com";
const ADMIN_IMAGE_BASE = "https://api-admin.native91.com";

// ✅ 1. LOGO URL RESOLVER (TRYS ADMIN FIRST)
const getImageUrl = (logo) => {
  if (!logo) return null;

  if (typeof logo === "object" && !Array.isArray(logo)) {
    if (logo.image && typeof logo.image === "string") logo = logo.image;
    else if (logo.url && typeof logo.url === "string") logo = logo.url;
    else return null;
  }

  if (Array.isArray(logo)) logo = logo[0];
  if (!logo || typeof logo !== "string") return null;

  let s = logo.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/images")) return `${ADMIN_IMAGE_BASE}${s}`;
  if (s.startsWith("/uploads") || s.startsWith("/public")) return `${VENDOR_BACKEND_URL}${s}`;

  return `${ADMIN_IMAGE_BASE}/uploads/${s}`;
};

// ✅ 2. PRODUCT URL RESOLVER (TRYS ADMIN FIRST)
const getPrimaryImageUrl = (image) => {
  if (!image) return null;

  if (typeof image === "object" && !Array.isArray(image)) {
    if (image.image && typeof image.image === "string") image = image.image;
    else if (image.url && typeof image.url === "string") image = image.url;
    else return null;
  }

  if (Array.isArray(image)) image = image[0];
  if (!image || typeof image !== "string") return null;

  let s = image.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/images")) return `${ADMIN_IMAGE_BASE}${s}`;
  if (s.startsWith("/uploads") || s.startsWith("/public")) return `${VENDOR_BACKEND_URL}${s}`;

  return `${ADMIN_IMAGE_BASE}/uploads/${s}`;
};

const sanitizeSubCategory = (raw) => {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/\\/g, "").replace(/[\[\]"']/g, "").replace(/^[\/\s]+|[\/\s]+$/g, "").replace(/\s+/g, " ").trim();
  return s;
};

const getProductSubCategories = (product) => {
  const allSubs = [];
  if (product.subCategory) allSubs.push(product.subCategory);
  if (product.subcategory) allSubs.push(product.subcategory);
  if (Array.isArray(product.subCategories)) allSubs.push(...product.subCategories);
  if (Array.isArray(product.subcategories)) allSubs.push(...product.subcategories);

  if (product.categorySubcategoryMap && typeof product.categorySubcategoryMap === "object") {
    Object.values(product.categorySubcategoryMap).forEach((arr) => {
      if (Array.isArray(arr)) allSubs.push(...arr);
    });
  }
  return [...new Set(allSubs.map((s) => sanitizeSubCategory(s)).filter(Boolean))];
};

// ✅ 3. COMPANY LOGO COMPONENT (WITH AUTO-SWITCH FALLBACK)
const CompanyLogo = ({ logoUrl, companyName }) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState(null);

  // જો લોગો ના હોય અથવા બંને સર્વર ફેલ થાય તો "A" દેખાડો
  if (!logoUrl || hasError) {
    return (
      <div className="brand-placeholder mb-3" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="brand-initial" style={{ fontSize: "3rem", fontWeight: "bold", color: "#ccc" }}>
          {companyName?.charAt(0)?.toUpperCase() || "?"}
        </span>
        <span className="brand-name-display text-muted">{companyName}</span>
      </div>
    );
  }

  return (
    <div className="brand-image-container mb-3">
      <img
        src={fallbackUrl || logoUrl}
        alt={companyName}
        className="company-logo-grid d-block mx-auto"
        style={{ maxHeight: "120px", objectFit: "contain" }}
        onError={() => {
          // જો એડમિન URL ફેલ થાય, તો વેન્ડર URL ટ્રાય કરો
          if (!fallbackUrl && logoUrl.includes("api-admin.native91.com")) {
            const vendorUrl = logoUrl.replace("api-admin.native91.com", "api-vendor.native91.com");
            setFallbackUrl(vendorUrl);
          } else {
            // જો વેન્ડર પણ ફેલ થાય, તો ફોલબેક ("A") દેખાડો
            setHasError(true);
          }
        }}
      />
    </div>
  );
};

const Grid = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [pathname]);

  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName || "");
  const navigate = useNavigate();

  const { setShowCart, fetchCart } = useCart();
  const { isInWishlist, toggleWishlist, fetchWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({ name: decodedName || "", description: "", logo: null, loading: true });

  const [qtyMap, setQtyMap] = useState({});
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [allSubCategories, setAllSubCategories] = useState([]);

  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [brands, setBrands] = useState([]);

  const getQty = (productId) => qtyMap[productId] || 1;

  const changeQty = (e, productId, delta, maxStock) => {
    e.stopPropagation();
    setQtyMap((prev) => {
      const current = prev[productId] || 1;
      let next = current + delta;
      if (next < 1) next = 1;
      if (maxStock !== undefined && maxStock !== null && next > maxStock) next = Math.max(1, Number(maxStock));
      return { ...prev, [productId]: next };
    });
  };

  useEffect(() => {
    if (!decodedName) { setCompanyInfo((prev) => ({ ...prev, loading: false })); return; }
    let cancelled = false;

    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${API_URL}/companies`, { timeout: 15000 });
        let companiesData = [];
        if (response.data) {
          if (response.data.success && Array.isArray(response.data.companies)) companiesData = response.data.companies;
          else if (Array.isArray(response.data)) companiesData = response.data;
          else if (response.data.companies && Array.isArray(response.data.companies)) companiesData = response.data.companies;
        }

        const targetName = decodedName.trim().toLowerCase();
        const matched = companiesData.find((c) => (c.name || "").trim().toLowerCase() === targetName);

        if (cancelled) return;

        if (matched) {
          // 🚨 FORCE ADMIN URL IF VENDOR IS RETURNED
          let logoStr = matched.logo;
          if (logoStr && typeof logoStr === "string" && logoStr.includes("api-vendor.native91.com")) {
            logoStr = logoStr.replace("api-vendor.native91.com", "api-admin.native91.com");
          }
          
          setCompanyInfo({
            name: matched.name || decodedName,
            description: matched.description || `${matched.name} - Premium brand on Native91`,
            logo: logoStr ? getImageUrl(logoStr) : null,
            loading: false,
          });
        } else {
          setCompanyInfo({ name: decodedName, description: `${decodedName} - Premium brand on Native91`, logo: null, loading: false });
        }
      } catch (err) {
        if (!cancelled) setCompanyInfo({ name: decodedName, description: `${decodedName} - Premium brand on Native91`, logo: null, loading: false });
      }
    };

    fetchCompany();
    return () => { cancelled = true; };
  }, [decodedName]);

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    axios.get(`${API_URL}/products`, { params: { company: decodedName } })
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
        const uniqueCategories = [...new Set(res.data.map((p) => p.category).filter(Boolean))];
        const uniqueMaterials = [...new Set(res.data.map((p) => p.material).filter(Boolean))];
        const uniqueBrands = [...new Set(res.data.map((p) => p.brand).filter(Boolean))];
        const subSet = new Set();
        res.data.forEach((p) => { getProductSubCategories(p).forEach((s) => subSet.add(s)); });
        setCategories(uniqueCategories);
        setMaterials(uniqueMaterials);
        setBrands(uniqueBrands);
        setAllSubCategories(Array.from(subSet));
        fetchWishlist();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedName, fetchWishlist]);

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategories.length > 0) filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    if (selectedMaterials.length > 0) filtered = filtered.filter((p) => selectedMaterials.includes(p.material));
    if (selectedBrands.length > 0) filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) => {
        const productSubs = getProductSubCategories(p).map((s) => s.toLowerCase());
        return selectedSubCategories.some((sel) => productSubs.includes(sel.toLowerCase()));
      });
    }
    if (selectedPriceRange) {
      switch (selectedPriceRange) {
        case "under-500": filtered = filtered.filter((p) => p.price < 500); break;
        case "500-1000": filtered = filtered.filter((p) => p.price >= 500 && p.price <= 1000); break;
        case "1000-2000": filtered = filtered.filter((p) => p.price >= 1000 && p.price <= 2000); break;
        case "2000-5000": filtered = filtered.filter((p) => p.price >= 2000 && p.price <= 5000); break;
        case "above-5000": filtered = filtered.filter((p) => p.price > 5000); break;
        default: break;
      }
    } else {
      if (priceMin) filtered = filtered.filter((p) => p.price >= Number(priceMin));
      if (priceMax) filtered = filtered.filter((p) => p.price <= Number(priceMax));
    }
    if (selectedRating > 0) filtered = filtered.filter((p) => (p.averageRating || 0) >= selectedRating);
    setFilteredProducts(filtered);
  }, [selectedCategories, selectedMaterials, selectedBrands, selectedSubCategories, selectedPriceRange, priceMin, priceMax, selectedRating, products]);

  const isOutOfStock = (item) => {
    const stock = item?.stock;
    if (stock === undefined || stock === null) return false;
    return Number(stock) <= 0;
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    if (isOutOfStock(item)) return alert("Sorry, this product is out of stock.");
    const requestedQty = getQty(item._id);
    if (Number(item.stock) < requestedQty) return alert(`Only ${item.stock} items available in stock.`);
    setIsAddingToCart((prev) => ({ ...prev, [item._id]: true }));

    try {
      const guestId = localStorage.getItem("guestId");
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: item._id,
          name: item.name,
          price: item.price,
          image: Array.isArray(item.image) ? item.image[0] : item.image,
          quantity: requestedQty,
          stock: item.stock,
        },
      });
      setQtyMap((prev) => ({ ...prev, [item._id]: 1 }));
      await fetchCart();
      setShowCart(true);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart.");
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [item._id]: false }));
    }
  };

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
    } catch (error) { console.error(error); } finally { setIsTogglingWishlist((prev) => ({ ...prev, [productId]: false })); }
  };

  const clearFilters = () => {
    setSelectedCategories([]); setSelectedMaterials([]); setSelectedBrands([]);
    setSelectedRating(0); setPriceMin(""); setPriceMax(""); setSelectedSubCategories([]); setSelectedPriceRange("");
  };

  const handleCategoryChange = (category) => setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
  const handleMaterialChange = (material) => setSelectedMaterials((prev) => prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]);
  const handleBrandChange = (brand) => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  const handleSubCategoryToggle = (subCategory) => setSelectedSubCategories((prev) => prev.includes(subCategory) ? prev.filter((s) => s !== subCategory) : [...prev, subCategory]);
  const handleAllSubCategoriesToggle = () => setSelectedSubCategories([]);

  const getSortedProducts = () => {
    let sorted = [...filteredProducts];
    switch (sort) {
      case "price-low-high": return sorted.sort((a, b) => a.price - b.price);
      case "price-high-low": return sorted.sort((a, b) => b.price - a.price);
      case "newest": return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "rating": return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      default: return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  const getSortLabel = () => {
    const labels = { popular: "Popular", newest: "Newest", "price-low-high": "Price: Low to High", "price-high-low": "Price: High to Low", rating: "Customer Rating" };
    return labels[sort] || "Popular";
  };

  return (
    <>
      <Header />
      <Breadcrumb />

      <div className="product-background lexend px-3 py-5">
        <Container className="product-page">
          
          {categories.length > 0 && (
            <div className="category-description mb-4 p-4 rounded text-center">
              {companyInfo.loading ? (
                <div className="d-flex justify-content-center mb-3">
                  <div className="spinner-border spinner-border-sm text-secondary" />
                </div>
              ) : (
                <CompanyLogo logoUrl={companyInfo.logo} companyName={companyInfo.name} />
              )}
              <h2 className="h4 m-3 funnel-sans">{companyInfo.name || decodedName}</h2>
              <p className="text-muted mb-0 company-description-grid">
                {companyInfo.description || `Explore our collection of premium ${(companyInfo.name || decodedName).toLowerCase()} products.`}
              </p>
            </div>
          )}

          <div className="top-bar">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <Button variant="outline-secondary" className="mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                  <FaSlidersH /> Filters
                  {selectedSubCategories.length > 0 && <span className="filter-count-badge">{selectedSubCategories.length}</span>}
                </Button>
                <span className="product-count">{filteredProducts.length} Products</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="sort-label">Sort by:</span>
                <Dropdown>
                  <Dropdown.Toggle className="sort-btn">{getSortLabel()}</Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSort("popular")}>Popular</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("newest")}>Newest</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("price-low-high")}>Price: Low to High</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("price-high-low")}>Price: High to Low</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("rating")}>Customer Rating</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>

          <Row className="g-4">
            <Col lg={3} className="d-none">
              <div className="filters-sidebar">
                <div className="filter-header">
                  <h5>Filter By</h5>
                  <Button variant="link" onClick={clearFilters} className="clear-all-btn">Clear All</Button>
                </div>
                {categories.length > 0 && (
                  <div className="filter-group">
                    <h6>Categories</h6>
                    <div className="filter-options">
                      {categories.map((cat) => (
                        <Form.Check key={cat} type="checkbox" label={`${cat} (${products.filter((p) => p.category === cat).length})`} checked={selectedCategories.includes(cat)} onChange={() => handleCategoryChange(cat)} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="filter-group">
                  <h6>Price</h6>
                  <div className="price-inputs">
                    <Form.Control type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                    <span>to</span>
                    <Form.Control type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                  </div>
                </div>
                {materials.length > 0 && (
                  <div className="filter-group">
                    <h6>Material</h6>
                    <div className="filter-options">
                      {materials.slice(0, 5).map((mat) => (
                        <Form.Check key={mat} type="checkbox" label={`${mat} (${products.filter((p) => p.material === mat).length})`} checked={selectedMaterials.includes(mat)} onChange={() => handleMaterialChange(mat)} />
                      ))}
                    </div>
                  </div>
                )}
                {brands.length > 0 && (
                  <div className="filter-group">
                    <h6>Brand</h6>
                    <div className="filter-options">
                      {brands.slice(0, 5).map((brand) => (
                        <Form.Check key={brand} type="checkbox" label={`${brand} (${products.filter((p) => p.brand === brand).length})`} checked={selectedBrands.includes(brand)} onChange={() => handleBrandChange(brand)} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="filter-group">
                  <h6>Rating</h6>
                  <div className="rating-options">
                    {[4, 3, 2, 1].map((rating) => (
                      <Form.Check key={rating} type="radio" name="rating" label={<span className="rating-label">{[...Array(5)].map((_, i) => <FaStar key={i} color={i < rating ? "#ffc107" : "#e4e5e9"} size={14} />)}<span>& up</span></span>} checked={selectedRating === rating} onChange={() => setSelectedRating(rating === selectedRating ? 0 : rating)} />
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            {showMobileFilters && (
              <div className="mobile-filters-overlay" onClick={() => setShowMobileFilters(false)}>
                <div className="mobile-filters-drawer" onClick={(e) => e.stopPropagation()}>
                  <div className="drawer-header">
                    <h5>Filters</h5>
                    <Button variant="link" className="text-dark text-decoration-none" onClick={() => setShowMobileFilters(false)}>✘</Button>
                  </div>
                  <div className="drawer-body">
                    <div className="filter-group">
                      <h6>Categories</h6>
                      {categories.map((cat) => <Form.Check key={cat} type="checkbox" label={cat} checked={selectedCategories.includes(cat)} onChange={() => handleCategoryChange(cat)} />)}
                    </div>
                    {allSubCategories.length > 0 && (
                      <div className="filter-group">
                        <h6><FaSitemap className="me-1" /> Sub-Categories</h6>
                        <div className="sub-category-filter-list">
                          <Form.Check type="checkbox" label="All Sub-Categories" checked={selectedSubCategories.length === 0} onChange={handleAllSubCategoriesToggle} />
                          {allSubCategories.map((sub, index) => <Form.Check key={index} type="checkbox" label={sub} checked={selectedSubCategories.includes(sub)} onChange={() => handleSubCategoryToggle(sub)} />)}
                        </div>
                      </div>
                    )}
                    <div className="filter-group">
                      <h6>Price Range</h6>
                      {[{ val: "under-500", label: "Under ₹500" }, { val: "500-1000", label: "₹500 - ₹1,000" }, { val: "1000-2000", label: "₹1,000 - ₹2,000" }, { val: "2000-5000", label: "₹2,000 - ₹5,000" }, { val: "above-5000", label: "Above ₹5,000" }].map(({ val, label }) => <Form.Check key={val} type="radio" name="priceRangeMobile" label={label} checked={selectedPriceRange === val} onChange={() => setSelectedPriceRange(val)} />)}
                      <Form.Check type="radio" name="priceRangeMobile" label="All Prices" checked={selectedPriceRange === ""} onChange={() => setSelectedPriceRange("")} />
                    </div>
                    <div className="filter-group">
                      <h6>Custom Price</h6>
                      <div className="price-inputs">
                        <Form.Control type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                        <span>to</span>
                        <Form.Control type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                      </div>
                    </div>
                    <div className="filter-group">
                      <h6>Rating</h6>
                      {[4, 3, 2].map((r) => <Form.Check key={r} type="radio" name="ratingMobile" label={`${r}★ & above`} checked={selectedRating === r} onChange={() => setSelectedRating(r)} />)}
                      <Form.Check type="radio" name="ratingMobile" label="All Ratings" checked={selectedRating === 0} onChange={() => setSelectedRating(0)} />
                    </div>
                  </div>
                  <div className="drawer-footer">
                    <Button variant="outline" onClick={clearFilters}>Clear All</Button>
                    <Button variant="outline-dark" onClick={() => setShowMobileFilters(false)}>Apply</Button>
                  </div>
                </div>
              </div>
            )}

            <Col lg={12}>
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-3">Loading products...</p></div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5"><h5>No products found</h5><Button variant="outline-dark" onClick={clearFilters}>Clear Filters</Button></div>
              ) : (
                <Row className="g-4 text-center">
                  {sortedProducts.map((item) => {
                    const inWishlist = isInWishlist(item._id);
                    const productSlug = createSlug(item.name);
                    const isToggling = isTogglingWishlist[item._id] || false;
                    const isAdding = isAddingToCart[item._id] || false;
                    const outOfStock = isOutOfStock(item);
                    const qty = getQty(item._id);

                    return (
                      <Col key={item._id} xs={6} md={4} lg={3}>
                        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                          <Card className="" onClick={() => navigate(`/product/${productSlug}`)}>
                            <div className="product-image-wrapper">
                              {/* PRODUCT IMAGE WITH AUTO-FALLBACK */}
                              <Card.Img
                                className="product-card"
                                src={getPrimaryImageUrl(item.image) || "/images/placeholder.png"}
                                alt={item.name || "Product"}
                                onError={(e) => {
                                  const currentSrc = e.currentTarget.src;
                                  // જો એડમિન URL ફેલ થાય, તો વેન્ડર ટ્રાય કરો
                                  if (currentSrc.includes("api-admin.native91.com")) {
                                    e.currentTarget.src = currentSrc.replace("api-admin.native91.com", "api-vendor.native91.com");
                                  } else {
                                    // જો વેન્ડર પણ ફેલ થાય તો પ્લેસહોલ્ડર
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/images/placeholder.png";
                                  }
                                }}
                                loading="lazy"
                              />
                              {outOfStock && <Badge bg="danger" style={{ position: "absolute", top: "10px", left: "10px", zIndex: 2, fontSize: "11px", padding: "5px 10px" }}><FaBan className="me-1" /> Out of Stock</Badge>}
                              <div className="wishlist-btn-grid" onClick={(e) => handleToggleWishlist(e, item._id)} style={{ cursor: isToggling ? "not-allowed" : "pointer" }}>
                                {isToggling ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : inWishlist ? <FaHeart color="#e74c3c" /> : <FaRegHeart />}
                              </div>
                            </div>
                            <Card.Body>
                              <div className="product-brand">{item.company || "Brand Name"}</div>
                              <h6 className="product-name">{item.name}</h6>
                              <div className="product-rating">
                                {[...Array(5)].map((_, i) => <FaStar key={i} color={i < Math.round(item.averageRating || 0) ? "#ffc107" : "#e4e5e9"} size={12} />)}
                              </div>
                              <div className="product-price">₹{item.price.toLocaleString()}</div>
                              {!outOfStock && (
                                <div className="qty-box-grid" onClick={(e) => e.stopPropagation()}>
                                  <button type="button" className="qty-btn-grid" onClick={(e) => changeQty(e, item._id, -1, item.stock)} disabled={qty <= 1}><FaMinus size={10} /></button>
                                  <span className="qty-value-grid">{qty}</span>
                                  <button type="button" className="qty-btn-grid" onClick={(e) => changeQty(e, item._id, 1, item.stock)} disabled={item.stock !== undefined && qty >= Number(item.stock)}><FaPlus size={10} /></button>
                                </div>
                              )}
                              <Button className="add-to-cart-btn" onClick={(e) => handleAddToCart(e, item)} disabled={isAdding || outOfStock}>
                                {outOfStock ? (<><FaBan /> Out of Stock</>) : isAdding ? (<><span className="spinner-border spinner-border-sm me-2" />Adding...</>) : (<><FaShoppingCart /> Add to Cart</>)}
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

export default Grid;
