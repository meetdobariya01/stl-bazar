// import React, { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   ProgressBar,
// } from "react-bootstrap";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FaTrash,
//   FaMinus,
//   FaPlus,
//   FaShoppingBag,
//   FaShieldAlt,
//   FaTag,
// } from "react-icons/fa";
// import axios from "axios";
// import "./cart.css";
// import Header from "../../components/header/header";
// import Footer from "../../components/footer/footer";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

// // ✅ Helper function to format prices
// const formatPrice = (price) => {
//   if (!price && price !== 0) return "0.00";
//   const numPrice = typeof price === 'string' ? parseFloat(price) : price;
//   if (isNaN(numPrice)) return "0.00";
//   return numPrice.toFixed(2);
// };

// const Cart = () => {
//   const [cart, setCart] = useState({ items: [] });
//   const guestId = localStorage.getItem("guestId");

//   // FETCH CART
//   const fetchCart = async () => {
//     if (!guestId) return;

//     try {
//       const res = await axios.get(`${API_URL}/cart/${guestId}`);
//       setCart(res.data || { items: [] });
//     } catch (err) {
//       console.error("Fetch cart error:", err.response?.data || err.message);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, [guestId]);

//   // UPDATE QTY
//   const updateQty = async (productId, type) => {
//     const item = cart.items.find((i) => i.productId === productId);
//     if (!item) return;

//     const newQuantity = type === "inc" ? item.quantity + 1 : item.quantity - 1;
    
//     if (newQuantity < 1) {
//       removeItem(productId);
//       return;
//     }

//     try {
//       await axios.post(`${API_URL}/cart/add`, {
//         guestId,
//         product: {
//           productId: item.productId,
//           name: item.name,
//           price: item.price,
//           image: item.image,
//           quantity: type === "inc" ? 1 : -1,
//         },
//       });

//       fetchCart();
//     } catch (err) {
//       console.error("Update quantity error:", err.response?.data || err.message);
//     }
//   };

//   // REMOVE ITEM
//   const removeItem = async (productId) => {
//     try {
//       await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);
//       fetchCart();
//     } catch (err) {
//       console.error("Remove item error:", err.response?.data || err.message);
//     }
//   };

//   const subtotal = cart.items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );

//   const shipping = subtotal > 1499 ? 0 : 99;
//   const total = subtotal + shipping;

//   return (
//     <>
//       <Header />

//       <section className="cart-page lexend">
//         <Container>
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="cart-top"
//           >
//             <div>
//               <h2 className="funnel-sans">Your Cart ({cart.items.length})</h2>
//               <p>Review your items and proceed to checkout.</p>
//             </div>

//             <NavLink to="/" className="continue-shopping">
//               ← Continue Shopping
//             </NavLink>
//           </motion.div>

//           <Row className="g-4">
//             {/* LEFT */}
//             <Col lg={8}>
//               <AnimatePresence>
//                 {cart.items.length === 0 ? (
//                   <motion.div
//                     className="empty-cart"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     <FaShoppingBag size={70} />
//                     <h4>Your Cart is Empty</h4>

//                     <Button as={NavLink} to="/" className="shop-btn">
//                       Continue Shopping
//                     </Button>
//                   </motion.div>
//                 ) : (
//                   <>
//                     {cart.items.map((item, index) => (
//                       <motion.div
//                         key={item.productId}
//                         initial={{ opacity: 0, y: 30 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="cart-card"
//                       >
//                         <Card className="border-0">
//                           <Card.Body>
//                             <Row className="align-items-center">
//                               {/* IMAGE */}
//                               <Col md={3} xs={4}>
//                                 <div className="cart-img">
//                                   <img 
//                                     src={item.image || "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image"} 
//                                     alt={item.name} 
//                                   />
//                                 </div>
//                               </Col>

//                               {/* INFO */}
//                               <Col md={6} xs={8}>
//                                 <div className="cart-info">
//                                   <h4>{item.name}</h4>

//                                   {/* ✅ Fixed price format */}
//                                   <h5 className="funnel-sans">₹{formatPrice(item.price)}</h5>

//                                   <div className="product-meta">
//                                     <span>Qty: {item.quantity}</span>
//                                   </div>

//                                   {/* ✅ Fixed item total */}
//                                   <div className="item-total">
//                                     <small>Item Total: ₹{formatPrice(item.price * item.quantity)}</small>
//                                   </div>

//                                   <div className="cart-actions">
//                                     <button
//                                       onClick={() => removeItem(item.productId)}
//                                     >
//                                       <FaTrash /> Remove
//                                     </button>
//                                   </div>
//                                 </div>
//                               </Col>

//                               {/* QTY */}
//                               <Col md={3} xs={12}>
//                                 <div className="qty-box">
//                                   <button
//                                     onClick={() =>
//                                       updateQty(item.productId, "dec")
//                                     }
//                                   >
//                                     <FaMinus />
//                                   </button>

//                                   <span>{item.quantity}</span>

//                                   <button
//                                     onClick={() =>
//                                       updateQty(item.productId, "inc")
//                                     }
//                                   >
//                                     <FaPlus />
//                                   </button>
//                                 </div>
//                               </Col>
//                             </Row>
//                           </Card.Body>
//                         </Card>
//                       </motion.div>
//                     ))}

//                     {/* SHIPPING BAR */}
//                     <div className="shipping-box">
//                       <div className="shipping-top">
//                         <span>🎉 Add more items to reach free shipping!</span>

//                         {/* ✅ Fixed price format */}
//                         <span>₹{formatPrice(subtotal)} / ₹1499</span>
//                       </div>

//                       <ProgressBar now={Math.min((subtotal / 1499) * 100, 100)} />
//                     </div>
//                   </>
//                 )}
//               </AnimatePresence>
//             </Col>

//             {/* RIGHT */}
//             <Col lg={4}>
//               <motion.div
//                 initial={{ opacity: 0, x: 40 }}
//                 animate={{ opacity: 1, x: 0 }}
//               >
//                 <Card className="summary-card border-0">
//                   <Card.Body>
//                     <h3>Order Summary</h3>

//                     <div className="summary-row">
//                       <span>Subtotal ({cart.items.length} items)</span>
//                       {/* ✅ Fixed price format */}
//                       <span>₹{formatPrice(subtotal)}</span>
//                     </div>

//                     <div className="summary-row">
//                       <span>Shipping</span>
//                       <span>{shipping === 0 ? "FREE" : `₹${formatPrice(shipping)}`}</span>
//                     </div>

//                     {shipping > 0 && (
//                       <div className="summary-row discount">
//                         <span>Add ₹{formatPrice(1499 - subtotal)} more for free shipping</span>
//                         <span>-</span>
//                       </div>
//                     )}

//                     <hr />

//                     <div className="summary-total">
//                       <div>
//                         <h4>Total</h4>
//                         <p>Inclusive of all taxes</p>
//                       </div>

//                       {/* ✅ Fixed total price */}
//                       <h2>₹{formatPrice(total)}</h2>
//                     </div>

//                     <button className="coupon-btn">
//                       <FaTag /> Apply Coupon
//                     </button>

//                     <Button
//                       as={NavLink}
//                       to="/checkout"
//                       className="checkout-btn"
//                     >
//                       Proceed to Checkout
//                     </Button>

//                     <div className="secure-checkout">
//                       <FaShieldAlt />
//                       <span>Secure Checkout</span>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </motion.div>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       <Footer />
//     </>
//   );
// };

// export default Cart;


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
  Spinner
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
  FaStore
} from "react-icons/fa";
import axios from "axios";
import "./cart.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const getImageUrl = (image) => {
  if (!image) return "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image";
  if (Array.isArray(image) && image.length > 0) return image[0];
  if (typeof image === 'string') return image;
  return "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image";
};

const Cart = () => {
  const [cart, setCart] = useState({ items: [], appliedCoupon: null });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const guestId = localStorage.getItem("guestId");

  const fetchCart = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      setCart(res.data || { items: [], appliedCoupon: null });
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  const updateQty = async (productId, type) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

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
      console.error("Update quantity error:", err.response?.data || err.message);
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

  // Calculate totals
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const FREE_SHIPPING_THRESHOLD = 1500;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const couponDiscount = cart.appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const finalShippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const total = discountedSubtotal + finalShippingCost;

  // APPLY COUPON - User Action
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage({ type: "", text: "" });

    try {
      // Get cart items with vendor info for validation
      const cartItemsWithVendor = cart.items.map(item => ({
        productId: item.productId,
        vendorId: item.vendorId,
        price: item.price
      }));

      // Validate coupon
      const response = await axios.post(`${API_URL}/coupon/user/validate`, {
        code: couponCode,
        guestId,
        subtotal: subtotal,
        cartItems: cartItemsWithVendor
      });

      if (response.data.success) {
        // Apply coupon to cart
        await axios.post(`${API_URL}/coupon/user/apply`, {
          code: couponCode,
          guestId,
          subtotal: subtotal
        });

        setCouponMessage({ 
          type: "success", 
          text: `✅ Coupon applied! You saved ₹${formatPrice(response.data.discountAmount)}` 
        });
        
        fetchCart(); // Refresh cart
        setTimeout(() => {
          setShowCouponModal(false);
          setCouponCode("");
        }, 2000);
      }
    } catch (err) {
      setCouponMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Invalid coupon code" 
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  // REMOVE COUPON - User Action
  const removeCoupon = async () => {
    try {
      await axios.delete(`${API_URL}/coupon/user/remove/${guestId}`);
      setCouponMessage({ type: "success", text: "Coupon removed successfully" });
      fetchCart();
      setTimeout(() => setCouponMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Remove coupon error:", err);
      setCouponMessage({ type: "error", text: "Failed to remove coupon" });
    }
  };

  // FETCH AVAILABLE COUPONS for user
  const fetchAvailableCoupons = async () => {
    try {
      const cartItemsWithVendor = cart.items.map(item => ({
        productId: item.productId,
        vendorId: item.vendorId
      }));
      
      const response = await axios.post(`${API_URL}/coupon/user/available`, {
        guestId,
        subtotal: subtotal,
        cartItems: cartItemsWithVendor
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
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

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
                              <Col md={3} xs={4}>
                                <div className="cart-img">
                                  <img 
                                    src={getImageUrl(item.image)} 
                                    alt={item.name} 
                                  />
                                </div>
                              </Col>
                              <Col md={6} xs={8}>
                                <div className="cart-info">
                                  <h4>{item.name}</h4>
                                  <h5 className="funnel-sans">₹{formatPrice(item.price)}</h5>
                                  <div className="product-meta">
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                  <div className="item-total">
                                    <small>Item Total: ₹{formatPrice(item.price * item.quantity)}</small>
                                  </div>
                                  <div className="cart-actions">
                                    <button onClick={() => removeItem(item.productId)}>
                                      <FaTrash /> Remove
                                    </button>
                                  </div>
                                </div>
                              </Col>
                              <Col md={3} xs={12}>
                                <div className="qty-box">
                                  <button onClick={() => updateQty(item.productId, "dec")}>
                                    <FaMinus />
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button onClick={() => updateQty(item.productId, "inc")}>
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
                        <span>
                          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                            "🎉 Congratulations! You've got FREE Shipping!"
                          ) : (
                            <>🎉 Add ₹{formatPrice(amountToFreeShipping)} more for FREE Shipping!</>
                          )}
                        </span>
                        <span>₹{formatPrice(subtotal)} / ₹{FREE_SHIPPING_THRESHOLD}</span>
                      </div>
                      <ProgressBar now={shippingProgress} />
                    </div>

                    {/* Coupon Message Alert */}
                    {couponMessage.text && (
                      <Alert 
                        variant={couponMessage.type === "success" ? "success" : "danger"} 
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
                      <span>₹{formatPrice(subtotal)}</span>
                    </div>

                    {/* Applied Coupon Section */}
                    {cart.appliedCoupon && (
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
                        {finalShippingCost === 0 ? "FREE" : `₹${formatPrice(finalShippingCost)}`}
                      </span>
                    </div>

                    {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                      <div className="summary-row shipping-note">
                        <small>Add ₹{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</small>
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

                    {/* Coupon Button */}
                    {!cart.appliedCoupon ? (
                      <button 
                        className="coupon-btn" 
                        onClick={handleOpenCouponModal}
                      >
                        <FaTag /> Apply Coupon
                      </button>
                    ) : (
                      <button className="coupon-btn applied" onClick={removeCoupon}>
                        <FaTag /> Remove Coupon
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
            </Col>
          </Row>
        </Container>
      </section>

      {/* Coupon Modal - User applies coupon here */}
      <Modal show={showCouponModal} onHide={() => {
        setShowCouponModal(false);
        setCouponMessage({ type: "", text: "" });
        setCouponCode("");
      }} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaGift className="me-2" style={{ color: "#ff6b6b" }} />
            Apply Coupon Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Enter Coupon Code */}
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
                style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
              >
                {applyingCoupon ? <FaSpinner className="fa-spin" /> : "Apply"}
              </Button>
            </div>
            {couponMessage.text && (
              <Alert variant={couponMessage.type === "success" ? "success" : "warning"} className="mt-3">
                {couponMessage.text}
              </Alert>
            )}
          </div>

          {/* Available Coupons Section */}
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
                          <strong className="text-primary">{coupon.code}</strong>
                          {coupon.vendorName && (
                            <small className="text-muted">
                              <FaStore size={10} /> {coupon.vendorName}
                            </small>
                          )}
                        </div>
                        <p className="small mb-1">{coupon.description}</p>
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
                <li>Vendor coupons only apply to that vendor's products in your cart</li>
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