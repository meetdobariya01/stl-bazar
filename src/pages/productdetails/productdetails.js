import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Rating,
  Alert,
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
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./productdetails.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
// ✅ VENDOR BACKEND URL for images
const VENDOR_BACKEND_URL = "https://api.brandelvendor.starlighttechlabsindia.com";

// Helper function to format price
const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const Productdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    userName: "",
    rating: 0,
    review: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      checkWishlistStatus();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/product/${id}`);
      console.log("Product data received:", response.data);

      setProduct(response.data);

      // Set active image - handle both array and string
      if (response.data.image) {
        if (
          Array.isArray(response.data.image) &&
          response.data.image.length > 0
        ) {
          const firstImageUrl = getImageUrl(response.data.image[0]);
          setActiveImg(firstImageUrl);
        } else if (typeof response.data.image === "string") {
          setActiveImg(getImageUrl(response.data.image));
        }
      } else {
        setActiveImg("/images/placeholder.png");
      }
    } catch (err) {
      console.error("Product fetch error details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load product. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}/reviews`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Check if product is in wishlist
  const checkWishlistStatus = async () => {
    try {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) return;

      const res = await axios.get(`${API_URL}/wishlist/${guestId}`);
      const items = res.data.items || [];
      const exists = items.some((item) => item.productId === id);
      setWishlist(exists);
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  // Toggle wishlist
  const toggleWishlist = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = Date.now().toString();
        localStorage.setItem("guestId", guestId);
      }

      if (wishlist) {
        // Remove from wishlist
        await axios.delete(`${API_URL}/wishlist/remove`, {
          data: { guestId, productId: product._id },
        });
        setWishlist(false);
        alert("Removed from wishlist");
      } else {
        // Add to wishlist
        await axios.post(`${API_URL}/wishlist/add`, {
          guestId,
          product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.image) ? product.image[0] : product.image,
          },
        });
        setWishlist(true);
        navigate("/wishlist");
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      alert("Something went wrong");
    }
  };

  // Handle review input changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setReviewData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewData.rating || reviewData.rating === 0) {
      setReviewError("Please select a rating");
      return;
    }
    if (!reviewData.review.trim()) {
      setReviewError("Please write your review");
      return;
    }
    if (!reviewData.userName.trim()) {
      setReviewError("Please enter your name");
      return;
    }

    setSubmitting(true);
    setReviewError("");

    try {
      const response = await axios.post(`${API_URL}/products/${id}/review`, {
        rating: reviewData.rating,
        review: reviewData.review,
        userName: reviewData.userName,
      });

      if (response.data.message) {
        setReviewSuccess("Thank you for your review!");
        setReviewData({
          userName: "",
          rating: 0,
          review: "",
        });

        await fetchReviews();

        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Helper function to get full image URL from VENDOR backend
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

    // ✅ FIXED: Vendor backend uploaded image (starts with /uploads)
    if (imgStr.startsWith("/uploads")) {
      return `${VENDOR_BACKEND_URL}${imgStr}`;
    }

    // Local images from public folder
    if (imgStr.startsWith("/images")) {
      return imgStr;
    }

    // If it's just a filename, assume it's in vendor uploads
    if (!imgStr.startsWith("/")) {
      return `${VENDOR_BACKEND_URL}/uploads/${imgStr}`;
    }

    // Fallback
    return `${VENDOR_BACKEND_URL}${imgStr}`;
  };

  // Get all images as array with full URLs
  const getAllImages = () => {
    if (!product) return [];

    if (product.image) {
      if (Array.isArray(product.image)) {
        const validImages = product.image.filter((img) => img && img.trim());
        if (validImages.length > 0) {
          return validImages.map((img) => getImageUrl(img));
        }
      } else if (typeof product.image === "string" && product.image.trim()) {
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

      const primaryImage =
        Array.isArray(product.image) && product.image.length > 0
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

  // Buy Now function
  const buyNow = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = Date.now().toString();
        localStorage.setItem("guestId", guestId);
      }

      const primaryImage =
        Array.isArray(product.image) && product.image.length > 0
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

      navigate("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      alert("Failed to proceed. Please try again.");
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            color={i < Math.floor(rating) ? "#ffc107" : "#e4e5e9"}
            size={16}
          />
        ))}
        <span className="ms-2 text-muted">{rating.toFixed(1)}</span>
      </div>
    );
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
          <div
            className="alert alert-danger mx-auto"
            style={{ maxWidth: "500px" }}
          >
            <h4>Error Loading Product</h4>
            <p>{error || "Product not found"}</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button
              variant="outline-secondary"
              onClick={fetchProduct}
              className="ms-2"
            >
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
                <div
                  className="main-image-container"
                  style={{ position: "relative" }}
                >
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
              </div>
            </Col>

            {/* RIGHT SIDE - PRODUCT INFO */}
            <Col lg={6}>
              <div className="product-content">
                <span className="best-seller-badge">Bestseller</span>

                <h1 className="funnel-sans">{product.name}</h1>

                {/* Ratings */}
                <div className="rating-row">
                  <div className="stars">{renderStars(averageRating)}</div>
                  <span className="ms-2">
                    {averageRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                  <Button
                    variant="link"
                    className="write-review-btn"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Write a Review
                  </Button>
                </div>

                {/* Price */}
                <div className="price-box funnel-sans">
                  ₹{formatPrice(product.price)}
                </div>

                {/* Wishlist Button */}
                <p
                  className={`wishlist-btn-product-details mt-2 ${wishlist ? "active" : ""}`}
                  onClick={toggleWishlist}
                >
                  <FaHeart className="wishlist-icon" />
                  {wishlist ? "Go to Wishlist" : "Add to Wishlist"}
                </p>

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
                  <div className="qty-box-product-details">
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
                    <FaShoppingCart /> Add to Cart
                  </Button>

                  <Button className="buy-btn-product-details" onClick={buyNow}>
                    Buy Now
                  </Button>
                </div>

                {/* Features */}
                <div className="features-row-product-details">
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
          <div className="product-accordion mt-5">
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

          {/* REVIEWS SECTION */}
          <div className="reviews-section mt-5">
            <div className="reviews-header d-flex justify-content-between align-items-center mb-4">
              <h3 className="funnel-sans">Customer Reviews</h3>
              <Button
                variant="outline-success"
                onClick={() => setShowReviewModal(true)}
              >
                Write a Review
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-5 bg-light rounded">
                <p className="mb-3">
                  No reviews yet. Be the first to review this product!
                </p>
                <Button
                  variant="success"
                  onClick={() => setShowReviewModal(true)}
                >
                  Write a Review
                </Button>
              </div>
            ) : (
              <Row className="g-4">
                {reviews
                  .slice()
                  .reverse()
                  .map((review, index) => (
                    <Col md={4} lg={3} key={index}>
                      <div className="review-card p-3 border rounded h-100">
                        <div className="review-stars mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="review-text mt-3">{review.review}</p>
                        <div className="review-meta mt-3">
                          <div className="reviewer-info d-flex align-items-center">
                            <FaUser className="me-2 text-muted" />
                            <strong>{review.userName || "Anonymous"}</strong>
                          </div>
                          {review.createdAt && (
                            <div className="review-date mt-1">
                              <FaCalendarAlt
                                className="me-1 text-muted"
                                size={12}
                              />
                              <small className="text-muted">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
              </Row>
            )}
          </div>
        </Container>
      </div>

      {/* REVIEW MODAL */}
      <Modal
        show={showReviewModal}
        onHide={() => {
          setShowReviewModal(false);
          setReviewError("");
          setReviewSuccess("");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewSuccess && (
            <Alert
              variant="success"
              onClose={() => setReviewSuccess("")}
              dismissible
            >
              {reviewSuccess}
            </Alert>
          )}
          {reviewError && (
            <Alert
              variant="danger"
              onClose={() => setReviewError("")}
              dismissible
            >
              {reviewError}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Name *</Form.Label>
              <Form.Control
                type="text"
                name="userName"
                value={reviewData.userName}
                onChange={handleReviewChange}
                placeholder="Enter your name"
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={30}
                    className="cursor-pointer me-2"
                    color={star <= reviewData.rating ? "#ffc107" : "#e4e5e9"}
                    onClick={() => !submitting && handleRatingChange(star)}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Review *</Form.Label>
              <Form.Control
                as="textarea"
                name="review"
                rows={5}
                value={reviewData.review}
                onChange={handleReviewChange}
                placeholder="Share your experience with this product..."
                disabled={submitting}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowReviewModal(false);
              setReviewError("");
              setReviewSuccess("");
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default Productdetails;