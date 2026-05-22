import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Nav,
  Tab,
  Form,
  InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaShoppingBag,
  FaShieldAlt,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./productdetails.css";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL;

const Productdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImg(res.data.image || "/images/default-product.png");
      })
      .catch((err) => console.error("Product fetch error", err));
  }, [id]);

  const addToCart = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = Date.now().toString();
        localStorage.setItem("guestId", guestId);
      }

      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: qty,
        },
      });

      // Redirect to cart page after adding
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    }
  };

  if (!product) return <p className="text-center mt-5">Loading product...</p>;

  return (
    <>
      <Header />

      {/* ================= PRODUCT DETAILS PAGE ================= */}
      <div className="product-details-page">
        <Container className="py-5 lexend">
          <Row className="g-5">
            {/* LEFT SIDE */}
            <Col lg={6}>
              <div className="product-gallery">
                {/* Thumbnail Images */}
                <div className="thumbnail-list">
                  {product.images && product.images.length > 0 ? (
                    product.images.map((img, i) => (
                      <div
                        key={i}
                        className={`thumb-box ${activeImg === img ? "active" : ""}`}
                        onClick={() => setActiveImg(img)}
                      >
                        <img src={img} alt="" />
                      </div>
                    ))
                  ) : (
                    <div className="thumb-box active">
                      <img src={product.image} alt="" />
                    </div>
                  )}
                </div>

                {/* Main Image */}
                <motion.div
                  className="main-image-box"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={activeImg || product.image}
                    alt={product.name}
                    className="main-product-image"
                  />
                </motion.div>
              </div>
            </Col>

            {/* RIGHT SIDE */}
            <Col lg={6}>
              <div className="product-content">
                <span className="best-seller-badge">Bestseller</span>

                <h1 className="funnel-sans">{product.name}</h1>

                <p className="brand-name">Studio Earth</p>

                {/* Ratings */}
                <div className="rating-row ">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>

                  <span>4.8 ({product.reviewCount || 126} reviews)</span>
                </div>

                {/* Price */}
                <div className="price-box funnel-sans">₹{product.price}</div>

                <p className="tax-text">
                  Inclusive of all taxes | Free shipping on orders above ₹1499
                </p>

                <p className="description-text">
                  {product.description ||
                    "A timeless piece to elevate your space. This handcrafted ceramic vase is perfect for fresh blooms or a statement decor on its own."}
                </p>

                {/* Quantity */}
                <div className="quantity-section">
                  <span>Quantity</span>

                  <div className="qty-box">
                    <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>
                      −
                    </button>

                    <input value={qty} readOnly />

                    <button onClick={() => setQty(qty + 1)}>+</button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="action-buttons">
                  <Button className="cart-btn" onClick={addToCart}>
                    <FaShoppingCart />
                    Add to Cart
                  </Button>

                  <Button className="buy-btn-product-details">Buy Now</Button>
                </div>

                {/* Features */}
                <div className="features-row">
                  <div className="feature-item">
                    <FaHeart />
                    <span>Handmade with love</span>
                  </div>

                  <div className="feature-item">
                    <FaShieldAlt />
                    <span>Easy Returns</span>
                  </div>

                  <div className="feature-item">
                    <FaShoppingBag />
                    <span>Secure Checkout</span>
                  </div>
                </div>

                {/* Delivery */}
                <div className="delivery-text">
                  Estimated delivery: 3 – 5 business days
                </div>
              </div>
            </Col>
          </Row>

          {/* ACCORDION SECTION */}
          <div className="product-accordion">
            <details open>
              <summary className="funnel-sans">Product Details</summary>
              <p>{product.description}</p>
            </details>

            <details>
              <summary className="funnel-sans">Materials & Care</summary>
              <p>
                Clean gently using a dry cloth. Avoid direct sunlight and
                moisture.
              </p>
            </details>

            <details>
              <summary className="funnel-sans">Shipping & Returns</summary>
              <p>Free shipping above ₹1499. Easy 7-day returns available.</p>
            </details>

            <details>
              <summary className="funnel-sans">About the Brand</summary>
              <p>
                Brandel focuses on timeless handcrafted products made with love.
              </p>
            </details>
          </div>

          {/* REVIEWS */}
          <div className="reviews-section">
            <div className="review-header">
              <h3 className="funnel-sans">
                Reviews ({product.reviewCount || 126})
              </h3>

              <span>View all reviews</span>
            </div>

            <Row className="g-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, i) => (
                  <Col lg={3} md={6} key={i}>
                    <div className="review-card">
                      <div className="review-stars">
                        {[...Array(r.rating)].map((_, j) => (
                          <FaStar key={j} />
                        ))}
                      </div>

                      <p>{r.comment}</p>

                      <h6>{r.name}</h6>

                      <span>Verified Buyer</span>
                    </div>
                  </Col>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4].map((item) => (
                    <Col lg={3} md={6} key={item}>
                      <div className="review-card">
                        <div className="review-stars">
                          {[...Array(5)].map((_, j) => (
                            <FaStar key={j} />
                          ))}
                        </div>

                        <p>Beautiful product and premium quality.</p>

                        <h6>Verified Buyer</h6>

                        <span>★★★★★</span>
                      </div>
                    </Col>
                  ))}
                </>
              )}
            </Row>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Productdetails;