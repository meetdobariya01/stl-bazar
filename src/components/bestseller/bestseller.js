import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";
import "./bestseller.css";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const BACKEND_URL = "http://localhost:9000";
const Bestseller = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add navigate hook

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/best-sellers`);

      // console.log("Best Sellers data:", data);
      // Only show first 6 products
      setBestSellers(data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching best sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image URL safely
  const getImageUrl = (image) => {
    if (!image) return null;

    // If it's an array, get the first item
    let imagePath = Array.isArray(image) ? image[0] : image;

    if (!imagePath) return null;

    // If it's a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // If it starts with /images, serve from backend
    if (imagePath.startsWith("/images")) {
      return `${imagePath}`;
    }

    // Default: serve from uploads folder
    return `${BACKEND_URL}/uploads/${imagePath}`;
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className="collection-section py-5">
        <Container>
          <div className="text-center">
            <h3>Loading best sellers...</h3>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="collection-section py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h2 className="section-title-seller funnel-sans">Most Loved Picks</h2>

          <a
            href="/products"
            className="view-all-link d-flex align-items-center"
          >
            View all products
            <FaArrowRight className="ms-2" />
          </a>
        </div>

        {isMobile ? (
          <Swiper
            slidesPerView={2.2}
            spaceBetween={12}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
          >
            {bestSellers.map((product, index) => {
              const imageUrl = getImageUrl(product.image);

              return (
                <SwiperSlide key={product._id || index}>
                  <div
                    className="collection-card"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="image-wrapper">
                      <img
                        src={
                          imageUrl ||
                          "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image"
                        }
                        alt={product.name}
                      />
                    </div>

                    <div className="card-content">
                      <h5>{product.name}</h5>
                      <p className="product-price lexend">₹{product.price}</p>
                      <p>Brand Name</p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <Row className="g-4">
            {bestSellers.map((product, index) => {
              const imageUrl = getImageUrl(product.image);

              return (
                <Col lg={2} md={4} sm={6} xs={6} key={product._id || index}>
                  <div
                    className="collection-card"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="image-wrapper">
                      <img
                        src={
                          imageUrl ||
                          "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image"
                        }
                        alt={product.name}
                      />
                    </div>

                    <div className="card-content">
                      <h5>{product.name}</h5>
                      <p className="product-price lexend">₹{product.price}</p>
                      <p>Brand Name</p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default Bestseller;
