import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./collections.css";

const API_URL = process.env.REACT_APP_API_URL;
// ✅ USE VENDOR BACKEND URL FOR IMAGES
const VENDOR_BACKEND_URL = "https://api.brandelvendor.starlighttechlabsindia.com";

const Collections = ({ limit = 6 }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);

      const companiesResponse = await axios.get(`${API_URL}/companies`);
      const companies = companiesResponse.data;

      const productsData = [];

      for (const company of companies) {
        try {
          const productsResponse = await axios.get(`${API_URL}/products`, {
            params: { company: company.name },
          });

          const products = productsResponse.data;

          if (products && products.length > 0) {
            productsData.push({
              ...products[0],
              companyName: company.name,
            });
          }
        } catch (err) {
          console.error(`Error fetching products for ${company.name}:`, err);
        }
      }

      setCollections(productsData.slice(0, limit));
      setError(null);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Get image URL from VENDOR backend
  const getImageUrl = (image) => {
    if (!image) return null;

    let imagePath = Array.isArray(image) ? image[0] : image; 

    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    if (imagePath.startsWith("/uploads")) {
      return `${VENDOR_BACKEND_URL}${imagePath}`;
    }

    if (imagePath.startsWith("/images")) {
      return imagePath;
    }

    return `${VENDOR_BACKEND_URL}/uploads/${imagePath}`;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0";
    return numPrice.toFixed(2);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCompanyClick = (companyName) => {
    navigate(`/company/${encodeURIComponent(companyName)}`);
  };

  const renderStars = (rating) => {
    const starRating = rating || 0;
    return (
      <div className="product-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            size={12}
            color={i < Math.floor(starRating) ? "#ffc107" : "#e4e5e9"}
          />
        ))}
        <span className="ms-1 rating-value">{starRating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="collection-section py-5 lexend">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading collections...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="collection-section py-5 lexend">
        <Container>
          <div className="text-center py-5 text-danger">
            <p>{error}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="collection-section py-5 lexend">
        <Container>
          <div className="text-center py-5">
            <p>No collections available</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="collection-section-bg py-5 lexend">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">  
          <h2 className="section-title-collection funnel-sans">Handpicked Selections</h2>

          <a
            href="/product"
            className="view-all-link d-flex align-items-center"
          >
            View all 
            <FaArrowRight className="ms-2" />
          </a>
        </div>

        <Row className="g-4 collection-row">
          {collections.map((product, index) => {
            const imageUrl = getImageUrl(product.image);

            return (
              <Col
                xl={3}
                lg={3}
                md={4}
                sm={6}
                xs={6}
                key={product._id || index}
              >
                <div
                  className="collection-card-main"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="image-wrapper-main mb-3">
                    <img
                      src={imageUrl || "/images/placeholder-product.jpg"}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder-product.jpg";
                      }}
                    />

                    {product.isNew && <span className="new-badge">NEW</span>}

                    <button
                      className="wishlist-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ♡
                    </button>
                  </div>

                  <div className="card-content-main">
                    <p
                      className="company-name"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompanyClick(
                          product.companyName || product.company,
                        );
                      }}
                    >
                      {product.companyName || product.company}
                    </p>

                    <h5 className="product-name-main">{product.name}</h5>

                    <p className="product-price">
                      ₹{formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default Collections;