import React, { useEffect, useState } from "react";
import { Container, Carousel, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart, FaTruck } from "react-icons/fa";
import "./bestseller.css";

const products = [
  {
    id: 1,
    name: "Kunafa Spread - 80 Gm",
    image: "/images/kunafa.jpg",
    price: 180,
    oldPrice: 189,
    rating: 4,
    reviews: 9,
  },
  {
    id: 2,
    name: "Premium Alsi Mix Mukhwas",
    image: "/images/mukhwas.jpg",
    price: 100,
    oldPrice: 105,
    rating: 4,
    reviews: 28,
  },
  {
    id: 3,
    name: "Chocolate Jaggery Powder",
    image: "/images/jaggery.jpg",
    price: 142,
    oldPrice: 149,
    rating: 4,
    reviews: 9,
  },
  {
    id: 4,
    name: "Barbeque Cashew - 100g",
    image: "/images/cashew.jpg",
    price: 360,
    oldPrice: 379,
    rating: 4,
    reviews: 6,
  },
  {
    id: 5,
    name: "Roasted Almonds",
    image: "/images/almond.jpg",
    price: 280,
    oldPrice: 295,
    rating: 4,
    reviews: 9,
  }, {
    id: 5,
    name: "Roasted Almonds",
    image: "/images/almond.jpg",
    price: 280,
    oldPrice: 295,
    rating: 4,
    reviews: 9,
  },
   {
    id: 5,
    name: "Roasted Almonds",
    image: "/images/almond.jpg",
    price: 280,
    oldPrice: 295,
    rating: 4,
    reviews: 9,
  },
   {
    id: 5,
    name: "Roasted Almonds",
    image: "/images/almond.jpg",
    price: 280,
    oldPrice: 295,
    rating: 4,
    reviews: 9,
  },
];

// utility
const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

const Bestseller = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [qty, setQty] = useState({});

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const slides = chunk(products, isMobile ? 2 : 4);

  const changeQty = (id, val) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + val),
    }));
  };

  return (
    <section className="bestseller-section container">
      <Container fluid>
        <h2 className="section-title">BESTSELLER</h2>

        <Carousel indicators={false} interval={3000} pause={false} touch>
          {slides.map((group, index) => (
            <Carousel.Item key={index}>
              <div className="bestseller-row">
                {group.map((item) => (
                  <motion.div
                    key={item.id}
                    className="bestseller-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <Card.Img src={item.image} />

                      <Card.Body className="funnel-sans">
                        <h5 className="lexend">{item.name}</h5>

                        <div className="rating">
                          {[...Array(item.rating)].map((_, i) => (
                            <FaStar key={i} />
                          ))}
                          <span>({item.reviews})</span>
                        </div>

                        <div className="price">
                          <span className="old">₹{item.oldPrice}</span>
                          <span className="new">₹{item.price}</span>
                          <span className="off">5% Off</span>
                        </div>

                        <div className="ship">
                          <FaTruck /> Ships in 1 Day
                        </div>

                        <div className="qty-cart">
                          <div className="qty">
                            <button onClick={() => changeQty(item.id, -1)}>
                              −
                            </button>
                            <span>{qty[item.id] || 1}</span>
                            <button onClick={() => changeQty(item.id, 1)}>
                              +
                            </button>
                          </div>

                          <Button className="cart-btn">
                            <FaShoppingCart />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default Bestseller;
