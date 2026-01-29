import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBoxOpen } from "react-icons/fa";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL;

const Category = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        const uniqueCategories = [...new Set(res.data.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // convert category name → css class
  const getCategoryClass = (cat) =>
    `category-card text-center cat-${cat.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="featured-categories">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header text-center"
        >
          <h2 className="lexend">Shop by Category</h2>
          <p className="funnel-sans">Explore our wide range of premium categories</p>
        </motion.div>

        <Row className="g-4 mt-4 justify-content-center">
          {categories.map((cat, index) => (
            <Col key={index} xs={6} md={4} lg={2} className="d-flex justify-content-center">
              <motion.div
                className="w-100"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card
                  className={getCategoryClass(cat)}
                  onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}  
                >
                  <div className="icon-wrap">
                    <FaBoxOpen size={32} />
                  </div>
                  <h6>{cat}</h6>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Button className="view-all-btn funnel-sans" onClick={() => navigate("/categories")}>
            View All Categories
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};

export default Category;