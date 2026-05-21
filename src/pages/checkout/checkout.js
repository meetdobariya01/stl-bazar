import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaLock,
} from "react-icons/fa";
import axios from "axios";

import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

import "./checkout.css";

const API_URL = process.env.REACT_APP_API_URL;

const Checkout = () => {
  const [payment, setPayment] = useState("upi");

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

  // FETCH CART
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

  // HANDLE INPUT
  const handleChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value,
    });
  };

  // TOTALS
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shippingCost = subtotal > 1499 ? 0 : 99;
  const total = subtotal + shippingCost;

  // PLACE ORDER
  const placeOrder = async () => {
    try {
      if (!guestId || cart.items.length === 0) return alert("Cart is empty");

      const required = [
        "name",
        "phone",
        "email",
        "address",
        "city",
        "state",
        "pincode",
      ];

      for (let field of required) {
        if (!shipping[field]) return alert(`Please fill ${field}`);
      }

      const res = await axios.post(`${API_URL}/order/place`, {
        guestId,
        shippingAddress: shipping,
        paymentMethod: payment,
      });

      alert("Order placed successfully! Order ID: " + res.data.orderId);

      setCart({ items: [] });

      localStorage.removeItem("guestId");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };
  const [shippingMethod, setShippingMethod] = useState("standard");

  return (
    <>
      <Header />

      <section className="checkout-page lexend">
        <Container>
          {/* TOP */}
          <motion.div
            className="checkout-top"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="funnel-sans">Checkout</h2>

            {/* <div className="checkout-steps">
              <span>Cart</span>
              <span>›</span>
              <span className="active">Information</span>
              <span>›</span>
              <span>Shipping</span>
              <span>›</span>
              <span>Payment</span>
            </div> */}
          </motion.div>

          <Row className="g-4">
            {/* LEFT */}
            <Col lg={7}>
              {/* CONTACT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="checkout-card border-0">
                  <Card.Body>
                    <div className="section-head">
                      <h4 className="funnel-sans">1. Contact Information</h4>

                      <p>
                        Already have an account?{" "}
                        <NavLink to="/login" className="login-link">
                          Log in
                        </NavLink>
                      </p>
                    </div>

                    <Form.Control
                      type="email"
                      name="email"
                      value={shipping.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="custom-input"
                    />

                    <Form.Check
                      type="checkbox"
                      label="Keep me updated on news and exclusive offers"
                      className="mt-3"
                    />
                  </Card.Body>
                </Card>
              </motion.div>

              {/* SHIPPING */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="checkout-card border-0 mt-4">
                  <Card.Body>
                    <h4 className="section-title funnel-sans">
                      2. Shipping Address
                    </h4>

                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Label>Full Name *</Form.Label>

                        <Form.Control
                          name="name"
                          value={shipping.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="custom-input"
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label>Phone Number *</Form.Label>

                        <Form.Control
                          name="phone"
                          value={shipping.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className="custom-input"
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label>Address *</Form.Label>

                        <Form.Control
                          name="address"
                          value={shipping.address}
                          onChange={handleChange}
                          placeholder="House no, Building, Street"
                          className="custom-input"
                        />
                      </Col>

                      <Col md={12}>
                        <Form.Label>Address Line 2</Form.Label>

                        <Form.Control
                          placeholder="Apartment, suite, unit, etc."
                          className="custom-input"
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label>City *</Form.Label>

                        <Form.Control
                          name="city"
                          value={shipping.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                          className="custom-input"
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label>State *</Form.Label>

                        <Form.Control
                          name="state"
                          value={shipping.state}
                          onChange={handleChange}
                          placeholder="Enter your state"
                          className="custom-input"
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label>Pin Code *</Form.Label>

                        <Form.Control
                          name="pincode"
                          value={shipping.pincode}
                          onChange={handleChange}
                          placeholder="Enter pin code"
                          className="custom-input"
                        />
                      </Col>
                    </Row>

                    {/* <Form.Check
                      type="checkbox"
                      label="Save this address for next time."
                      className="mt-3"
                    /> */}
                  </Card.Body>
                </Card>
              </motion.div>

              {/* SHIPPING METHOD */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="checkout-card border-0 mt-4">
                  <Card.Body>
                    <h4 className="section-title funnel-sans">
                      3. Shipping Method
                    </h4>

                    {/* STANDARD */}
                    <div
                      className={`method-box ${
                        shippingMethod === "standard" ? "active-method" : ""
                      }`}
                      onClick={() => setShippingMethod("standard")}
                    >
                      <div>
                        <h6>Standard Shipping</h6>
                        <p>Delivery in 3 - 5 business days</p>
                      </div>

                      <strong>FREE</strong>
                    </div>

                    {/* EXPRESS */}
                    <div
                      className={`method-box ${
                        shippingMethod === "express" ? "active-method" : ""
                      }`}
                      onClick={() => setShippingMethod("express")}
                    >
                      <div>
                        <h6>Express Shipping</h6>
                        <p>Delivery in 1 - 2 business days</p>
                      </div>

                      <strong>₹199</strong>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>

              {/* PAYMENT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="checkout-card border-0 mt-4">
                  <Card.Body>
                    <h4 className="section-title funnel-sans">
                      4. Payment Method
                    </h4>

                    <p className="payment-note">
                      All transactions are secure and encrypted.
                    </p>

                    <div
                      className={`payment-option ${
                        payment === "upi" ? "active-pay" : ""
                      }`}
                      onClick={() => setPayment("upi")}
                    >
                      <div>
                        <Form.Check
                          checked={payment === "upi"}
                          readOnly
                          type="radio"
                          label="UPI / Net Banking / Wallets"
                        />
                      </div>

                      <div className="payment-icons">
                        <span>UPI</span>
                        <span>Paytm</span>
                        <span>GPay</span>
                      </div>
                    </div>

                    <div
                      className={`payment-option ${
                        payment === "card" ? "active-pay" : ""
                      }`}
                      onClick={() => setPayment("card")}
                    >
                      <div>
                        <Form.Check
                          checked={payment === "card"}
                          readOnly
                          type="radio"
                          label="Credit / Debit Card"
                        />
                      </div>

                      <div className="payment-icons">
                        <span>VISA</span>
                        <span>Master</span>
                      </div>
                    </div>

                    <div
                      className={`payment-option ${
                        payment === "cod" ? "active-pay" : ""
                      }`}
                      onClick={() => setPayment("cod")}
                    >
                      <div>
                        <Form.Check
                          checked={payment === "cod"}
                          readOnly
                          type="radio"
                          label="Cash on Delivery (COD)"
                        />
                      </div>
                    </div>

                    <Button className="payment-btn" onClick={placeOrder}>
                      Continue to Payment
                    </Button>

                    <div className="secure-note">
                      <FaLock />
                      <span>Your data is safe and secure with us.</span>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            {/* RIGHT */}
            <Col lg={5}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="summary-card border-0">
                  <Card.Body>
                    <div className="summary-head">
                      <h3>Order Summary</h3>

                      <span>Edit Cart</span>
                    </div>

                    {cart.items.map((item) => (
                      <div key={item.productId} className="summary-item">
                        <div className="summary-img">
                          <Image src={item.image} />
                          <span>{item.quantity}</span>
                        </div>

                        <div className="summary-info">
                          <h5>{item.name}</h5>
                          <p>₹{item.price}</p>
                        </div>
                      </div>
                    ))}

                    <hr />

                    <div className="summary-row">
                      <span>Subtotal ({cart.items.length} items)</span>

                      <span>₹{subtotal}</span>
                    </div>

                    <div className="summary-row">
                      <span>Shipping</span>

                      <span className="free">
                        {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                      </span>
                    </div>

                    <div className="summary-row">
                      <span>Shipping Discount</span>

                      <span className="discount">-₹99</span>
                    </div>

                    <div className="summary-total">
                      <div>
                        <h4>Total</h4>
                        <p>Inclusive of all taxes</p>
                      </div>

                      <h2>₹{total}</h2>
                    </div>

                    <div className="shipping-save">
                      🎉 You saved ₹99 on shipping!
                    </div>

                    <div className="features-row">
                      <div>
                        <FaShieldAlt />
                        <span>Secure Payments</span>
                      </div>

                      <div>
                        <FaUndo />
                        <span>Easy Returns</span>
                      </div>

                      <div>
                        <FaTruck />
                        <span>Fast Delivery</span>
                      </div>
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

export default Checkout;
