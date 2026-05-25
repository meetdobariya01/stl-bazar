import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./category.css";

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
      <section className="categories-section">
        <Container>
          <div className="section-heading text-start mb-5">
            <span>POPULAR CATEGORIES</span>
            <h2>Shop By Category</h2>
            <p>Explore premium collections for your modern lifestyle.</p>
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
      <section className="categories-section">
        <Container>
          <div className="section-heading text-start mb-5">
            <span>POPULAR CATEGORIES</span>
            <h2>Shop By Category</h2>
            <p>Explore premium collections for your modern lifestyle.</p>
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
    <section className="categories-section">
      <Container>
        <div className="section-heading text-start mb-5">
          <span>POPULAR CATEGORIES</span>
          <h2>Shop By Category</h2>
          <p>Explore premium collections for your modern lifestyle.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-5">
            <p>No categories found</p>
          </div>
        ) : (
          <Row className="g-4">
            {categories.map((category, index) => (
              <Col lg={1} md={3} sm={4} xs={3} key={category._id || index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    className="category-item"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <div className="category-image-wrapper">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="category-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="category-placeholder">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h4 className="category-name">{category.name}</h4>
                  </div>
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