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
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaLock,
  FaCheckCircle,
  FaAddressCard,
  FaPlus,
  FaTrash,
  FaTag,
} from "react-icons/fa";
import axios from "axios";

import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

import "./checkout.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const formatImagePath = (image) => {
  if (!image) {
    return "/images/placeholder.png";
  }

  let imgPath = image;

  if (Array.isArray(image)) {
    if (image.length === 0) {
      return "/images/placeholder.png";
    }
    imgPath = image[0];
  }

  if (typeof imgPath !== "string") {
    return "/images/placeholder.png";
  }

  if (imgPath.trim() === "") {
    return "/images/placeholder.png";
  }

  if (imgPath.startsWith("http")) {
    return imgPath;
  }

  if (imgPath.startsWith("/uploads")) {
    return `${BACKEND_URL}${imgPath}`;
  }

  if (imgPath.startsWith("/images")) {
    return imgPath;
  }

  return `${BACKEND_URL}${imgPath}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const [shippingMethod, setShippingMethod] = useState("standard");
  
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

  const [cart, setCart] = useState({ items: [], appliedCoupon: null });
  
  const guestId = localStorage.getItem("guestId");
  
  useEffect(() => {
    if (!localStorage.getItem("guestId")) {
      const newGuestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestId", newGuestId);
    }
  }, []);

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

  useEffect(() => {
    if (guestId) {
      fetchSavedAddresses();
    }
  }, [guestId]);  

  const fetchCart = async () => {
    if (!guestId) return;

    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      console.log("Fetched cart in checkout:", res.data);
      setCart(res.data || { items: [], appliedCoupon: null });
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  const fetchSavedAddresses = async () => {
    if (!guestId) return;
    
    setLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_URL}/addresses/${guestId}`);
      if (res.data.success) {
        setSavedAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value,
    });
  };

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

  const deleteSavedAddress = async (addressId, e) => {
    e.stopPropagation();
    if (!guestId) return;
    
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await axios.delete(`${API_URL}/addresses/${guestId}/${addressId}`);
        setAddressSaveSuccess("Address deleted successfully!");
        fetchSavedAddresses();
        setTimeout(() => setAddressSaveSuccess(""), 3000);
      } catch (err) {
        console.error("Delete address error:", err);
        setAddressSaveError("Failed to delete address");
        setTimeout(() => setAddressSaveError(""), 3000);
      }
    }
  };

  const getShippingCost = (subtotalAfterDiscount, method) => {
    const FREE_SHIPPING_THRESHOLD = 1500;
    
    if (method === "express") {
      return 199;
    }
    
    if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return 99;
  };

  const subtotal = cart.items.reduce(
    (acc, item) => acc + (item.price * item.quantity),
    0,
  );

  const couponDiscount = cart.appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const shippingCost = getShippingCost(discountedSubtotal, shippingMethod);
  const total = discountedSubtotal + shippingCost;

  const saveAddressToDB = async () => {
    if (!guestId) {
      setAddressSaveError("Unable to save address. Please refresh the page.");
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
        guestId,
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
        await fetchSavedAddresses();
      }
    } catch (err) {
      console.error("Save address error:", err);
      setAddressSaveError("❌ Failed to save address. Please try again.");
    }
  };

  const sendOrderEmail = async (orderId) => {
    try {
      setEmailStatus("sending");
      
      const emailData = {
        to: shipping.email,
        subject: `Order Confirmation - #${orderId}`,
        orderId: orderId,
        customerName: shipping.name,
        items: cart.items,
        subtotal: subtotal,
        couponDiscount: couponDiscount,
        shippingCost: shippingCost,
        total: total,
        shippingAddress: shipping,
        paymentMethod: payment,
        shippingMethod: shippingMethod,
        orderDate: new Date().toLocaleString()
      };

      await axios.post(`${API_URL}/order/send-confirmation`, emailData);
      
      setEmailStatus("success");
    } catch (err) {
      console.error("Email sending error:", err);
      setEmailStatus("error");
    }
  };

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

      if (saveAddressChecked) {
        await saveAddressToDB();
      }

      const orderData = {
        guestId,
        shippingAddress: shipping,
        paymentMethod: payment,
        shippingMethod: shippingMethod,
        subtotal: subtotal,
        couponDiscount: couponDiscount,
        appliedCoupon: cart.appliedCoupon,
        shippingCost: shippingCost,
        total: total,
      };

      console.log("Placing order with data:", orderData);

      const res = await axios.post(`${API_URL}/order/place`, orderData);

      if (res.data.success) {
        await sendOrderEmail(res.data.orderId);
        
        localStorage.removeItem("guestId");
        
        navigate("/order-complete", { 
          state: { 
            orderId: res.data.orderId,
            orderDetails: {
              items: cart.items,
              subtotal: subtotal,
              couponDiscount: couponDiscount,
              appliedCoupon: cart.appliedCoupon,
              shippingCost: shippingCost,
              total: total,
              shipping: shipping,
              paymentMethod: payment,
              shippingMethod: shippingMethod
            }
          } 
        });
      } else {
        throw new Error(res.data.message || "Failed to place order");
      }
      
    } catch (err) {
      console.error("Order placement error:", err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />

      <section className="checkout-page lexend">
        <Container>
          <motion.div
            className="checkout-top"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="funnel-sans">Checkout</h2>
          </motion.div>

          <Row className="g-4">
            <Col lg={7}>
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
                      required
                    />

                    <Form.Check
                      type="checkbox"
                      label="Keep me updated on news and exclusive offers"
                      className="mt-3"
                    />
                  </Card.Body>
                </Card>
              </motion.div>

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
                        {savedAddresses.length > 0 && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaAddressCard size={14} />
                            {showSavedAddresses ? "Hide" : "My Addresses"} ({savedAddresses.length})
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={saveAddressToDB}
                          className="d-flex align-items-center gap-2"
                        >
                          <FaPlus size={12} />
                          Save Address
                        </Button>
                      </div>
                    </div>

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
                                  style={{ cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                                >
                                  <div onClick={() => selectSavedAddress(addr)}>
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
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="delete-address-btn"
                                    onClick={(e) => deleteSavedAddress(addr._id, e)}
                                    style={{ position: "absolute", top: "5px", right: "5px", color: "#dc3545" }}
                                  >
                                    <FaTrash size={12} />
                                  </Button>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </div>
                    )}

                    {addressSaveSuccess && (
                      <Alert variant="success" className="py-2 mb-3" style={{ fontSize: "14px" }}>
                        <FaCheckCircle className="me-2" />
                        {addressSaveSuccess}
                      </Alert>
                    )}

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
                          required
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
                          required
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
                          required
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
                          required
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
                          required
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
                          required
                        />
                      </Col>
                    </Row>

                    <Form.Check
                      type="checkbox"
                      label="Save this address for next time."
                      className="mt-3"
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                    />
                  </Card.Body>
                </Card>
              </motion.div>

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

                    {discountedSubtotal >= 1500 && shippingMethod === "standard" && (
                      <Alert variant="success" className="mb-3">
                        🎉 Free shipping applied on orders above ₹1500!
                      </Alert>
                    )}

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
                      <strong>
                        {discountedSubtotal >= 1500 ? "FREE" : "₹99"}
                      </strong>
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

                    {discountedSubtotal < 1500 && shippingMethod === "standard" && (
                      <div className="shipping-note mt-3">
                        <small className="text-muted">
                          🚚 Add ₹{formatPrice(1500 - discountedSubtotal)} more to get free standard shipping
                        </small>
                      </div>
                    )}

                    {shippingMethod === "express" && (
                      <div className="shipping-note mt-3">
                        <small className="text-muted">
                          ⚡ Express shipping always costs ₹199 (delivery in 1-2 days)
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>

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
                          className="checkbox-button"
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
                          className="checkbox-button"
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
                          className="checkbox-button"
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
                        `Pay ₹${formatPrice(total)}`
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
                          <Image 
                            src={formatImagePath(item.image)} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/placeholder.png";
                            }}
                          />
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

                    {cart.appliedCoupon && couponDiscount > 0 && (
                      <div className="summary-row coupon-discount">
                        <span>
                          <FaTag className="me-1" style={{ fontSize: "12px" }} />
                          Coupon ({cart.appliedCoupon.code})
                        </span>
                        <span className="discount">
                          -₹{formatPrice(couponDiscount)}
                        </span>
                      </div>
                    )}

                    <div className="summary-row">
                      <span>Shipping ({shippingMethod === "express" ? "Express" : "Standard"})</span>
                      <span className={shippingCost === 0 ? "free" : ""}>
                        {shippingCost === 0 ? "FREE" : `₹${formatPrice(shippingCost)}`}
                      </span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="summary-row subtotal-after-discount">
                        <span>Subtotal after discount</span>
                        <span>₹{formatPrice(discountedSubtotal)}</span>
                      </div>
                    )}

                    <div className="summary-total">
                      <div>
                        <h4>Total</h4>
                        <p>Inclusive of all taxes</p>
                      </div>
                      <h2>₹{formatPrice(total)}</h2>
                    </div>

                    {shippingCost === 0 && discountedSubtotal >= 1500 && (
                      <div className="shipping-save">
                        🎉 Free standard shipping applied!
                      </div>
                    )}

                    {shippingMethod === "express" && (
                      <div className="shipping-save express-note">
                        ⚡ Express shipping - Delivery in 1-2 days
                      </div>
                    )}

                    {cart.appliedCoupon && (
                      <div className="coupon-save-note">
                        🎟️ Coupon saved: ₹{formatPrice(couponDiscount)} off!
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

      <Footer />
    </>
  );
};

export default Checkout;