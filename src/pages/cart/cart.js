import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL;

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const guestId = localStorage.getItem("guestId");

  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  const updateQty = async (productId, type) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

    if (type === "dec" && item.quantity === 1) {
      await removeItem(productId);
      return;
    }

    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          ...item,
          quantity: type === "inc" ? 1 : -1,
        },
      });
      await fetchCart();
    } catch (err) {
      console.error("Update quantity error", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error("Remove item error", err);
    }
  };

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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
          {/* Cart Items */}
          <Col lg={8}>
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <motion.div
                  className="text-center py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaShoppingBag size={80} className="text-muted mb-3" />
                  <h4 className="fw-bold">Your cart is empty</h4>
                  <p>Add items to continue shopping!</p>
                  <Button as={NavLink} to="/" variant="dark" className="mt-3">
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                cart.items.map((item) => (
                  <motion.div
                    key={item.productId}
                    className="mb-3"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="shadow-sm rounded-4 border-0 hover-shadow">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs={4} md={3}>
                            <img
                              src={item.image}
                              className="img-fluid rounded-3"
                              alt={item.name}
                            />
                          </Col>

                          <Col xs={8} md={5} className="my-2 my-md-0">
                            <h6 className="fw-semibold">{item.name}</h6>
                            <p className="text-muted mb-0">₹{item.price}</p>
                          </Col>

                          <Col
                            xs={6}
                            md={2}
                            className="d-flex align-items-center justify-content-start gap-2"
                          >
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => updateQty(item.productId, "dec")}
                              disabled={item.quantity === 1}
                            >
                              <FaMinus />
                            </Button>
                            <span className="fw-bold">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => updateQty(item.productId, "inc")}
                            >
                              <FaPlus />
                            </Button>
                          </Col>

                          <Col
                            xs={6}
                            md={2}
                            className="text-end d-flex flex-column align-items-end justify-content-center"
                          >
                            <h6 className="fw-bold mb-1">
                              ₹{item.price * item.quantity}
                            </h6>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                            >
                              <FaTrash />
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="shadow-sm rounded-4 border-0 p-3">
              <Card.Body>
                <h5 className="fw-bold mb-3">Order Summary</h5>

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>₹{subtotal}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <strong>Free</strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold mb-4">
                  <span>Total</span>
                  <strong>₹{subtotal}</strong>
                </div>

                <Button
                  as={NavLink}
                  to="/checkout"
                  variant="dark"
                  className="w-100 rounded-pill mb-2"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  as={NavLink}
                  to="/"
                  variant="outline-dark"
                  className="w-100 rounded-pill"
                >
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default Cart;
