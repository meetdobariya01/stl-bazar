import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// 🔹 Add the Backend URL where images are served
const BACKEND_URL = "http://localhost:9000";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const guestId = localStorage.getItem("guestId");

  // 🔹 Helper to handle dual URL logic (Admin vs Basic)
  // ================= IMAGE PATH LOGIC =================
const formatImagePath = (path) => {
  // 🔹 Handle array input
  if (Array.isArray(path)) {
    path = path[0]; // Take first image if it's an array
  }
  
  if (!path) return "/images/default-product.png";

  // 1. Full External URL (e.g., Cloudinary or S3)
  if (path.startsWith("http")) return path;

  // 2. Admin/Vendor Uploads (e.g., path starts with /uploads)
  if (path.startsWith("/uploads")) {
    return `${BACKEND_URL}${path}`;
  }

  // 3. Basic/Preset Local Images
  if (path.startsWith("/images")) {
    return `${path}`;
  }

  // Fallback: Default to backend URL + path
  return `${BACKEND_URL}${path}`;
};

  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  const updateQty = async (item, type) => {
    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: type === "inc" ? 1 : -1,
        },
      });

      fetchCart();
    } catch (err) {
      console.error("Update qty error:", err.response?.data || err.message);
    }
  };


  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);
      fetchCart();
    } catch (err) {
      console.error("Remove item error:", err.message);
    }
  };

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <Header />
      <Container className="py-5">
        <motion.h2
          className="fw-bold text-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🛒 Your Shopping Cart
        </motion.h2>

        <Row className="g-4">
          <Col lg={8}>
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <motion.div className="text-center py-5">
                  <FaShoppingBag size={80} className="text-muted mb-3" />
                  <h4 className="fw-bold">Your cart is empty</h4>
                  <Button as={NavLink} to="/" variant="dark">Continue Shopping</Button>
                </motion.div>
              ) : (
                cart.items.map((item) => (
                  <motion.div
                    key={item.productId}
                    className="mb-3"
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="shadow-sm rounded-4 border-0 p-2">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs={4} md={3}>
                            {/* 🔹 FIXED IMAGE SRC HERE */}
                            <img
                              src={formatImagePath(item.image)}
                              alt={item.name}
                              className="img-fluid rounded shadow-sm"
                              style={{ height: "100px", width: "100%", objectFit: "cover" }}
                              onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                            />
                          </Col>

                          <Col xs={8} md={9}>
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="fw-bold mb-1">{item.name}</h6>
                              <Button
                                variant="link"
                                className="text-danger p-0"
                                onClick={() => removeItem(item.productId)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                            <p className="text-muted mb-2">₹{item.price}</p>

                            <div className="d-flex align-items-center">
                              <Button
                                variant="outline-dark"
                                size="sm"
                                className="rounded-circle"
                                onClick={() => updateQty(item, "dec")}
                              >
                                <FaMinus size={10} />
                              </Button>

                              <span className="mx-3 fw-bold">{item.quantity}</span>
                              <Button
                                variant="outline-dark"
                                size="sm"
                                className="rounded-circle"
                                onClick={() => updateQty(item, "inc")}
                              >
                                <FaPlus size={10} />
                              </Button>
                              <span className="ms-auto fw-bold text-dark">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Col>

          <Col lg={4}>
            <Card className="p-4 shadow-sm border-0 rounded-4">
              <h5 className="fw-bold mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Total</span>
                <span className="fw-bold fs-5">₹{subtotal}</span>
              </div>
              <Button as={NavLink} to="/checkout" variant="dark" className="w-100 py-2 rounded-3">
                Proceed to Checkout
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Cart;