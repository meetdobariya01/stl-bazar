import { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaTruck, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./bestseller.css";

const Bestseller = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});

  // Fetch BEST SELLERS (1 product per company, first-added order)
  useEffect(() => {
    fetch("http://localhost:9000/api/best-sellers")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("BEST SELLER ERROR:", err));
  }, []);

  // Auto-scroll for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      const slider = document.getElementById("auto-scroll");
      if (window.innerWidth < 768 && slider) {
        slider.scrollLeft += 260;
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
          slider.scrollLeft = 0;
        }
      }
    }, 2500);

    return () => clearInterval(interval);
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

  return (
    <Container className="product-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="title">BEST SELLER</h2>
        <Button className="deal-btn">VIEW DEALS</Button>
      </div>

      <div id="auto-scroll" className="product-slider">
        {products.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="product-card-wrapper"
          >
            <Card className="product-card">
              <Link
                to={`/product/${item._id}`}
                className="product-link"
              >
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

                  {/* <div className="ship">
                    <FaTruck /> Ships in 1 Day
                  </div> */}

                  <div className="cart-area">
                    {cart[item._id] ? (
                      <div className="qty-box">
                        <button onClick={() => decreaseQty(item._id)}>-</button>
                        <span>{cart[item._id]}</span>
                        <button onClick={() => increaseQty(item._id)}>+</button>
                      </div>
                    ) : (
                      <Button
                        className="cart-btn"
                        onClick={() => addToCart(item._id)}
                      >
                        <FaShoppingCart />
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
    </Container>
  );
};

export default Bestseller;
