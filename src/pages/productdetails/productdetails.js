// pages/Productdetails/Productdetails.js - COMPLETE FIXED VERSION

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Container, Row, Col, Button, Form, Modal, Alert, Badge, Spinner,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar, FaHeart, FaShoppingCart, FaShoppingBag, FaShieldAlt,
  FaChevronLeft, FaChevronRight, FaUser, FaCalendarAlt, FaTicketAlt,
  FaCopy, FaCheckCircle, FaWeight, FaRulerCombined, FaTag, FaTruck,
  FaClock, FaRupeeSign, FaBox, FaShippingFast, FaMapMarkerAlt,
  FaInfoCircle, FaLeaf, FaExclamationTriangle, FaUtensils, FaAppleAlt,
  FaSeedling, FaPalette,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./productdetails.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const COUPON_API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const VENDOR_IMAGE_BASE = "http://localhost:5177";

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  return numPrice.toFixed(2);
};

const getStockStatus = (stock) => {
  if (!stock && stock !== 0)
    return { label: "In Stock", color: "success", icon: "✅", canAdd: true };
  if (stock === 0)
    return { label: "Out of Stock", color: "danger", icon: "❌", canAdd: false };
  if (stock <= 5)
    return { label: `Only ${stock} left! Hurry!`, color: "warning", icon: "⚠️", canAdd: true };
  if (stock <= 10)
    return { label: `Only ${stock} left`, color: "info", icon: "📦", canAdd: true };
  return { label: `${stock} in stock`, color: "success", icon: "✅", canAdd: true };
};

const formatSizeWeight = (product) => {
  if (!product) return null;
  const parts = [];
  if (product.size) parts.push(`Size: ${product.size}`);
  if (product.weight && product.weight > 0) {
    parts.push(`Weight: ${product.weight}${product.weightUnit || ""}`);
  }
  if (product.sku) parts.push(`SKU: ${product.sku}`);
  if (product.variant) parts.push(`Variant: ${product.variant}`);
  return parts.length > 0 ? parts : null;
};

const getShippingDisplay = (product) => {
  if (!product) return null;
  let shippingText = product.shippingTime || "1 week";
  if (shippingText === "Custom" && product.customShippingTime) {
    shippingText = product.customShippingTime;
  }
  const charge = product.shippingCharge || 0;
  const isFree = product.isFreeShipping !== undefined ? product.isFreeShipping : true;
  const chargeText = isFree ? "Free" : `₹${charge}`;

  const isWeekBased = shippingText.toLowerCase().includes("week");
  let deliveryRange = "1 week";

  if (isWeekBased) {
    const weekMatch = shippingText.match(/(\d+)\s*week/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1]);
      deliveryRange = `${weeks} week${weeks > 1 ? "s" : ""}`;
    } else {
      deliveryRange = shippingText;
    }
  } else {
    const minDays = product.estimatedDeliveryDays?.min || 3;
    const maxDays = product.estimatedDeliveryDays?.max || 7;
    deliveryRange = minDays === maxDays ? `${minDays} days` : `${minDays}–${maxDays} days`;
  }

  return {
    shippingText, chargeText, charge, isFree,
    displayText: `${chargeText} • ${shippingText}`,
    deliveryRange,
  };
};

const decodeSlug = (slug) => {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const createSlug = (name) => {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

// ✅ Helper: Convert ObjectId to string safely
const toIdString = (id) => {
  if (!id) return null;
  if (typeof id === "string") return id.trim() || null;
  if (id.$oid) return id.$oid;
  if (typeof id.toString === "function") {
    const str = id.toString();
    return str && str !== "[object Object]" ? str : null;
  }
  return null;
};

// ✅ Helper: Generate stable fallback ID
const generateFallbackId = (color, size, price, idx) => {
  const base = `${color || ""}_${size || ""}_${price || 0}`.trim();
  return base ? `fb_${base.replace(/[^a-zA-Z0-9]/g, "_")}` : `fb_idx_${idx}`;
};

// ✅ Helper: Normalize variants from different possible product structures
const normalizeVariants = (product) => {
  if (!product) return [];

  // Priority 1: product.variants
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((v, idx) => {
      const color = v.color || v.colorName || v.name || "";
      const size = v.size || v.sizeName || "";
      const price = v.price || 0;
      let id = toIdString(v._id);
      if (!id) id = generateFallbackId(color, size, price, idx);

      return {
        _id: id,
        color,
        size,
        price,
        stock: v.stock !== undefined ? v.stock : 0,
        image: v.image || v.variantImage || "",
        isAvailable: v.isAvailable !== undefined ? v.isAvailable : (v.stock !== 0),
        __hasRealId: !!v._id,
      };
    });
  }

  // Priority 2: product.colors
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors.map((c, idx) => {
      if (typeof c === "string") {
        return {
          _id: generateFallbackId(c, "", product.price || 0, idx),
          color: c,
          size: "",
          price: product.price || 0,
          stock: product.stock || 0,
          image: "",
          isAvailable: (product.stock || 0) > 0,
          __hasRealId: false,
        };
      }
      const color = c.name || c.color || c.colorName || "";
      const size = c.size || "";
      const price = c.price || product.price || 0;
      const id = toIdString(c._id) || generateFallbackId(color, size, price, idx);
      return {
        _id: id,
        color,
        size,
        price,
        stock: c.stock !== undefined ? c.stock : (product.stock || 0),
        image: c.image || "",
        isAvailable: c.isAvailable !== undefined ? c.isAvailable : ((c.stock || product.stock || 0) > 0),
        __hasRealId: !!c._id,
      };
    });
  }

  // Priority 3: product.variantColors
  if (product.variantColors && Array.isArray(product.variantColors) && product.variantColors.length > 0) {
    return product.variantColors.map((c, idx) => {
      const color = c.name || c.color || "";
      const price = c.price || product.price || 0;
      const id = toIdString(c._id) || generateFallbackId(color, "", price, idx);
      return {
        _id: id,
        color,
        size: "",
        price,
        stock: c.stock !== undefined ? c.stock : (product.stock || 0),
        image: c.image || "",
        isAvailable: true,
        __hasRealId: !!c._id,
      };
    });
  }

  return [];
};

const Productdetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart, setShowCart, fetchCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [stock, setStock] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [variants, setVariants] = useState([]);

  const [brandDescription, setBrandDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);

  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ userName: "", rating: 0, review: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchBrandDetails = useCallback(async (companyName) => {
    if (!companyName) return;
    setBrandLoading(true);
    try {
      const response = await axios.get(`${API_URL}/company/details/${encodeURIComponent(companyName)}`);
      if (response.data && response.data.success) {
        const company = response.data.company;
        setBrandName(company.name || companyName);
        setBrandDescription(company.description || `${company.name} - Premium brand on Native91`);
        setBrandLogo(company.logo || null);
      } else {
        setBrandName(companyName);
        setBrandDescription(`${companyName} - Premium brand on Native91`);
        setBrandLogo(null);
      }
    } catch (err) {
      setBrandName(companyName);
      setBrandDescription(`${companyName} - Premium brand on Native91`);
      setBrandLogo(null);
    } finally {
      setBrandLoading(false);
    }
  }, []);

  const calculateDiscountedPrice = useCallback((coupon) => {
    if (!product || !coupon) return null;

    const basePrice = selectedVariant && selectedVariant.price > 0
      ? parseFloat(selectedVariant.price)
      : parseFloat(product.price);

    let discountAmount = 0;
    const discount = coupon.discount || coupon.discountValue || 0;
    const type = coupon.type || coupon.discountType || "percentage";
    const maxDiscount = coupon.maxDiscount || 0;

    if (type === "percentage") {
      discountAmount = (basePrice * discount) / 100;
      if (maxDiscount && discountAmount > maxDiscount) discountAmount = maxDiscount;
    } else {
      discountAmount = Math.min(discount, basePrice);
    }

    const newPrice = basePrice - discountAmount;
    return {
      originalPrice: basePrice,
      discountAmount,
      discountedPrice: newPrice,
      savingsPercentage: ((discountAmount / basePrice) * 100).toFixed(0),
    };
  }, [product, selectedVariant]);

  const applyCoupon = async (coupon) => {
    try {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) { alert("Please add product to cart first."); return; }

      const couponProducts = coupon.products || coupon.productIds || [];
      if (couponProducts.length > 0) {
        const isProductValid = couponProducts.some(id => id.toString() === product._id.toString());
        if (!isProductValid) { alert("This coupon is not valid for this product."); return; }
      }

      await axios.post(`${API_URL}/coupons/user/apply`, {
        guestId, code: coupon.code, productId: product._id,
      });

      const priceInfo = calculateDiscountedPrice(coupon);
      setAppliedCoupon(coupon);
      setDiscountedPrice(priceInfo);

      localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
      localStorage.setItem("discountedPrice", JSON.stringify(priceInfo));
      localStorage.setItem("appliedProductId", product._id);

      alert(`Coupon ${coupon.code} applied successfully`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to apply coupon");
    }
  };

  const removeCoupon = async () => {
    try {
      const guestId = localStorage.getItem("guestId");
      if (guestId) await axios.delete(`${API_URL}/coupons/user/remove/${guestId}`);

      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("discountedPrice");
      localStorage.removeItem("appliedProductId");
      setAppliedCoupon(null);
      setDiscountedPrice(null);
    } catch (err) { console.log(err); }
  };

  const fetchVendorCoupons = useCallback(async () => {
    if (!product?._id || !isMounted.current) { setVendorCoupons([]); return; }
    setCouponLoading(true);
    try {
      const productId = product._id;
      const companyName = product?.company || product?.vendor || product?.vendorName;

      const storedProductId = localStorage.getItem("appliedProductId");
      if (storedProductId && storedProductId !== productId) {
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discountedPrice");
        localStorage.removeItem("appliedProductId");
        setAppliedCoupon(null);
        setDiscountedPrice(null);
      }

      try {
        const response = await axios.get(`${COUPON_API_URL}/coupons/public/product/${productId}`);
        if (response.data.success && response.data.coupons && isMounted.current) {
          const validCoupons = response.data.coupons.filter(coupon => {
            const cp = coupon.products || coupon.productIds || [];
            if (cp.length === 0) return true;
            return cp.some(id => id.toString() === productId.toString());
          });
          setVendorCoupons(validCoupons);
          return;
        }
      } catch (err) { console.error("Product coupon fetch failed:", err); }

      if (companyName && isMounted.current) {
        try {
          const response = await axios.get(
            `${COUPON_API_URL}/coupons/public/company/${encodeURIComponent(companyName)}`,
            { params: { productId } }
          );
          if (response.data.success && response.data.coupons && isMounted.current) {
            const validCoupons = response.data.coupons.filter(coupon => {
              const cp = coupon.products || coupon.productIds || [];
              if (cp.length === 0) return true;
              return cp.some(id => id.toString() === productId.toString());
            });
            setVendorCoupons(validCoupons);
            return;
          }
        } catch (err) { console.error("Company coupon fetch failed:", err); }
      }

      if (isMounted.current) setVendorCoupons([]);
    } catch (err) {
      console.error("Error in fetchVendorCoupons:", err);
      if (isMounted.current) setVendorCoupons([]);
    } finally {
      if (isMounted.current) setCouponLoading(false);
    }
  }, [product]);

  const getImageUrl = useCallback((image) => {
    if (!image) return "/images/placeholder.png";
    let img = image;
    if (Array.isArray(image)) {
      if (image.length === 0) return "/images/placeholder.png";
      img = image[0];
    }
    const imgStr = String(img).trim();
    if (imgStr.startsWith("http://") || imgStr.startsWith("https://")) return imgStr;
    if (imgStr.startsWith("/uploads")) return `${VENDOR_IMAGE_BASE}${imgStr}`;
    if (imgStr.startsWith("/images")) return imgStr;
    if (!imgStr.startsWith("/") && !imgStr.startsWith("http")) {
      return `${VENDOR_IMAGE_BASE}/uploads/${imgStr}`;
    }
    return `${API_URL}${imgStr}`;
  }, []);

  const getVariantImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/images/placeholder.png";
    return getImageUrl(imagePath);
  }, [getImageUrl]);

  const getAllImagesFromProduct = useCallback((product) => {
    if (!product) return ["/images/placeholder.png"];
    let images = [];
    const imageFields = ["images", "image", "productImages", "gallery"];
    for (const field of imageFields) {
      if (product[field]) {
        if (Array.isArray(product[field])) {
          const validImages = product[field]
            .filter((img) => img && typeof img === "string" && img.trim())
            .map((img) => getImageUrl(img));
          images = [...images, ...validImages];
        } else if (typeof product[field] === "string" && product[field].trim()) {
          images.push(getImageUrl(product[field]));
        }
      }
    }
    images = [...new Set(images)];
    if (images.length === 0) images = ["/images/placeholder.png"];
    return images;
  }, [getImageUrl]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        const productName = decodeSlug(slug);
        const response = await axios.get(`${API_URL}/products`);
        if (!isMounted.current) return;

        const products = response.data;
        let foundProduct = null;

        foundProduct = products.find(p => p.name && p.name.toLowerCase() === productName.toLowerCase());
        if (!foundProduct) {
          const productSlug = createSlug(productName);
          foundProduct = products.find(p => p.name && createSlug(p.name) === productSlug);
        }
        if (!foundProduct) {
          const searchTerms = productName.toLowerCase().split(" ");
          foundProduct = products.find(p => {
            if (!p.name) return false;
            const nameLower = p.name.toLowerCase();
            return searchTerms.some(term => nameLower.includes(term));
          });
        }
        if (!foundProduct && slug.length === 24) {
          try {
            const productResponse = await axios.get(`${API_URL}/product/${slug}`);
            if (productResponse.data) foundProduct = productResponse.data;
          } catch (idErr) { console.log("ID fallback failed"); }
        }
        if (!foundProduct) throw new Error(`Product "${productName}" not found`);
        if (!isMounted.current) return;

        setProduct(foundProduct);
        setStock(foundProduct.stock || 0);

        const normalizedVariants = normalizeVariants(foundProduct);
        setVariants(normalizedVariants);

        const allImages = getAllImagesFromProduct(foundProduct);
        setProductImages(allImages);
        if (allImages.length > 0) {
          setActiveImg(allImages[0]);
          setCurrentImageIndex(0);
        } else {
          setActiveImg("/images/placeholder.png");
        }

        await fetchReviews(foundProduct._id);
        const guestId = localStorage.getItem("guestId");
        if (guestId) {
          await fetchWishlist();
          const inWishlist = await isInWishlist(foundProduct._id);
          setIsInWishlistState(inWishlist);
        }

        const companyName = foundProduct.company || foundProduct.vendor || foundProduct.vendorName;
        if (companyName) await fetchBrandDetails(companyName);
      } catch (err) {
        console.error("Product fetch error:", err);
        if (isMounted.current) {
          setError(err.response?.data?.message || err.message || "Failed to load product.");
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, getAllImagesFromProduct, fetchWishlist, fetchBrandDetails]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (product?._id) {
        try {
          const inWishlist = await isInWishlist(product._id);
          setIsInWishlistState(inWishlist);
        } catch (error) { console.error("Error checking wishlist:", error); }
      }
    };
    checkWishlist();
  }, [product, isInWishlist]);

  const fetchReviews = async (productId) => {
    try {
      const id = productId || product?._id;
      if (!id) return;
      const response = await axios.get(`${API_URL}/products/${id}/reviews`);

      const reviewsData = response.data.reviews || [];
      const sanitizedReviews = reviewsData.map(review => ({
        _id: String(review._id || ""),
        userName: String(review.userName || "Anonymous"),
        rating: typeof review.rating === "number" ? review.rating : 0,
        review: String(review.review || ""),
        createdAt: review.createdAt || new Date().toISOString(),
      }));

      setReviews(sanitizedReviews);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (err) {
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  const toggleWishlist = async () => {
    if (!product || isTogglingWishlist) return;
    setIsTogglingWishlist(true);
    try {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }
      if (isInWishlistState) {
        await removeFromWishlist(product._id);
        setIsInWishlistState(false);
        alert("Removed from wishlist");
      } else {
        await addToWishlist({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: Array.isArray(product.image) ? product.image[0] : product.image,
          company: product.company || "Native91",
        });
        setIsInWishlistState(true);
        alert("Added to wishlist!");
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleVariantSelect = (variant) => {
    if (!variant || variant.isAvailable === false || variant.stock === 0) return;

    if (selectedVariant && selectedVariant._id === variant._id) {
      setSelectedVariant(null);
      setSelectedColor("");
      setSelectedSize("");
      setStock(product?.stock || 0);
      if (productImages.length > 0) {
        setActiveImg(productImages[0]);
        setCurrentImageIndex(0);
      }
      return;
    }

    setSelectedVariant(variant);
    setSelectedColor(variant.color || "");
    setSelectedSize(variant.size || "");

    setStock(variant.stock || 0);
    if (qty > variant.stock) setQty(Math.max(1, variant.stock));

    if (variant.image) {
      const variantImgUrl = getVariantImageUrl(variant.image);
      setActiveImg(variantImgUrl);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmitReview = async () => {
    if (!reviewData.rating || reviewData.rating === 0) { setReviewError("Please select a rating"); return; }
    if (!reviewData.review.trim()) { setReviewError("Please write your review"); return; }
    if (!reviewData.userName.trim()) { setReviewError("Please enter your name"); return; }

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
        setReviewData({ userName: "", rating: 0, review: "" });
        await fetchReviews(product._id);
        setTimeout(() => { setShowReviewModal(false); setReviewSuccess(""); }, 2000);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
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

  // ✅ handleAddToCart — Variant OPTIONAL, strict variantId
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      // ✅ Strict variant ID — String conversion guaranteed
      const strictVariantId = selectedVariant && selectedVariant._id
        ? String(selectedVariant._id)
        : null;

      // 🔍 Debug log
      console.log("🎯 handleAddToCart debug:", {
        selectedVariant,
        strictVariantId,
        hasVariants: variants.length,
      });

      const basePrice = selectedVariant && selectedVariant.price > 0
        ? selectedVariant.price
        : product.price;

      const finalPrice = discountedPrice ? discountedPrice.discountedPrice : basePrice;

      const primaryImage = selectedVariant && selectedVariant.image
        ? selectedVariant.image
        : (Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : product.image || "");

      await addToCart({
        productId: String(product._id),
        name: product.name,
        price: parseFloat(finalPrice),
        originalPrice: parseFloat(basePrice),
        image: primaryImage,
        quantity: parseInt(qty),
        discountAmount: discountedPrice ? discountedPrice.discountAmount : 0,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        stock: stock,

        // ✅ FIXED: variantId on separate line
        variantId: strictVariantId,
        selectedColor: selectedVariant?.color || "",
        selectedSize: selectedVariant?.size || "",
        variantImage: selectedVariant?.image || "",
        variantPrice: selectedVariant?.price || 0,

        size: selectedVariant?.size || product.size || "",
        weight: product.weight || 0,
        weightUnit: product.weightUnit || "",
        sku: product.sku || "",
        variant: product.variant || "",
        ingredients: product.ingredients || "",
        company: product.company || "N/A",
        vendorId: product.vendorId || null,
      });

      setShowCart(true);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ handleBuyNow — Variant OPTIONAL, strict variantId (SINGLE VERSION)
  const handleBuyNow = async () => {
    const effectiveStockCheck = selectedVariant ? (selectedVariant.stock || 0) : stock;
    if (effectiveStockCheck === 0) {
      alert("Sorry, this product is out of stock!");
      return;
    }

    try {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestId", guestId);
      }

      const strictVariantId = selectedVariant && selectedVariant._id
        ? String(selectedVariant._id)
        : null;

      const basePrice = selectedVariant && selectedVariant.price > 0
        ? selectedVariant.price
        : product.price;

      const finalPrice = discountedPrice ? discountedPrice.discountedPrice : basePrice;

      const primaryImage = selectedVariant && selectedVariant.image
        ? selectedVariant.image
        : (Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : product.image || "");

      await addToCart({
        productId: String(product._id),
        name: product.name,
        price: parseFloat(finalPrice),
        originalPrice: parseFloat(basePrice),
        image: primaryImage,
        quantity: parseInt(qty),
        discountAmount: discountedPrice ? discountedPrice.discountAmount : 0,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        stock: stock,

        variantId: strictVariantId,
        selectedColor: selectedVariant?.color || "",
        selectedSize: selectedVariant?.size || "",
        variantImage: selectedVariant?.image || "",
        variantPrice: selectedVariant?.price || 0,

        size: selectedVariant?.size || product.size || "",
        weight: product.weight || 0,
        weightUnit: product.weightUnit || "",
        sku: product.sku || "",
        variant: product.variant || "",
        ingredients: product.ingredients || "",
        company: product.company || "N/A",
        vendorId: product.vendorId || null,
      });

      navigate("/checkout");
    } catch (error) {
      alert("Failed to proceed. Please try again.");
    }
  };

  const renderStars = (rating) => {
    const numRating = typeof rating === "number" ? rating : parseFloat(rating) || 0;
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} color={i < Math.floor(numRating) ? "#ffc107" : "#e4e5e9"} size={16} />
        ))}
        <span className="ms-2 text-muted">{numRating.toFixed(1)}</span>
      </div>
    );
  };

  useEffect(() => {
    const coupon = localStorage.getItem("appliedCoupon");
    const price = localStorage.getItem("discountedPrice");
    const storedProductId = localStorage.getItem("appliedProductId");

    if (coupon && price && storedProductId && product?._id) {
      if (storedProductId === product._id) {
        setAppliedCoupon(JSON.parse(coupon));
        setDiscountedPrice(JSON.parse(price));
      } else {
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discountedPrice");
        localStorage.removeItem("appliedProductId");
        setAppliedCoupon(null);
        setDiscountedPrice(null);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product) fetchVendorCoupons();
  }, [product, fetchVendorCoupons]);

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
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
              <Button variant="outline-secondary" onClick={() => window.location.reload()} className="ms-2">Try Again</Button>
              <Button variant="outline-success" onClick={() => navigate("/category/All")}>Browse All Products</Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const hasMultipleImages = productImages.length > 1;

  const basePrice = selectedVariant && selectedVariant.price > 0
    ? selectedVariant.price
    : product.price;

  const displayPrice = discountedPrice ? discountedPrice.discountedPrice : basePrice;
  const originalPrice = basePrice;

  const effectiveStock = selectedVariant ? (selectedVariant.stock || 0) : stock;
  const stockStatus = getStockStatus(effectiveStock);

  const sizeWeightInfo = formatSizeWeight(product);
  const shippingInfo = getShippingDisplay(product);

  const hasIngredients = product.ingredients || (product.ingredientsList && product.ingredientsList.length > 0);
  const hasAllergens = product.allergens && product.allergens.length > 0;
  const hasNutritionalInfo = product.nutritionalInfo && (
    product.nutritionalInfo.servingSize ||
    product.nutritionalInfo.calories > 0 ||
    product.nutritionalInfo.protein > 0 ||
    product.nutritionalInfo.carbohydrates > 0 ||
    product.nutritionalInfo.fat > 0
  );
  const hasDietaryInfo = product.dietaryInfo && (
    product.dietaryInfo.isVegetarian ||
    product.dietaryInfo.isVegan ||
    product.dietaryInfo.isGlutenFree ||
    product.dietaryInfo.isDairyFree ||
    product.dietaryInfo.isNutFree ||
    product.dietaryInfo.isOrganic
  );

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
                        key={`thumb-${i}`}
                        className={`thumb-box ${activeImg === img ? "active" : ""}`}
                        onClick={() => { setActiveImg(img); setCurrentImageIndex(i); }}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - view ${i + 1}`}
                          onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="main-image-container" style={{ position: "relative" }}>
                  <motion.div
                    className="main-image-box"
                    key={`main-img-${activeImg}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => setIsImageFullscreen(true)}
                    style={{ cursor: "zoom-in" }}
                  >
                    <img
                      src={activeImg || productImages[0] || "/images/placeholder.png"}
                      alt={product.name}
                      className="main-product-image"
                      onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                    />
                  </motion.div>

                  {hasMultipleImages && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}
                        style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", color: "black", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
                        <FaChevronLeft />
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}
                        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", color: "black", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
                        <FaChevronRight />
                      </button>
                    </>
                  )}

                  {hasMultipleImages && (
                    <div className="image-counter">
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
                <div className="product-brand">{String(product.company || "Brand Name")}</div>
                <div className="rating-row">
                  <div className="stars">{renderStars(averageRating)}</div>
                  <span className="ms-2">
                    {averageRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                  <Button variant="link" className="write-review-btn" onClick={() => setShowReviewModal(true)}>
                    Write a Review
                  </Button>
                </div>

                {/* VARIANT SELECTOR */}
                {variants.length > 0 && (
                  <div className="variant-selector-section mt-3 mb-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 fw-bold">
                        <FaPalette className="me-2 text-primary" />
                        Select Variant
                        <Badge bg="secondary" className="ms-2">{variants.length} options</Badge>
                        <Badge bg="info" className="ms-2">Optional</Badge>
                      </h6>
                      {selectedVariant && (
                        <small className="text-success">
                          <FaCheckCircle className="me-1" />
                          {selectedVariant.color}
                          {selectedVariant.color && selectedVariant.size && " • "}
                          {selectedVariant.size && `Size: ${selectedVariant.size}`}
                        </small>
                      )}
                    </div>

                    <Row className="g-2">
                      {variants.map((variant, idx) => {
                        const isSelected = selectedVariant && (
                          selectedVariant._id
                            ? selectedVariant._id === variant._id
                            : selectedColor === variant.color && selectedSize === variant.size
                        );
                        const isDisabled = variant.isAvailable === false || variant.stock === 0;
                        const variantImageUrl = variant.image ? getVariantImageUrl(variant.image) : null;

                        return (
                          <Col xs={6} md={4} lg={3} key={variant._id || idx}>
                            <div
                              className={`variant-option-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                              onClick={() => handleVariantSelect(variant)}
                              style={{
                                border: isSelected ? "2px solid #0D3B2E" : "2px solid #e0e0e0",
                                borderRadius: "10px",
                                padding: "10px",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                                background: isSelected ? "#f0f8f5" : "white",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                position: "relative"
                              }}
                            >
                              {variantImageUrl && (
                                <img
                                  src={variantImageUrl}
                                  alt={variant.color || variant.size || "Variant"}
                                  style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {variant.color && (
                                  <div className="fw-bold" style={{ fontSize: '0.9rem', color: '#0D3B2E' }}>{variant.color}</div>
                                )}
                                {variant.size && (
                                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{variant.size}</div>
                                )}
                                {variant.price > 0 && (
                                  <div className="text-success fw-bold" style={{ fontSize: '0.85rem' }}>₹{variant.price}</div>
                                )}
                                {isDisabled && (
                                  <div className="text-danger" style={{ fontSize: '0.7rem' }}>Out of Stock</div>
                                )}
                                {!isDisabled && variant.stock <= 5 && variant.stock > 0 && (
                                  <div className="text-warning" style={{ fontSize: '0.7rem' }}>Only {variant.stock} left</div>
                                )}
                              </div>
                              {isSelected && (
                                <FaCheckCircle className="text-success" style={{ position: 'absolute', top: '5px', right: '5px' }} />
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>

                    {!selectedVariant && variants.length > 0 && (
                      <Alert variant="info" className="mt-2 mb-0 py-2 small">
                        <FaInfoCircle className="me-2" />
                        Optional: Select a variant above for specific color/size
                      </Alert>
                    )}
                  </div>
                )}

                {/* SIZE/WEIGHT INFO */}
                {sizeWeightInfo && sizeWeightInfo.length > 0 && (
                  <div className="size-weight-info mt-3 py-3 bg-light rounded">
                    <div className="d-flex flex-wrap gap-3">
                      {product.size && (
                        <div className="d-flex align-items-center">
                          <FaTag className="me-1 text-muted" />
                          <span><strong>Size:</strong> {product.size}</span>
                        </div>
                      )}
                      {product.weight > 0 && (
                        <div className="d-flex align-items-center">
                          <span><strong>Weight:</strong> {product.weight} {product.weightUnit || ""}</span>
                        </div>
                      )}
                      {product.sku && (
                        <div className="d-flex align-items-center">
                          <FaTag className="me-1 text-muted" />
                          <span><strong>SKU:</strong> {product.sku}</span>
                        </div>
                      )}
                      {product.variant && (
                        <div className="d-flex align-items-center">
                          <FaRulerCombined className="me-1 text-muted" />
                          <span><strong>Variant:</strong> {product.variant}</span>
                        </div>
                      )}
                    </div>
                    {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                      <div className="mt-2 small text-muted">
                        <FaRulerCombined className="me-1" />
                        Dimensions: {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit || "cm"}
                      </div>
                    )}
                  </div>
                )}

                {/* INGREDIENTS */}
                {(hasIngredients || hasAllergens) && (
                  <div className="ingredients-section mt-3 p-3 border rounded" style={{ background: "#fafafa" }}>
                    {hasIngredients && (
                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FaUtensils className="text-primary" />
                          <strong>Ingredients</strong>
                        </div>
                        <p className="mb-0 small">
                          {product.ingredients}
                          {product.ingredientsList && product.ingredientsList.length > 0 && (
                            <span className="text-muted d-block mt-1">
                              <small>Detailed: {product.ingredientsList.join(", ")}</small>
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    {hasAllergens && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FaExclamationTriangle className="text-warning" />
                          <strong>Allergens</strong>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {product.allergens.map((allergen, idx) => (
                            <Badge key={idx} bg="warning" className="text-dark">{allergen}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* NUTRITIONAL INFO */}
                {hasNutritionalInfo && (
                  <div className="nutritional-info-section mt-3 p-3 border rounded" style={{ background: "#f8fff8" }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaAppleAlt className="text-success" />
                      <strong>Nutritional Information</strong>
                      {product.nutritionalInfo?.servingSize && (
                        <span className="text-muted small">(per {product.nutritionalInfo.servingSize})</span>
                      )}
                    </div>
                    <Row className="g-1">
                      {product.nutritionalInfo?.calories > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Calories</div>
                            <div className="fw-bold">{product.nutritionalInfo.calories}</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.protein > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Protein</div>
                            <div className="fw-bold">{product.nutritionalInfo.protein}g</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.carbohydrates > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Carbs</div>
                            <div className="fw-bold">{product.nutritionalInfo.carbohydrates}g</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.fat > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Fat</div>
                            <div className="fw-bold">{product.nutritionalInfo.fat}g</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.sugar > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Sugar</div>
                            <div className="fw-bold">{product.nutritionalInfo.sugar}g</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.fiber > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Fiber</div>
                            <div className="fw-bold">{product.nutritionalInfo.fiber}g</div>
                          </div>
                        </Col>
                      )}
                      {product.nutritionalInfo?.sodium > 0 && (
                        <Col xs={6} md={4}>
                          <div className="nutrition-item p-2 bg-white rounded border text-center">
                            <div className="small text-muted">Sodium</div>
                            <div className="fw-bold">{product.nutritionalInfo.sodium}mg</div>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                )}

                {/* DIETARY INFO */}
                {hasDietaryInfo && (
                  <div className="dietary-info-section mt-3 d-flex flex-wrap gap-2">
                    {product.dietaryInfo?.isVegetarian && (
                      <Badge bg="success" className="p-2" style={{ fontSize: "14px" }}>
                        <FaLeaf className="me-1" /> Vegetarian
                      </Badge>
                    )}
                    {product.dietaryInfo?.isVegan && (
                      <Badge bg="info" className="p-2" style={{ fontSize: "14px" }}>
                        <FaSeedling className="me-1" /> Vegan
                      </Badge>
                    )}
                    {product.dietaryInfo?.isGlutenFree && (
                      <Badge bg="warning" className="p-2" style={{ fontSize: "14px" }}>🌾 Gluten Free</Badge>
                    )}
                    {product.dietaryInfo?.isDairyFree && (
                      <Badge bg="primary" className="p-2" style={{ fontSize: "14px" }}>🥛 Dairy Free</Badge>
                    )}
                    {product.dietaryInfo?.isNutFree && (
                      <Badge bg="secondary" className="p-2" style={{ fontSize: "14px" }}>🥜 Nut Free</Badge>
                    )}
                    {product.dietaryInfo?.isOrganic && (
                      <Badge bg="success" className="p-2" style={{ fontSize: "14px" }}>🌱 Organic</Badge>
                    )}
                  </div>
                )}

                {/* SHIPPING CARD */}
                {shippingInfo && (
                  <div className="shipping-info-card mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="shipping-icon">
                        <FaTruck size={24} className="text-primary" />
                      </div>
                      <div className="shipping-details flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-bold">Delivery</span>
                          <span className="text-success fw-bold">{shippingInfo.chargeText}</span>
                        </div>
                        <div className="d-flex align-items-center gap-3 mt-1">
                          <span className="small">
                            <FaClock className="me-1 text-muted" />
                            {shippingInfo.deliveryRange}
                          </span>
                          <span className="small text-muted">|</span>
                          <span className="small">
                            <FaBox className="me-1 text-muted" />
                            {shippingInfo.shippingText}
                          </span>
                        </div>
                        {!shippingInfo.isFree && shippingInfo.charge > 0 && (
                          <Badge bg="info" className="mt-1">
                            <FaRupeeSign className="me-1" /> ₹{shippingInfo.charge} Shipping
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STOCK STATUS */}
                <div className="stock-status mt-3">
                  <Badge bg={stockStatus.color} style={{ fontSize: "16px", padding: "8px 16px" }}>
                    {stockStatus.icon} {stockStatus.label}
                  </Badge>
                  {effectiveStock > 0 && effectiveStock <= 10 && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between small">
                        <span>Stock Availability</span>
                        <span>{effectiveStock} / 10</span>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar bg-${effectiveStock <= 5 ? "warning" : "info"}`}
                          style={{ width: `${(effectiveStock / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PRICE */}
                <div className="price-box funnel-sans">
                  {discountedPrice ? (
                    <>
                      <span className="original-price" style={{ textDecoration: "line-through", color: "#999", marginRight: "10px" }}>
                        ₹{formatPrice(originalPrice)}
                      </span>
                      <span className="discounted-price" style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "1.3em" }}>
                        ₹{formatPrice(displayPrice)}
                      </span>
                      <span className="savings-badge" style={{ background: "#e74c3c", color: "white", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", marginLeft: "10px", fontWeight: "bold" }}>
                        Save ₹{formatPrice(discountedPrice.discountAmount)} ({discountedPrice.savingsPercentage}% OFF)
                      </span>
                    </>
                  ) : (
                    <>
                      ₹{formatPrice(originalPrice)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price" style={{ textDecoration: "line-through", color: "#999", marginLeft: "10px", fontSize: "0.8em" }}>
                          ₹{formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* COUPON BADGE */}
                {appliedCoupon && discountedPrice && (
                  <div className="applied-coupon-badge mt-2" style={{ background: "#d4edda", padding: "8px 15px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <FaCheckCircle className="text-success me-2" />
                      <span style={{ fontWeight: "bold" }}>{String(appliedCoupon.code)}</span>
                      <span className="ms-2 text-success">₹{formatPrice(discountedPrice.discountAmount)} OFF applied!</span>
                    </div>
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={removeCoupon}>Remove</Button>
                  </div>
                )}

                <p className={`wishlist-btn-product-details mt-2 ${isInWishlistState ? "active" : ""}`} onClick={toggleWishlist} style={{ cursor: isTogglingWishlist ? "not-allowed" : "pointer" }}>
                  {isTogglingWishlist ? <Spinner animation="border" size="sm" className="me-2" /> : <FaHeart className="wishlist-icon" />}
                  {isTogglingWishlist ? "Processing..." : isInWishlistState ? "Go to Wishlist" : "Add to Wishlist"}
                </p>

                {shippingInfo && (
                  <div className="shipping-info-card mb-1 tax-text">
                    <span className="fw-bold">Estimated Delivery</span>
                    <span className="mx-2">-</span>
                    <span className="small">
                      <span className="me-1">Your order will arrive within {shippingInfo.deliveryRange}</span>
                    </span>
                  </div>
                )}

                <p className="tax-text">Inclusive of all taxes | Free shipping on orders above ₹1499</p>

                {/* COUPONS SECTION */}
                {vendorCoupons.length > 0 && !couponLoading && (
                  <div className="vendor-coupons-section mt-3 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">
                        <FaTicketAlt className="me-2 text-success" />
                        Available Offers
                        <Badge bg="success" className="ms-2">{vendorCoupons.length}</Badge>
                      </h6>
                      <Button variant="link" size="sm" onClick={() => setShowCoupons(!showCoupons)} className="text-decoration-none p-0">
                        {showCoupons ? "Hide" : "View All"}
                      </Button>
                    </div>

                    {showCoupons && (
                      <div className="coupon-list mt-2">
                        {vendorCoupons.map((coupon, index) => {
                          const couponProducts = coupon.products || coupon.productIds || [];
                          const shouldShow = couponProducts.length === 0 || couponProducts.some(id => id.toString() === product._id.toString());
                          if (!shouldShow) return null;

                          const isApplied = appliedCoupon && appliedCoupon.code === coupon.code;
                          const priceInfo = calculateDiscountedPrice(coupon);
                          const discount = coupon.discount || coupon.discountValue || 0;
                          const type = coupon.type || coupon.discountType || "percentage";

                          return (
                            <div key={coupon._id || `coupon-${index}`}
                              className={`coupon-item p-2 mb-2 border rounded bg-white d-flex justify-content-between align-items-center ${isApplied ? "border-success" : ""}`}
                              style={isApplied ? { background: "#f0fff4" } : {}}>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-success me-2">
                                    {type === "percentage" ? `${discount}% OFF` : `₹${discount} OFF`}
                                  </span>
                                  <strong className="text-primary">{String(coupon.code)}</strong>
                                  {isApplied && <Badge bg="success" className="ms-2"><FaCheckCircle className="me-1" /> Applied</Badge>}
                                </div>
                                <p className="mb-0 small text-muted">{String(coupon.description || `${type === "percentage" ? discount + "%" : "₹" + discount} off`)}</p>
                                {priceInfo && (
                                  <small className="text-success">
                                    New price: ₹{formatPrice(priceInfo.discountedPrice)} (Save ₹{formatPrice(priceInfo.discountAmount)})
                                  </small>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-1">
                                {!isApplied ? (
                                  <Button variant="success" size="sm" onClick={() => applyCoupon(coupon)} className="ms-2">Apply</Button>
                                ) : (
                                  <Button variant="outline-danger" size="sm" onClick={removeCoupon} className="ms-2">Remove</Button>
                                )}
                                <Button variant="outline-secondary" size="sm" onClick={() => { navigator.clipboard.writeText(String(coupon.code)); alert(`Copied "${coupon.code}"!`); }} className="ms-2">
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

                {/* QUANTITY */}
                <div className="quantity-section">
                  <span>Quantity</span>
                  <div className="qty-box-product-details">
                    <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} disabled={effectiveStock === 0}>−</button>
                    <input value={qty} readOnly />
                    <button onClick={() => setQty(Math.min(qty + 1, effectiveStock))} disabled={qty >= effectiveStock || effectiveStock === 0}>+</button>
                  </div>
                  {effectiveStock > 0 && (
                    <small className="text-muted ms-3">Max: {effectiveStock} available</small>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="action-buttons">
                  <Button className="cart-btn" onClick={handleAddToCart} disabled={isAddingToCart || effectiveStock === 0}>
                    {isAddingToCart ? (
                      <><Spinner animation="border" size="sm" className="me-2" />Adding...</>
                    ) : effectiveStock === 0 ? (
                      <><FaShoppingCart /> Out of Stock</>
                    ) : (
                      <><FaShoppingCart /> Add to Cart</>
                    )}
                  </Button>
                  <Button className="buy-btn-product-details" onClick={handleBuyNow}>Buy Now</Button>
                </div>

                <div className="features-row-product-details">
                  <div className="feature-item"><FaHeart /> <span>Handmade with love</span></div>
                  <div className="feature-item"><FaShieldAlt /> <span>Easy Returns</span></div>
                  <div className="feature-item"><FaShoppingBag /> <span>Secure Checkout</span></div>
                </div>
              </div>
            </Col>
          </Row>

          {/* ACCORDION SECTION */}
          <div className="product-accordion mt-5">
            <details open>
              <summary className="funnel-sans">Product Details</summary>
              <p>{String(product.description)}</p>
              {sizeWeightInfo && sizeWeightInfo.length > 0 && (
                <ul className="mt-2">
                  {sizeWeightInfo.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              )}
            </details>

            {(hasIngredients || hasAllergens || hasNutritionalInfo || hasDietaryInfo) && (
              <details>
                <summary className="funnel-sans">
                  <FaInfoCircle className="me-2" /> Ingredients & Nutrition
                </summary>
                <div className="ingredients-accordion p-3">
                  {hasIngredients && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <FaUtensils className="me-2 text-primary" />
                        Ingredients
                      </h6>
                      <p className="mb-0">{product.ingredients}</p>
                      {product.ingredientsList && product.ingredientsList.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Detailed:</small>
                          <ul className="mb-0 mt-1">
                            {product.ingredientsList.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {hasAllergens && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <FaExclamationTriangle className="me-2 text-warning" />
                        Allergens
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {product.allergens.map((allergen, idx) => (
                          <Badge key={idx} bg="warning" className="text-dark p-2">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasNutritionalInfo && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <FaAppleAlt className="me-2 text-success" />
                        Nutritional Information
                        {product.nutritionalInfo?.servingSize && (
                          <span className="text-muted small ms-2">
                            (per {product.nutritionalInfo.servingSize})
                          </span>
                        )}
                      </h6>
                      <div className="nutrition-grid">
                        <Row className="g-2">
                          {product.nutritionalInfo?.calories > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Calories</div>
                                <div className="fw-bold">{product.nutritionalInfo.calories}</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.protein > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Protein</div>
                                <div className="fw-bold">{product.nutritionalInfo.protein}g</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.carbohydrates > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Carbs</div>
                                <div className="fw-bold">{product.nutritionalInfo.carbohydrates}g</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.fat > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Fat</div>
                                <div className="fw-bold">{product.nutritionalInfo.fat}g</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.sugar > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Sugar</div>
                                <div className="fw-bold">{product.nutritionalInfo.sugar}g</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.fiber > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Fiber</div>
                                <div className="fw-bold">{product.nutritionalInfo.fiber}g</div>
                              </div>
                            </Col>
                          )}
                          {product.nutritionalInfo?.sodium > 0 && (
                            <Col xs={6} md={3}>
                              <div className="nutrition-item p-2 bg-light rounded text-center">
                                <div className="small text-muted">Sodium</div>
                                <div className="fw-bold">{product.nutritionalInfo.sodium}mg</div>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </div>
                    </div>
                  )}

                  {hasDietaryInfo && (
                    <div>
                      <h6 className="fw-bold">
                        <FaLeaf className="me-2 text-success" />
                        Dietary Preferences
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {product.dietaryInfo?.isVegetarian && (
                          <Badge bg="success" className="p-2">🌱 Vegetarian</Badge>
                        )}
                        {product.dietaryInfo?.isVegan && (
                          <Badge bg="info" className="p-2">🌿 Vegan</Badge>
                        )}
                        {product.dietaryInfo?.isGlutenFree && (
                          <Badge bg="warning" className="p-2">🌾 Gluten Free</Badge>
                        )}
                        {product.dietaryInfo?.isDairyFree && (
                          <Badge bg="primary" className="p-2">🥛 Dairy Free</Badge>
                        )}
                        {product.dietaryInfo?.isNutFree && (
                          <Badge bg="secondary" className="p-2">🥜 Nut Free</Badge>
                        )}
                        {product.dietaryInfo?.isOrganic && (
                          <Badge bg="success" className="p-2">🌱 Organic</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}

            <details>
              <summary className="funnel-sans">Shipping & Delivery</summary>
              <div className="shipping-details-accordion ">
                {shippingInfo ? (
                  <>
                    <div className="row g-3">
                      {shippingInfo && (
                        <div className="shipping-info-card mb-1 tax-text">
                          <span className="fw-bold">Estimated Delivery</span>
                          <span className="mx-2">-</span>
                          <span className="small ">
                            <span className="me-1">
                              {" "}
                              Your order will arrive within{" "}
                              {shippingInfo.deliveryRange}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">
                    Shipping information not available for this product.
                  </p>
                )}
              </div>
            </details>

            <details>
              <summary className="funnel-sans">Why Native91?</summary>
              <p>
                Native91 helps local businesses grow by providing a modern
                platform that delivers quality products with convenience and
                trust.
              </p>
            </details>

            <details>
              <summary className="funnel-sans">Returns Policy</summary>
              <p>
                Easy 7-day returns available. Items must be unused and in
                original packaging.
                <a
                  href="/returns-policy"
                  className="text-decoration-none text-primary ms-2"
                >
                  Learn more
                </a>
              </p>
            </details>

            <details>
              <summary className="funnel-sans">About the Brand</summary>
              <div className="brand-about-content">
                {brandLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading brand details...</span>
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {brandLogo && (
                        <img
                          src={brandLogo}
                          alt={brandName}
                          className="brand-logo-small"
                          onError={(e) => (e.target.style.display = "none")}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            border: "1px solid #e9ecef",
                          }}
                        />
                      )}
                      <h5 className="brand-name mb-0">
                        {brandName || product?.company || "Native91"}
                      </h5>
                    </div>

                    <p className="brand-description">
                      {brandDescription ||
                        (product?.company
                          ? `${product.company} - Premium brand on Native91`
                          : "Native91 focuses on timeless handcrafted products made with love.")}
                    </p>

                    <div className="brand-actions mt-3">
                    </div>
                  </>
                )}
              </div>
            </details>
          </div>

          {/* REVIEWS SECTION */}
          <div className="reviews-section mt-5">
            <div className="reviews-header d-flex justify-content-between align-items-center mb-4">
              <h3 className="funnel-sans me-2">Customer Reviews</h3>
              <Button
                variant="outline-dark"
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
                  variant="outline-dark"
                  onClick={() => setShowReviewModal(true)}
                >
                  Write a Review
                </Button>
              </div>
            ) : (
              <Row className="g-4">
                {reviews.map((review, index) => {
                  const reviewText = String(review?.review || "");
                  const userName = String(review?.userName || "Anonymous");
                  const rating =
                    typeof review?.rating === "number" ? review.rating : 0;
                  const createdAt =
                    review?.createdAt || new Date().toISOString();

                  return (
                    <Col md={4} lg={3} key={review?._id || `review-${index}`}>
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
                              <FaCalendarAlt
                                className="me-1 text-muted"
                                size={12}
                              />
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
            <Form.Group className="mb-3" key="review-name">
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

            <Form.Group className="mb-3" key="review-rating">
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

            <Form.Group className="mb-3" key="review-text">
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

      {/* MOBILE STICKY CART */}
      <div className="mobile-sticky-cart">
        <button
          className={`mobile-wishlist ${isInWishlistState ? "active" : ""}`}
          onClick={toggleWishlist}
          disabled={isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <FaHeart />
          )}
        </button>

        <button
          className="mobile-add-cart"
          onClick={handleAddToCart}
          disabled={isAddingToCart || effectiveStock === 0}
        >
          {isAddingToCart ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : effectiveStock === 0 ? (
            "Out of Stock"
          ) : (
            <FaShoppingBag className="me-2" />
          )}
          {isAddingToCart
            ? "Adding..."
            : discountedPrice
              ? `₹${formatPrice(displayPrice)}`
              : "Add to Cart"}
        </button>
      </div>

      <Footer />
    </>
  );
};

export default Productdetails;