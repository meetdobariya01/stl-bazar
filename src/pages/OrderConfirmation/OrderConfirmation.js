// OrderConfirmation.jsx
import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Image, Alert, Spinner } from "react-bootstrap";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaReceipt, FaHome, FaArrowRight, FaGift, FaShoppingBag, FaClock, FaShieldAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";

import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

// Helper to format image paths
const BACKEND_URL = "http://localhost:9000";

export const formatImagePath = (path) => {
  const BACKEND_URL = "http://localhost:9000";

  if (!path) return "/images/default-product.png";

  // array support
  if (Array.isArray(path)) {
    path = path[path.length - 1];
  }

  // object support
  if (typeof path === "object") {
    path = path?.url || path?.image || path?.src || "";
  }

  // force string safely
  if (typeof path !== "string") {
    return "/images/default-product.png";
  }

  const cleanPath = path.trim();

  if (!cleanPath) return "/images/default-product.png";

  if (cleanPath.startsWith("http")) return cleanPath;

  if (cleanPath.startsWith("/uploads")) {
    return `${BACKEND_URL}${cleanPath}`;
  }

  if (cleanPath.startsWith("/images")) {
    return cleanPath;
  }

  return `${BACKEND_URL}/${cleanPath.replace(/^\/+/, "")}`;
};
// Animated Number Counter
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value) || 0;
      const increment = end / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>₹{count.toLocaleString()}</span>;
};

// Floating particles animation
const FloatingParticles = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [window.innerHeight + 100, -100]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            backgroundColor: `hsl(${Math.random() * 60 + 100}, 70%, 50%)`,
            borderRadius: "50%",
            boxShadow: "0 0 10px rgba(76,175,80,0.5)"
          }}
        />
      ))}
    </div>
  );
};

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const mainRef = useRef(null);

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parallax effects
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Get orderId
  const queryParams = new URLSearchParams(location.search);
  const orderIdFromUrl = queryParams.get("orderId");
  const orderId = location.state?.orderId || orderIdFromUrl;

  // Trigger confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        startVelocity: 30,
        colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#FF5722']
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        const savedOrderId = localStorage.getItem("lastOrderId");
        if (savedOrderId) {
          await fetchOrderById(savedOrderId);
        } else {
          setError("No order information found.");
          setLoading(false);
        }
        return;
      }
      await fetchOrderById(orderId);
    };

    const fetchOrderById = async (id) => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/order/single/${id}`);
        const rawOrder = response.data;

        const formattedOrder = {
          _id: rawOrder._id,
          orderId: rawOrder._id,
          createdAt: rawOrder.createdAt,
          paymentMethod: rawOrder.paymentMethod,
          paymentStatus: rawOrder.paymentStatus || (rawOrder.paymentMethod === "COD" ? "pending" : "paid"),
          orderStatus: rawOrder.orderStatus || "Confirmed",
          subtotal: rawOrder.totalPrice,
          shippingCost: 0,
          total: rawOrder.totalPrice,
          shippingAddress: rawOrder.shippingAddress || {},
          items: rawOrder.items || []
        };

        setOrderData(formattedOrder);
        localStorage.removeItem("guestId");

      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Unable to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getPaymentMethodIcon = (method) => {
    if (method === "COD" || method === "cod") return "💰 Cash on Delivery";
    if (method === "card") return "💳 Credit/Debit Card";
    return method || "Unknown";
  };

  const getEstimatedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: 60, height: 60, margin: "0 auto 20px", border: "4px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }}
            />
            <h3>Loading Your Order...</h3>
            <p className="text-white-50 mt-2">Please wait while we fetch your order details</p>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !orderData) {
    return (
      <>
        <Header />
        <Container className="py-5 min-vh-100 d-flex align-items-center">
          <Row className="justify-content-center w-100">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-lg rounded-4 border-0 text-center p-5">
                  <motion.div
                    className="mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4">
                      <FaReceipt size={48} className="text-danger" />
                    </div>
                  </motion.div>
                  <h3 className="fw-bold mb-3">Order Not Found</h3>
                  <p className="text-muted mb-4">{error}</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => navigate("/")}>
                      Continue Shopping
                    </Button>
                    <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate("/")}>
                      Go to Home
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
        <Footer />
      </>
    );
  }

  const items = orderData.items || [];
  const subtotal = orderData.subtotal || items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  const total = orderData.total || subtotal;
  const address = orderData.shippingAddress || {};

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div ref={mainRef} style={{ overflowX: "hidden", position: "relative", background: "#f8f9fa" }}>
      <FloatingParticles />
      <Header />

      {/* Hero Section with Principal Animation */}
      <motion.div
        style={{
          y: headerY,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden"
        }}
        className="py-5"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center text-white position-relative"
          style={{ zIndex: 2 }}
        >
          <motion.div
            className="mb-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-4">
              <FaCheckCircle size={64} className="text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="fw-bold display-4 mb-3"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            Order Confirmed! 🎉
          </motion.h1>

          <motion.p
            className="fs-5 mb-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Thank you for your purchase, {address.name || "Valued Customer"}!
          </motion.p>

          <motion.p
            className="text-white-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Order #{orderData.orderId || orderData._id?.slice(-8)}
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <Alert variant="light" className="d-inline-flex mt-3 rounded-pill px-4 bg-white bg-opacity-90 border-0">
              <span className="small fw-semibold text-dark">✨ Your order has been placed successfully</span>
            </Alert>
          </motion.div>
        </motion.div>

        {/* Decorative circles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      </motion.div>

      <Container className="py-5" style={{ position: "relative", zIndex: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-4">
            {/* LEFT COLUMN */}
            <Col lg={8}>
              {/* Order Summary Card */}
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 mb-4 overflow-hidden">
                    <div style={{ background: "linear-gradient(90deg, #4CAF50, #8BC34A)", height: "5px" }} />
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                        >
                          <FaShoppingBag className="text-success" size={24} />
                        </motion.div>
                        <h5 className="fw-bold mb-0 fs-3">Order Summary</h5>
                      </div>

                      <AnimatePresence>
                        {items.map((item, idx) => (
                          <motion.div
                            key={item._id || item.productId || idx}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
                            className="d-flex align-items-center mb-3 pb-3 border-bottom rounded p-2"
                          >
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}>
                              <Image
                                src={formatImagePath(item.image)}
                                alt={item.name}
                                rounded
                                style={{ width: 80, height: 80, objectFit: "cover" }}
                                className="me-3 shadow"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/placeholder.png";
                                }}
                              />
                            </motion.div>
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-semibold fs-5">{item.name}</p>
                              <small className="text-muted">
                                ₹{(item.price || 0).toLocaleString()} × {item.quantity || 0}
                              </small>
                            </div>
                            <motion.div
                              className="fw-bold fs-5 text-success"
                              whileHover={{ scale: 1.1 }}
                            >
                              ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Subtotal</span>
                          <motion.span whileHover={{ scale: 1.05 }}>
                            <AnimatedNumber value={subtotal} />
                          </motion.span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Shipping</span>
                          <span className="text-success fw-semibold">Free</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Tax</span>
                          <span>Included</span>
                        </div>
                        <hr className="my-3" />
                        <motion.div
                          className="d-flex justify-content-between fw-bold fs-3"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <span>Total Paid</span>
                          <motion.span
                            className="text-success"
                            whileHover={{ scale: 1.1 }}
                          >
                            <AnimatedNumber value={total} duration={1500} />
                          </motion.span>
                        </motion.div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Delivery Information */}
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 mb-4 overflow-hidden">
                    <div style={{ background: "linear-gradient(90deg, #2196F3, #03A9F4)", height: "5px" }} />
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <FaTruck className="text-primary" size={24} />
                        <h5 className="fw-bold mb-0">Delivery Information</h5>
                      </div>
                      <Row>
                        <Col md={6}>
                          <motion.div
                            className="mb-3"
                            whileHover={{ x: 5 }}
                          >
                            <div className="text-muted small mb-1">Estimated Delivery</div>
                            <div className="d-flex align-items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              >
                                <FaCalendarAlt className="text-success" />
                              </motion.div>
                              <span className="fw-semibold fs-5">{getEstimatedDelivery()}</span>
                            </div>
                          </motion.div>
                        </Col>
                        <Col md={6}>
                          <motion.div
                            className="mb-3"
                            whileHover={{ x: 5 }}
                          >
                            <div className="text-muted small mb-1">Payment Method</div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fs-5">{getPaymentMethodIcon(orderData.paymentMethod)}</span>
                            </div>
                          </motion.div>
                        </Col>
                      </Row>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Alert variant="info" className="mt-3 mb-0 bg-light border-0 rounded-3">
                          <div className="d-flex align-items-center gap-2">
                            <FaShieldAlt className="text-info" />
                            <small>🔒 Secure transaction • You'll receive a confirmation email shortly</small>
                          </div>
                        </Alert>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 overflow-hidden">
                    <div style={{ background: "linear-gradient(90deg, #FF9800, #FFC107)", height: "5px" }} />
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <FaMapMarkerAlt className="text-warning" size={24} />
                        <h5 className="fw-bold mb-0">Shipping Address</h5>
                      </div>
                      <motion.div
                        className="ps-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="mb-2 fw-semibold fs-5">{address.name || "Customer Name"}</p>
                        <p className="mb-1 text-muted">{address.address || "Address line"}</p>
                        <p className="mb-1 text-muted">
                          {address.city || "City"}, {address.state || "State"} - {address.pincode || "000000"}
                        </p>
                        <p className="mb-1 text-muted">{address.country || "India"}</p>
                        <p className="mb-0 mt-3">
                          <span className="fw-medium">📞 Phone:</span> {address.phone || "N/A"} &nbsp;&nbsp;|&nbsp;&nbsp;
                          <span className="fw-medium">✉️ Email:</span> {address.email || "N/A"}
                        </p>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </motion.div>
            </Col>

            {/* RIGHT COLUMN */}
            <Col lg={4}>
              <motion.div variants={itemVariants} className="sticky-top" style={{ top: "100px" }}>
                {/* Order Status */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 mb-4 overflow-hidden">
                    <div style={{ background: "linear-gradient(90deg, #9C27B0, #E040FB)", height: "5px" }} />
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <FaClock className="text-purple" size={24} />
                        <h5 className="fw-bold mb-0">Order Status</h5>
                      </div>

                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="text-muted">Status</span>
                          <motion.span
                            className="badge bg-warning text-dark rounded-pill px-3 py-2 fs-6"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                          >
                            {orderData.orderStatus || "Confirmed"}
                          </motion.span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="text-muted">Payment</span>
                          <motion.span
                            className={`badge rounded-pill px-3 py-2 fs-6 ${orderData.paymentStatus === "paid" ? "bg-success" : "bg-secondary"}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {orderData.paymentStatus === "paid" ? "✓ Paid" : orderData.paymentMethod === "COD" ? "💰 Pay on Delivery" : "Pending"}
                          </motion.span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="text-muted">Order Date</span>
                          <span className="small fw-semibold">{formatDate(orderData.createdAt)}</span>
                        </div>
                      </div>

                      <div className="progress mb-3" style={{ height: "10px", borderRadius: "10px", overflow: "hidden", background: "#e0e0e0" }}>
                        <motion.div
                          className="progress-bar bg-success"
                          initial={{ width: 0 }}
                          animate={{ width: orderData.orderStatus === "Delivered" ? "100%" : orderData.orderStatus === "Shipped" ? "75%" : orderData.orderStatus === "Processing" ? "50%" : "30%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          style={{ borderRadius: "10px" }}
                        />
                      </div>

                      <div className="d-flex justify-content-between small text-muted">
                        <motion.span whileHover={{ scale: 1.1, color: "#4CAF50" }} style={{ cursor: "pointer" }}>✓ Placed</motion.span>
                        <motion.span whileHover={{ scale: 1.1, color: "#FF9800" }} style={{ cursor: "pointer" }}>⏳ Process</motion.span>
                        <motion.span whileHover={{ scale: 1.1, color: "#2196F3" }} style={{ cursor: "pointer" }}>📦 Ship</motion.span>
                        <motion.span whileHover={{ scale: 1.1, color: "#4CAF50" }} style={{ cursor: "pointer" }}>🏠 Deliver</motion.span>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>

                {/* Gift Card */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)" }}>
                    <Card.Body className="p-4 text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <FaGift size={48} className="text-warning mb-3" />
                      </motion.div>
                      <h6 className="fw-bold mb-2">🎁 You've Earned a Special Gift!</h6>
                      <p className="small text-muted mb-3">Use coupon code on your next purchase</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="warning" size="sm" className="rounded-pill px-4 fw-bold">
                          WELCOME100
                        </Button>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </motion.div>

                {/* Help Card */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="shadow-lg rounded-4 border-0 mb-4 bg-light">
                    <Card.Body className="p-4 text-center">
                      <FaHome className="text-secondary mb-2" size={32} />
                      <h6 className="fw-bold mb-2">Need Help With Your Order?</h6>
                      <p className="small text-muted mb-3">
                        Our support team is here to assist you 24/7
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline-dark" size="sm" className="rounded-pill px-4">
                          Contact Support <FaArrowRight className="ms-2" size={12} />
                        </Button>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </motion.div>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="dark"
                      className="rounded-pill py-3 fw-bold shadow w-100"
                      onClick={() => navigate("/")}
                    >
                      Continue Shopping <FaArrowRight className="ms-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline-secondary"
                      className="rounded-pill py-2 w-100"
                      onClick={() => window.print()}
                    >
                      📄 Print Receipt
                    </Button>
                  </motion.div>
                </div>

                {/* Order ID */}
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <small className="text-muted">
                    <strong>Order ID:</strong> {orderData._id}
                    <br />
                    Keep this ID for future reference
                  </small>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;