import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Image, Alert, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave, FaSave, FaAddressBook, FaTrash, FaUser, FaSpinner } from "react-icons/fa";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";
const BACKEND_URL = "http://localhost:9000";

const Checkout = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState("card");
  const [loading, setLoading] = useState(false); // ✅ Add loading state
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
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressName, setAddressName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [cart, setCart] = useState({ items: [] });
  const guestId = localStorage.getItem("guestId");

  // Format image paths - FIXED to handle arrays and non-strings
  const formatImagePath = (path) => {
    // Handle array input
    if (Array.isArray(path)) {
      path = path[0];
    }
    
    // Handle null, undefined, or empty values
    if (!path) return "/images/default-product.png";
    
    // Convert to string if not already
    const pathStr = String(path);
    
    if (pathStr.startsWith("http")) return pathStr;
    if (pathStr.startsWith("/uploads")) return `${BACKEND_URL}${pathStr}`;
    if (pathStr.startsWith("/images")) return pathStr;
    return `${BACKEND_URL}${pathStr}`;
  };

  // Load saved addresses from localStorage
  const loadSavedAddresses = () => {
    const addresses = localStorage.getItem("savedAddresses");
    if (addresses) {
      try {
        const parsed = JSON.parse(addresses);
        setSavedAddresses(parsed);
        console.log("Loaded addresses from localStorage:", parsed.length);
      } catch (e) {
        console.error("Error parsing addresses:", e);
        setSavedAddresses([]);
      }
    } else {
      setSavedAddresses([]);
    }
  };

  // Save address to localStorage
  const saveAddressToLocal = (addressData, name) => {
    const existingAddresses = localStorage.getItem("savedAddresses");
    let addresses = existingAddresses ? JSON.parse(existingAddresses) : [];
    
    const newAddress = {
      id: Date.now().toString(),
      name: name || "My Address",
      address: { ...addressData },
      createdAt: new Date().toISOString()
    };
    
    addresses.unshift(newAddress); // Add to beginning
    localStorage.setItem("savedAddresses", JSON.stringify(addresses));
    
    setMessage({ type: "success", text: "Address saved successfully!" });
    loadSavedAddresses(); // Refresh the list
    return true;
  };

  // Load address from saved
  const loadAddress = (addr) => {
    setShipping({
      name: addr.address.name || "",
      email: addr.address.email || "",
      phone: addr.address.phone || "",
      address: addr.address.address || "",
      city: addr.address.city || "",
      state: addr.address.state || "",
      pincode: addr.address.pincode || "",
      country: addr.address.country || "India",
    });
    setSelectedAddressId(addr.id);
    setMessage({ type: "success", text: "Address loaded successfully!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Delete saved address
  const deleteAddress = (addressId) => {
    const existingAddresses = localStorage.getItem("savedAddresses");
    if (existingAddresses) {
      let addresses = JSON.parse(existingAddresses);
      addresses = addresses.filter(addr => addr.id !== addressId);
      localStorage.setItem("savedAddresses", JSON.stringify(addresses));
      loadSavedAddresses();
      setMessage({ type: "success", text: "Address deleted!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
    loadSavedAddresses();
  }, [guestId]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    // Clear selected address when user modifies fields
    if (selectedAddressId) setSelectedAddressId(null);
  };

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const placeOrder = async () => {
    // Validate required fields
    if (!guestId || cart.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    const required = ["name", "phone", "email", "address", "city", "state", "pincode"];
    for (let field of required) {
      if (!shipping[field]) {
        alert(`Please fill ${field}`);
        return;
      }
    }

    // Start loading
    setLoading(true);

    try {
      // If user wants to save this address
      if (saveAddress && !selectedAddressId) {
        saveAddressToLocal(shipping, addressName || "My Address");
      }

      const res = await axios.post(`${API_URL}/order/place`, {
        guestId,
        shippingAddress: shipping,
        paymentMethod: payment,
      });

      // Show success message with email info
      const emailResults = res.data.emailResults;
      let successMessage = `Order placed successfully! Order ID: ${res.data.orderId}`;
      
      if (emailResults) {
        let emailStatus = [];
        if (emailResults.customer) emailStatus.push("📧 Customer email sent");
        if (emailResults.admin) emailStatus.push("📧 Admin notified");
        if (emailResults.vendors.length > 0) {
          const sentCount = emailResults.vendors.filter(v => v.success).length;
          emailStatus.push(`📧 ${sentCount}/${emailResults.vendors.length} vendors notified`);
        }
        if (emailStatus.length > 0) {
          successMessage += "\n\n" + emailStatus.join("\n");
        }
      }
      
      alert(successMessage);

      localStorage.setItem("lastOrderId", res.data.orderId);
      setCart({ items: [] });
      localStorage.removeItem("guestId");
      
      navigate("/order-confirmation", { 
        state: { orderId: res.data.orderId } 
      });
      
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      alert("Failed to place order: " + errorMessage);
    } finally {
      // Stop loading regardless of success or failure
      setLoading(false);
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

        {/* Loading Overlay */}
        {loading && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 z-3" style={{ zIndex: 9999 }}>
            <Card className="text-center p-4 shadow-lg rounded-4" style={{ minWidth: "300px" }}>
              <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
              <h5 className="fw-bold">Placing Your Order...</h5>
              <p className="text-muted mb-0">Please wait while we process your order and send confirmation emails.</p>
              <div className="mt-3">
                <small className="text-muted">
                  <FaSpinner className="me-1 spin" /> This may take a few seconds
                </small>
              </div>
            </Card>
          </div>
        )}

        {/* CART ITEMS SUMMARY */}
        {cart.items.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm rounded-4 border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3 fs-3">Your Items</h5>
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="d-flex align-items-center mb-3 p-2 border-bottom"
                    >
                      <Image
                        src={formatImagePath(item.image)}
                        rounded
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                        className="me-3"
                        onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-bold">{item.name}</p>
                        <small className="text-muted">
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
        
        {savedAddresses.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm rounded-4 border-0">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaAddressBook size={20} className="text-primary" />
                    <h5 className="fw-bold mb-0">Saved Addresses</h5>
                    <span className="badge bg-secondary ms-2">{savedAddresses.length} saved</span>
                  </div>
                  
                  <Row className="g-3">
                    {savedAddresses.map((addr) => (
                      <Col md={6} key={addr.id}>
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                          <Card 
                            className={`border-2 ${selectedAddressId === addr.id ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`} 
                            style={{ cursor: "pointer" }}
                          >
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1" onClick={() => loadAddress(addr)}>
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <FaAddressBook size={12} className="text-primary" />
                                    <p className="fw-bold mb-0">{addr.name}</p>
                                  </div>
                                  <p className="small text-muted mb-1">
                                    <strong>{addr.address.name}</strong>
                                  </p>
                                  <p className="small text-muted mb-1">{addr.address.address}</p>
                                  <p className="small text-muted mb-0">
                                    {addr.address.city}, {addr.address.state} - {addr.address.pincode}
                                  </p>
                                  <p className="small text-muted mb-0">
                                    📞 {addr.address.phone} | ✉️ {addr.address.email}
                                  </p>
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAddress(addr.id);
                                  }}
                                >
                                  <FaTrash size={14} />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        <Row className="g-4">
          <Col lg={8}>
            {/* SHIPPING DETAILS FORM */}
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
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control 
                        name="phone" 
                        value={shipping.phone} 
                        onChange={handleChange} 
                        placeholder="Phone Number" 
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={12}>
                      <Form.Control 
                        name="email" 
                        value={shipping.email} 
                        onChange={handleChange} 
                        placeholder="Email Address" 
                        type="email"
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={12}>
                      <Form.Control 
                        name="address" 
                        value={shipping.address} 
                        onChange={handleChange} 
                        placeholder="Street Address" 
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control 
                        name="city" 
                        value={shipping.city} 
                        onChange={handleChange} 
                        placeholder="City" 
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control 
                        name="state" 
                        value={shipping.state} 
                        onChange={handleChange} 
                        placeholder="State" 
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control 
                        name="pincode" 
                        value={shipping.pincode} 
                        onChange={handleChange} 
                        placeholder="Zip Code" 
                        className="p-3 shadow-sm rounded-3 border-0 bg-light" 
                        required
                        disabled={loading}
                      />
                    </Col>
                  </Row>

                  {/* Save Address Option - Always visible (no login needed) */}
                  <div className="mt-4 p-3 bg-light rounded-3">
                    <Form.Check
                      type="checkbox"
                      id="save-address-toggle"
                      label={
                        <span className="d-flex align-items-center gap-5">
                          <span>Save this address for future purchases</span>
                        </span>
                      }
                      checked={saveAddress}
                      onChange={(e) => {
                        setSaveAddress(e.target.checked);
                        if (e.target.checked) {
                          setShowSaveForm(true);
                        } else {
                          setShowSaveForm(false);
                          setAddressName("");
                        }
                      }}
                      className="mb-2"
                      disabled={loading}
                    />
                    
                    {saveAddress && showSaveForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-3"
                      >
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-semibold">
                            Address Name <span className="text-muted">(e.g., Home, Office)</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="My Address"
                            value={addressName}
                            onChange={(e) => setAddressName(e.target.value)}
                            className="rounded-3"
                            disabled={loading}
                          />
                          <Form.Text className="text-muted small">
                            Give this address a name so you can easily identify it later
                          </Form.Text>
                        </Form.Group>
                      </motion.div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>

            {/* PAYMENT METHOD */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="shadow-sm rounded-4 border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-4 fs-3">Payment Method</h5>
                  <Form.Check
                    type="radio"
                    label={<span><FaCreditCard className="me-2" />Credit / Debit Card</span>}
                    name="payment"
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                    className="mb-3 p-3 shadow-sm rounded-3 border"
                    disabled={loading}
                  />
                  <Form.Check
                    type="radio"
                    label={<span><FaMoneyBillWave className="me-2" />Cash on Delivery</span>}
                    name="payment"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="p-3 shadow-sm rounded-3 border"
                    disabled={loading}
                  />
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* ORDER SUMMARY SIDEBAR */}
          <Col lg={4}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="shadow-sm rounded-4 border-0 sticky-top" style={{ top: "20px" }}>
                <Card.Body>
                  <h5 className="fw-bold mb-4 fs-3">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold mb-4 fs-4">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <Button
                    variant="dark"
                    className="w-100 rounded-pill py-3 fw-bold shadow-lg"
                    onClick={placeOrder}
                    disabled={cart.items.length === 0 || loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Processing Order...
                      </>
                    ) : (
                      "Complete Purchase"
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
      <Footer />

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;