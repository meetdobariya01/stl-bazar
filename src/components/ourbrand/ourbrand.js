import React from "react";
import { Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./ourbrand.css";

const categories = [
  { id: 1, title: "GROCERY & KITCHEN", image: "/images/grocery.jpg" },
  { id: 2, title: "BEAUTY", image: "/images/beauty.jpg" },
  { id: 3, title: "SPIRITUAL NEEDS", image: "/images/spiritual.jpg" },
  { id: 4, title: "MEN'S CARE", image: "/images/mens.jpg" },
  { id: 5, title: "GIFTING", image: "/images/gifting.jpg" },
  { id: 6, title: "COSMETICS", image: "/images/cosmetics.jpg" },
];

// split slides
const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

const Ourbrand = () => {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;
  const slides = chunk(categories, isMobile ? 2 : 4);

  const handleBrandClick = (title) => {
    navigate(
      `/brand/${title
        .toLowerCase()
        .replace(/ & /g, "-")
        .replace(/\s+/g, "-")}`
    );
  };

  return (
    <section className="featured-section">
      <div className="featured-fullwidth full-width-carousel">
        <div className="featured-header">
          <h2>OUR BRAND</h2>
          <button
            className="view-all"
            onClick={() => navigate("/all-brands")}
          >
            View All
          </button>
        </div>

        <Carousel indicators={false} interval={3000} pause={false} touch>
          {slides.map((group, index) => (
            <Carousel.Item key={index}>
              <div className="featured-row">
                {group.map((item) => (
                  <motion.div
                    key={item.id}
                    className="featured-card"
                    onClick={() => handleBrandClick(item.title)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="image-wrap">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <h6>{item.title}</h6>
                  </motion.div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Ourbrand;
