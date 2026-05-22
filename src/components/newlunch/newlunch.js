import { useState, useEffect, useRef, useCallback } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTruck, FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./newlunch.css";

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = "http://localhost:9000";

// ✅ Image Format Fix - Handles non-string values
const formatImagePath = (path) => {
  if (!path) return "/images/default-product.png";
  // Convert to string if it's not already
  const pathStr = String(path);
  if (pathStr.startsWith("http")) return pathStr;
  if (pathStr.startsWith("/uploads")) return `${BACKEND_URL}${pathStr}`;
  if (pathStr.startsWith("/images")) return pathStr;
  return `${BACKEND_URL}${pathStr}`;
};

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
};

const Newlunch = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const width = useWindowWidth();

  const itemsPerView =
    width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 3 : 4;

  const maxIndex = Math.max(0, products.length - itemsPerView);

  useEffect(() => {
    fetch(`${API_URL}/best-sellers`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("BEST SELLER ERROR:", err));
  }, []);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [itemsPerView, maxIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <Container className="product-section">
      <div className="d-flex justify-content-between align-items-center mb-3 lexend">
        <h2 className="title">BEST SELLER</h2>
        <Button className="deal-btn">VIEW DEALS</Button>
      </div>

      <div className="bs-carousel-wrapper">
        <button
          className="bs-carousel-nav-btn bs-carousel-prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div className="bs-carousel-track">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              className="bs-carousel-slide"
              initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                gap: "16px",
              }}
            >
              {visibleProducts.map((item) => (
                <Card className="product-card" key={item._id}>
                  <Link
                    to={`/product/${item._id}`}
                    className="product-link"
                  >
                    {/* ✅ IMAGE FIX - Now handles any data type */}
                    <Card.Img
                      src={formatImagePath(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/images/default-product.png";
                      }}
                    />

                    <Card.Body>
                      <h6 className="product-title">
                        {item.name}
                      </h6>

                      {/* ✅ RATING FIX */}
                      <div className="rating d-flex align-items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={14}
                            color={
                              i <
                              Math.round(item.averageRating || 0)
                                ? "#f5a623"
                                : "#ddd"
                            }
                          />
                        ))}
                        <span className="text-muted">
                          ({item.ratings?.length || 0})
                        </span>
                      </div>

                      <div className="price">
                        <span className="new">
                          ₹{item.price}
                        </span>
                      </div>

                      <Button className="cart-btn">
                        <FaShoppingCart />
                      </Button>
                    </Card.Body>
                  </Link>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          className="bs-carousel-nav-btn bs-carousel-next"
          onClick={goNext}
          disabled={currentIndex >= maxIndex}
        >
          <FaChevronRight />
        </button>
      </div>
    </Container>
  );
};

export default Newlunch;