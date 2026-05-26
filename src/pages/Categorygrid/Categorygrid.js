import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Handle both string and array images
  const formatImagePath = (image) => {
    if (!image) return "/images/default-product.png";
    
    // If image is an array, take the first item
    let imgPath = image;
    if (Array.isArray(image)) {
      if (image.length === 0) return "/images/default-product.png";
      imgPath = image[0];
    }
    
    // If it's not a string after array check
    if (typeof imgPath !== "string") return "/images/default-product.png";
    
    if (imgPath.startsWith("http")) return imgPath;
    if (imgPath.startsWith("/uploads")) return `${BACKEND_URL}${imgPath}`;
    if (imgPath.startsWith("/images")) return imgPath;
    
    return `${BACKEND_URL}${imgPath}`;
  };

  useEffect(() => {
    if (!decodedCategory) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, {
        params: { category: decodedCategory },
      })
      .then((res) => {
        console.log("Products received:", res.data);
        setProducts(res.data);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  if (loading)
    return (
      <>
        <Header />
        <div className="text-center mt-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading products...</p>
        </div>
        <Footer />
      </>
    );

  if (!products.length)
    return (
      <>
        <Header />
        <div className="text-center mt-5 py-5">
          <h4>No products found in {decodedCategory}</h4>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </>
    );

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

                    {/* Rating Section */}
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
                      ₹{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
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