import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaShoppingBag,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./productdetails.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const Productdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ FIXED: Using '/product/' (singular) instead of '/products/' (plural)
      console.log("Fetching product from:", `${API_URL}/product/${id}`);
      
      const response = await axios.get(`${API_URL}/product/${id}`);
      console.log("Product data received:", response.data);
      
      setProduct(response.data);
      
      // Set active image - handle both array and string
      if (response.data.image) {
        if (Array.isArray(response.data.image) && response.data.image.length > 0) {
          const firstImageUrl = getImageUrl(response.data.image[0]);
          setActiveImg(firstImageUrl);
        } else if (typeof response.data.image === 'string') {
          setActiveImg(getImageUrl(response.data.image));
        }
      } else {
        setActiveImg("/images/placeholder.png");
      }
    } catch (err) {
      console.error("Product fetch error details:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      setError(err.response?.data?.message || "Failed to load product. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    if (!image) return "/images/placeholder.png";

    let img = image;

    // If array, take first image for URLs that need a single image
    if (Array.isArray(image)) {
      if (image.length === 0) return "/images/placeholder.png";
      img = image[0];
    }

    const imgStr = String(img);

    // Already full URL
    if (imgStr.startsWith("http")) {
      return imgStr;
    }

    // Backend uploaded image
    if (imgStr.startsWith("/uploads")) {
      return `${BACKEND_URL}${imgStr}`;
    }

    // Local images from public folder
    if (imgStr.startsWith("/images")) {
      return imgStr;
    }

    // If it's just a filename, assume it's in uploads
    if (!imgStr.startsWith("/")) {
      return `${BACKEND_URL}/uploads/${imgStr}`;
    }

    // Fallback
    return `${BACKEND_URL}${imgStr}`;
  };

  // Get all images as array with full URLs
  const getAllImages = () => {
    if (!product) return [];
    
    if (product.image) {
      if (Array.isArray(product.image)) {
        // Filter out null/undefined and get URLs
        const validImages = product.image.filter(img => img && img.trim());
        if (validImages.length > 0) {
          return validImages.map(img => getImageUrl(img));
        }
      } else if (typeof product.image === 'string' && product.image.trim()) {
        return [getImageUrl(product.image)];
      }
    }
    
    return ["/images/placeholder.png"];
  };

  const nextImage = () => {
    const images = getAllImages();
    if (images.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(newIndex);
    setActiveImg(images[newIndex]);
  };

  const prevImage = () => {
    const images = getAllImages();
    if (images.length <= 1) return;
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setActiveImg(images[newIndex]);
  };

  const addToCart = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = Date.now().toString();
        localStorage.setItem("guestId", guestId);
      }

      // Get primary image for cart
      const primaryImage = Array.isArray(product.image) && product.image.length > 0 
        ? product.image[0] 
        : product.image;

      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: primaryImage,
          quantity: qty,
        },
      });

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="text-center py-5">
          <div className="alert alert-danger mx-auto" style={{ maxWidth: "500px" }}>
            <h4>Error Loading Product</h4>
            <p>{error || "Product not found"}</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="outline-secondary" onClick={fetchProduct} className="ms-2">
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = getAllImages();
  const hasMultipleImages = images.length > 1;

  return (
    <>
      <Header />

      {/* ================= PRODUCT DETAILS PAGE ================= */}
      <div className="product-details-page">
        <Container className="py-5 lexend">
          <Row className="g-5">
            {/* LEFT SIDE - IMAGE GALLERY */}
            <Col lg={6}>
              <div className="product-gallery">
                {/* Thumbnail Images */}
                {images.length > 0 && (
                  <div className="thumbnail-list">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`thumb-box ${activeImg === img ? "active" : ""}`}
                        onClick={() => {
                          setActiveImg(img);
                          setCurrentImageIndex(i);
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - view ${i + 1}`}
                          onError={(e) => {
                            e.target.src = "/images/placeholder.png";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Image with Navigation Arrows */}
                <div className="main-image-container" style={{ position: "relative" }}>
                  <motion.div
                    className="main-image-box"
                    key={activeImg}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={activeImg || images[0]}
                      alt={product.name}
                      className="main-product-image"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  </motion.div>

                  {/* Navigation Arrows for Multiple Images */}
                  {hasMultipleImages && (
                    <>
                      <button
                        className="gallery-nav prev"
                        onClick={prevImage}
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className="gallery-nav next"
                        onClick={nextImage}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="image-counter text-center mt-2">
                    <small className="text-muted">
                      {currentImageIndex + 1} / {images.length} images
                    </small>
                  </div>
                )}
              </div>
            </Col>

            {/* RIGHT SIDE - PRODUCT INFO */}
            <Col lg={6}>
              <div className="product-content">
                <span className="best-seller-badge">Bestseller</span>

                <h1 className="funnel-sans">{product.name}</h1>

                <p className="brand-name">Studio Earth</p>

                {/* Ratings */}
                <div className="rating-row">
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
                    <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</button>
                    <input value={qty} readOnly />
                    <button onClick={() => setQty(qty + 1)}>+</button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="action-buttons">
                  <Button className="cart-btn" onClick={addToCart}>
                    <FaShoppingCart /> Add to Cart
                  </Button>
                  <Button className="buy-btn-product-details">Buy Now</Button>
                </div>

                {/* Features */}
                <div className="features-row">
                  <div className="feature-item">
                    <FaHeart /> <span>Handmade with love</span>
                  </div>
                  <div className="feature-item">
                    <FaShieldAlt /> <span>Easy Returns</span>
                  </div>
                  <div className="feature-item">
                    <FaShoppingBag /> <span>Secure Checkout</span>
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
              <p>Clean gently using a dry cloth. Avoid direct sunlight and moisture.</p>
            </details>
            <details>
              <summary className="funnel-sans">Shipping & Returns</summary>
              <p>Free shipping above ₹1499. Easy 7-day returns available.</p>
            </details>
            <details>
              <summary className="funnel-sans">About the Brand</summary>
              <p>Brandel focuses on timeless handcrafted products made with love.</p>
            </details>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Productdetails;