import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaTshirt,
  FaMobileAlt,
  FaCouch,
  FaSpa,
  FaHeadphones,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./category.css";

const categories = [
  {
    title: "Fashion & Clothing",
    icon: <FaTshirt />,
    bg: "cat-fashion",
    slug: "fashion",
  },
  {
    title: "Electronics",
    icon: <FaMobileAlt />,
    bg: "cat-electronics",
    slug: "electronics",
  },
  {
    title: "Home & Living",
    icon: <FaCouch />,
    bg: "cat-home",
    slug: "home-living",
  },
  {
    title: "Beauty & Care",
    icon: <FaSpa />,
    bg: "cat-beauty",
    slug: "beauty",
  },
  {
    title: "Accessories",
    icon: <FaHeadphones />,
    bg: "cat-accessories",
    slug: "accessories",
  },
];

const Category = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className="featured-categories">
        <Container>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-header text-center"
          >
            <h2>Shop by Category</h2>
            <p>Explore our wide range of premium categories</p>
          </motion.div>

          {/* Categories */}
          <Row className="g-4 mt-4 justify-content-center">
            {categories.map((cat, index) => (
              <Col
                key={index}
                xs={6}
                md={4}
                lg={2}
                className="d-flex justify-content-center"
              >
                <motion.div
                  className="w-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`category-card ${cat.bg}`}
                    onClick={() => navigate(`/category/${cat.slug}`)}
                  >
                    <div className="icon-wrap">{cat.icon}</div>
                    <h6>{cat.title}</h6>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Button */}
          <motion.div
            className="text-center mt-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              className="view-all-btn"
              onClick={() => navigate("/categories")}
            >
              View All Categories
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Category;
