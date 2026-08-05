import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBoxOpen,
  FaShoppingBag,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaUndo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";
import "./orderhistory.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "https://api.gourmetbazar.starlighttechlabsindia.com";
const VENDOR_BACKEND_URL =
  "https://api.brandelvendor.starlighttechlabsindia.com";

// Formatter for image path
const formatProductImage = (image) => {
  if (!image) return "/images/placeholder.png";
  let imgPath = image;
  if (Array.isArray(image)) {
    if (image.length === 0) return "/images/placeholder.png";
    imgPath = image[0];
  }
  if (typeof imgPath !== "string") return "/images/placeholder.png";
  if (imgPath.startsWith("http")) return imgPath;
  if (imgPath.startsWith("/uploads")) return `${VENDOR_BACKEND_URL}${imgPath}`;
  if (imgPath.startsWith("/images")) return imgPath;
  return `${BACKEND_URL}/${imgPath.replace(/^\/+/, "")}`;
};

const Orderhistory = () => {
  const navigate = useNavigate();
  const { fetchCart, setShowCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  // Fetch orders from API
  const fetchOrdersData = async () => {
    setLoading(true);
    setError("");
    const guestId = localStorage.getItem("guestId");
    const token = localStorage.getItem("token");
    let userId = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id;
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }

    if (!guestId && !userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const requests = [];
      if (guestId) {
        requests.push(axios.get(`${API_URL}/order/guest/${guestId}`));
      }
      if (userId) {
        requests.push(axios.get(`${API_URL}/order/user/${userId}`));
      }

      const responses = await Promise.all(requests);
      let combinedOrders = [];

      responses.forEach((res) => {
        if (Array.isArray(res.data)) {
          combinedOrders = [...combinedOrders, ...res.data];
        }
      });

      // Deduplicate by ID and sort by date descending
      const uniqueOrders = [];
      const seenIds = new Set();

      combinedOrders.forEach((order) => {
        if (order && order._id && !seenIds.has(order._id)) {
          seenIds.add(order._id);
          uniqueOrders.push(order);
        }
      });

      uniqueOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(uniqueOrders);
    } catch (err) {
      console.error("Fetch orders failed", err);
      setError("Unable to load order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  // Format date beautifully
  const formatDate = (dateString) => {
    if (!dateString) return "Date Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Toggle order card expansion
  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Reorder functionality
  const handleReorder = async (e, order) => {
    e.stopPropagation();
    setReorderingId(order._id);
    const guestId = localStorage.getItem("guestId");

    if (!guestId) {
      setReorderingId(null);
      alert("Something went wrong. Please refresh and try again.");
      return;
    }

    try {
      for (const item of order.items) {
        await axios.post(`${API_URL}/cart/add`, {
          guestId,
          product: {
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity || 1,
          },
        });
      }
      await fetchCart();
      setShowCart(true);
    } catch (err) {
      console.error("Reorder failed", err);
      alert("Failed to reorder items. Some items might be out of stock.");
    } finally {
      setReorderingId(null);
    }
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    // 1. Filter by Tab
    if (
      activeTab !== "All" &&
      order.orderStatus?.toLowerCase() !== activeTab.toLowerCase()
    ) {
      return false;
    }
    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesId = order._id.toLowerCase().includes(query);
      const matchesItem = order.items.some((item) =>
        item.name.toLowerCase().includes(query),
      );
      const matchesCity = order.shippingAddress?.city
        ?.toLowerCase()
        .includes(query);
      return matchesId || matchesItem || matchesCity;
    }
    return true;
  });

  const getTimelineStep = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return 3;
      case "shipped":
        return 2;
      case "confirmed":
        return 1;
      case "pending":
      default:
        return 0;
    }
  };

  return (
    <div className="order-history-page">
      <Header />

      <Container className="py-5 lexend">
        {/* Page Title */}
        <div className="order-history-header mb-5 text-center text-md-start">
          <motion.h1
            className="order-history-title funnel-sans"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Order <span>History</span>
          </motion.h1>
          <motion.p
            className="order-history-subtitle funnel-sans"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track your orders, reorder favorites, and manage your receipts.
          </motion.p>
        </div>

        {/* Search & Tabs Panel */}
        <Row className="mb-4 align-items-center g-3">
          <Col md={6}>
            <motion.div
              className="search-bar-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FaSearch className="search-icon" />
              <Form.Control
                type="text"
                placeholder="Search by Order ID, Product Name, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div
              className="tabs-container d-flex justify-content-md-end flex-wrap gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {["All", "Pending", "Confirmed", "Shipped", "Delivered"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(tab);
                      setExpandedOrder(null);
                    }}
                  >
                    {tab}
                  </button>
                ),
              )}
            </motion.div>
          </Col>
        </Row>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted funnel-sans">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <Card className="text-center py-5 border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="text-danger mb-3" style={{ fontSize: "40px" }}>
                ⚠️
              </div>
              <h4 className="funnel-sans fw-bold">{error}</h4>
              <Button
                variant="outline-dark"
                className="mt-3 rounded-pill"
                onClick={fetchOrdersData}
              >
                Retry Loading
              </Button>
            </Card.Body>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <AnimatePresence>
            <motion.div
              className="empty-orders-state text-center py-5 rounded-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="icon-wrapper mb-4">
                <FaBoxOpen size={80} className="empty-box-icon text-muted" />
              </div>
              <h3 className="funnel-sans fw-bold">No Orders Found</h3>
              <p className="text-muted funnel-sans px-3">
                {searchQuery || activeTab !== "All"
                  ? "Try adjusting your search query or switching filters."
                  : "Looks like you haven't placed any orders yet. Explore our fresh collection!"}
              </p>
              <Button
                className="explore-btn rounded-pill px-5 py-3 mt-3"
                onClick={() => navigate("/product")}
              >
                <FaShoppingBag className="me-2" /> Start Shopping
              </Button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="orders-timeline">
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const isExpanded = expandedOrder === order._id;
                const timelineStep = getTimelineStep(order.orderStatus);

                return (
                  <motion.div
                    key={order._id}
                    layout="position"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`order-card shadow-sm ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleExpand(order._id)}
                  >
                    {/* Card Header Section */}
                    <div className="order-card-header p-4">
                      <Row className="align-items-center g-3">
                        <Col xs={12} md={3} className="text-md-start">
                          <div className="order-id-block">
                            <span className="order-id-label">ORDER ID</span>
                            <h5 className="order-id-value funnel-sans">
                              #{order._id.slice(-8).toUpperCase()}
                            </h5>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="header-meta-block">
                            <span className="meta-label">
                              <FaCalendarAlt className="me-1" /> Placed on
                            </span>
                            <span className="meta-value">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </Col>
                        <Col xs={6} md={2}>
                          <div className="header-meta-block">
                            <span className="meta-label">
                              <FaReceipt className="me-1" /> Total
                            </span>
                            <span className="meta-value price-highlight">
                              ₹{order.totalPrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </Col>
                        <Col xs={12} md={2} className="text-md-center">
                          <span
                            className={`order-status-badge status-${order.orderStatus?.toLowerCase() || "pending"}`}
                          >
                            {order.orderStatus || "Pending"}
                          </span>
                        </Col>
                        <Col xs={12} md={2} className="text-md-end">
                          <button className="expand-indicator-btn">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </Col>
                      </Row>
                    </div>

                    {/* Summary Preview (Visible when collapsed) */}
                    {!isExpanded && (
                      <div className="order-collapsed-preview px-4 pb-4 pt-1">
                        <div className="preview-items-row d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="preview-images-group d-flex gap-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="preview-img-wrapper">
                                <img
                                  src={formatProductImage(item.image)}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.target.src = "/images/placeholder.png";
                                  }}
                                />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="preview-more-indicator">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>

                          <div className="collapsed-action-btns d-flex gap-2">
                            <Button
                              className="order-action-btn border-btn rounded-pill px-3 py-2 btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(order._id);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              className="order-action-btn fill-btn rounded-pill px-3 py-2 btn-sm d-flex align-items-center"
                              disabled={reorderingId === order._id}
                              onClick={(e) => handleReorder(e, order)}
                            >
                              {reorderingId === order._id ? (
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                              ) : (
                                <FaUndo className="me-1" size={11} />
                              )}
                              Buy Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Content Drawer (Visible when expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="order-expanded-details border-top"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-4">
                            {/* Visual Timeline Tracker */}
                            {/* <div className="timeline-tracker mb-5">
                              <h6 className="section-title funnel-sans mb-4">Delivery Status</h6>
                              <div className="stepper-wrapper">
                                {[
                                  { label: "Ordered", desc: "Order placed successfully" },
                                  { label: "Confirmed", desc: "Order details verified" },
                                  { label: "Shipped", desc: "In transit to destination" },
                                  { label: "Delivered", desc: "Received at address" }
                                ].map((step, sIdx) => {
                                  const isCompleted = timelineStep >= sIdx;
                                  const isActive = timelineStep === sIdx;
                                  
                                  return (
                                    <div key={sIdx} className={`step-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                                      <div className="step-circle">
                                        {isCompleted ? <FaCheckCircle className="check-icon" /> : sIdx + 1}
                                      </div>
                                      <div className="step-content">
                                        <div className="step-title">{step.label}</div>
                                        <div className="step-desc d-none d-md-block">{step.desc}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div> */}

                            <Row className="g-4">
                              {/* Order Items Table */}
                              <Col lg={7}>
                                <h6 className="section-title funnel-sans mb-3">
                                  Order Items ({order.items.length})
                                </h6>
                                <div className="order-items-list">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="order-item-row d-flex align-items-center py-3 border-bottom"
                                    >
                                      <div className="item-image-wrapper me-3">
                                        <img
                                          src={formatProductImage(item.image)}
                                          alt={item.name}
                                          onError={(e) => {
                                            e.target.src =
                                              "/images/placeholder.png";
                                          }}
                                        />
                                      </div>
                                      <div className="item-details flex-grow-1">
                                        <h6
                                          className="item-name mb-1"
                                          onClick={() =>
                                            navigate(
                                              `/product/${item.productId}`,
                                            )
                                          }
                                        >
                                          {item.name}
                                        </h6>
                                        <span className="item-qty text-muted">
                                          Qty: {item.quantity || 1}
                                        </span>
                                      </div>
                                      <div className="item-price text-end">
                                        <h6 className="price-val">
                                          ₹
                                          {(
                                            (item.price || 0) *
                                            (item.quantity || 1)
                                          ).toLocaleString("en-IN")}
                                        </h6>
                                        <span className="price-unit text-muted">
                                          ₹
                                          {(item.price || 0).toLocaleString(
                                            "en-IN",
                                          )}{" "}
                                          each
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Col>

                              {/* Shipping & Payment Summary */}
                              <Col lg={5}>
                                <div className="details-sidebar p-4 rounded-4">
                                  <div className="address-summary mb-4">
                                    <h6 className="section-title funnel-sans mb-3">
                                      <FaMapMarkerAlt className="me-2 text-success" />{" "}
                                      Shipping Address
                                    </h6>
                                    {order.shippingAddress ? (
                                      <div className="shipping-text">
                                        <p className="fw-bold mb-1">
                                          {order.shippingAddress.name}
                                        </p>
                                        <p className="mb-1">
                                          {order.shippingAddress.address}
                                        </p>
                                        <p className="mb-1">
                                          {order.shippingAddress.city},{" "}
                                          {order.shippingAddress.state} -{" "}
                                          {order.shippingAddress.pincode}
                                        </p>
                                        <p className="mb-0 text-muted">
                                          📞 {order.shippingAddress.phone}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-muted">
                                        No address details available.
                                      </p>
                                    )}
                                  </div>

                                  <div className="billing-summary border-top pt-4">
                                    <h6 className="section-title funnel-sans mb-3">
                                      <FaCreditCard className="me-2 text-success" />{" "}
                                      Billing Details
                                    </h6>
                                    <div className="bill-row d-flex justify-content-between mb-2">
                                      <span className="bill-label text-muted">
                                        Payment Method
                                      </span>
                                      <span className="bill-value">
                                        {order.paymentMethod === "COD"
                                          ? "💰 Cash on Delivery"
                                          : "💳 UPI/Card"}
                                      </span>
                                    </div>
                                    <div className="bill-row d-flex justify-content-between mb-2">
                                      <span className="bill-label text-muted">
                                        Delivery
                                      </span>
                                      <span className="bill-value text-success">
                                        FREE
                                      </span>
                                    </div>
                                    <div className="bill-row d-flex justify-content-between border-top pt-2 mt-2">
                                      <span className="bill-label fw-bold">
                                        Total Price
                                      </span>
                                      <span className="bill-value fw-bold text-success fs-5">
                                        ₹
                                        {order.totalPrice.toLocaleString(
                                          "en-IN",
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="expanded-actions-block d-flex gap-2 mt-4">
                                    <Button
                                      className="w-100 fill-btn rounded-pill py-3 d-flex align-items-center justify-content-center"
                                      disabled={reorderingId === order._id}
                                      onClick={(e) => handleReorder(e, order)}
                                    >
                                      {reorderingId === order._id ? (
                                        <Spinner
                                          animation="border"
                                          size="sm"
                                          className="me-2"
                                        />
                                      ) : (
                                        <FaUndo className="me-2" />
                                      )}
                                      Buy Again
                                    </Button>
                                    <Button
                                      variant="outline-dark"
                                      className="w-100 rounded-pill py-3"
                                      onClick={() =>
                                        navigate(
                                          `/contactus?order=${order._id}`,
                                        )
                                      }
                                    >
                                      Get Help
                                    </Button>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default Orderhistory;
