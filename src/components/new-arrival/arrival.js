// components/arrival/arrival.js
import React, { useEffect, useRef, useState } from "react";
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

  /* ========================================= SLIDER REFS ========================================= */
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const lastTimeRef = useRef(null);
  const lastMouseXRef = useRef(null);
  const lastMouseTimeRef = useRef(null);
  const directionRef = useRef(-1);
  const mouseInsideRef = useRef(false);
  const cursorSpeedRef = useRef(0);
  const resetTimerRef = useRef(null);

  /* ========================================= SLIDER SETTINGS ========================================= */
  const AUTO_SPEED = 45;
  const MIN_CURSOR_SPEED = 25;
  const MAX_CURSOR_SPEED = 180;

  /* ========================================= FETCH BRANDS ========================================= */
  useEffect(() => {
    fetchAllBrands();
  }, []);

  /* ========================================= IMAGE HELPER ========================================= */
  const getImageUrl = (logo) => {
    if (!logo) return null;
    const image = Array.isArray(logo) ? logo[0] : logo;
    if (!image) return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/images")) {
      return `${ADMIN_IMAGE_BASE_URL}${image}`;
    }
    if (image.startsWith("/uploads")) {
      return `${VENDOR_IMAGE_BASE_URL}${image}`;
    }
    if (image.startsWith("images/")) {
      return `${OLD_IMAGE_BASE_URL}/${image}`;
    }
    return image;
  };

  /* ========================================= FETCH ALL BRANDS (WITH PRODUCTS FILTER) ========================================= */
  const fetchAllBrands = async () => {
    try {
      setLoading(true);

      // 1️⃣ બધી કંપનીઓ લાવો
      const companiesRes = await axios.get(`${API_URL}/companies`);
      const fetchedBrands = companiesRes.data.companies || [];
      console.log("✅ Brands fetched:", fetchedBrands.length);

      // 2️⃣ બધા પ્રોડક્ટ્સ લાવો
      let allProducts = [];
      try {
        const productsRes = await axios.get(`${API_URL}/products`);
        allProducts = productsRes.data || [];
        console.log("✅ Products fetched:", allProducts.length);
      } catch (prodErr) {
        console.warn(
          "⚠️ Products fetch failed, showing all brands:",
          prodErr.message
        );
      }

      // 3️⃣ જે કંપનીઓમાં પ્રોડક્ટ છે તેમનું Set બનાવો (lowercase + trim)
      const companiesWithProducts = new Set(
        allProducts
          .map((p) => (p.company || "").trim().toLowerCase())
          .filter(Boolean)
      );

      // 4️⃣ ફક્ત એવી કંપનીઓ રાખો જેમાં પ્રોડક્ટ છે
      const filteredBrands = fetchedBrands.filter((brand) => {
        const brandName = (brand.name || "").trim().toLowerCase();
        if (!brandName) return false;

        // જો products API ફેલ થયું હોય, તો બધી બ્રાન્ડ દેખાડો
        if (allProducts.length === 0) return true;

        return companiesWithProducts.has(brandName);
      });

      console.log("✅ Brands with products:", filteredBrands.length);

      // 5️⃣ ફોર્મેટ કરો
      const formattedBrands = filteredBrands.map((brand) => {
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

  /* ========================================= BRAND CLICK ========================================= */
  const handleBrandClick = (brandName) => {
    navigate(`/company/${encodeURIComponent(brandName)}`);
  };

  /* ========================================= GET LOOP WIDTH ========================================= */
  const getLoopWidth = () => {
    if (!trackRef.current) {
      return 0;
    }
    return trackRef.current.scrollWidth / 2;
  };

  /* ========================================= SET POSITION ========================================= */
  const applyPosition = () => {
    if (!trackRef.current) {
      return;
    }
    trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
  };

  /* ========================================= KEEP SLIDER IN INFINITE LOOP ========================================= */
  const normalizePosition = () => {
    const loopWidth = getLoopWidth();
    if (!loopWidth) {
      return;
    }
    if (positionRef.current <= -loopWidth) {
      positionRef.current += loopWidth;
    }
    if (positionRef.current >= 0) {
      positionRef.current -= loopWidth;
    }
  };

  /* ========================================= MAIN ANIMATION ========================================= */
  useEffect(() => {
    if (brands.length === 0) {
      return;
    }
    lastTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const previousTime = lastTimeRef.current || currentTime;
      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      let speed = AUTO_SPEED;

      if (mouseInsideRef.current && cursorSpeedRef.current > 0) {
        speed = Math.max(
          MIN_CURSOR_SPEED,
          Math.min(cursorSpeedRef.current, MAX_CURSOR_SPEED)
        );
      }

      const direction = mouseInsideRef.current ? directionRef.current : -1;

      positionRef.current += direction * speed * deltaTime;

      normalizePosition();
      applyPosition();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [brands]);

  /* ========================================= MOUSE ENTER ========================================= */
  const handleMouseEnter = (e) => {
    mouseInsideRef.current = true;
    lastMouseXRef.current = e.clientX;
    lastMouseTimeRef.current = performance.now();
    cursorSpeedRef.current = 0;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
  };

  /* ========================================= MOUSE MOVE ========================================= */
  const handleMouseMove = (e) => {
    const currentX = e.clientX;
    const currentTime = performance.now();

    if (
      lastMouseXRef.current === null ||
      lastMouseTimeRef.current === null
    ) {
      lastMouseXRef.current = currentX;
      lastMouseTimeRef.current = currentTime;
      return;
    }

    const distance = currentX - lastMouseXRef.current;
    const time = currentTime - lastMouseTimeRef.current;

    if (Math.abs(distance) > 1 && time > 0) {
      if (distance > 0) {
        directionRef.current = 1;
      }
      if (distance < 0) {
        directionRef.current = -1;
      }

      const pixelsPerSecond = (Math.abs(distance) / time) * 1000;
      cursorSpeedRef.current = Math.min(
        Math.max(pixelsPerSecond, MIN_CURSOR_SPEED),
        MAX_CURSOR_SPEED
      );
    }

    lastMouseXRef.current = currentX;
    lastMouseTimeRef.current = currentTime;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      directionRef.current = -1;
      cursorSpeedRef.current = 0;
    }, 300);
  };

  /* ========================================= MOUSE LEAVE ========================================= */
  const handleMouseLeave = () => {
    mouseInsideRef.current = false;
    lastMouseXRef.current = null;
    lastMouseTimeRef.current = null;
    cursorSpeedRef.current = 0;
    directionRef.current = -1;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
  };

  /* ========================================= WINDOW RESIZE ========================================= */
  useEffect(() => {
    const handleResize = () => {
      normalizePosition();
      applyPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [brands]);

  /* ========================================= CLEANUP ========================================= */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  /* ========================================= LOADING ========================================= */
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
              <span className="visually-hidden"> Loading... </span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  /* ========================================= NO BRANDS ========================================= */
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

  const scrollingBrands = [...brands, ...brands];

  /* ========================================= RENDER ========================================= */
  return (
    <section className="arrival-premium mt-5 lexend">
      <Container fluid className="px-4">
        <div className="arrival-header-premium">
          <div className="header-left-premium">
            <span className="badge-premium"> ✦ PREMIUM COLLECTION </span>
            <h2 className="title-premium funnel-sans">
              <span className="gold-premium funnel-sans"> Luxury </span>
              Brands
            </h2>
            <p className="subtitle-premium">
              Handpicked collections from distinguished artisans
            </p>
          </div>
          <Button
            className="view-premium"
            onClick={() => navigate("/product")}
          >
            View All <FaArrowRight size={13} />
          </Button>
        </div>

        <div
          className="brand-slider-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div ref={trackRef} className="brand-slider-track">
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
                            `❌ Failed to load logo for: ${brand.name}`
                          );
                          e.target.style.display = "none";
                          const parent = e.target.parentElement;
                          const fallback = parent.querySelector(
                            ".brand-name-fallback"
                          );
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}

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
                    <h6 className="name-premium"> {brand.name} </h6>
                    <Button
                      variant="link"
                      className="shop-premium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrandClick(brand.name);
                      }}
                    >
                      Explore
                      <FaArrowRight size={10} className="arrow-icon" />
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