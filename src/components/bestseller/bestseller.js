import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart } from "react-icons/fa";
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
];

const Bestseller = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart`);
  };

  // 👉 split products into groups of 2 for mobile carousel
  const mobileSlides = [];
  for (let i = 0; i < products.length; i += 2) {
    mobileSlides.push(products.slice(i, i + 2));
  }

  const ProductCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bestseller-card">
        <Card.Img src={item.image} />
        <Card.Body>
          <h6>{item.name}</h6>

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

          <Button className="cart-btn" onClick={() => addToCart(item)}>
            <FaShoppingCart />
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );

  return (
    <section className="bestseller-section container">
      <Container fluid>
        <h2 className="section-title mt-5">BESTSELLER</h2>

        {/* MOBILE: 2 ITEMS PER SLIDE */}
        {isMobile ? (
          <Carousel
            interval={2500}
            controls={false}
            indicators={false}
            pause={false}
            touch
          >
            {mobileSlides.map((slide, index) => (
              <Carousel.Item key={index}>
                <Row>
                  {slide.map((item) => (
                    <Col xs={6} key={item.id}>
                      <ProductCard item={item} />
                    </Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          /* DESKTOP GRID */
        <Row className="justify-content-center">
  {products.map((item) => (
    <Col
      key={item.id}
      xl={2}
      lg={3}
      md={4}
      sm={6}
      xs={6}
      className="d-flex justify-content-center"
    >
      <ProductCard item={item} />
    </Col>
  ))}
</Row>

        )}
      </Container>
    </section>
  );
};

export default Bestseller;
