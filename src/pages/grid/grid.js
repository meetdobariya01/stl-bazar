import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";
import "./grid.css";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = "http://localhost:9000";

const Grid = () => {
  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName || "");
  const navigate = useNavigate();

  const { setShowCart, fetchCart } = useCart();

  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [sort, setSort] = useState("Sort By");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, { params: { company: decodedName } })
      .then((res) => {
        console.log("Products loaded:", res.data); // Debug log
        setProducts(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  // ✅ IMPROVED: Get primary image for card display
  const getPrimaryImageUrl = (image) => {
    if (!image) return "/images/placeholder.png";

    let img = image;

    // If array → take first image
    if (Array.isArray(image)) {
      if (image.length === 0) return "/images/placeholder.png";
      img = image[0];
    }

    if (!img) return "/images/placeholder.png";

    // Convert to string if needed
    const imgStr = String(img);

    // Already full URL
    if (imgStr.startsWith("http")) {
      return imgStr;
    }

    // Backend uploaded image (starts with /uploads)
    if (imgStr.startsWith("/uploads")) {
      return `${BACKEND_URL}${imgStr}`;
    }

    // Local images from public folder
    if (imgStr.startsWith("/images")) {
      // For local public folder images
      return imgStr;
    }

    // Fallback: try with backend URL
    return `${BACKEND_URL}${imgStr}`;
  };

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
        image: Array.isArray(item.image) ? item.image[0] : item.image, // Send first image for cart
        quantity: qty[item._id] || 1,
      },
    });

    await fetchCart();
    setShowCart(true);
  };

  // Sorting logic
  const getSortedProducts = () => {
    let sorted = [...products];
    
    switch(sort) {
      case "Price (Low → High)":
        return sorted.sort((a, b) => a.price - b.price);
      case "Price (High → Low)":
        return sorted.sort((a, b) => b.price - a.price);
      case "Name (A → Z)":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "Name (Z → A)":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <>
      <Header />
      <div className="hero-banner">
        <img
          src="/images/product-banner.png"
          alt="Banner"
          className="banner-img"
        />
      </div>
      <Details />
      <div className="product-background">
        <Container className="product-page">
          {/* TOP BAR */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Products ({products.length})</h5>

            <Dropdown>
              <Dropdown.Toggle className="sort-btn">{sort}</Dropdown.Toggle>
              <Dropdown.Menu>
                {[
                  "Price (Low → High)",
                  "Price (High → Low)",
                  "Name (A → Z)",
                  "Name (Z → A)",
                ].map((s) => (
                  <Dropdown.Item key={s} onClick={() => setSort(s)}>
                    {s}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* PRODUCTS */}
          {loading ? (
            <p className="text-center mt-5">Loading products...</p>
          ) : (
            <Row className="g-4">
              {sortedProducts.map((item) => (
                <Col key={item._id} xs={6} sm={6} md={4} lg={3}>
                  <motion.div whileHover={{ y: -8 }}>
                    <Card
                      className="product-grid-card"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      <Card.Img
                        variant="top"
                        src={getPrimaryImageUrl(item.image)}
                        onError={(e) => {
                          e.target.src = "/images/placeholder.png";
                        }}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      
                      {/* Show multiple image indicator */}
                      {/* {Array.isArray(item.image) && item.image.length > 1 && (
                        <div className="multi-image-badge">
                          {item.image.length} images
                        </div>
                      )} */}

                      <Card.Body className="lexend">
                        <h6>{item.name}</h6>

                        <div className="rating">
                          {[...Array(Math.round(item.averageRating || 0))].map(
                            (_, i) => (
                              <FaStar key={i} color="#ffc107" />
                            ),
                          )}
                        </div>

                        <div className="price">₹{item.price}</div>

                        <div className="qty-cart">
                          <div className="qty">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeQty(item._id, -1);
                              }}
                            >
                              −
                            </button>
                            <span>{qty[item._id] || 1}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeQty(item._id, 1);
                              }}
                            >
                              +
                            </button>
                          </div>

                          <Button
                            className="cart-btn-grid"
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            <FaShoppingCart />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default Grid;