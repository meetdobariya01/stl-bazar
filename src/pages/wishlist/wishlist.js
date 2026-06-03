import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartBroken, FaTrash, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./wishlist.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";

const API_URL = process.env.REACT_APP_API_URL;
// ✅ USE VENDOR BACKEND URL FOR IMAGES
const VENDOR_BACKEND_URL = "https://api.brandelvendor.starlighttechlabsindia.com";

// ✅ FIXED: Format image using VENDOR backend
const formatImage = (image) => {
  if (!image) return "/images/placeholder.png";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads")) return `${VENDOR_BACKEND_URL}${image}`;
  return `${image}`;
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchCart, setShowCart } = useCart();
  const navigate = useNavigate();

  const guestId = localStorage.getItem("guestId");

  const fetchWishlist = async () => {
    if (!guestId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/wishlist/${guestId}`);
      setWishlist(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/remove`, {
        data: { guestId, productId },
      });
      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const addToCart = async (item) => {
    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        },
      });
      await fetchCart();
      setShowCart(true);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  return (
    <div>
      <Header />

      <Container className="py-5 lexend">
        <motion.h2
          className="text-center fw-bold mb-4 lexend"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ❤️ My Wishlist
        </motion.h2>

        {loading ? (
          <p className="text-center mt-5">Loading wishlist...</p>
        ) : (
          <AnimatePresence>
            {wishlist.length === 0 ? (
              <motion.div
                className="text-center py-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaHeartBroken size={60} className="text-danger mb-3" />
                <h4 className="funnel-sans">Your wishlist is empty</h4>
                <p className="funnel-sans">
                  Add items you love to see them here.
                </p>
              </motion.div>
            ) : (
              <div className="wishlist-wrapper">
                <div className="wishlist-top">
                  <div>
                    <h1 className="wishlist-main-title funnel-sans">
                      My Wishlist <span>({wishlist.length})</span>
                    </h1>

                    <p className="wishlist-subtitle funnel-sans">
                      Items you love, all in one place.
                    </p>
                  </div>
                </div>

                <Row className="g-4">
                  <Col lg={8}>
                    {wishlist.map((item) => (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="wishlist-item-card"
                      >
                        <Row className="align-items-center">
                          <Col md={3}>
                            <div
                              className="wishlist-product-image"
                              onClick={() =>
                                navigate(`/product/${item.productId}`)
                              }
                            >
                              <img
                                src={formatImage(item.image)}
                                alt={item.name}
                                onError={(e) => {
                                  e.target.src = "/images/placeholder.png";
                                }}
                              />
                            </div>
                          </Col>

                          <Col md={5}>
                            <div className="wishlist-product-content">
                              <h3
                                onClick={() =>
                                  navigate(`/product/${item.productId}`)
                                }
                              >
                                {item.name}
                              </h3>

                              <p className="wishlist-brand">
                                Premium Home Decor
                              </p>

                              <h4>₹{item.price}</h4>

                              <div className="wishlist-meta">
                                <span>Handcrafted</span>
                                <span>Premium Quality</span>
                              </div>

                              <div className="wishlist-stock">
                                <span className="stock-dot"></span>
                                In stock
                              </div>
                            </div>
                          </Col>

                          <Col md={4}>
                            <div className="wishlist-action-area">
                              <button
                                className="wishlist-remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(item.productId);
                                }}
                              >
                                <FaTrash />
                              </button>

                              <Button
                                className="wishlist-cart-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                              >
                                <FaShoppingCart className="me-2" />
                                Add to Cart
                              </Button>

                              <Button
                                className="wishlist-view-btn"
                                onClick={() =>
                                  navigate(`/product/${item.productId}`)
                                }
                              >
                                View Product
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </motion.div>
                    ))}
                  </Col>

                  <Col lg={4}>
                    <motion.div
                      className="wishlist-sidebar"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="wishlist-summary-card">
                        <h4>Wishlist Summary</h4>

                        <div className="summary-highlight">
                          <div className="summary-heart">❤</div>

                          <div>
                            <h5>{wishlist.length} Items</h5>
                            <p>All your favorite picks in one place.</p>
                          </div>
                        </div>

                        <div className="wishlist-feature">
                          <h6>Easy Access</h6>
                          <p>View and manage your saved products anytime.</p>
                        </div>

                        <div className="wishlist-feature">
                          <h6>Quick Shopping</h6>
                          <p>Add your favorite products directly to cart.</p>
                        </div>

                        <div className="wishlist-feature">
                          <h6>Premium Collection</h6>
                          <p>Save luxury handcrafted products you love.</p>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                </Row>
              </div>
            )}
          </AnimatePresence>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default Wishlist;