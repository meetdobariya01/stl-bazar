import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const guestId = localStorage.getItem("guestId");

  // 🔹 FETCH CART
  const fetchCart = async () => {
    if (!guestId) return;

    try {
      console.log("Fetching cart:", `${API_URL}/cart/${guestId}`);

      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error(
        "Cart fetch error:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  // 🔹 UPDATE QUANTITY
  const updateQty = async (productId, type) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        productId,
        quantity: type === "inc" ? 1 : -1,
      });

      fetchCart();
    } catch (err) {
      console.error(
        "Update quantity error:",
        err.response?.data || err.message
      );
    }
  };

  // 🔹 REMOVE ITEM
  const removeItem = async (productId) => {
    try {
      await axios.delete(
        `${API_URL}/cart/remove/${guestId}/${productId}`
      );
      fetchCart();
    } catch (err) {
      console.error(
        "Remove item error:",
        err.response?.data || err.message
      );
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
          <Col lg={8}>
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <motion.div className="text-center py-5">
                  <FaShoppingBag size={80} className="text-muted mb-3" />
                  <h4 className="fw-bold">Your cart is empty</h4>
                  <Button as={NavLink} to="/" variant="dark">
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                cart.items.map((item) => (
                  <motion.div key={item.productId} className="mb-3">
                    <Card className="shadow-sm rounded-4 border-0">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs={4}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded"
                            />
                          </Col>

                          <Col xs={8}>
                            <h6>{item.name}</h6>
                            <p>₹{item.price}</p>

                            <Button
                              size="sm"
                              onClick={() =>
                                updateQty(item.productId, "dec")
                              }
                            >
                              <FaMinus />
                            </Button>

                            <span className="mx-2">
                              {item.quantity}
                            </span>

                            <Button
                              size="sm"
                              onClick={() =>
                                updateQty(item.productId, "inc")
                              }
                            >
                              <FaPlus />
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              className="ms-3"
                              onClick={() =>
                                removeItem(item.productId)
                              }
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

          <Col lg={4}>
            <Card className="p-3">
              <h5>Order Summary</h5>
              <hr />
              <p>Total: ₹{subtotal}</p>

              <Button as={NavLink} to="/checkout" variant="dark">
                Checkout
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
