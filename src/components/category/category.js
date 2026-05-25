import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      console.log("Database mathi aavel categories:", response.data);
      setCategories(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Categories load karva ma error aavi");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className="categories-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2>Shop By Category</h2>
            <p>Explore our premium collections</p>
          </div>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading categories...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="categories-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2>Shop By Category</h2>
            <p>Explore our premium collections</p>
          </div>
          <div className="text-center py-5 text-danger">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCategories}>
              Try Again
            </button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="categories-section py-5">
      <Container>
        <div className="text-center mb-5">
          <h2>Shop By Category</h2>
          <p>Explore our premium collections</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-5">
            <p>No categories found</p>
          </div>
        ) : (
          <Row className="g-4">
            {categories.map((category, index) => (
              <Col lg={2} md={3} sm={4} xs={6} key={category._id || index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card 
                    className="category-card h-100 text-center border-0 shadow-sm"
                    onClick={() => handleCategoryClick(category.name)}
                    style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden" }}
                  >
                    {/* Database mathi image show thashe */}
                    <div className="category-image-container p-3">
                      {category.image ? (
                        <img 
                          src={category.image}
                          alt={category.name}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "contain",
                            borderRadius: "10px"
                          }}
                          onError={(e) => {
                            console.error(`Image load failed: ${category.image}`);
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150x150?text=No+Image";
                          }}
                        />
                      ) : (
                        <div 
                          style={{
                            width: "100%",
                            height: "150px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f8f9fa",
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: "#6c757d",
                            borderRadius: "10px"
                          }}
                        >
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <Card.Body>
                      <Card.Title className="h6 mb-2">{category.name}</Card.Title>
                      {category.productCount > 0 && (
                        <small className="text-muted">{category.productCount} Products</small>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default CategoriesSection;