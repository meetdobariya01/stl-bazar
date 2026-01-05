import { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaTruck, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./bestseller.css";

const products = [
  {
    id: 1,
    name: "Conscious Food Cashews - 250 Gm",
    img: "/images/cashew.jpg",
    price: 475,
    sale: 404,
    off: "15% Off",
    rating: 4,
    reviews: 7,
  },
  {
    id: 2,
    name: "Phool Bamboobless Incense Sticks",
    img: "/images/phool.jpg",
    price: 265,
    sale: 252,
    off: "5% Off",
    rating: 4,
    reviews: 4,
  },
  {
    id: 3,
    name: "Loban Agarbatti Incense Sticks - 85 Gm",
    img: "/images/loban.jpg",
    price: 75,
    sale: 71,
    off: "5% Off",
    rating: 4,
    reviews: 28,
  },
  {
    id: 4,
    name: "Conscious Food Almonds - 250 Gm",
    img: "/images/almond.jpg",
    price: 445,
    sale: 380,
    off: "15% Off",
    rating: 4,
    reviews: 9,
  },
  {
    id: 5,
    name: "Cowpathy Smudge incense Sage",
    img: "/images/sage.jpg",
    price: 200,
    sale: 160,
    off: "20% Off",
    rating: 4,
    reviews: 7,
  },
];

const Bestseller = () => {
  const [cart, setCart] = useState({});

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
            key={item.id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="product-card-wrapper"
          >
            <Card className="product-card">
              {/* IMAGE CLICK */}
              <Link
                to={"/productdetails"}
                className="product-link"
              >
                <Card.Img src={item.img} alt={item.name} />
              

              <Card.Body>
                {/* TITLE CLICK */}
                <Link
                  to={`/productdetails/${item.id}`}
                  className="product-link"
                >
                  <h6 className="product-title">{item.name}</h6>
                </Link>

                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < item.rating ? "#f5a623" : "#ddd"}
                    />
                  ))}
                  <span>({item.reviews})</span>
                </div>

                <div className="price">
                  <span className="new">₹{item.sale}.00</span>
                </div>

                <div className="ship">
                  <FaTruck /> Ships in 1 Days
                </div>
                

                <div className="cart-area">
                  {cart[item.id] ? (
                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{cart[item.id]}</span>
                      <button onClick={() => increaseQty(item.id)}>+</button>
                    </div>
                  ) : (
                    <Button
                      className="cart-btn"
                      onClick={() => addToCart(item.id)}
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
