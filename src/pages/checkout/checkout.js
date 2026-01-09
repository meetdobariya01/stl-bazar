  import React, { useState, useEffect } from "react";
  import { Container, Row, Col, Card, Form, Button, Image } from "react-bootstrap";
  import { motion } from "framer-motion";
  import { FaCreditCard, FaMoneyBillWave, FaTrash } from "react-icons/fa";
  import axios from "axios";

  import Footer from "../../components/footer/footer";
  import Header from "../../components/header/header";

  const API_URL = process.env.REACT_APP_API_URL;

  const Checkout = () => {
    const [payment, setPayment] = useState("card");
    const [shipping, setShipping] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });

    const [cart, setCart] = useState({ items: [] });

    const guestId = localStorage.getItem("guestId");

    // Fetch cart items
    const fetchCart = async () => {
      if (!guestId) return;
      try {
        const res = await axios.get(`${API_URL}/cart/${guestId}`);
        setCart(res.data);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };

    useEffect(() => {
      fetchCart();
    }, [guestId]);

    // Handle input changes
    const handleChange = (e) => {
      setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    // Calculate totals
    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    // Place order
    const placeOrder = async () => {
      try {
        if (!guestId || cart.items.length === 0) return alert("Cart is empty");

        // Validate required fields
        const required = ["name", "phone", "email", "address", "city", "state", "pincode"];
        for (let field of required) {
          if (!shipping[field]) return alert(`Please fill ${field}`);
        }

        const res = await axios.post(`${API_URL}/order/place`, {
          guestId,
          shippingAddress: shipping,
          paymentMethod: payment,
        });

        alert("Order placed successfully! Order ID: " + res.data.orderId);

        // Clear cart locally
        setCart({ items: [] });
        localStorage.removeItem("guestId");
      } catch (err) {
        console.error(err);
        alert("Failed to place order");
      }
    };

    return (
      <div>
        <Header />

        <Container className="py-5">
          <motion.h2
            className="fw-bold text-center mb-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Checkout
          </motion.h2>

          {/* CART ITEMS */}
          {cart.items.length > 0 && (
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm rounded-4 border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-3 fs-3">Your Cart</h5>
                    {cart.items.map((item) => (
                      <div
                        key={item.productId}
                        className="d-flex align-items-center mb-3 p-2 border-bottom"
                      >
                        <Image
                          src={item.image}
                          rounded
                          style={{ width: 60, height: 60, objectFit: "cover" }}
                          className="me-3"
                        />
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-bold">{item.name}</p>
                          <small>
                            ₹{item.price} × {item.quantity}
                          </small>
                        </div>
                        <div className="fw-bold">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row className="g-4">
            {/* LEFT SIDE: Shipping & Payment */}
            <Col lg={8}>
              {/* SHIPPING DETAILS */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="shadow-sm rounded-4 mb-4 border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-4 fs-3">Shipping Details</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Control
                          name="name"
                          value={shipping.name}
                          onChange={handleChange}
                          placeholder="Full Name"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          name="phone"
                          value={shipping.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={12}>
                        <Form.Control
                          name="email"
                          value={shipping.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={12}>
                        <Form.Control
                          name="address"
                          value={shipping.address}
                          onChange={handleChange}
                          placeholder="Street Address"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          name="city"
                          value={shipping.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          name="state"
                          value={shipping.state}
                          onChange={handleChange}
                          placeholder="State"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          name="pincode"
                          value={shipping.pincode}
                          onChange={handleChange}
                          placeholder="Zip Code"
                          className="p-3 shadow-sm rounded-3 border-0"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </motion.div>

              {/* PAYMENT METHOD */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-sm rounded-4 border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-4 fs-3">Payment Method</h5>
                    <Form.Check
                      type="radio"
                      label={<span><FaCreditCard className="me-2" />Credit / Debit Card</span>}
                      name="payment"
                      checked={payment === "card"}
                      onChange={() => setPayment("card")}
                      className="mb-3 p-2 shadow-sm rounded-3"
                    />
                    <Form.Check
                      type="radio"
                      label={<span><FaMoneyBillWave className="me-2" />Cash on Delivery</span>}
                      name="payment"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                      className="p-2 shadow-sm rounded-3"
                    />
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            {/* RIGHT SIDE: Order Summary */}
            <Col lg={4}>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="shadow-sm rounded-4 border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-4 fs-3">Order Summary</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping</span>
                      <span className="text-success">Free</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold mb-4 fs-5">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                    <Button
                      variant="dark"
                      className="w-100 rounded-pill py-3 fw-bold shadow"
                      onClick={placeOrder}
                    >
                      Place Order
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>

        <Footer />
      </div>
    );
  };

  export default Checkout;
