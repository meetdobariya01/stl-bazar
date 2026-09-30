import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, Button, ProgressBar, Modal, Form, Alert, Spinner, Badge,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash, FaMinus, FaPlus, FaShoppingBag, FaShieldAlt, FaTag, FaTimes,
  FaGift, FaSpinner, FaStore, FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const VENDOR_BACKEND_URL = "https://api-vendor.native91.com";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const formatImagePath = (image) => {
  if (!image) return "/images/placeholder.png";
  let imgPath = image;
  if (Array.isArray(image)) {
    if (image.length === 0) return "/images/placeholder.png";
    imgPath = image[0];
  }
  if (typeof imgPath !== "string" || imgPath.trim() === "") return "/images/placeholder.png";
  if (imgPath.startsWith("http")) return imgPath;
  if (imgPath.startsWith("/uploads")) return `${VENDOR_BACKEND_URL}${imgPath}`;
  if (imgPath.startsWith("/images")) return imgPath;
  return `${VENDOR_BACKEND_URL}${imgPath}`;
};

const getStockStatus = (stock) => {
  if (!stock && stock !== 0) return { label: "In Stock", color: "success", icon: "✅" };
  if (stock === 0) return { label: "Out of Stock", color: "danger", icon: "❌" };
  if (stock <= 5) return { label: `Only ${stock} left!`, color: "warning", icon: "⚠️" };
  if (stock <= 10) return { label: `${stock} in stock`, color: "info", icon: "📦" };
  return { label: `${stock} in stock`, color: "success", icon: "✅" };
};

const waitForFastrrSDK = (maxWait = 10000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === "function") {
        resolve(true);
      } else if (Date.now() - start > maxWait) {
        reject(new Error("Fastrr SDK load timeout"));
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
};

const isMobileDevice = () =>
  typeof window !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], appliedCoupon: null });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [productStock, setProductStock] = useState({});
  const [stockLoading, setStockLoading] = useState({});

  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", country: "India",
  });

  const [prefetchedToken, setPrefetchedToken] = useState(null);
  const [prefetchedOrderId, setPrefetchedOrderId] = useState(null);
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState(null);

  const guestId = localStorage.getItem("guestId");

  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      const cartData = res.data || { items: [], appliedCoupon: null };
      setCart(cartData);
      if (cartData.items?.length > 0) fetchAllProductStocks(cartData.items);
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };

  const fetchAllProductStocks = async (items) => {
    const promises = items.map(async (item) => {
      try {
        const variantIdStr = item.variantId?.toString() || null;
        const url = variantIdStr
          ? `${API_URL}/product/${item.productId}?variantId=${variantIdStr}`
          : `${API_URL}/product/${item.productId}`;
        const response = await axios.get(url);
        return { key: `${item.productId}_${variantIdStr || "default"}`, stock: response.data.stock ?? 0 };
      } catch (err) {
        const variantIdStr = item.variantId?.toString() || null;
        return { key: `${item.productId}_${variantIdStr || "default"}`, stock: item.quantity || 0 };
      }
    });

    try {
      const results = await Promise.all(promises);
      const stockMap = {};
      results.forEach(({ key, stock }) => { stockMap[key] = stock; });
      setProductStock(stockMap);
    } catch (err) {}
  };

  const fetchProductStock = async (productId, variantId = null) => {
    const variantIdStr = variantId?.toString() || null;
    const key = `${productId}_${variantIdStr || "default"}`;
    try {
      setStockLoading((prev) => ({ ...prev, [key]: true }));
      const url = variantIdStr
        ? `${API_URL}/product/${productId}?variantId=${variantIdStr}`
        : `${API_URL}/product/${productId}`;
      const response = await axios.get(url);
      const stock = response.data.stock ?? 0;
      setProductStock((prev) => ({ ...prev, [key]: stock }));
      return stock;
    } catch (err) {
      return 0;
    } finally {
      setStockLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => { fetchCart(); }, [guestId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fastrrAddress");
      if (saved) setAddressForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch (e) {}
  }, []);

  const updateQty = async (productId, type, variantId = null) => {
    const item = cart.items.find((i) => {
      const sameProduct = i.productId === productId;
      const itemVariant = i.variantId?.toString() || null;
      const targetVariant = variantId?.toString() || null;
      return sameProduct && itemVariant === targetVariant;
    });
    if (!item) return;

    if (type === "inc") {
      const stockKey = `${productId}_${variantId || "default"}`;
      const stock = productStock[stockKey] !== undefined
        ? productStock[stockKey]
        : await fetchProductStock(productId, variantId);
      if (item.quantity >= stock) {
        alert(`❌ Only ${stock} items available!`);
        return;
      }
    }

    const newQuantity = type === "inc" ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity < 1) { removeItem(productId, variantId); return; }

    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: item.productId, name: item.name, price: item.price, image: item.image,
          quantity: type === "inc" ? 1 : -1,
          variantId: item.variantId || null,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          variantPrice: item.variantPrice || 0,
          customFieldLabel: item.customFieldLabel || null,
          customFieldValue: item.customFieldValue || null,
        },
      });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity.");
    }
  };

  const removeItem = async (productId, variantId = null) => {
    try {
      const url = variantId
        ? `${API_URL}/cart/remove/${guestId}/${productId}?variantId=${variantId}`
        : `${API_URL}/cart/remove/${guestId}/${productId}`;
      await axios.delete(url);
      fetchCart();
    } catch (err) {}
  };

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 1500;
  const hasItems = cart.items.length > 0;
  const shippingCost = !hasItems ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const couponDiscount = cart.appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const finalShippingCost = !hasItems ? 0 : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const total = hasItems ? discountedSubtotal + finalShippingCost : 0;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }
    setApplyingCoupon(true);
    setCouponMessage({ type: "", text: "" });
    try {
      const validateRes = await axios.post(`${API_URL}/coupons/user/validate`, {
        code: couponCode, guestId, subtotal,
      });
      if (validateRes.data.success) {
        const applyRes = await axios.post(`${API_URL}/coupons/user/apply`, {
          code: couponCode, guestId, subtotal,
        });
        if (applyRes.data.success) {
          setCouponMessage({
            type: "success",
            text: `Coupon applied! You saved ₹${formatPrice(validateRes.data.coupon.discountAmount)}`,
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
      setCouponMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to apply coupon",
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await axios.delete(`${API_URL}/coupons/user/remove/${guestId}`);
      if (response.data.success) {
        setCouponMessage({ type: "success", text: "Coupon removed" });
        await fetchCart();
        setTimeout(() => setCouponMessage({ type: "", text: "" }), 3000);
      }
    } catch (err) {}
  };

  const fetchAvailableCoupons = async () => {
    if (!guestId) return;
    try {
      const response = await axios.post(`${API_URL}/coupons/user/available`, { guestId, subtotal });
      if (response.data.success) setAvailableCoupons(response.data.coupons);
    } catch (err) {}
  };

  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
    fetchAvailableCoupons();
  };

  const isAddressComplete = useCallback(() =>
    addressForm.name && addressForm.email && addressForm.phone &&
    addressForm.address && addressForm.city && addressForm.state && addressForm.pincode,
    [addressForm]
  );

  // ⚡ Prefetch token — modal open thay tyare
  const prefetchAccessToken = useCallback(async () => {
    if (!isAddressComplete() || !cart.items?.length) return;

    setPrefetching(true);
    setPrefetchError(null);

    try {
      const res = await axios.post(`${API_URL}/order/shiprocket-checkout`, {
        guestId,
        shippingAddress: addressForm,
        cartItems: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: Array.isArray(item.image) ? item.image[0] : item.image,
          sku: item.sku || "",
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          customFieldLabel: item.customFieldLabel || null,
          customFieldValue: item.customFieldValue || null,
        })),
        couponCode: cart.appliedCoupon?.code || null,
        subtotal,
        total,
        shippingCost: finalShippingCost,
        couponDiscount,
      });

      if (!res.data.success) {
        setPrefetchError(res.data.message || "Failed to initialize");
        setPrefetchedToken(null);
        return;
      }

      setPrefetchedToken(res.data.accessToken);
      setPrefetchedOrderId(res.data.orderId);
      setPrefetchError(null);
    } catch (err) {
      setPrefetchError(err.response?.data?.message || "Failed to initialize");
      setPrefetchedToken(null);
    } finally {
      setPrefetching(false);
    }
  }, [addressForm, guestId, cart.items, subtotal, total, finalShippingCost, couponDiscount, isAddressComplete, cart.appliedCoupon]);

  // ✅ FIXED: Pre-check compatibility with graceful error handling
  const handleShiprocketCheckoutClick = async () => {
    try {
      const checkRes = await axios.post(
        `${API_URL}/order/check-fastrr-compatibility`,
        {
          cartItems: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
          })),
        }
      );

      if (!checkRes.data.compatible) {
        alert(
          `⚠️ Fast Checkout unavailable for this product.\n\n` +
            `Reason: ${checkRes.data.reason || "Product not found in Fastrr catalog."}\n\n` +
            `Redirecting to standard checkout...`
        );
        navigate("/checkout");
        return;
      }
    } catch (err) {
      console.error("Compatibility check error:", err);

      const reason =
        err.response?.data?.reason ||
        err.response?.data?.message ||
        "Fastrr checkout is currently unavailable.";

      alert(
        `⚠️ ${reason}\n\n` +
          `Redirecting to standard checkout...`
      );
      navigate("/checkout");
      return;
    }

    // ✅ Compatible — open address modal
    setShowAddressModal(true);
  };

  useEffect(() => {
    if (showAddressModal && isAddressComplete()) prefetchAccessToken();
  }, [showAddressModal, isAddressComplete, prefetchAccessToken]);

  const handleAddressPayNow = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAddressComplete()) {
      alert("Please fill all required address fields");
      return;
    }

    localStorage.setItem("fastrrAddress", JSON.stringify(addressForm));

    let token = prefetchedToken;
    let orderId = prefetchedOrderId;

    if (!token) {
      setProcessingCheckout(true);
      try {
        const res = await axios.post(`${API_URL}/order/shiprocket-checkout`, {
          guestId,
          shippingAddress: addressForm,
          cartItems: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: Array.isArray(item.image) ? item.image[0] : item.image,
            sku: item.sku || "",
            selectedColor: item.selectedColor || "",
            selectedSize: item.selectedSize || "",
            customFieldLabel: item.customFieldLabel || null,
            customFieldValue: item.customFieldValue || null,
          })),
          couponCode: cart.appliedCoupon?.code || null,
          subtotal,
          total,
          shippingCost: finalShippingCost,
          couponDiscount,
        });

        if (!res.data.success || !res.data.accessToken) {
          if (
            res.data.code === "FASTRR_CATALOG_MISSING" ||
            res.data.code === "FASTRR_VARIANT_MISSING"
          ) {
            alert(`⚠️ ${res.data.message}\n\nRedirecting to standard checkout...`);
            setProcessingCheckout(false);
            setShowAddressModal(false);
            navigate("/checkout");
            return;
          }
          alert(res.data.message || "Failed to initialize checkout");
          setProcessingCheckout(false);
          return;
        }

        token = res.data.accessToken;
        orderId = res.data.orderId;
      } catch (err) {
        alert(err.response?.data?.message || "Checkout failed. Please use standard checkout.");
        setProcessingCheckout(false);
        return;
      }
    }

    try {
      await waitForFastrrSDK(8000);
    } catch (sdkErr) {
      alert("Fastrr SDK not loaded. Please refresh.");
      setProcessingCheckout(false);
      return;
    }

    setShowAddressModal(false);
    setProcessingCheckout(false);

    setTimeout(() => {
      try {
        window.HeadlessCheckout.addToCart(event, token, {
          fallbackUrl: `${window.location.origin}/order-complete?orderId=${orderId}`,
        });
      } catch (iframeErr) {
        console.error("Iframe error:", iframeErr);
        alert("Failed to open checkout.");
      }
    }, isMobileDevice() ? 400 : 50);
  };

  const handleStandardCheckout = () => navigate("/checkout");

  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <>
      <Header />
      <section className="cart-page lexend">
        <Container>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="cart-top">
            <div>
              <h2 className="funnel-sans">Your Cart ({cart.items.length})</h2>
              <p>Review your items and proceed to checkout.</p>
            </div>
            <NavLink to="/" className="continue-shopping">← Continue Shopping</NavLink>
          </motion.div>

          {cart.items.length === 0 ? (
            <motion.div className="empty-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FaShoppingBag size={70} />
              <h4>Your Cart is Empty</h4>
              <p className="text-muted">Add some products to get started!</p>
              <Button as={NavLink} to="/" className="shop-btn">Continue Shopping</Button>
            </motion.div>
          ) : (
            <Row className="g-4">
              <Col lg={8}>
                <AnimatePresence>
                  {cart.items.map((item, index) => {
                    const variantIdStr = item.variantId?.toString() || "default";
                    const stockKey = `${item.productId}_${variantIdStr}`;
                    const stock = productStock[stockKey] !== undefined ? productStock[stockKey] : item.quantity;
                    const stockStatus = getStockStatus(stock);
                    const isOutOfStock = stock === 0;

                    return (
                      <motion.div
                        key={`${item.productId}_${item.variantId || "default"}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="cart-card"
                      >
                        <Card className={`border-0 ${isOutOfStock ? "opacity-50" : ""}`}>
                          <Card.Body>
                            <Row className="align-items-center">
                              <Col md={3} xs={4}>
                                <div className="cart-img">
                                  <img
                                    src={formatImagePath(item.variantImage || item.image)}
                                    alt={item.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.png"; }}
                                  />
                                </div>
                              </Col>
                              <Col md={6} xs={8}>
                                <div className="cart-info">
                                  <h4>{item.name}</h4>
                                  {(item.selectedColor || item.selectedSize) && (
                                    <div className="cart-variant-info mb-1">
                                      {item.selectedColor && <Badge bg="dark" className="me-1" style={{ fontSize: "11px", padding: "4px 8px" }}>🎨 {item.selectedColor}</Badge>}
                                      {item.selectedSize && <Badge bg="secondary" style={{ fontSize: "11px", padding: "4px 8px" }}>📏 {item.selectedSize}</Badge>}
                                    </div>
                                  )}
                                  {item.customFieldLabel && item.customFieldValue && (
                                    <div className="cart-custom-field mb-2" style={{ fontSize: "12px" }}>
                                      <span style={{ background: "#fff9e6", border: "1px solid #ffd966", borderRadius: "6px", padding: "3px 8px", color: "#7a5c00", display: "inline-block" }}>
                                        <strong>{item.customFieldLabel}:</strong> {item.customFieldValue}
                                      </span>
                                    </div>
                                  )}
                                  <h5 className="funnel-sans">₹{formatPrice(item.price)}</h5>
                                  {stockLoading[stockKey] ? (
                                    <Spinner animation="border" size="sm" className="mb-2" />
                                  ) : (
                                    <Badge bg={stockStatus.color} className="mb-2 d-inline-block" style={{ fontSize: "12px", padding: "5px 10px" }}>
                                      {stockStatus.icon} {stockStatus.label}
                                    </Badge>
                                  )}
                                  <div className="product-meta"><span>Qty: {item.quantity}</span></div>
                                  <div className="item-total">
                                    <small>Item Total: ₹{formatPrice(item.price * item.quantity)}</small>
                                  </div>
                                  <div className="cart-actions">
                                    <button onClick={() => removeItem(item.productId, item.variantId)}>
                                      <FaTrash /> Remove
                                    </button>
                                  </div>
                                </div>
                              </Col>
                              <Col md={3} xs={12}>
                                <div className="qty-box">
                                  <button onClick={() => updateQty(item.productId, "dec", item.variantId)} disabled={isOutOfStock}><FaMinus /></button>
                                  <span>{item.quantity}</span>
                                  <button onClick={() => updateQty(item.productId, "inc", item.variantId)} disabled={item.quantity >= stock || isOutOfStock}><FaPlus /></button>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <div className="shipping-box mt-3">
                  <div className="shipping-top">
                    <span>
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? "🎉 Congratulations! FREE Shipping!"
                        : <>🎉 Add ₹{formatPrice(amountToFreeShipping)} more for FREE Shipping!</>}
                    </span>
                    <span>₹{formatPrice(subtotal)} / ₹{FREE_SHIPPING_THRESHOLD}</span>
                  </div>
                  <ProgressBar now={shippingProgress} />
                </div>

                <div className="d-lg-none mt-3">
                  {!cart.appliedCoupon ? (
                    <button className="coupon-btn w-100" onClick={handleOpenCouponModal}><FaTag /> Apply Coupon</button>
                  ) : (
                    <button className="coupon-btn applied w-100" onClick={removeCoupon}><FaTag /> Remove Coupon ({cart.appliedCoupon.code})</button>
                  )}
                </div>

                {couponMessage.text && (
                  <Alert variant={couponMessage.type === "success" ? "success" : "danger"} className="mt-3" dismissible onClose={() => setCouponMessage({ type: "", text: "" })}>
                    {couponMessage.text}
                  </Alert>
                )}
              </Col>

              <Col lg={4} className="d-none d-lg-block">
                <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="summary-card border-0">
                    <Card.Body>
                      <h3>Order Summary</h3>
                      <div className="summary-row">
                        <span>Subtotal ({cart.items.length} items)</span>
                        <span>₹{formatPrice(subtotal)}</span>
                      </div>
                      {cart.appliedCoupon && (
                        <div className="summary-row coupon-applied">
                          <span><FaTag className="me-1" /> Coupon ({cart.appliedCoupon.code})</span>
                          <span className="discount">
                            -₹{formatPrice(cart.appliedCoupon.discountAmount)}
                            <FaTimes className="ms-2 remove-coupon" onClick={removeCoupon} style={{ cursor: "pointer", fontSize: "12px" }} />
                          </span>
                        </div>
                      )}
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span className={finalShippingCost === 0 ? "free" : ""}>
                          {finalShippingCost === 0 ? "FREE" : `₹${formatPrice(finalShippingCost)}`}
                        </span>
                      </div>
                      <hr />
                      <div className="summary-total">
                        <div><h4>Total</h4><p>Inclusive of all taxes</p></div>
                        <h2>₹{formatPrice(total)}</h2>
                      </div>
                      {!cart.appliedCoupon ? (
                        <button className="coupon-btn" onClick={handleOpenCouponModal}><FaTag /> Apply Coupon</button>
                      ) : (
                        <button className="coupon-btn applied" onClick={removeCoupon}><FaTag /> Remove Coupon</button>
                      )}
                      <Button className="checkout-btn" onClick={handleShiprocketCheckoutClick} disabled={processingCheckout}>
                        {processingCheckout ? <><FaSpinner className="fa-spin me-2" /> Processing...</> : <>⚡ Fast Checkout (Fastrr)</>}
                      </Button>
                      <Button variant="outline-secondary" className="w-100 mt-2" onClick={handleStandardCheckout} style={{ borderRadius: "10px", fontSize: "14px" }}>
                        Standard Checkout (COD / PayU)
                      </Button>
                      <div className="secure-checkout mt-3">
                        <FaShieldAlt /><span>Secure Checkout</span>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {hasItems && (
        <div className="mobile-checkout-bar d-lg-none">
          <div className="mobile-checkout-inner">
            <div className="mobile-total-info">
              <span className="mobile-total-label">Total</span>
              <span className="mobile-total-amount">₹{formatPrice(total)}</span>
              <small className="d-block text-muted" style={{ fontSize: "11px" }}>
                {finalShippingCost === 0 ? "✓ FREE Shipping" : `+ ₹${formatPrice(finalShippingCost)} shipping`}
              </small>
            </div>
            <Button className="mobile-checkout-btn" onClick={handleShiprocketCheckoutClick} disabled={processingCheckout}>
              {processingCheckout ? <FaSpinner className="fa-spin" /> : "Checkout"}
            </Button>
          </div>
        </div>
      )}

      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="lexend">
          <Modal.Title>⚡ Fast Checkout — Shipping Address</Modal.Title>
        </Modal.Header>
        <Modal.Body className="lexend">
          <Alert variant="info" className="small">Fill shipping details to proceed.</Alert>
          <Row className="g-3">
            <Col md={6} xs={12}><Form.Label>Full Name *</Form.Label><Form.Control value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} placeholder="John Doe" /></Col>
            <Col md={6} xs={12}><Form.Label>Email *</Form.Label><Form.Control type="email" value={addressForm.email} onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })} placeholder="john@example.com" /></Col>
            <Col md={6} xs={12}><Form.Label>Phone *</Form.Label><Form.Control type="tel" inputMode="numeric" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="9876543210" maxLength={10} /></Col>
            <Col md={6} xs={12}><Form.Label>Pincode *</Form.Label><Form.Control type="tel" inputMode="numeric" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="400001" maxLength={6} /></Col>
            <Col xs={12}><Form.Label>Address *</Form.Label><Form.Control as="textarea" rows={2} value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="House no, Street, Area" /></Col>
            <Col md={6} xs={12}><Form.Label>City *</Form.Label><Form.Control value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Mumbai" /></Col>
            <Col md={6} xs={12}><Form.Label>State *</Form.Label><Form.Control value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="Maharashtra" /></Col>
          </Row>
          {prefetching && (<div className="mt-3 text-center text-muted small"><FaSpinner className="fa-spin me-2" />Preparing secure checkout...</div>)}
          {prefetchError && (<Alert variant="warning" className="mt-3 small mb-0">⚠️ {prefetchError}</Alert>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleAddressPayNow} disabled={processingCheckout || prefetching}>
            {processingCheckout ? <><FaSpinner className="fa-spin me-2" /> Processing...</> : prefetching ? <><FaSpinner className="fa-spin me-2" /> Preparing...</> : "⚡ Pay Now (Fastrr)"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCouponModal} onHide={() => { setShowCouponModal(false); setCouponMessage({ type: "", text: "" }); setCouponCode(""); }} centered size="lg">
        <Modal.Header closeButton className="lexend">
          <Modal.Title><FaGift className="me-2" style={{ color: "#0f5132 " }} />Apply Coupon Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="lexend">
          <div className="mb-4">
            <Form.Label className="fw-bold">Enter Coupon Code</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control type="text" placeholder="e.g., SAVE10" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} autoFocus style={{ textTransform: "uppercase" }} />
              <Button variant="primary" onClick={applyCoupon} disabled={applyingCoupon} style={{ backgroundColor: "#0f5132 ", borderColor: "#0f5132 " }}>
                {applyingCoupon ? <FaSpinner className="fa-spin" /> : "Apply"}
              </Button>
            </div>
            {couponMessage.text && <Alert variant={couponMessage.type === "success" ? "success" : "warning"} className="mt-3">{couponMessage.text}</Alert>}
          </div>
          {availableCoupons.length > 0 && (
            <>
              <hr />
              <div>
                <h6 className="mb-3"><FaTag className="me-2" /> Available Coupons</h6>
                <Row className="g-3">
                  {availableCoupons.map((coupon, idx) => (
                    <Col md={6} xs={12} key={idx}>
                      <div className="available-coupon-card p-3 border rounded" style={{ cursor: "pointer" }} onClick={() => { setCouponCode(coupon.code); setTimeout(() => applyCoupon(), 100); }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong className="text-primary">{coupon.code}</strong>
                          {coupon.vendorName && <small className="text-muted"><FaStore size={10} /> {coupon.vendorName}</small>}
                        </div>
                        <p className="small mb-1">{coupon.description || `${coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}`}</p>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="text-success fw-bold">{coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}</span>
                          {coupon.minOrderAmount > 0 && <small className="text-muted">Min. ₹${coupon.minOrderAmount}</small>}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
};

export default Cart;
