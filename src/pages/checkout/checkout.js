import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaLock,
  FaCheckCircle,
  FaAddressCard,
  FaPlus,
} from "react-icons/fa";
import axios from "axios";

import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

import "./checkout.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

// ✅ Helper function to format prices
const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const Checkout = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Alert states
  const [addressSaveSuccess, setAddressSaveSuccess] = useState("");
  const [addressSaveError, setAddressSaveError] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

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
  const [userId, setUserId] = useState(null);

  const guestId = localStorage.getItem("guestId");

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (addressSaveSuccess) {
      const timer = setTimeout(() => setAddressSaveSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [addressSaveSuccess]);

  useEffect(() => {
    if (addressSaveError) {
      const timer = setTimeout(() => setAddressSaveError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [addressSaveError]);

  useEffect(() => {
    if (emailStatus) {
      const timer = setTimeout(() => setEmailStatus(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [emailStatus]);

  // Check if user is logged in
  useEffect(() => {
    const loggedInUserId = localStorage.getItem("userId");
    if (loggedInUserId) {
      setUserId(loggedInUserId);
    }
  }, []);

  // Fetch saved addresses when userId changes
  useEffect(() => {
    if (userId) {
      fetchSavedAddresses();
    }
  }, [userId]);

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

  // FETCH SAVED ADDRESSES
  const fetchSavedAddresses = async () => {
    if (!userId) return;
    
    setLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_URL}/addresses/${userId}`);
      if (res.data.success) {
        setSavedAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value,
    });
  };

  // SELECT SAVED ADDRESS
  const selectSavedAddress = (address) => {
    setShipping({
      name: address.address.name || address.name,
      email: address.address.email || "",
      phone: address.address.phone || "",
      address: address.address.address || "",
      city: address.address.city || "",
      state: address.address.state || "",
      pincode: address.address.pincode || "",
      country: address.address.country || "India",
    });
    setShowSavedAddresses(false);
    setAddressSaveSuccess("Address loaded successfully!");
    setTimeout(() => setAddressSaveSuccess(""), 3000);
  };

  // TOTALS with proper calculation
  const subtotal = cart.items.reduce(
    (acc, item) => acc + (item.price * item.quantity),
    0,
  );

  const shippingCost = subtotal > 1499 ? 0 : 99;
  const total = subtotal + shippingCost;

  // SAVE ADDRESS FUNCTION
  const saveAddressToDB = async () => {
    if (!userId) {
      setAddressSaveError("Please login to save address");
      return;
    }

    const required = ["name", "phone", "address", "city", "state", "pincode"];
    for (let field of required) {
      if (!shipping[field]) {
        setAddressSaveError(`Please fill ${field} field`);
        return;
      }
    }

    try {
      const response = await axios.post(`${API_URL}/addresses`, {
        userId,
        name: shipping.name,
        address: {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: shipping.country
        }
      });
      
      if (response.data.success) {
        setAddressSaveSuccess("✅ Address saved successfully!");
        // Refresh saved addresses
        await fetchSavedAddresses();
      }
      console.log("Address saved successfully");
    } catch (err) {
      console.error("Save address error:", err);
      setAddressSaveError("❌ Failed to save address. Please try again.");
    }
  };

  // Send order confirmation email
  const sendOrderEmail = async (orderId, orderDetails) => {
    try {
      setEmailStatus("sending");
      
      const emailData = {
        to: shipping.email,
        subject: `Order Confirmation - #${orderId}`,
        orderId: orderId,
        customerName: shipping.name,
        items: cart.items,
        total: total,
        shippingAddress: shipping,
        paymentMethod: payment,
        orderDate: new Date().toLocaleString()
      };

      await axios.post(`${API_URL}/order/send-confirmation`, emailData);
      
      setEmailStatus("success");
      console.log("Order confirmation email sent successfully");
    } catch (err) {
      console.error("Email sending error:", err);
      setEmailStatus("error");
    }
  };

  // PLACE ORDER
  const placeOrder = async () => {
    if (isProcessing) return;
    
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

      setIsProcessing(true);

      if (saveAddressChecked && userId) {
        await saveAddressToDB();
      }

      const res = await axios.post(`${API_URL}/order/place`, {
        guestId,
        shippingAddress: shipping,
        paymentMethod: payment,
      });

      await sendOrderEmail(res.data.orderId, {
        items: cart.items,
        total: total,
        shipping: shipping,
        paymentMethod: payment
      });

      localStorage.removeItem("guestId");
      
      navigate("/order-complete", { 
        state: { 
          orderId: res.data.orderId,
          orderDetails: {
            items: cart.items,
            total: total,
            shipping: shipping,
            paymentMethod: payment
          }
        } 
      });
      
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
      setIsProcessing(false);
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="section-title funnel-sans mb-0">
                        2. Shipping Address
                      </h4>
                      
                      <div className="d-flex gap-2">
                        {/* Show Saved Addresses Button */}
                        {userId && savedAddresses.length > 0 && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaAddressCard size={14} />
                            {showSavedAddresses ? "Hide" : "My Addresses"} ({savedAddresses.length})
                          </Button>
                        )}
                        
                        {/* Save Address Button */}
                        {userId && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={saveAddressToDB}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaPlus size={12} />
                            Save Current
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Saved Addresses List */}
                    {showSavedAddresses && (
                      <div className="saved-addresses-list mb-4">
                        <h6 className="mb-3">Select a saved address:</h6>
                        {loadingAddresses ? (
                          <div className="text-center py-3">
                            <Spinner size="sm" />
                            <span className="ms-2">Loading addresses...</span>
                          </div>
                        ) : (
                          <Row className="g-2">
                            {savedAddresses.map((addr, idx) => (
                              <Col md={6} key={addr._id || idx}>
                                <div 
                                  className="saved-address-card p-3 border rounded"
                                  onClick={() => selectSavedAddress(addr)}
                                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                                >
                                  <div className="d-flex justify-content-between">
                                    <strong>{addr.address.name || addr.name}</strong>
                                    {addr.isDefault && (
                                      <span className="badge bg-success">Default</span>
                                    )}
                                  </div>
                                  <p className="mb-1 small mt-2">
                                    {addr.address.address}<br/>
                                    {addr.address.city}, {addr.address.state} - {addr.address.pincode}<br/>
                                    📞 {addr.address.phone}
                                  </p>
                                  <small className="text-muted">
                                    Click to use this address
                                  </small>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </div>
                    )}

                    {/* Address Save Success Alert */}
                    {addressSaveSuccess && (
                      <Alert variant="success" className="py-2 mb-3" style={{ fontSize: "14px" }}>
                        <FaCheckCircle className="me-2" />
                        {addressSaveSuccess}
                      </Alert>
                    )}

                    {/* Address Save Error Alert */}
                    {addressSaveError && (
                      <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: "14px" }}>
                        {addressSaveError}
                      </Alert>
                    )}

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
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                    /> */}

                    {!userId && (
                      <Alert variant="info" className="mt-3 py-2">
                        <small>🔐 Login to save your address for future orders</small>
                      </Alert>
                    )}
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

                    {emailStatus === "sending" && (
                      <Alert variant="info" className="py-2 mb-3">
                        <Spinner size="sm" className="me-2" />
                        Sending order confirmation to your email...
                      </Alert>
                    )}
                    
                    {emailStatus === "success" && (
                      <Alert variant="success" className="py-2 mb-3">
                        <FaCheckCircle className="me-2" />
                        Order confirmation sent to your email!
                      </Alert>
                    )}
                    
                    {emailStatus === "error" && (
                      <Alert variant="warning" className="py-2 mb-3">
                        ⚠️ Order placed but email could not be sent.
                      </Alert>
                    )}

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

                    <Button 
                      className="payment-btn" 
                      onClick={placeOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
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
                      <span 
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/cart")}
                      >
                        Edit Cart
                      </span>
                    </div>

                    {cart.items.map((item) => (
                      <div key={item.productId} className="summary-item">
                        <div className="summary-img">
                          <Image src={item.image} />
                          <span>{item.quantity}</span>
                        </div>

                        <div className="summary-info">
                          <h5>{item.name}</h5>
                          <p>₹{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}

                    <hr />

                    <div className="summary-row">
                      <span>Subtotal ({cart.items.length} items)</span>
                      <span>₹{formatPrice(subtotal)}</span>
                    </div>

                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="free">
                        {shippingCost === 0 ? "FREE" : `₹${formatPrice(shippingCost)}`}
                      </span>
                    </div>

                    {shippingCost > 0 && (
                      <div className="summary-row">
                        <span>Shipping Discount</span>
                        <span className="discount">-₹99</span>
                      </div>
                    )}

                    <div className="summary-total">
                      <div>
                        <h4>Total</h4>
                        <p>Inclusive of all taxes</p>
                      </div>

                      <h2>₹{formatPrice(total)}</h2>
                    </div>

                    {shippingCost > 0 && (
                      <div className="shipping-save">
                        🎉 You saved ₹99 on shipping!
                      </div>
                    )}

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

      {/* Add this CSS to your checkout.css */}
      <style jsx>{`
        .saved-address-card {
          transition: all 0.2s ease;
          background: white;
        }
        .saved-address-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>

      <Footer />
    </>
  );
};

export default Checkout;