import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart, FaTruck } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Details from "../../components/details/details";
// import "./grid.css";

const API_URL = process.env.REACT_APP_API_URL;

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedCategory) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, { params: { category: decodedCategory } })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  const addToCart = (id) => setCart((prev) => ({ ...prev, [id]: 1 }));
  const increaseQty = (id) =>
    setCart((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  const decreaseQty = (id) =>
    setCart((prev) => {
      if (prev[id] === 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });

  if (loading) return <p className="text-center mt-5">Loading products...</p>;
  if (!products.length)
    return <p className="text-center mt-5">No products found</p>;

  return (
    <>
      <Header />

      <Details />

      <Container className="product-page ">
        <h2 className="text-center lexend mb-4">{decodedCategory}</h2>
        <Row className="g-4">
          {products.map((item) => (
            <Col key={item._id} xs={6} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  className="product-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <Card.Img src={item.image || "/images/default-product.png"} />
                  <Card.Body>
                    <h6>{item.name}</h6>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          color={
                            i < (item.averageRating || 0) ? "#f5a623" : "#ddd"
                          }
                        />
                      ))}
                    </div>
                    <div className="price">₹{item.price}</div>

                    <div className="cart-area">
                      {cart[item._id] ? (
                        <div className="qty-box">
                          <button onClick={() => decreaseQty(item._id)}>
                            -
                          </button>
                          <span>{cart[item._id]}</span>
                          <button onClick={() => increaseQty(item._id)}>
                            +
                          </button>
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
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default CategoryProducts;
