import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingBag,
  FaShieldAlt,
  FaTag,
} from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const guestId = localStorage.getItem("guestId");

  // FETCH CART
  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  // UPDATE QTY
  const updateQty = async (productId, type) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

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
      console.error(err.response?.data || err.message);
    }
  };

  // REMOVE ITEM
  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);

      fetchCart();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shipping = subtotal > 1499 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <>
      <Header />

      <section className="cart-page lexend">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cart-top"
          >
            <div>
              <h2 className="funnel-sans">Your Cart ({cart.items.length})</h2>
              <p>Review your items and proceed to checkout.</p>
            </div>

            <NavLink to="/" className="continue-shopping">
              ← Continue Shopping
            </NavLink>
          </motion.div>

          <Row className="g-4">
            {/* LEFT */}
            <Col lg={8}>
              <AnimatePresence>
                {cart.items.length === 0 ? (
                  <motion.div
                    className="empty-cart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FaShoppingBag size={70} />
                    <h4>Your Cart is Empty</h4>

                    <Button as={NavLink} to="/" className="shop-btn">
                      Continue Shopping
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {cart.items.map((item, index) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="cart-card"
                      >
                        <Card className="border-0">
                          <Card.Body>
                            <Row className="align-items-center">
                              {/* IMAGE */}
                              <Col md={3} xs={4}>
                                <div className="cart-img">
                                  <img src={item.image} alt={item.name} />
                                </div>
                              </Col>

                              {/* INFO */}
                              <Col md={6} xs={8}>
                                <div className="cart-info">
                                  <h4>{item.name}</h4>

                                  <h5 className="funnel-sans">₹{item.price}</h5>

                                  <div className="product-meta">
                                    <span>Qty: {item.quantity}</span>
                                  </div>

                                  <div className="cart-actions">
                                    <button
                                      onClick={() => removeItem(item.productId)}
                                    >
                                      <FaTrash /> Remove
                                    </button>
                                  </div>
                                </div>
                              </Col>

                              {/* QTY */}
                              <Col md={3} xs={12}>
                                <div className="qty-box">
                                  <button
                                    onClick={() =>
                                      updateQty(item.productId, "dec")
                                    }
                                  >
                                    <FaMinus />
                                  </button>

                                  <span>{item.quantity}</span>

                                  <button
                                    onClick={() =>
                                      updateQty(item.productId, "inc")
                                    }
                                  >
                                    <FaPlus />
                                  </button>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    ))}

                    {/* SHIPPING BAR */}
                    <div className="shipping-box">
                      <div className="shipping-top">
                        <span>🎉 You are eligible for free shipping!</span>

                        <span>₹{subtotal} / ₹1499</span>
                      </div>

                      <ProgressBar now={(subtotal / 1499) * 100} />
                    </div>
                  </>
                )}
              </AnimatePresence>
            </Col>

            {/* RIGHT */}
            <Col lg={4}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="summary-card border-0">
                  <Card.Body>
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                      <span>Subtotal ({cart.items.length} items)</span>

                      <span>₹{subtotal}</span>
                    </div>

                    <div className="summary-row">
                      <span>Shipping</span>

                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>

                    <div className="summary-row discount">
                      <span>Shipping Discount</span>

                      <span>-₹99</span>
                    </div>

                    <hr />

                    <div className="summary-total">
                      <div>
                        <h4>Total</h4>
                        <p>Inclusive of all taxes</p>
                      </div>

                      <h2>₹{total}</h2>
                    </div>

                    <button className="coupon-btn">
                      <FaTag /> Apply Coupon
                    </button>

                    <Button
                      as={NavLink}
                      to="/checkout"
                      className="checkout-btn"
                    >
                      Proceed to Checkout
                    </Button>

                    <div className="secure-checkout">
                      <FaShieldAlt />
                      <span>Secure Checkout</span>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </>
  );
};

export default Cart;