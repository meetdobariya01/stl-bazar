// CategoriesSection.js - Updated version
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL || "https://api.gourmetbazar.starlighttechlabsindia.com/api";
const ADMIN_BACKEND_URL = "https://api.brandelsuperadmin.starlighttechlabsindia.com";

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
      const response = await axios.get(`${API_URL}/categories`, {
        params: {
          _t: Date.now(), // This ensures fresh data every time
        },
      });
      console.log("Categories from API:", response.data);

      // Handle both response formats
      let categoriesData = [];
      if (response.data.success && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (
        response.data.categories &&
        Array.isArray(response.data.categories)
      ) {
        categoriesData = response.data.categories;
      } else {
        categoriesData = response.data || [];
      }

      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  // ✅ FIXED: Get correct image URL from admin backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If it starts with /images/categories/ (stored by admin)
    if (imagePath.startsWith("/images/categories/")) {
      // return `${ADMIN_BACKEND_URL}${imagePath}`;
      return `${ADMIN_BACKEND_URL}${imagePath}`;
    }

    // If it's just a filename
    if (!imagePath.startsWith("/")) {
      return `${ADMIN_BACKEND_URL}/images/categories/${imagePath}`;
    }

    // Default fallback
    return `${imagePath}`;
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
    <Row className="g-4 justify-content-center container mx-auto lexend">
      <div className="category-heading text-start mt-5">
        <span>POPULAR CATEGORIES</span>
        <h2 className="funnel-sans category-title">Explore Our World</h2>
        {/* <p>Explore premium collections for your modern lifestyle.</p> */}
      </div>
      {categories.map((category, index) => {
        const imageUrl = getImageUrl(category.image);

        return (
          <Col lg={4} md={4} sm={6} xs={6} key={category._id || index}>
            <motion.div
              className="premium-category-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="premium-category-image">  
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="category-image"
                />
              </div>

              <div className="premium-category-content">
                <h5>{category.name}</h5>
                <span>Explore Collection</span>
              </div>
            </motion.div>
          </Col>
        );
      })}
    </Row>
  );
};

export default CategoriesSection;
