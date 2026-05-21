import React, { useEffect, useState } from "react";
import { Container, Carousel, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Add this import
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import "./arrival.css";

const Arrival = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add navigate hook

  useEffect(() => {
    fetchArrivalProducts();
  }, []);

  // Helper function to get correct image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Handle array
    let imagePath = Array.isArray(image) ? image[0] : image;
    
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Check if it's in images folder
    if (cleanPath.startsWith('images/')) {
      return `${cleanPath}`;
    }
    
    // Check if it's in uploads folder
    if (cleanPath.startsWith('uploads/')) {
      return `http://localhost:9000/${cleanPath}`;
    }
    
    // Default to uploads folder
    return `http://localhost:9000/uploads/${cleanPath}`;
  };

  const fetchArrivalProducts = async () => {
    try {
      const response = await axios.get("http://localhost:9000/api/arrival-best-sellers");
      
      console.log("API Response:", response.data);
      
      if (response.data.success && response.data.slides) {
        const transformedSlides = response.data.slides.map(slide => ({
          products: slide.products.map(product => {
            const imageUrl = getImageUrl(product.image);
            console.log(`Product: ${product.name}, Image URL: ${imageUrl}`);
            
            return {
              id: product._id, // Make sure to include the product ID
              title: product.name,
              price: `₹${product.price}`,
              image: imageUrl || "https://via.placeholder.com/800/CCCCCC/FFFFFF?text=No+Image",
            };
          })
        }));
        
        setSlides(transformedSlides);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className="arrival-section lexend">
        <Container fluid className="px-lg-5">
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h3 className="mt-3">Loading new arrivals...</h3>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="arrival-section lexend">
      <Container fluid className="px-lg-5">
        <Carousel
          indicators={true}
          controls={true}
          interval={7000}
          pause={false}
          prevIcon={<div className="custom-arrow left-arrow"><FaChevronLeft /></div>}
          nextIcon={<div className="custom-arrow right-arrow"><FaChevronRight /></div>}
        >
          {slides.map((slide, idx) => (
            <Carousel.Item key={idx}>
              <div className="arrival-wrapper">
                <div className="left-content">
                  <span>New Arrivals</span>
                  <h2>
                    Fresh Finds,
                    <br />
                    <span>Handpicked</span>
                    <br />
                    For You
                  </h2>
                  <Button className="explore-btn">Explore New In</Button>
                </div>

                <div className="container-fluid">
                  <div className="row g-3">
                    {slide.products.map((item, index) => (
                      <div 
                        className="col-6 col-md-4 col-lg-3" 
                        key={index}
                        onClick={() => handleProductClick(item.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="product-card h-100">
                          <div className="product-img">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="img-fluid w-100"
                              onError={(e) => {
                                console.log(`Failed to load image for: ${item.title}`, item.image);
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/800/CCCCCC/FFFFFF?text=No+Image";
                              }}
                            />
                          </div>
                          <div className="product-info text-center mt-2">
                            <h5>{item.title}</h5>
                            <p className="funnel-sans">{item.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default Arrival;