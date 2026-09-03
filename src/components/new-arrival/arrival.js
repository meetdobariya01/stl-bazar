import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "./arrival.css";

const API_URL = process.env.REACT_APP_API_URL;

const OLD_IMAGE_BASE_URL = "https://native91.com";
const ADMIN_IMAGE_BASE_URL = "https://api-vendor.native91.com";

const Arrival = () => {
  const [brandSlides, setBrandSlides] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // ✅ FIX: The response data is { companies: [...] }
      const brands = response.data.companies || [];

      console.log("Brands fetched:", brands.length);
      console.log("Full response:", response.data);

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
              logo: logoUrl || null,
              rawLogo: brand.logo,
              firstLetter: brand.name ? brand.name.charAt(0).toUpperCase() : '?',
              hasValidLogo: !!logoUrl,
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
                logo: logoUrl || null,
                rawLogo: brand.logo,
                firstLetter: brand.name ? brand.name.charAt(0).toUpperCase() : '?',
                hasValidLogo: !!logoUrl,
              };
            }),
            isFirst: false
          });
        }
      }

      setBrandSlides(slides);
    } catch (error) {
      console.error("Error fetching brands:", error);
      // ✅ Show error state
      setBrandSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName) => {
    navigate(`/company/${encodeURIComponent(brandName)}`);
  };

  if (loading) {
    return (
      <section className="arrival-premium">
        <Container fluid className="px-4">
          <div className="text-center py-5">
            <div
              className="spinner-border text-gold"
              style={{ width: 36, height: 36 }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (brands.length === 0) {
    return (
      <section className="arrival-premium">
        <Container fluid className="px-4">
          <div className="text-center py-5">
            <p className="text-light" style={{ fontSize: 16 }}>
              No brands available
            </p>

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

  /*
    Duplicate brands so the animation can continuously
    move from right to left without an empty gap.
  */
  const scrollingBrands = [...brands, ...brands];

  return (
    <section className="arrival-premium mt-5 lexend">
      <Container fluid className="px-4">
        {/* Header */}
        <div className="arrival-header-premium">
          <div className="header-left-premium">
            <span className="badge-premium">✦ PREMIUM COLLECTION</span>

            <h2 className="title-premium funnel-sans">
              <span className="gold-premium funnel-sans">Luxury</span> Brands
            </h2>

            <p className="subtitle-premium">
              Handpicked collections from distinguished artisans
            </p>
          </div>

          <Button className="view-premium" onClick={() => navigate("/product")}>
            View All <FaArrowRight size={13} />
          </Button>
        </div>

        {/* Auto Left Slider */}
        <div className="brand-slider-wrapper">
          <div className="brand-slider-track">
            {scrollingBrands.map((brand, index) => (
              <div className="brand-slide-item" key={`${brand.id}-${index}`}>
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
                          console.error(
                            `❌ Failed to load logo for: ${brand.name}`,
                          );

                          e.target.style.display = "none";

                          const parent = e.target.parentElement;

                          const fallback = parent.querySelector(
                            ".brand-name-fallback",
                          );

                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}

                    {/* Fallback */}
                    <div
                      className="brand-name-fallback"
                      style={{
                        display:
                          brand.hasValidLogo && brand.logo ? "none" : "flex",
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
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Arrival;
