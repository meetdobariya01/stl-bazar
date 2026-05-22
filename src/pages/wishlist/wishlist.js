import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartBroken, FaTrash, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./wishlist.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext";

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = "http://localhost:9000";

const formatImage = (image) => {
  if (!image) return "/images/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${image}`;
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchCart, setShowCart } = useCart();
  const navigate = useNavigate();

  const guestId = localStorage.getItem("guestId");

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    if (!guestId) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_URL}/wishlist/${guestId}`);
      setWishlist(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove from wishlist
  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/remove`, {
        data: { guestId, productId },
      });
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  // Add to cart from wishlist
  const addToCart = async (item) => {
    try {
      await axios.post(`${API_URL}/cart/add`, {
        guestId,
        product: {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        },
      });
      await fetchCart();
      setShowCart(true);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  return (
    <div>
      <Header />

      <Container className="py-5">
        <motion.h2
          className="text-center fw-bold mb-4 lexend"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ❤️ My Wishlist
        </motion.h2>

        {loading ? (
          <p className="text-center mt-5">Loading wishlist...</p>
        ) : (
          <AnimatePresence>
            {wishlist.length === 0 ? (
              <motion.div
                className="text-center py-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaHeartBroken size={60} className="text-danger mb-3" />
                <h4 className="funnel-sans">Your wishlist is empty</h4>
                <p className="funnel-sans">Add items you love to see them here.</p>
                {/* <Button variant="dark" className="mt-2" onClick={() => navigate("/")}>
                  Browse Products
                </Button> */}
              </motion.div>
            ) : (
              <Row className="g-4 funnel-sans">
                {wishlist.map((item) => (
                  <Col lg={4} md={6} sm={12} key={item.productId}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Card
                        className="border-0 shadow-lg rounded-4 overflow-hidden"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        <Card.Img
                          variant="top"
                          src={formatImage(item.image)}
                          style={{ height: "220px", objectFit: "cover" }}
                          onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                        />
                        <Card.Body>
                          <h5 className="fw-semibold">{item.name}</h5>
                          <p className="text-muted mb-3">₹{item.price}</p>

                          <div className="d-flex gap-2">
                            <Button
                              variant="dark"
                              className="w-100 rounded-pill"
                              onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                            >
                              <FaShoppingCart className="me-2" />
                              Add to Cart
                            </Button>

                            <Button
                              variant="outline-danger"
                              className="rounded-pill"
                              onClick={(e) => { e.stopPropagation(); removeItem(item.productId); }}
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
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default Wishlist;