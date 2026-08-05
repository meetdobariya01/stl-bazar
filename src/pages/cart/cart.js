import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingBag,
  FaShieldAlt,
  FaTag,
  FaTimes,
  FaGift,
  FaSpinner,
  FaStore,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBox,
} from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const VENDOR_BACKEND_URL =
  "https://api.brandelvendor.starlighttechlabsindia.com";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
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
    return `${VENDOR_BACKEND_URL}${imgPath}`;
  }

  if (imgPath.startsWith("/images")) {
    return imgPath;
  }

  return `${VENDOR_BACKEND_URL}${imgPath}`;
};

// ✅ Stock status helper
const getStockStatus = (stock) => {
  if (!stock && stock !== 0) return { label: "In Stock", color: "success", icon: "✅" };
  if (stock === 0) return { label: "Out of Stock", color: "danger", icon: "❌" };
  if (stock <= 5) return { label: `Only ${stock} left!`, color: "warning", icon: "⚠️" };
  if (stock <= 10) return { label: `${stock} in stock`, color: "info", icon: "📦" };
  return { label: `${stock} in stock`, color: "success", icon: "✅" };
};

const Cart = () => {
  const [cart, setCart] = useState({ items: [], appliedCoupon: null });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [productStock, setProductStock] = useState({});
  const [stockLoading, setStockLoading] = useState({});
  const guestId = localStorage.getItem("guestId");

  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      const cartData = res.data || { items: [], appliedCoupon: null };
      setCart(cartData);
      
      // ✅ Fetch stock for each item in cart
      if (cartData.items && cartData.items.length > 0) {
        fetchAllProductStocks(cartData.items);
      }
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err.message);
    }
  };

  // ✅ Fetch stock for all products in cart
  const fetchAllProductStocks = async (items) => {
    const stockPromises = items.map(async (item) => {
      try {
        const response = await axios.get(`${API_URL}/product/${item.productId}`);
        return { productId: item.productId, stock: response.data.stock || 0 };
      } catch (err) {
        console.error(`Failed to fetch stock for ${item.productId}:`, err);
        return { productId: item.productId, stock: item.quantity || 0 };
      }
    });

    try {
      const results = await Promise.all(stockPromises);
      const stockMap = {};
      results.forEach(({ productId, stock }) => {
        stockMap[productId] = stock;
      });
      setProductStock(stockMap);
    } catch (err) {
      console.error("Failed to fetch product stocks:", err);
    }
  };

  // ✅ Fetch single product stock
  const fetchProductStock = async (productId) => {
    try {
      setStockLoading(prev => ({ ...prev, [productId]: true }));
      const response = await axios.get(`${API_URL}/product/${productId}`);
      const stock = response.data.stock || 0;
      setProductStock(prev => ({ ...prev, [productId]: stock }));
      return stock;
    } catch (err) {
      console.error(`Failed to fetch stock for ${productId}:`, err);
      return 0;
    } finally {
      setStockLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  // ✅ Update quantity with stock validation
  const updateQty = async (productId, type) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

    // ✅ Check stock when adding
    if (type === "inc") {
      const stock = productStock[productId] !== undefined ? productStock[productId] : await fetchProductStock(productId);
      if (item.quantity >= stock) {
        alert(`❌ Only ${stock} items available in stock!`);
        return;
      }
    }

    const newQuantity = type === "inc" ? item.quantity + 1 : item.quantity - 1;

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

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
      console.error(
        "Update quantity error:",
        err.response?.data || err.message,
      );
      alert("Failed to update quantity. Please try again.");
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);
      fetchCart();
    } catch (err) {
      console.error("Remove item error:", err.response?.data || err.message);
    }
  };

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const FREE_SHIPPING_THRESHOLD = 1500;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;

  const couponDiscount = cart.appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const finalShippingCost =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const total = discountedSubtotal + finalShippingCost;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage({ type: "", text: "" });

    try {
      const validateRes = await axios.post(`${API_URL}/coupons/user/validate`, {
        code: couponCode,
        guestId,
        subtotal: subtotal,
      });

      if (validateRes.data.success) {
        const applyRes = await axios.post(`${API_URL}/coupons/user/apply`, {
          code: couponCode,
          guestId,
          subtotal: subtotal,
        });

        if (applyRes.data.success) {
          setCouponMessage({
            type: "success",
            text: `Coupon applied! You saved ₹${formatPrice(validateRes.data.coupon.discountAmount)}`
          });

          await fetchCart();

          setTimeout(() => {
            setShowCouponModal(false);
            setCouponCode("");
            setCouponMessage({ type: "", text: "" });
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Apply coupon error:", err);

      let errorMessage = "Failed to apply coupon";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "Coupon not found";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Invalid coupon code";
      }

      setCouponMessage({ type: "error", text: errorMessage });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/coupons/user/remove/${guestId}`,
      );

      if (response.data.success) {
        setCouponMessage({
          type: "success",
          text: "Coupon removed successfully",
        });
        await fetchCart();
        setTimeout(() => setCouponMessage({ type: "", text: "" }), 3000);
      }
    } catch (err) {
      console.error("Remove coupon error:", err);
      setCouponMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to remove coupon",
      });
      setTimeout(() => setCouponMessage({ type: "", text: "" }), 3000);
    }
  };

  const fetchAvailableCoupons = async () => {
    if (!guestId) return;

    try {
      const response = await axios.post(`${API_URL}/coupons/user/available`, {
        guestId,
        subtotal: subtotal,
      });

      if (response.data.success) {
        setAvailableCoupons(response.data.coupons);
      }
    } catch (err) {
      console.error("Fetch available coupons error:", err);
    }
  };

  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
    fetchAvailableCoupons();
  };

  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );

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

          <Col lg={4} className="my-3 d-lg-none d-md-none">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="summary-card border-0">
                <Card.Body>
                  <h3>Order Summary</h3>

                  <div className="summary-row">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>₹{formatPrice(subtotal)}</span>
                  </div>
                  {cart.appliedCoupon &&
                    cart.appliedCoupon.discountAmount > 0 && (
                      <div className="summary-row coupon-applied">
                        <span>
                          <FaTag className="me-1" /> Coupon ({cart.appliedCoupon.code})
                        </span>
                        <span className="discount">
                          -₹{formatPrice(cart.appliedCoupon.discountAmount)}
                          <FaTimes
                            className="ms-2 remove-coupon"
                            onClick={removeCoupon}
                            style={{ cursor: "pointer", fontSize: "12px" }}
                          />
                        </span>
                      </div>
                    )}

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className={finalShippingCost === 0 ? "free" : ""}>
                      {finalShippingCost === 0
                        ? "FREE"
                        : `₹${formatPrice(finalShippingCost)}`}
                    </span>
                  </div>

                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="summary-row shipping-note">
                      <small>
                        Add ₹{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                        more for free shipping
                      </small>
                    </div>
                  )}

                  <hr />

                  <div className="summary-total">
                    <div>
                      <h4>Total</h4>
                      <p>Inclusive of all taxes</p>
                    </div>
                    <h2>₹{formatPrice(total)}</h2>
                  </div>

                  {cart.appliedCoupon && cart.appliedCoupon.discountAmount > 0 ? (
                    <button
                      className="coupon-btn applied"
                      onClick={removeCoupon}
                    >
                      <FaTag /> Remove Coupon
                    </button>
                  ) : (
                    <button
                      className="coupon-btn"
                      onClick={handleOpenCouponModal}
                    >
                      <FaTag /> Apply Coupon
                    </button>
                  )}

                  <Button as={NavLink} to="/checkout" className="checkout-btn">
                    Proceed to Checkout
                  </Button>

                  <div className="secure-checkout">
                    <FaShieldAlt />
                    <span>Secure Checkout</span>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
            <div className="shipping-box">
              <div className="shipping-top">
                <span>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    "🎉 Congratulations! You've got FREE Shipping!"
                  ) : (
                    <>
                      🎉 Add ₹{formatPrice(amountToFreeShipping)} more for FREE
                      Shipping!
                    </>
                  )}
                </span>
                <span>
                  ₹{formatPrice(subtotal)} / ₹{FREE_SHIPPING_THRESHOLD}
                </span>
              </div>
              <ProgressBar now={shippingProgress} />
            </div>
          </Col>
          <Row className="g-4">
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
                    {cart.items.map((item, index) => {
                      const stock = productStock[item.productId] !== undefined 
                        ? productStock[item.productId] 
                        : item.quantity;
                      const stockStatus = getStockStatus(stock);
                      const isLowStock = stock > 0 && stock <= 10;
                      const isOutOfStock = stock === 0;
                      
                      return (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="cart-card"
                        >
                          <Card className={`border-0 ${isOutOfStock ? 'opacity-50' : ''}`}>
                            <Card.Body>
                              <Row className="align-items-center">
                                <Col md={3} xs={4}>
                                  <div className="cart-img">
                                    <img
                                      src={formatImagePath(item.image)}
                                      alt={item.name}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/placeholder.png";
                                      }}
                                    />
                                  </div>
                                </Col>
                                <Col md={6} xs={8}>
                                  <div className="cart-info">
                                    <h4>{item.name}</h4>
                                    <h5 className="funnel-sans">
                                      ₹{formatPrice(item.price)}
                                    </h5>
                                    
                                    {/* ✅ Stock Status Badge */}
                                    {stockLoading[item.productId] ? (
                                      <Spinner animation="border" size="sm" className="mb-2" />
                                    ) : (
                                      <Badge 
                                        bg={stockStatus.color}
                                        className="mb-2 d-inline-block"
                                        style={{ fontSize: '12px', padding: '5px 10px' }}
                                      >
                                        {stockStatus.icon} {stockStatus.label}
                                      </Badge>
                                    )}

                                    {/* ✅ Low Stock Progress Bar */}
                                    {isLowStock && !isOutOfStock && (
                                      <div className="mt-1 mb-2" style={{ maxWidth: '150px' }}>
                                        <div className="d-flex justify-content-between small">
                                          <span className="text-muted">Stock</span>
                                          <span className="text-muted">{stock} / 10</span>
                                        </div>
                                        <div className="progress" style={{ height: "4px" }}>
                                          <div
                                            className={`progress-bar bg-${stock <= 5 ? 'warning' : 'info'}`}
                                            style={{ width: `${(stock / 10) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* ✅ Out of Stock Warning */}
                                    {isOutOfStock && (
                                      <div className="text-danger small mb-1">
                                        <FaExclamationTriangle className="me-1" />
                                        Out of Stock - Please remove from cart
                                      </div>
                                    )}

                                    <div className="product-meta">
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                    <div className="item-total">
                                      <small>
                                        Item Total: ₹
                                        {formatPrice(item.price * item.quantity)}
                                      </small>
                                    </div>
                                    <div className="cart-actions">
                                      <button
                                        onClick={() => removeItem(item.productId)}
                                        disabled={isOutOfStock}
                                      >
                                        <FaTrash /> {isOutOfStock ? 'Remove' : 'Remove'}
                                      </button>
                                    </div>
                                  </div>
                                </Col>
                                <Col md={3} xs={12}>
                                  <div className="qty-box">
                                    <button
                                      onClick={() =>
                                        updateQty(item.productId, "dec")
                                      }
                                      disabled={isOutOfStock}
                                    >
                                      <FaMinus />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                      onClick={() =>
                                        updateQty(item.productId, "inc")
                                      }
                                      disabled={item.quantity >= stock || isOutOfStock}
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>
                                  {!isOutOfStock && stock > 0 && (
                                    <small className="text-muted d-block text-center mt-1">
                                      Max: {stock}
                                    </small>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      );
                    })}

                    <div className="shipping-box d-none d-md-block d-lg-block">
                      <div className="shipping-top">
                        <span>
                          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                            "🎉 Congratulations! You've got FREE Shipping!"
                          ) : (
                            <>
                              🎉 Add ₹{formatPrice(amountToFreeShipping)} more
                              for FREE Shipping!
                            </>
                          )}
                        </span>
                        <span>
                          ₹{formatPrice(subtotal)} / ₹{FREE_SHIPPING_THRESHOLD}
                        </span>
                      </div>
                      <ProgressBar now={shippingProgress} />
                    </div>

                    {couponMessage.text && (
                      <Alert
                        variant={
                          couponMessage.type === "success"
                            ? "success"
                            : "danger"
                        }
                        className="mt-3"
                        dismissible
                        onClose={() => setCouponMessage({ type: "", text: "" })}
                      >
                        {couponMessage.text}
                      </Alert>
                    )}
                  </>
                )}
              </AnimatePresence>
            </Col>

            <Col lg={4} className="d-none d-md-block d-lg-block">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="summary-card border-0">
                  <Card.Body>
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                      <span>Subtotal ({cart.items.length} items)</span>
                      <span>₹{formatPrice(subtotal)}</span>
                    </div>

                    {cart.appliedCoupon && (
                      <div className="summary-row coupon-applied">
                        <span>
                          <FaTag className="me-1" /> Coupon (
                          {cart.appliedCoupon.code})
                        </span>
                        <span className="discount">
                          -₹{formatPrice(cart.appliedCoupon.discountAmount)}
                          <FaTimes
                            className="ms-2 remove-coupon"
                            onClick={removeCoupon}
                            style={{ cursor: "pointer", fontSize: "12px" }}
                          />
                        </span>
                      </div>
                    )}

                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className={finalShippingCost === 0 ? "free" : ""}>
                        {finalShippingCost === 0
                          ? "FREE"
                          : `₹${formatPrice(finalShippingCost)}`}
                      </span>
                    </div>

                    {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                      <div className="summary-row shipping-note">
                        <small>
                          Add ₹{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                          more for free shipping
                        </small>
                      </div>
                    )}

                    <hr />

                    <div className="summary-total">
                      <div>
                        <h4>Total</h4>
                        <p>Inclusive of all taxes</p>
                      </div>
                      <h2>₹{formatPrice(total)}</h2>
                    </div>

                    {!cart.appliedCoupon ? (
                      <button
                        className="coupon-btn"
                        onClick={handleOpenCouponModal}
                      >
                        <FaTag /> Apply Coupon
                      </button>
                    ) : (
                      <button
                        className="coupon-btn applied"
                        onClick={removeCoupon}
                      >
                        <FaTag /> Remove Coupon
                      </button>
                    )}

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

      <Modal
        show={showCouponModal}
        onHide={() => {
          setShowCouponModal(false);
          setCouponMessage({ type: "", text: "" });
          setCouponCode("");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="lexend">
          <Modal.Title>
            <FaGift className="me-2" style={{ color: "#0f5132 " }} />
            Apply Coupon Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="lexend">
          <div className="mb-4">
            <Form.Label className="fw-bold">Enter Coupon Code</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="e.g., SAVE10, WELCOME20, VENDOR10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                autoFocus
                style={{ textTransform: "uppercase" }}
              />
              <Button
                variant="primary"
                onClick={applyCoupon}
                disabled={applyingCoupon}
                style={{ backgroundColor: "#0f5132 ", borderColor: "#0f5132 " }}
              >
                {applyingCoupon ? <FaSpinner className="fa-spin" /> : "Apply"}
              </Button>
            </div>
            {couponMessage.text && (
              <Alert
                variant={
                  couponMessage.type === "success" ? "success" : "warning"
                }
                className="mt-3"
              >
                {couponMessage.text}
              </Alert>
            )}
          </div>

          {availableCoupons.length > 0 && (
            <>
              <hr />
              <div>
                <h6 className="mb-3">
                  <FaTag className="me-2" />
                  Available Coupons for You
                </h6>
                <Row className="g-3">
                  {availableCoupons.map((coupon, idx) => (
                    <Col md={6} key={idx}>
                      <div
                        className="available-coupon-card p-3 border rounded"
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                        onClick={() => {
                          setCouponCode(coupon.code);
                          setTimeout(() => applyCoupon(), 100);
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong className="text-primary">
                            {coupon.code}
                          </strong>
                          {coupon.vendorName && (
                            <small className="text-muted">
                              <FaStore size={10} /> {coupon.vendorName}
                            </small>
                          )}
                        </div>
                        <p className="small mb-1">
                          {coupon.description ||
                            `${coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}`}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="text-success fw-bold">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                          {coupon.minOrderAmount > 0 && (
                            <small className="text-muted">
                              Min. ₹{coupon.minOrderAmount}
                            </small>
                          )}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 mt-2 text-decoration-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCouponCode(coupon.code);
                            setTimeout(() => applyCoupon(), 100);
                          }}
                        >
                          Apply Now →
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}

          <div className="mt-4 pt-2">
            <small className="text-muted">
              <strong>Note:</strong>
              <ul className="small mt-1 mb-0">
                <li>Coupons are case-insensitive</li>
                <li>Minimum order conditions may apply</li>
                <li>Only one coupon can be applied per order</li>
              </ul>
            </small>
          </div>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
};

export default Cart;