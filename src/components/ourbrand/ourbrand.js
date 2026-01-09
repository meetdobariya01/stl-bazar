import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ourbrand.css";

const API_URL = process.env.REACT_APP_API_URL;

// Helper: split array into chunks for carousel slides
const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

const Ourbrand = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_URL}/companies`);
        setCompanies(res.data);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  const slides = chunk(companies, isMobile ? 2 : 4);

  // Navigate to brand page
  const handleBrandClick = (title) => {
    const url = `/company/${encodeURIComponent(title)}`; // encode for safe URL
    navigate(url);
  };

  if (companies.length === 0) return null;

  return (
    <section className="featured-section funnel-sans">
      <div className="featured-fullwidth full-width-carousel">
        <div className="featured-header container lexend">
          <h2>OUR BRAND</h2>
          <button className="view-all" onClick={() => navigate("/all-brands")}>
            View All
          </button>
        </div>

        <Carousel indicators={false} interval={3000} pause={false} touch>
          {slides.map((group, index) => (
            <Carousel.Item key={index}>
              <div className="featured-row">
                {group.map((company) => (
                  <motion.div
                    key={company._id}
                    className="featured-card"
                    onClick={() => handleBrandClick(company.name)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="image-wrap">
                      <img
                        src={company.logo || "/images/default-company.png"}
                        alt={company.name}
                      />
                    </div>
                    <h6>{company.name}</h6>
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
