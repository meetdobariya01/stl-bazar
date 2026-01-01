import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Namkeen Pack",
      price: 299,
      qty: 1,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 2,
      name: "Spicy Mix Combo",
      price: 399,
      qty: 2,
      image: "https://via.placeholder.com/300",
    },
  ]);

  const updateQty = (id, type) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1),
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <div>
      {/* Header Section */}
      <Header />

      <Container className="py-5 funnel-sans">
        <motion.h2
          className="fw-bold text-center mb-5 lexend"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🛒 Shopping Cart
        </motion.h2>

        <Row className="g-4">
          {/* CART ITEMS */}
          <Col lg={8}>
            <AnimatePresence>
              {cartItems.length === 0 ? (
                <motion.div
                  className="text-center py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaShoppingBag size={60} className="text-muted mb-3" />
                  <h4 className="fw-bold lexend">Your cart is empty</h4>
                  <p>Add products to continue shopping</p>
                </motion.div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-3"
                  >
                    <Card className="border-0 shadow rounded-4">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs={4} md={3}>
                            <img
                              src={item.image}
                              alt=""
                              className="img-fluid rounded-3"
                            />
                          </Col>

                          <Col xs={8} sm={5}>
                            <h6 className="fw-semibold lexend mb-1">
                              {item.name}
                            </h6>
                            <p className="text-muted mb-0">₹{item.price}</p>
                          </Col>

                          <Col xs={6} sm={2}>
                            <div className="d-flex align-items-center justify-content-start justify-content-sm-center gap-2">
                              <Button
                                size="sm"
                                variant="outline-dark"
                                onClick={() => updateQty(item.id, "dec")}
                              >
                                <FaMinus />
                              </Button>

                              <span className="fw-bold">{item.qty}</span>

                              <Button
                                size="sm"
                                variant="outline-dark"
                                onClick={() => updateQty(item.id, "inc")}
                              >
                                <FaPlus />
                              </Button>
                            </div>
                          </Col>

                          <Col xs={6} sm={2} className="text-end">
                            <h6 className="fw-bold mb-1">
                              ₹{item.price * item.qty}
                            </h6>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeItem(item.id)}
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

          {/* SUMMARY */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow rounded-4 ">
                <Card.Body>
                  <h5 className="fw-bold mb-3 lexend">Order Summary</h5>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fw-bold mb-4">
                    <span>Total</span>
                    <span>₹{subtotal}</span>
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
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Cart;
