import { useState, useEffect, useCallback } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTruck, FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./bestseller.css";

const API_URL = process.env.REACT_APP_API_URL;

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
};

const Bestseller = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const width = useWindowWidth();

  // Items visible per slide
  const itemsPerView = width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 3 : 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Fetch BEST SELLERS (1 product per company, first-added order)
  useEffect(() => {
    fetch(`${API_URL}/best-sellers`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("BEST SELLER ERROR:", err));
  }, []);

  // Reset index when items per view changes
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

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: 1 }));
  };

  const increaseQty = (id) => {
    setCart((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decreaseQty = (id) => {
    setCart((prev) => {
      if (prev[id] === 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <Container className="product-section">
      <div className="d-flex justify-content-between align-items-center mb-3 lexend">
        <h2 className="title">BEST SELLER</h2>
        <Button className="deal-btn">VIEW DEALS</Button>
      </div>

      <div className="bs-carousel-wrapper">
        {/* Prev Button */}
        <button
          className="bs-carousel-nav-btn bs-carousel-prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>

        {/* Product Track */}
        <div className="bs-carousel-track">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              className="bs-carousel-slide"
              initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                gap: "16px",
              }}
            >
              {visibleProducts.map((item) => (
                <Card className="product-card" key={item._id}>
                  <Link to={`/product/${item._id}`} className="product-link">
                    <Card.Img src={item.image} alt={item.name} />
                    <Card.Body>
                      <h6 className="product-title">{item.name}</h6>

                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            color={i < (item.averageRating || 4) ? "#f5a623" : "#ddd"}
                          />
                        ))}
                        <span>({item.reviews || 0})</span>
                      </div>

                      <div className="price">
                        <span className="new">₹{item.price}</span>
                      </div>

                      <div className="cart-area">
                        {cart[item._id] ? (
                          <div className="qty-box-bestseller">
                            <button onClick={(e) => { e.preventDefault(); decreaseQty(item._id); }}>-</button>
                            <span>{cart[item._id]}</span>
                            <button onClick={(e) => { e.preventDefault(); increaseQty(item._id); }}>+</button>
                          </div>
                        ) : (
                          <Button className="cart-btn" onClick={(e) => { e.preventDefault(); addToCart(item._id); }}>
                            <FaShoppingCart />
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Link>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          className="bs-carousel-nav-btn bs-carousel-next"
          onClick={goNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="bs-carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <span
            key={i}
            className={`bs-carousel-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
          />
        ))}
      </div>
    </Container>
  );
};

export default Bestseller;
