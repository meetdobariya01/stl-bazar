import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const USER_BACKEND_URL = "http://localhost:9000";
const ADMIN_BACKEND_URL = "http://localhost:7000";

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
      console.log("Categories from API:", response.data);
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
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  // ✅ Fix: Get correct image URL based on path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log("Original image path:", imagePath);
    
    // If already full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    
    // 🆕 New images uploaded by admin (stored in /images/categories/)
    if (imagePath.startsWith("/images/categories/")) {
      // Try to get from admin backend first, then user backend
      return `${ADMIN_BACKEND_URL}${imagePath}`;
    }
    
    // 🟢 Old images (stored in /images/Category/)
    if (imagePath.startsWith("/images/Category/")) {
      return `${USER_BACKEND_URL}${imagePath}`;
    }
    
    // Default fallback
    return `${USER_BACKEND_URL}/images/categories/${imagePath}`;
  };

  if (loading) {
    return (
      <section className="category-section">
        <Container>
          <div className="category-heading text-start mb-5">
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
      <section className="category-section">
        <Container>
          <div className="category-heading text-start mb-5">
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
    <section className="category-section">
      <Container>
        <div className="category-heading text-start mb-5">
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
            {categories.map((category, index) => {
              const imageUrl = getImageUrl(category.image);
              console.log(`Category: ${category.name}, Final URL: ${imageUrl}`);
              
              return (
                <Col lg={1} md={3} sm={4} xs={3} key={category._id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div
                      className="category-item-home"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <div className="category-image-wrapper">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="category-image"
                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%" }}
                            onError={(e) => {
                              console.log(`Failed to load: ${imageUrl}`);
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `<div class="category-placeholder">${category.name.charAt(0).toUpperCase()}</div>`;
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
              );
            })}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default CategoriesSection;