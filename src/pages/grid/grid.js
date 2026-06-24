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
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaSlidersH,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";
import "./grid.css";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL;
// ✅ USE VENDOR BACKEND URL FOR IMAGES
const VENDOR_BACKEND_URL = "https://api.brandelvendor.starlighttechlabsindia.com";

// ✅ FIXED: Get primary image URL using VENDOR backend
const getPrimaryImageUrl = (image) => {
  if (!image) return "/images/placeholder.png";
  let img = Array.isArray(image) ? image[0] : image;
  if (!img) return "/images/placeholder.png";
  const imgStr = String(img);
  if (imgStr.startsWith("http")) return imgStr;
  if (imgStr.startsWith("/uploads")) return `${VENDOR_BACKEND_URL}${imgStr}`;
  if (imgStr.startsWith("/images")) return imgStr;
  return `${VENDOR_BACKEND_URL}${imgStr}`;
};

const Grid = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName || "");
  const navigate = useNavigate();

  const { setShowCart, fetchCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    if (!decodedName) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, { params: { company: decodedName } })
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);

        const uniqueCategories = [
          ...new Set(res.data.map((p) => p.category).filter(Boolean)),
        ];
        const uniqueMaterials = [
          ...new Set(res.data.map((p) => p.material).filter(Boolean)),
        ];
        const uniqueBrands = [
          ...new Set(res.data.map((p) => p.brand).filter(Boolean)),
        ];

        setCategories(uniqueCategories);
        setMaterials(uniqueMaterials);
        setBrands(uniqueBrands);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category),
      );
    }

    if (selectedMaterials.length > 0) {
      filtered = filtered.filter((p) => selectedMaterials.includes(p.material));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    if (priceMin) {
      filtered = filtered.filter((p) => p.price >= Number(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((p) => p.price <= Number(priceMax));
    }

    if (selectedRating > 0) {
      filtered = filtered.filter(
        (p) => (p.averageRating || 0) >= selectedRating,
      );
    }

    setFilteredProducts(filtered);
  }, [
    selectedCategories,
    selectedMaterials,
    selectedBrands,
    priceMin,
    priceMax,
    selectedRating,
    products,
  ]);

  const changeQty = (id, val) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + val),
    }));
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    const guestId = localStorage.getItem("guestId");
    await axios.post(`${API_URL}/cart/add`, {
      guestId,
      product: {
        productId: item._id,
        name: item.name,
        price: item.price,
        image: Array.isArray(item.image) ? item.image[0] : item.image,
        quantity: qty[item._id] || 1,
      },
    });
    await fetchCart();
    setShowCart(true);
  };

  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setSelectedRating(0);
    setPriceMin("");
    setPriceMax("");
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const getSortedProducts = () => {
    let sorted = [...filteredProducts];
    switch (sort) {
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
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  const getSortLabel = () => {
    const labels = {
      popular: "Popular",
      newest: "Newest",
      "price-low-high": "Price: Low to High",
      "price-high-low": "Price: High to Low",
      rating: "Customer Rating",
    };
    return labels[sort] || "Popular";
  };

  return (
    <>
      <Header />

      <div className="product-background lexend px-3 py-5">
        <Container className="product-page">
          <div className="top-bar">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-secondary"
                  className="mobile-filter-btn"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <FaSlidersH /> Filters
                </Button>
              </div>

              <div className="d-flex align-items-center gap-3">
                <span className="sort-label">Sort by:</span>
                <Dropdown>
                  <Dropdown.Toggle className="sort-btn">
                    {getSortLabel()}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSort("popular")}>
                      Popular
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("newest")}>
                      Newest
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("price-low-high")}>
                      Price: Low to High
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("price-high-low")}>
                      Price: High to Low
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSort("rating")}>
                      Customer Rating
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>

          <Row className="g-4">
            {/* Filters Sidebar */}
            <Col lg={3} className="d-none">
              <div className="filters-sidebar">
                <div className="filter-header">
                  <h5>Filter By</h5>
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="clear-all-btn"
                  >
                    Clear All
                  </Button>
                </div>

                {categories.length > 0 && (
                  <div className="filter-group">
                    <h6>Categories</h6>
                    <div className="filter-options">
                      {categories.map((cat) => (
                        <Form.Check
                          key={cat}
                          type="checkbox"
                          label={`${cat} (${products.filter((p) => p.category === cat).length})`}
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="filter-group">
                  <h6>Price</h6>
                  <div className="price-inputs">
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <span>to</span>
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                </div>

                {materials.length > 0 && (
                  <div className="filter-group">
                    <h6>Material</h6>
                    <div className="filter-options">
                      {materials.slice(0, 5).map((mat) => (
                        <Form.Check
                          key={mat}
                          type="checkbox"
                          label={`${mat} (${products.filter((p) => p.material === mat).length})`}
                          checked={selectedMaterials.includes(mat)}
                          onChange={() => handleMaterialChange(mat)}
                        />
                      ))}
                      {materials.length > 5 && (
                        <Button variant="link" size="sm" className="view-more">
                          + View more
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {brands.length > 0 && (
                  <div className="filter-group">
                    <h6>Brand</h6>
                    <div className="filter-options">
                      {brands.slice(0, 5).map((brand) => (
                        <Form.Check
                          key={brand}
                          type="checkbox"
                          label={`${brand} (${products.filter((p) => p.brand === brand).length})`}
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                        />
                      ))}
                      {brands.length > 5 && (
                        <Button variant="link" size="sm" className="view-more">
                          + View more
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="filter-group">
                  <h6>Rating</h6>
                  <div className="rating-options">
                    {[4, 3, 2, 1].map((rating) => (
                      <Form.Check
                        key={rating}
                        type="radio"
                        name="rating"
                        label={
                          <span className="rating-label">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                color={i < rating ? "#ffc107" : "#e4e5e9"}
                                size={14}
                              />
                            ))}
                            <span>& up</span>
                          </span>
                        }
                        checked={selectedRating === rating}
                        onChange={() =>
                          setSelectedRating(
                            rating === selectedRating ? 0 : rating,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Col>

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
                       className="text-dark text-decoration-none"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      ✘
                    </Button>
                  </div>
                  <div className="drawer-body">
                    <div className="filter-group">
                      <h6>Categories</h6>
                      {categories.map((cat) => (
                        <Form.Check
                          key={cat}
                          type="checkbox"
                          label={cat}
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                        />
                      ))}
                    </div>
                    <div className="filter-group">
                      <h6>Price</h6>
                      <div className="price-inputs">
                        <Form.Control
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                        />
                        <span>to</span>
                        <Form.Control
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="drawer-footer">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button
                      variant="outline-dark"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <Col lg={12}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                  <p className="mt-3">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No products found</h5>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <Row className="g-4 text-center">
                  {sortedProducts.map((item) => {
                    const isInWishlist = wishlist.includes(item._id);
                    return (
                      <Col key={item._id} xs={6} md={4} lg={3}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            className=""
                            onClick={() => navigate(`/product/${item._id}`)}
                          >
                            <div className="product-image-wrapper">
                              <Card.Img
                                className="product-card"
                                src={getPrimaryImageUrl(item.image)}
                                onError={(e) =>
                                  (e.target.src = "/images/placeholder.png")
                                }
                              />
                              <div
                                className="wishlist-btn"
                                onClick={(e) => toggleWishlist(e, item._id)}
                              >
                                {isInWishlist ? (
                                  <FaHeart color="#e74c3c" />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </div>
                            </div>
                            <Card.Body>
                              <div className="product-brand">
                                {item.brand || "Brand Name"}
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
                              </div>
                              <div className="product-price">
                                ₹{item.price.toLocaleString()}
                              </div>
                              <Button
                                className="add-to-cart-btn"
                                onClick={(e) => handleAddToCart(e, item)}
                              >
                                <FaShoppingCart /> Add to Cart
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
      <Details />

      <Footer />
    </>
  );
};

export default Grid;