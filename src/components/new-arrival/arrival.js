import React, { useEffect, useState } from "react";
import { Container, Carousel, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "./arrival.css";

const API_URL = process.env.REACT_APP_API_URL;
// ✅ Image base URLs
const OLD_IMAGE_BASE_URL = "https://gourmetbazar.starlighttechlabsindia.com";
const ADMIN_IMAGE_BASE_URL = "https://api.brandelsuperadmin.starlighttechlabsindia.com";

const Arrival = () => {
  const [brandSlides, setBrandSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBrands();
  }, []);

  // ✅ Get image URL - check if it's an admin uploaded image
  const getImageUrl = (image) => {
    if (!image) return null;
    
    let imagePath = Array.isArray(image) ? image[0] : image;
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Clean the path - remove leading slash if present
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // ✅ Check if it's an admin uploaded image (has timestamp in filename)
    // Admin images have format: images/company/1780477739752-Barenecessities.jpeg
    // They contain numbers at the start of the filename
    const filename = cleanPath.includes('/') ? cleanPath.split('/').pop() : cleanPath;
    const hasTimestamp = /^\d+/.test(filename);
    
    if (hasTimestamp) {
      // ✅ This is an admin uploaded image - use admin backend
      return `${ADMIN_IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    // ✅ If it starts with images/ - use old frontend URL
    if (cleanPath.startsWith('images/')) {
      return `${OLD_IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    // ✅ If it starts with uploads/ - use admin backend
    if (cleanPath.startsWith('uploads/')) {
      return `${ADMIN_IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    // Default: try old frontend
    return `${OLD_IMAGE_BASE_URL}/${cleanPath}`;
  };

  const fetchAllBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/companies`);
      const brands = response.data;
      
      console.log("Brands fetched:", brands.length);
      
      // Log each brand's image path and generated URL
      brands.forEach(brand => {
        const imageUrl = getImageUrl(brand.logo);
        console.log(`Brand: ${brand.name}`);
        console.log(`  Raw logo: ${brand.logo}`);
        console.log(`  Generated URL: ${imageUrl}`);
        console.log('---');
      });
      
      const slides = [];
      
      if (brands.length > 0) {
        const firstSlideBrands = brands.slice(0, 4);
        slides.push({
          slideNumber: 1,
          brands: firstSlideBrands.map(brand => {
            const logoUrl = getImageUrl(brand.logo);
            return {
              id: brand._id,
              name: brand.name,
              description: brand.description || "Premium Brand",
              logo: logoUrl || "https://via.placeholder.com/130/CCCCCC/FFFFFF?text=No+Logo",
              rawLogo: brand.logo,
            };
          }),
          isFirst: true
        });
        
        if (brands.length > 4) {
          const remainingBrands = brands.slice(4);
          slides.push({
            slideNumber: 2,
            brands: remainingBrands.map(brand => {
              const logoUrl = getImageUrl(brand.logo);
              return {
                id: brand._id,
                name: brand.name,
                description: brand.description || "Premium Brand",
                logo: logoUrl || "https://via.placeholder.com/130/CCCCCC/FFFFFF?text=No+Logo",
                rawLogo: brand.logo,
              };
            }),
            isFirst: false
          });
        }
      }
      
      setBrandSlides(slides);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName) => {
    navigate(`/company/${encodeURIComponent(brandName)}`);
  };

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  if (loading) {
    return (
      <section className="arrival-premium">
        <Container fluid className="px-4">
          <div className="text-center py-5">
            <div className="spinner-border text-gold" style={{ width: 36, height: 36 }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (brandSlides.length === 0) {
    return (
      <section className="arrival-premium">
        <Container fluid className="px-4">
          <div className="text-center py-5">
            <p className="text-light" style={{ fontSize: 16 }}>No brands available</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="arrival-premium mt-5 lexend">
      <Container fluid className="px-4">
        {/* Premium Header */}
        <div className="arrival-header-premium">
          <div className="header-left-premium">
            <span className="badge-premium">✦ PREMIUM COLLECTION</span>
            <h2 className="title-premium funnel-sans">
              <span className="gold-premium funnel-sans">Luxury</span> Brands
            </h2>
            <p className="subtitle-premium">Handpicked collections from distinguished artisans</p>
          </div>
          <Button 
            className="view-premium"
            onClick={() => navigate("/product")}
          >
            View All <FaArrowRight size={13} />
          </Button>
        </div>

        {/* Premium Carousel */}
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          indicators={false}
          controls={false}
          interval={5000}
          pause={false}
          className="carousel-premium"
        >
          {brandSlides.map((slide, idx) => (
            <Carousel.Item key={idx}>
              <div className="slide-label-premium">
                <span className="count-premium">{slide.brands.length} Brands</span>
              </div>
              <Row className="g-3 brand-grid-premium">
                {slide.brands.map((brand, index) => (
                  <Col xs={6} md={3} key={index}>
                    <div 
                      className="brand-premium"
                      onClick={() => handleBrandClick(brand.name)}
                    >
                      <div className="logo-premium">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          onError={(e) => {
                            console.error(`❌ Failed to load logo for: ${brand.name}`);
                            console.error(`   Attempted URL: ${brand.logo}`);
                            console.error(`   Raw logo: ${brand.rawLogo}`);
                            e.target.onerror = null;
                            // Show a clean placeholder
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='10' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Logo%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div className="info-premium text-center">
                        <h6 className="name-premium">{brand.name}</h6>
                        <p className="desc-premium">{brand.description}</p>
                        <Button 
                          variant="link" 
                          className="shop-premium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrandClick(brand.name);
                          }}
                        >
                          Explore <FaArrowRight size={10} className="arrow-icon" />
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default Arrival;