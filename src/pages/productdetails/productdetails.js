import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  Spinner,
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
  FaTicketAlt,
  FaCopy,
  FaCheckCircle,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./productdetails.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const COUPON_API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

// Helper to decode slug back to name
const decodeSlug = (slug) => {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to create slug from name
const createSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const Productdetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [productImages, setProductImages] = useState([]);

  // ================= COUPON STATES =================
  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);
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

  // ================= COUPON FUNCTIONS =================

  const calculateDiscountedPrice = (coupon) => {
    if (!product || !coupon) return null;

    const originalPrice = parseFloat(product.price);
    let discountAmount = 0;

    // Support both field name formats
    const discount = coupon.discount || coupon.discountValue || 0;
    const type = coupon.type || coupon.discountType || 'percentage';
    const maxDiscount = coupon.maxDiscount || 0;

    if (type === 'percentage') {
      discountAmount = (originalPrice * discount) / 100;
      // Apply max discount if exists
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = Math.min(discount, originalPrice);
    }

    const newPrice = originalPrice - discountAmount;
    return {
      originalPrice: originalPrice,
      discountAmount: discountAmount,
      discountedPrice: newPrice,
      savingsPercentage: ((discountAmount / originalPrice) * 100).toFixed(0)
    };
  };

  const applyCoupon = async (coupon) => {
    try {
      const guestId = localStorage.getItem("guestId");

      if (!guestId) {
        alert("Please add product to cart first.");
        return;
      }

      // CRITICAL: Check if coupon is valid for this specific product
      const couponProducts = coupon.products || coupon.productIds || [];
      if (couponProducts.length > 0) {
        const isProductValid = couponProducts.some(id => id.toString() === product._id.toString());
        
        if (!isProductValid) {
          alert("This coupon is not valid for this product.");
          return;
        }
      }

      // Save coupon in database with product context
      await axios.post(`${API_URL}/coupons/user/apply`, {
        guestId,
        code: coupon.code,
        productId: product._id // Send product ID for validation
      });

      // Apply coupon locally
      const priceInfo = calculateDiscountedPrice(coupon);

      setAppliedCoupon(coupon);
      setDiscountedPrice(priceInfo);

      // Store in localStorage
      localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
      localStorage.setItem("discountedPrice", JSON.stringify(priceInfo));
      localStorage.setItem("appliedProductId", product._id);

      alert(`Coupon ${coupon.code} applied successfully`);

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Failed to apply coupon"
      );
    }
  };

  const removeCoupon = async () => {
    try {
      const guestId = localStorage.getItem("guestId");

      if (guestId) {
        await axios.delete(
          `${API_URL}/coupons/user/remove/${guestId}`
        );
      }

      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("discountedPrice");
      localStorage.removeItem("appliedProductId");

      setAppliedCoupon(null);
      setDiscountedPrice(null);

    } catch (err) {
      console.log(err);
    }
  };

  const fetchVendorCoupons = async () => {
    try {
      setCouponLoading(true);

      if (!product?._id) {
        setVendorCoupons([]);
        return;
      }

      const productId = product._id;
      const companyName = product?.company || product?.vendor || product?.vendorName;
      
      console.log("=== FETCHING COUPONS ===");
      console.log("Product ID:", productId);
      console.log("Company name:", companyName);

      // Check if the applied coupon from localStorage is valid for this product
      const storedCoupon = localStorage.getItem("appliedCoupon");
      const storedProductId = localStorage.getItem("appliedProductId");
      
      // If the stored coupon is for a different product, remove it
      if (storedProductId && storedProductId !== productId) {
        console.log("⚠️ Stored coupon is for a different product. Removing...");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discountedPrice");
        localStorage.removeItem("appliedProductId");
        setAppliedCoupon(null);
        setDiscountedPrice(null);
      }

      // FIRST: Try to get coupons specifically for this product
      try {
        const response = await axios.get(`${COUPON_API_URL}/coupons/public/product/${productId}`);
        console.log("Product coupon response:", response.data);
        
        if (response.data.success && response.data.coupons) {
          console.log(`Found ${response.data.coupons.length} coupons from API`);
          
          // STRICT filtering - ONLY show coupons that explicitly include this product
          const validCoupons = response.data.coupons.filter(coupon => {
            const couponProducts = coupon.products || coupon.productIds || [];
            
            console.log(`\n--- Checking coupon: ${coupon.code} ---`);
            console.log(`Coupon products:`, couponProducts);
            console.log(`Coupon products count: ${couponProducts.length}`);
            
            // If NO products specified → applies to ALL products
            if (couponProducts.length === 0) {
              console.log(`✅ ${coupon.code} applies to ALL products - SHOWING`);
              return true;
            }
            
            // Check if this product is in the coupon's products list
            const isIncluded = couponProducts.some(id => {
              const idStr = id ? id.toString() : '';
              const productIdStr = productId.toString();
              const matches = idStr === productIdStr;
              if (matches) {
                console.log(`✅ Product ${productIdStr} FOUND in coupon ${coupon.code}`);
              }
              return matches;
            });
            
            if (isIncluded) {
              console.log(`✅ ${coupon.code} INCLUDES this product - SHOWING`);
              return true;
            } else {
              console.log(`❌ ${coupon.code} does NOT include product ${productId} - HIDING`);
              return false;
            }
          });
          
          console.log(`\n✅ After strict filtering: ${validCoupons.length} valid coupons`);
          setVendorCoupons(validCoupons);
          
          // If no valid coupons and there's a stored coupon, remove it
          if (validCoupons.length === 0 && storedCoupon) {
            console.log("⚠️ No valid coupons for this product. Removing stored coupon...");
            localStorage.removeItem("appliedCoupon");
            localStorage.removeItem("discountedPrice");
            localStorage.removeItem("appliedProductId");
            setAppliedCoupon(null);
            setDiscountedPrice(null);
          }
          
          return;
        }
      } catch (err) {
        console.error("Product coupon fetch failed:", err);
      }

      // SECOND: Try to get company coupons with product filter
      if (companyName) {
        try {
          const response = await axios.get(
            `${COUPON_API_URL}/coupons/public/company/${encodeURIComponent(companyName)}`,
            { 
              params: { productId: productId }
            }
          );
          console.log("Company coupon response:", response.data);
          
          if (response.data.success && response.data.coupons) {
            // STRICT filtering on company coupons too
            const validCoupons = response.data.coupons.filter(coupon => {
              const couponProducts = coupon.products || coupon.productIds || [];
              
              // If no products specified → applies to ALL products
              if (couponProducts.length === 0) {
                return true;
              }
              
              // Check if this product is in the list
              return couponProducts.some(id => id.toString() === productId.toString());
            });
            
            console.log(`Found ${validCoupons.length} valid company coupons`);
            setVendorCoupons(validCoupons);
            
            // If no valid coupons and there's a stored coupon, remove it
            if (validCoupons.length === 0 && storedCoupon) {
              console.log("⚠️ No valid company coupons for this product. Removing stored coupon...");
              localStorage.removeItem("appliedCoupon");
              localStorage.removeItem("discountedPrice");
              localStorage.removeItem("appliedProductId");
              setAppliedCoupon(null);
              setDiscountedPrice(null);
            }
            
            return;
          }
        } catch (err) {
          console.error("Company coupon fetch failed:", err);
        }
      }

      // No coupons found - clear any stored coupon
      console.log("No coupons found for this product");
      setVendorCoupons([]);
      
      // Clear stored coupon if it exists
      if (storedCoupon) {
        console.log("⚠️ No coupons available. Removing stored coupon...");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discountedPrice");
        localStorage.removeItem("appliedProductId");
        setAppliedCoupon(null);
        setDiscountedPrice(null);
      }
    } catch (err) {
      console.error("Error in fetchVendorCoupons:", err);
      setVendorCoupons([]);
    } finally {
      setCouponLoading(false);
    }
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return "/images/placeholder.png";

    let img = image;

    if (Array.isArray(image)) {
      if (image.length === 0) return "/images/placeholder.png";
      img = image[0];
    }

    const imgStr = String(img).trim();

    // If it's already a full URL, return it
    if (imgStr.startsWith("http://") || imgStr.startsWith("https://")) {
      return imgStr;
    }

    // Check if this is a vendor uploaded image (starts with /uploads/)
    if (imgStr.startsWith("/uploads")) {
      // Use the vendor API URL for vendor images
      return `https://api.brandelvendor.starlighttechlabsindia.com${imgStr}`;
    }

    // Handle other image paths
    if (imgStr.startsWith("/images")) {
      return imgStr;
    }

    // If no leading slash, try with both APIs
    if (!imgStr.startsWith("/") && !imgStr.startsWith("http")) {
      // Try vendor API first (for vendor images)
      return `https://api.brandelvendor.starlighttechlabsindia.com/uploads/${imgStr}`;
    }

    // Fallback to local API
    return `${API_URL}${imgStr}`;
  };

  const getAllImagesFromProduct = (product) => {
    if (!product) return ["/images/placeholder.png"];

    let images = [];
    const imageFields = ['images', 'image', 'productImages', 'gallery'];

    for (const field of imageFields) {
      if (product[field]) {
        if (Array.isArray(product[field])) {
          const validImages = product[field]
            .filter(img => img && typeof img === 'string' && img.trim())
            .map(img => getImageUrl(img));
          images = [...images, ...validImages];
        } else if (typeof product[field] === 'string' && product[field].trim()) {
          images.push(getImageUrl(product[field]));
        }
      }
    }

    images = [...new Set(images)];

    if (images.length === 0) {
      images = ["/images/placeholder.png"];
    }

    return images;
  };

  // Fetch product by slug
  useEffect(() => {
    if (slug) {
      fetchProductBySlug();
    }
  }, [slug]);

  // Check localStorage for applied coupon when product changes
  useEffect(() => {
    const coupon = localStorage.getItem("appliedCoupon");
    const price = localStorage.getItem("discountedPrice");
    const storedProductId = localStorage.getItem("appliedProductId");

    // Only apply stored coupon if it matches the current product
    if (coupon && price && storedProductId && product?._id) {
      if (storedProductId === product._id) {
        setAppliedCoupon(JSON.parse(coupon));
        setDiscountedPrice(JSON.parse(price));
      } else {
        // Stored coupon is for a different product - clear it
        console.log("⚠️ Stored coupon is for a different product. Clearing...");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discountedPrice");
        localStorage.removeItem("appliedProductId");
        setAppliedCoupon(null);
        setDiscountedPrice(null);
      }
    }
  }, [product]);

  // Fetch coupons when product is loaded
  useEffect(() => {
    if (product) {
      fetchVendorCoupons();
    }
  }, [product]);

  const fetchProductBySlug = async () => {
    try {
      setLoading(true);
      setError(null);

      const productName = decodeSlug(slug);

      const response = await axios.get(`${API_URL}/products`);
      const products = response.data;
      setAllProducts(products);

      let foundProduct = null;

      foundProduct = products.find(
        p => p.name && p.name.toLowerCase() === productName.toLowerCase()
      );

      if (!foundProduct) {
        const productSlug = createSlug(productName);
        foundProduct = products.find(
          p => p.name && createSlug(p.name) === productSlug
        );
      }

      if (!foundProduct) {
        const searchTerms = productName.toLowerCase().split(' ');
        foundProduct = products.find(p => {
          if (!p.name) return false;
          const nameLower = p.name.toLowerCase();
          return searchTerms.some(term => nameLower.includes(term));
        });
      }

      if (!foundProduct && slug.length === 24) {
        try {
          const productResponse = await axios.get(`${API_URL}/product/${slug}`);
          if (productResponse.data) {
            foundProduct = productResponse.data;
          }
        } catch (idErr) {
          console.log("ID fallback failed");
        }
      }

      if (!foundProduct) {
        throw new Error(`Product "${productName}" not found`);
      }

      setProduct(foundProduct);

      const allImages = getAllImagesFromProduct(foundProduct);
      setProductImages(allImages);

      if (allImages.length > 0) {
        setActiveImg(allImages[0]);
        setCurrentImageIndex(0);
      } else {
        setActiveImg("/images/placeholder.png");
      }

      await fetchReviews(foundProduct._id);
      await checkWishlistStatus(foundProduct._id);

    } catch (err) {
      console.error("Product fetch error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load product. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const id = productId || product?._id;
      if (!id) return;
      const response = await axios.get(`${API_URL}/products/${id}/reviews`);

      const reviewsData = response.data.reviews || [];
      const sanitizedReviews = reviewsData.map(review => ({
        _id: String(review._id || ''),
        userName: String(review.userName || 'Anonymous'),
        rating: typeof review.rating === 'number' ? review.rating : 0,
        review: String(review.review || ''),
        createdAt: review.createdAt || new Date().toISOString(),
      }));

      setReviews(sanitizedReviews);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) return;

      const res = await axios.get(`${API_URL}/wishlist/${guestId}`);
      const items = res.data.items || [];
      const exists = items.some((item) => item.productId === productId);
      setWishlist(exists);
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  const toggleWishlist = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = Date.now().toString();
        localStorage.setItem("guestId", guestId);
      }

      if (wishlist) {
        await axios.delete(`${API_URL}/wishlist/remove`, {
          data: { guestId, productId: product._id },
        });
        setWishlist(false);
        alert("Removed from wishlist");
      } else {
        await axios.post(`${API_URL}/wishlist/add`, {
          guestId,
          product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.image)
              ? product.image[0]
              : product.image,
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

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (newRating) => {
    setReviewData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

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
      const response = await axios.post(`${API_URL}/products/${product._id}/review`, {
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

        await fetchReviews(product._id);

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

  const nextImage = () => {
    if (productImages.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % productImages.length;
    setCurrentImageIndex(newIndex);
    setActiveImg(productImages[newIndex]);
  };

  const prevImage = () => {
    if (productImages.length <= 1) return;
    const newIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    setCurrentImageIndex(newIndex);
    setActiveImg(productImages[newIndex]);
  };

  // Add to Cart
  const addToCart = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      const finalPrice = discountedPrice ? discountedPrice.discountedPrice : product.price;

      const primaryImage =
        Array.isArray(product.image) && product.image.length > 0
          ? product.image[0]
          : product.image || "";
      const payload = {
        guestId: String(guestId),
        productId: String(product._id),
        name: String(product.name),

        price: parseFloat(finalPrice),

        originalPrice: parseFloat(product.price),

        discountAmount: discountedPrice
          ? discountedPrice.discountAmount
          : 0,

        couponCode: appliedCoupon
          ? appliedCoupon.code
          : null,

        image: String(primaryImage),

        quantity: parseInt(qty),
      };
      const response = await axios.post(`${API_URL}/cart/add`, payload);

      if (response.data.success !== false) {
        alert("Added to cart!");
        navigate("/cart");
      } else {
        alert(response.data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart. Please try again.");
    }
  };

  // Buy Now
  const buyNow = async () => {
    try {
      let guestId = localStorage.getItem("guestId");

      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      const finalPrice = discountedPrice ? discountedPrice.discountedPrice : product.price;

      const primaryImage =
        Array.isArray(product.image) && product.image.length > 0
          ? product.image[0]
          : product.image || "";

      const payload = {
        guestId: String(guestId),
        productId: String(product._id),
        name: String(product.name || 'Product'),
        price: parseFloat(finalPrice) || 0,
        originalPrice: parseFloat(product.price) || 0,
        image: String(primaryImage || ''),
        quantity: parseInt(qty) || 1,
        couponApplied: appliedCoupon ? String(appliedCoupon.code) : null,
      };

      await axios.post(`${API_URL}/cart/add`, payload);
      navigate("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      alert("Failed to proceed. Please try again.");
    }
  };

  const renderStars = (rating) => {
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            color={i < Math.floor(numRating) ? "#ffc107" : "#e4e5e9"}
            size={16}
          />
        ))}
        <span className="ms-2 text-muted">{numRating.toFixed(1)}</span>
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
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Button variant="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button
                variant="outline-secondary"
                onClick={fetchProductBySlug}
                className="ms-2"
              >
                Try Again
              </Button>
              <Button
                variant="outline-success"
                onClick={() => navigate("/category/All")}
              >
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const hasMultipleImages = productImages.length > 1;
  const displayPrice = discountedPrice ? discountedPrice.discountedPrice : product.price;
  const originalPrice = product.price;

  return (
    <>
      <Header />

      <div className="product-details-page">
        <Container className="py-5 lexend">
          <Row className="g-5">
            {/* LEFT SIDE - IMAGE GALLERY */}
            <Col lg={6}>
              <div className="product-gallery">
                {productImages.length > 0 && (
                  <div className="thumbnail-list">
                    {productImages.map((img, i) => (
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
                      src={activeImg || productImages[0] || "/images/placeholder.png"}
                      alt={product.name}
                      className="main-product-image"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  </motion.div>

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
                          background: "rgba(0,0,0,0.6)",
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
                          transition: "all 0.3s ease",
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
                          background: "rgba(0,0,0,0.6)",
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
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}

                  {hasMultipleImages && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        zIndex: 10,
                      }}
                    >
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* RIGHT SIDE - PRODUCT INFO */}
            <Col lg={6}>
              <div className="product-content">
                <span className="best-seller-badge">Bestseller</span>

                <h1 className="funnel-sans">{String(product.name)}</h1>
                <div className="product-brand">
                  {String(product.company || "Brand Name")}
                </div>
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

                {/* PRICE DISPLAY */}
                <div className="price-box funnel-sans">
                  {discountedPrice ? (
                    <>
                      <span className="original-price" style={{ textDecoration: 'line-through', color: '#999', marginRight: '10px' }}>
                        ₹{formatPrice(originalPrice)}
                      </span>
                      <span className="discounted-price" style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.3em' }}>
                        ₹{formatPrice(displayPrice)}
                      </span>
                      <span className="savings-badge" style={{
                        background: '#e74c3c',
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        marginLeft: '10px',
                        fontWeight: 'bold'
                      }}>
                        Save ₹{formatPrice(discountedPrice.discountAmount)} ({discountedPrice.savingsPercentage}% OFF)
                      </span>
                    </>
                  ) : (
                    <>
                      ₹{formatPrice(originalPrice)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price" style={{ textDecoration: 'line-through', color: '#999', marginLeft: '10px', fontSize: '0.8em' }}>
                          ₹{formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Applied Coupon Badge - Only show if coupon is valid for this product */}
                {appliedCoupon && discountedPrice && (
                  <div className="applied-coupon-badge mt-2" style={{
                    background: '#d4edda',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <FaCheckCircle className="text-success me-2" />
                      <span style={{ fontWeight: 'bold' }}>{String(appliedCoupon.code)}</span>
                      <span className="ms-2 text-success">
                        ₹{formatPrice(discountedPrice.discountAmount)} OFF applied!
                      </span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={removeCoupon}
                    >
                      Remove
                    </Button>
                  </div>
                )}

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
                  {String(product.description || "A timeless piece to elevate your space.")}
                </p>

                {/* COUPONS SECTION - UPDATED WITH DOUBLE CHECK */}
                {vendorCoupons.length > 0 && !couponLoading && (
                  <div className="vendor-coupons-section mt-3 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">
                        <FaTicketAlt className="me-2 text-success" />
                        Available Offers
                        <Badge bg="success" className="ms-2">
                          {vendorCoupons.length}
                        </Badge>
                      </h6>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="text-decoration-none p-0"
                      >
                        {showCoupons ? 'Hide' : 'View All'}
                      </Button>
                    </div>

                    {showCoupons && (
                      <div className="coupon-list mt-2">
                        {vendorCoupons.map((coupon, index) => {
                          // DOUBLE CHECK: Only show if coupon applies to this product
                          const couponProducts = coupon.products || coupon.productIds || [];
                          const shouldShow = couponProducts.length === 0 || 
                                            couponProducts.some(id => id.toString() === product._id.toString());
                          
                          // Skip if coupon doesn't apply to this product
                          if (!shouldShow) {
                            return null;
                          }

                          const isApplied = appliedCoupon && appliedCoupon.code === coupon.code;
                          const priceInfo = calculateDiscountedPrice(coupon);
                          const discount = coupon.discount || coupon.discountValue || 0;
                          const type = coupon.type || coupon.discountType || 'percentage';

                          return (
                            <div
                              key={coupon._id || index}
                              className={`coupon-item p-2 mb-2 border rounded bg-white d-flex justify-content-between align-items-center ${isApplied ? 'border-success' : ''}`}
                              style={isApplied ? { background: '#f0fff4' } : {}}
                            >
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-success me-2">
                                    {type === 'percentage'
                                      ? `${discount}% OFF`
                                      : `₹${discount} OFF`}
                                  </span>
                                  <strong className="text-primary">{String(coupon.code)}</strong>
                                  {isApplied && (
                                    <Badge bg="success" className="ms-2">
                                      <FaCheckCircle className="me-1" /> Applied
                                    </Badge>
                                  )}
                                </div>
                                <p className="mb-0 small text-muted">
                                  {String(coupon.description || `${type === 'percentage' ? discount + '%' : '₹' + discount} off`)}
                                </p>
                                {priceInfo && (
                                  <small className="text-success">
                                    New price: ₹{formatPrice(priceInfo.discountedPrice)}
                                    {' '}(Save ₹{formatPrice(priceInfo.discountAmount)})
                                  </small>
                                )}
                                {coupon.company && (
                                  <small className="text-muted ms-2">
                                    By: {String(coupon.company)}
                                  </small>
                                )}
                                {coupon.expiryDate && (
                                  <small className="text-muted ms-2">
                                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                  </small>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-1">
                                {!isApplied ? (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => applyCoupon(coupon)}
                                    className="ms-2"
                                  >
                                    Apply
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={removeCoupon}
                                    className="ms-2"
                                  >
                                    Remove
                                  </Button>
                                )}
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(coupon.code));
                                    alert(`Coupon code "${coupon.code}" copied!`);
                                  }}
                                  className="ms-2"
                                >
                                  <FaCopy /> Copy
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {couponLoading && (
                  <div className="text-center mt-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted">Loading offers...</span>
                  </div>
                )}

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

                <div className="action-buttons">
                  <Button className="cart-btn" onClick={addToCart}>
                    <FaShoppingCart /> Add to Cart
                  </Button>

                  <Button className="buy-btn-product-details" onClick={buyNow}>
                    Buy Now
                  </Button>
                </div>

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
              <p>{String(product.description)}</p>
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
                Native91 focuses on timeless handcrafted products made with love.
              </p>
            </details>
          </div>

          {/* REVIEWS SECTION */}
          <div className="reviews-section mt-5">
            <div className="reviews-header d-flex justify-content-between align-items-center mb-4">
              <h3 className="funnel-sans me-2">Customer Reviews</h3>
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
                {reviews.map((review, index) => {
                  const reviewText = String(review?.review || '');
                  const userName = String(review?.userName || 'Anonymous');
                  const rating = typeof review?.rating === 'number' ? review.rating : 0;
                  const createdAt = review?.createdAt || new Date().toISOString();

                  return (
                    <Col md={4} lg={3} key={review?._id || index}>
                      <div className="review-card p-3 border rounded h-100">
                        <div className="review-stars mb-2">
                          {renderStars(rating)}
                        </div>
                        <p className="review-text mt-3">{reviewText}</p>
                        <div className="review-meta mt-3">
                          <div className="reviewer-info d-flex align-items-center">
                            <FaUser className="me-2 text-muted" />
                            <strong>{userName}</strong>
                          </div>
                          {createdAt && (
                            <div className="review-date mt-1">
                              <FaCalendarAlt className="me-1 text-muted" size={12} />
                              <small className="text-muted">
                                {new Date(createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  );
                })}
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

      {/* Mobile Sticky Add To Cart */}
      <div className="mobile-sticky-cart">
        <button
          className={`mobile-wishlist ${wishlist ? "active" : ""}`}
          onClick={toggleWishlist}
        >
          <FaHeart />
        </button>

        <button className="mobile-add-cart" onClick={addToCart}>
          <FaShoppingBag className="me-2" />
          {discountedPrice ? `₹${formatPrice(displayPrice)}` : 'Add to Cart'}
        </button>
      </div>

      <Footer />
    </>
  );
};

export default Productdetails;