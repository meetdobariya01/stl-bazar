import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = "http://localhost:9000";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatImagePath = (path) => {
    if (!path) return "/images/default-product.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `${BACKEND_URL}${path}`;
    if (path.startsWith("/images")) return path;
    return `${BACKEND_URL}${path}`;
  };

  useEffect(() => {
    if (!decodedCategory) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, {
        params: { category: decodedCategory },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  if (loading)
    return <p className="text-center mt-5">Loading products...</p>;

  if (!products.length)
    return <p className="text-center mt-5">No products found</p>;

  return (
    <>
      <Header />
      <Details />

      <Container className="product-page my-5">
        <h2 className="text-center mb-5 fw-bold">{decodedCategory}</h2>

        <Row className="g-4">
          {products.map((item) => (
            <Col key={item._id} xs={6} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="product-card h-100 shadow-sm border-0"
                  style={{
                    cursor: "pointer",
                    borderRadius: "15px",
                    overflow: "hidden",
                  }}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div
                    style={{
                      height: "180px",
                      overflow: "hidden",
                      background: "#f8f9fa",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={formatImagePath(item.image)}
                      style={{
                        height: "100%",
                        objectFit: "contain",
                        padding: "10px",
                      }}
                      onError={(e) => {
                        e.target.src = "/images/default-product.png";
                      }}
                    />
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <h6 className="text-truncate">{item.name}</h6>

                    {/* ⭐ UPDATED RATING SECTION */}
                    <div className="rating mb-2 d-flex align-items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={12}
                          color={
                            i < Math.round(item.averageRating || 0)
                              ? "#f5a623"
                              : "#ddd"
                          }
                        />
                      ))}
                      <small className="text-muted">
                        ({item.ratings?.length || 0})
                      </small>
                    </div>

                    <div className="price fw-bold">
                      ₹{item.price}
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
