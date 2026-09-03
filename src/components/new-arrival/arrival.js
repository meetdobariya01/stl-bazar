import React, { useEffect, useState } from "react";
import { Container, Carousel, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "./arrival.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000/api";

// ✅ IMAGE BASE URLS
const VENDOR_API_URL = "https://api-vendor.native91.com";
const ADMIN_API_URL = "https://api-admin.native91.com";
const OLD_IMAGE_BASE_URL = "https://native91.com";

const Arrival = () => {
  const [brandSlides, setBrandSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBrands();
  }, []);

  // ✅ FIXED: IMAGE URL GENERATOR
  const getImageUrl = (logo) => {
    if (!logo) return null;

    // Handle array
    let imagePath = Array.isArray(logo) ? logo[0] : logo;
    
    // Handle non-string
    if (!imagePath || typeof imagePath !== 'string') return null;

    // Clean the path
    let cleanPath = imagePath.trim();

    // ✅ If already full URL
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    // ✅ Remove leading slash if present
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.slice(1);
    }

    // ✅ Check if it's an admin uploaded image (has timestamp in filename)
    const filename = cleanPath.includes('/') ? cleanPath.split('/').pop() : cleanPath;
    const hasTimestamp = /^\d+/.test(filename);

    // ✅ If it starts with images/
    if (cleanPath.startsWith("images/")) {
      return `${ADMIN_API_URL}/${cleanPath}`;
    }
    
    // ✅ If it starts with uploads/
    if (cleanPath.startsWith("uploads/")) {
      return `${VENDOR_API_URL}/${cleanPath}`;
    }

    // ✅ If it has timestamp, it's from admin
    if (hasTimestamp) {
      return `${ADMIN_API_URL}/${cleanPath}`;
    }

    // ✅ Default: try admin API
    return `${ADMIN_API_URL}/${cleanPath}`;
  };

  const handleImageError = (brandId) => {
    setImageErrors(prev => ({ ...prev, [brandId]: true }));
  };

  const fetchAllBrands = async () => {
    try {
      setLoading(true);
      console.log(`🟢 Fetching brands from: ${API_URL}/companies`);
      
      const response = await axios.get(`${API_URL}/companies`, {
        timeout: 10000
      });

      console.log("🟢 Response:", response.data);

      // ✅ Handle different response formats
      let brands = [];
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.companies)) {
          brands = response.data.companies;
        } else if (Array.isArray(response.data)) {
          brands = response.data;
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          brands = response.data.companies;
        }
      }

      console.log(`✅ Found ${brands.length} brands`);

      // ✅ Log each brand's logo URL for debugging
      brands.forEach(brand => {
        if (brand.logo) {
          const url = getImageUrl(brand.logo);
          console.log(`🖼️ ${brand.name}: ${url}`);
        } else {
          console.log(`⚠️ ${brand.name}: No logo`);
        }
      });

      // ✅ Create slides
      const slides = [];
      if (brands.length > 0) {
        // First slide: first 4 brands
        const firstSlideBrands = brands.slice(0, 4);
        slides.push({
          slideNumber: 1,
          brands: firstSlideBrands.map(brand => ({
            id: brand._id,
            name: brand.name || "Brand",
            description: brand.description || "Premium Brand",
            logo: getImageUrl(brand.logo),
            rawLogo: brand.logo,
            firstLetter: brand.name ? brand.name.charAt(0).toUpperCase() : '?',
            hasValidLogo: !!getImageUrl(brand.logo)
          })),
          isFirst: true
        });

        // Second slide: remaining brands
        if (brands.length > 4) {
          const remainingBrands = brands.slice(4);
          slides.push({
            slideNumber: 2,
            brands: remainingBrands.map(brand => ({
              id: brand._id,
              name: brand.name || "Brand",
              description: brand.description || "Premium Brand",
              logo: getImageUrl(brand.logo),
              rawLogo: brand.logo,
              firstLetter: brand.name ? brand.name.charAt(0).toUpperCase() : '?',
              hasValidLogo: !!getImageUrl(brand.logo)
            })),
            isFirst: false
          });
        }
      }

      setBrandSlides(slides);
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      setBrandSlides([]);
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

  // Loading State
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

  // Empty State
  if (brandSlides.length === 0) {
    return (
      <section className="arrival-premium">
        <Container fluid className="px-4">
          <div className="text-center py-5">
            <p className="text-light" style={{ fontSize: 16 }}>No brands available</p>
            <Button
              variant="outline-light"
              onClick={fetchAllBrands}
              className="mt-3"
            >
              Retry
            </Button>
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
          interval={1000}
          pause="hover"
          className="carousel-premium"
        >
          {brandSlides.map((slide, idx) => (
            <Carousel.Item key={idx}>
              <Row className="g-3 brand-grid-premium">
                {slide.brands.map((brand, index) => (
                  <Col xs={6} md={3} xl={3} key={index}>
                    <div
                      className="brand-premium"
                      onClick={() => handleBrandClick(brand.name)}
                    >
                      <div className="logo-premium">
                        {brand.hasValidLogo && brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="brand-logo-image"
                            onError={(e) => {
                              console.error(`❌ Failed to load logo for: ${brand.name}`);
                              console.error(`   Attempted URL: ${brand.logo}`);
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              const fallback = parent.querySelector('.brand-name-fallback');
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        {/* Brand Name Fallback */}
                        <div 
                          className="brand-name-fallback"
                          style={{
                            display: (brand.hasValidLogo && brand.logo) ? 'none' : 'flex',
                            width: '100%',
                            height: '100%',
                            minHeight: '140px',
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #0D3B2E 100%)',
                            color: '#FFFFFF',
                            fontSize: '20px',
                            fontWeight: '600',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            fontFamily: "'Funnel Sans', 'Arial', sans-serif",
                            padding: '16px',
                            textAlign: 'center',
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            border: '2px solid rgba(255,215,0,0.1)'
                          }}
                        >
                          {brand.name}
                        </div>
                      </div>
                      <div className="info-premium text-center">
                        <h6 className="name-premium">{brand.name}</h6>
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
