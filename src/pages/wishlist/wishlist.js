import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartBroken, FaTrash, FaShoppingCart } from "react-icons/fa";
import "./wishlist.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: "Premium Namkeen Pack",
      price: "₹299",
      image: "https://via.placeholder.com/300",
    },
    {
      id: 2,
      name: "Spicy Mix Combo",
      price: "₹399",
      image: "https://via.placeholder.com/300",
    },
  ]);

  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div>
      {/* Header Component */}
      <Header />

      <Container className="py-5">
        <motion.h2
          className="text-center fw-bold mb-4 lexend"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ❤️ My Wishlist
        </motion.h2>

        <AnimatePresence>
          {wishlist.length === 0 ? (
            <motion.div
              className="text-center py-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <FaHeartBroken
                size={60}
                className="text-danger mb-3"
              />
              <h4 className="funnel-sans">Your wishlist is empty</h4>
              <p className="funnel-sans">Add items you love to see them here.</p>
            </motion.div>
          ) : (
            <Row className="g-4 funnel-sans">
              {wishlist.map((item) => (
                <Col lg={4} md={6} sm={12} key={item.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                      <Card.Img variant="top" src={item.image} />
                      <Card.Body>
                        <h5 className="fw-semibold">{item.name}</h5>
                        <p className="text-muted mb-3">{item.price}</p>

                        <div className="d-flex gap-2">
                          <Button variant="dark" className="w-100 rounded-pill">
                            <FaShoppingCart className="me-2" />
                            Add to Cart
                          </Button>

                          <Button
                            variant="outline-danger"
                            className="rounded-pill"
                            onClick={() => removeItem(item.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </AnimatePresence>
      </Container>

      {/* Footer Placeholder */}
      <Footer />
    </div>
  );
};

export default Wishlist;
