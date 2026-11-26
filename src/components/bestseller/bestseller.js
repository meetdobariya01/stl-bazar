import React, { useEffect, useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import axios from "axios";
import { useWishlist } from "../../context/WishlistContext";
import { createSlug } from "../../utils/slugUtils";
import "./bestseller.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const Bestseller = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist() || {};

  const bestsellersTrackRef = useRef(null);

  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  // Fetch actual bestseller products from backend
  useEffect(() => {
    let mounted = true;

    const fetchBestSellers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/best-sellers`, {
          timeout: 10000,
        });

        const products = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        if (mounted) {
          setBestSellers(products.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);

        if (mounted) {
          setBestSellers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBestSellers();

    return () => {
      mounted = false;
    };
  }, []);

  // Get correct image URL from backend
  const getImageUrl = (image) => {
    if (!image) return null;

    const imagePath = Array.isArray(image) ? image[0] : image;

    if (!imagePath || typeof imagePath !== "string") {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    if (imagePath.startsWith("/images")) {
      return imagePath;
    }

    if (imagePath.startsWith("/uploads")) {
      return `${BACKEND_URL}${imagePath}`;
    }

    return `${BACKEND_URL}/uploads/${imagePath}`;
  };

  // Mouse drag scrolling
  const handleTrackMouseDown = (e) => {
    if (e.button !== 0) return;

    const track = bestsellersTrackRef.current;
    if (!track) return;

    dragState.current = {
      isDown: true,
      startX: e.pageX - track.getBoundingClientRect().left,
      scrollLeft: track.scrollLeft,
      hasMoved: false,
    };

    setIsDragging(true);
  };

  const handleTrackMouseMove = (e) => {
    const track = bestsellersTrackRef.current;

    if (!dragState.current.isDown || !track) return;

    const x = e.pageX - track.getBoundingClientRect().left;
    const walk = x - dragState.current.startX;

    if (Math.abs(walk) > 6) {
      dragState.current.hasMoved = true;
    }

    if (dragState.current.hasMoved) {
      e.preventDefault();
      track.scrollLeft = dragState.current.scrollLeft - walk * 1.3;
    }
  };

  const handleTrackMouseEnd = () => {
    if (!dragState.current.isDown) return;

    dragState.current.isDown = false;
    setIsDragging(false);

    // Keep the drag flag until the click event has been handled
    setTimeout(() => {
      dragState.current.hasMoved = false;
    }, 0);
  };

  // Wishlist
  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation();

    if (!toggleWishlist) return;

    try {
      await toggleWishlist(product);
    } catch (err) {
      console.warn("Wishlist toggle skipped:", err?.message);
    }
  };

  return (
    <section className="home-bestsellers-section">
      <Container>
        <div className="bestsellers-centered-header">
          <span className="section-eyebrow">LOVED BY OUR COMMUNITY</span>

          <h2 className="section-serif-heading">Our Bestsellers</h2>
        </div>

        {loading ? (
          <div className="bestsellers-message">Loading bestsellers...</div>
        ) : bestSellers.length === 0 ? (
          <div className="bestsellers-message">
            No bestsellers available right now.
          </div>
        ) : (
          <div
            ref={bestsellersTrackRef}
            className={`bestsellers-scroll-track ${
              isDragging ? "is-dragging" : ""
            }`}
            onMouseDown={handleTrackMouseDown}
            onMouseMove={handleTrackMouseMove}
            onMouseUp={handleTrackMouseEnd}
            onMouseLeave={handleTrackMouseEnd}
          >
            {bestSellers.map((product, index) => {
              const productName =
                product.name || product.ProductName || "Artisanal Product";

              const price = Number(product.price || 0);

              const mrp = Number(
                product.mrp ||
                  product.originalPrice ||
                  Math.round(price * 1.25),
              );

              const discountPct =
                mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

              const wishlisted = isInWishlist
                ? isInWishlist(product._id)
                : false;

              const imageUrl = getImageUrl(product.image || product.images);

              return (
                <motion.div
                  key={product._id || index}
                  className="bestseller-product-card"
                  initial={{ opacity: 0, y: 22, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min((index % 6) * 0.06, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => {
                    if (dragState.current.hasMoved) return;

                    navigate(`/product/${createSlug(productName)}`);
                  }}
                >
                  <div className="bestseller-img-box">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={productName}
                        loading="lazy"
                        draggable={false}
                      />
                    )}

                    <button
                      type="button"
                      className={`bestseller-wishlist-btn ${
                        wishlisted ? "is-active" : ""
                      }`}
                      onClick={(e) => handleWishlistToggle(e, product)}
                      aria-label="Toggle wishlist"
                    >
                      {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
                    </button>
                  </div>

                  <div className="bestseller-card-body">
                    <span className="bestseller-brand">
                      {product.company || "Native91"}
                    </span>

                    <h3 className="bestseller-title" title={productName}>
                      {productName}
                    </h3>

                    <div className="bestseller-rating">
                      <span className="rating-star">★</span>

                      <span className="rating-val">
                        {product.rating || "4.8"}
                      </span>

                      <span className="rating-count">
                        ({product.reviewsCount || 120})
                      </span>
                    </div>

                    <div className="bestseller-price-row">
                      <span className="price-current">
                        ₹{price.toLocaleString("en-IN")}
                      </span>

                      {mrp > price && (
                        <>
                          <span className="price-mrp">
                            ₹{mrp.toLocaleString("en-IN")}
                          </span>

                          <span className="price-off">{discountPct}% OFF</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="bestseller-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        navigate(`/product/${createSlug(productName)}`);
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
};

export default Bestseller;
