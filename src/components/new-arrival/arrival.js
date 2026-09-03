import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "./arrival.css";

const API_URL = process.env.REACT_APP_API_URL;

const OLD_IMAGE_BASE_URL = "https://native91.com";
const ADMIN_IMAGE_BASE_URL = "https://api-admin.native91.com";
const VENDOR_IMAGE_BASE_URL = "https://api-vendor.native91.com";

const Arrival = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBrands();
  }, []);

  // Image Helper
  const getImageUrl = (logo) => {
    if (!logo) return null;

    const image = Array.isArray(logo) ? logo[0] : logo;

    if (!image) return null;

    // Already full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Admin uploaded image
    if (image.startsWith("/images")) {
      return `${ADMIN_IMAGE_BASE_URL}${image}`;
    }

    // Vendor uploaded image
    if (image.startsWith("/uploads")) {
      return `${VENDOR_IMAGE_BASE_URL}${image}`;
    }

    // Old frontend images
    if (image.startsWith("images/")) {
      return `${OLD_IMAGE_BASE_URL}/${image}`;
    }

    return image;
  };

  const fetchAllBrands = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/companies`);

      const fetchedBrands = response.data.companies || [];

      console.log("✅ Brands fetched:", fetchedBrands.length);

      const formattedBrands = fetchedBrands.map((brand) => {
        const logoUrl = getImageUrl(brand.logo);

        return {
          id: brand._id,
          name: brand.name,
          logo: logoUrl || null,
          hasValidLogo: !!logoUrl,
        };
      });

      setBrands(formattedBrands);
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      setBrands([]);
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
