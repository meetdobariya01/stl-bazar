import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "./collections.css";

const Collections = ({ limit = 6 }) => {  // Add limit prop with default 6
  const [collections, setCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:9000/api/categories"
      );
      
      console.log("Categories data:", data);
      setAllCollections(data);
      // Only show first 'limit' items on homepage
      setCollections(data.slice(0, limit));
    } catch (error) {
      console.log(error);
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
    return `http://localhost:9000/uploads/${imagePath}`;
  };

  return (
    <section className="collection-section py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h2 className="section-title">
            Shop by Collection
          </h2>

          <a
            href="/collections"  // Link to all collections page
            className="view-all-link d-flex align-items-center"
          >
            View all collections
            <FaArrowRight className="ms-2" />
          </a>
        </div>

        <Row className="g-4">
          {collections.map((item, index) => {
            const imageUrl = getImageUrl(item.image);
            
            return (
              <Col lg={2} md={4} sm={6} xs={6} key={index}>
                <div className="collection-card">
                  <div className="image-wrapper">
                    <img
                      src={imageUrl || "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image"}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="card-content">
                    <h5>{item.name}</h5>
                    {/* <p className="product-count">{item.productCount} products</p> */}
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