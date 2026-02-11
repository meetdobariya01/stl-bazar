import React, { useEffect, useState } from "react";
import { Container, Carousel, Row, Col, Card, Button } from "react-bootstrap";
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
        const uniqueCategories = [...new Set(res.data.map((p) => p.category))];
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

  // const navigate = useNavigate();

  // Split categories into groups of 6 per slide
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const groupedCategories = chunkArray(categories, 6);

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
          <p className="funnel-sans">
            Explore our wide range of premium categories
          </p>
        </motion.div>

        <Carousel indicators={false} interval={null}>
          {groupedCategories.map((group, slideIndex) => (
            <Carousel.Item key={slideIndex}>
              <div className="d-flex justify-content-center gap-4 flex-wrap py-4">
                {group.map((cat, index) => (
                  <motion.div
                    key={index}
                    className="category-card-wrapper"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                  >
                    <Card
                      className={getCategoryClass(cat)}
                      onClick={() =>
                        navigate(`/category/${encodeURIComponent(cat)}`)
                      }
                    >
                      <div>
                        <FaBoxOpen size={32} />
                      </div>
                      <h6 className="mt-2">{cat}</h6>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        {/* <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Button
            className="view-all-btn funnel-sans"
            onClick={() => navigate("/categories")}
          >
            View All Categories
          </Button>
        </motion.div> */}
      </Container>
    </section>
  );
};

export default Category;
