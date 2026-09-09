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
  /* ========================================= SLIDER REFS ========================================= */ const trackRef =
    useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const lastTimeRef = useRef(null);
  const lastMouseXRef = useRef(null);
  const lastMouseTimeRef = useRef(null);
  const directionRef = useRef(-1);
  const mouseInsideRef = useRef(false);
  const cursorSpeedRef = useRef(0);
  const resetTimerRef = useRef(null);
  /* ========================================= SLIDER SETTINGS ========================================= */ const AUTO_SPEED = 45;
  const MIN_CURSOR_SPEED = 25;
  const MAX_CURSOR_SPEED = 180;
  /* ========================================= FETCH BRANDS ========================================= */ useEffect(() => {
    fetchAllBrands();
  }, []);
  /* ========================================= IMAGE HELPER ========================================= */ const getImageUrl =
    (logo) => {
      if (!logo) return null;
      const image = Array.isArray(logo) ? logo[0] : logo;
      if (!image) return null;
      /* Already full URL */ if (
        image.startsWith("http://") ||
        image.startsWith("https://")
      ) {
        return image;
      }
      /* Admin uploaded image */ if (image.startsWith("/images")) {
        return `${ADMIN_IMAGE_BASE_URL}${image}`;
      }
      /* Vendor uploaded image */ if (image.startsWith("/uploads")) {
        return `${VENDOR_IMAGE_BASE_URL}${image}`;
      }
      /* Old frontend images */ if (image.startsWith("images/")) {
        return `${OLD_IMAGE_BASE_URL}/${image}`;
      }
      return image;
    };
  /* ========================================= FETCH ALL BRANDS ========================================= */ const fetchAllBrands =
    async () => {
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
  /* ========================================= BRAND CLICK ========================================= */ const handleBrandClick =
    (brandName) => {
      navigate(`/company/${encodeURIComponent(brandName)}`);
    };
  /* ========================================= GET LOOP WIDTH ========================================= */ const getLoopWidth =
    () => {
      if (!trackRef.current) {
        return 0;
      }
      /* * Because brands are duplicated: * * [1 2 3 4 5] [1 2 3 4 5] * * We only need the width of the * first half. */ return (
        trackRef.current.scrollWidth / 2
      );
    };
  /* ========================================= SET POSITION ========================================= */ const applyPosition =
    () => {
      if (!trackRef.current) {
        return;
      }
      trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    };
  /* ========================================= KEEP SLIDER IN INFINITE LOOP ========================================= */ const normalizePosition =
    () => {
      const loopWidth = getLoopWidth();
      if (!loopWidth) {
        return;
      }
      /* * Moving left beyond one complete set */ if (
        positionRef.current <= -loopWidth
      ) {
        positionRef.current += loopWidth;
      }
      /* * Moving right beyond starting point */ if (positionRef.current >= 0) {
        positionRef.current -= loopWidth;
      }
    };
  /* ========================================= MAIN ANIMATION ========================================= */ useEffect(() => {
    if (brands.length === 0) {
      return;
    }
    lastTimeRef.current = performance.now();
    const animate = (currentTime) => {
      const previousTime = lastTimeRef.current || currentTime;
      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.05);
      lastTimeRef.current = currentTime;
      /* * --------------------------------------- * DETERMINE SPEED * --------------------------------------- */ let speed =
        AUTO_SPEED;
      /* * If mouse is moving, use cursor speed. */ if (
        mouseInsideRef.current &&
        cursorSpeedRef.current > 0
      ) {
        speed = Math.max(
          MIN_CURSOR_SPEED,
          Math.min(cursorSpeedRef.current, MAX_CURSOR_SPEED),
        );
      }
      /* * --------------------------------------- * DETERMINE DIRECTION * --------------------------------------- * * -1 = LEFT * 1 = RIGHT */ const direction =
        mouseInsideRef.current ? directionRef.current : -1;
      /* * --------------------------------------- * MOVE TRACK * --------------------------------------- */ positionRef.current +=
        direction * speed * deltaTime;
      /* * --------------------------------------- * INFINITE LOOP * --------------------------------------- */ normalizePosition();
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
  /* ========================================= MOUSE ENTER ========================================= */ const handleMouseEnter =
    (e) => {
      mouseInsideRef.current = true;
      lastMouseXRef.current = e.clientX;
      lastMouseTimeRef.current = performance.now();
      cursorSpeedRef.current = 0;
      /* * Stop automatic reset timer */ if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  /* ========================================= MOUSE MOVE ========================================= */ const handleMouseMove =
    (e) => {
      const currentX = e.clientX;
      const currentTime = performance.now();
      /* * First mouse movement */ if (
        lastMouseXRef.current === null ||
        lastMouseTimeRef.current === null
      ) {
        lastMouseXRef.current = currentX;
        lastMouseTimeRef.current = currentTime;
        return;
      }
      const distance = currentX - lastMouseXRef.current;
      const time = currentTime - lastMouseTimeRef.current;
      /* * Ignore extremely small movement */ if (
        Math.abs(distance) > 1 &&
        time > 0
      ) {
        /* * --------------------------------------- * CURSOR MOVING RIGHT * --------------------------------------- */ if (
          distance > 0
        ) {
          directionRef.current = 1;
        }
        /* * --------------------------------------- * CURSOR MOVING LEFT * --------------------------------------- */ if (
          distance < 0
        ) {
          directionRef.current = -1;
        }
        /* * --------------------------------------- * CURSOR SPEED * --------------------------------------- */ const pixelsPerSecond =
          (Math.abs(distance) / time) * 1000;
        cursorSpeedRef.current = Math.min(
          Math.max(pixelsPerSecond, MIN_CURSOR_SPEED),
          MAX_CURSOR_SPEED,
        );
      }
      lastMouseXRef.current = currentX;
      lastMouseTimeRef.current = currentTime;
      /* * Cursor has moved, so reset the * automatic-left timer. */ if (
        resetTimerRef.current
      ) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        /* * When cursor stops moving, * automatically move LEFT. */ directionRef.current =
          -1;
        cursorSpeedRef.current = 0;
      }, 300);
    };
  /* ========================================= MOUSE LEAVE ========================================= */ const handleMouseLeave =
    () => {
      mouseInsideRef.current = false;
      lastMouseXRef.current = null;
      lastMouseTimeRef.current = null;
      cursorSpeedRef.current = 0;
      /* * Immediately return to automatic * LEFT movement. */ directionRef.current =
        -1;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  /* ========================================= WINDOW RESIZE ========================================= */ useEffect(() => {
    const handleResize = () => {
      /* * Normalize position after responsive * card widths change. */ normalizePosition();
      applyPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [brands]);
  /* ========================================= CLEANUP ========================================= */ useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);
  /* ========================================= LOADING ========================================= */ if (
    loading
  ) {
    return (
      <section className="arrival-premium">
        {" "}
        <Container fluid className="px-4">
          {" "}
          <div className="text-center py-5">
            {" "}
            <div
              className="spinner-border text-gold"
              style={{ width: 36, height: 36 }}
              role="status"
            >
              {" "}
              <span className="visually-hidden"> Loading... </span>{" "}
            </div>{" "}
          </div>{" "}
        </Container>{" "}
      </section>
    );
  }
  /* ========================================= NO BRANDS ========================================= */ if (
    brands.length === 0
  ) {
    return (
      <section className="arrival-premium">
        {" "}
        <Container fluid className="px-4">
          {" "}
          <div className="text-center py-5">
            {" "}
            <p className="text-light" style={{ fontSize: 16 }}>
              {" "}
              No brands available{" "}
            </p>{" "}
            <Button
              variant="outline-light"
              onClick={fetchAllBrands}
              className="mt-3"
            >
              {" "}
              Retry{" "}
            </Button>{" "}
          </div>{" "}
        </Container>{" "}
      </section>
    );
  }
  /* * Duplicate brands for infinite slider. */ const scrollingBrands = [
    ...brands,
    ...brands,
  ];
  /* ========================================= RENDER ========================================= */ return (
    <section className="arrival-premium mt-5 lexend">
      {" "}
      <Container fluid className="px-4">
        {" "}
        {/* ================================= HEADER ================================= */}{" "}
        <div className="arrival-header-premium">
          {" "}
          <div className="header-left-premium">
            {" "}
            <span className="badge-premium"> ✦ PREMIUM COLLECTION </span>{" "}
            <h2 className="title-premium funnel-sans">
              {" "}
              <span className="gold-premium funnel-sans"> Luxury </span>{" "}
              Brands{" "}
            </h2>{" "}
            <p className="subtitle-premium">
              {" "}
              Handpicked collections from distinguished artisans{" "}
            </p>{" "}
          </div>{" "}
          <Button className="view-premium" onClick={() => navigate("/product")}>
            {" "}
            View All <FaArrowRight size={13} />{" "}
          </Button>{" "}
        </div>{" "}
        {/* ================================= BRAND SLIDER ================================= */}{" "}
        <div
          className="brand-slider-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {" "}
          <div ref={trackRef} className="brand-slider-track">
            {" "}
            {scrollingBrands.map((brand, index) => (
              <div className="brand-slide-item" key={`${brand.id}-${index}`}>
                {" "}
                <div
                  className="brand-premium"
                  onClick={() => handleBrandClick(brand.name)}
                >
                  {" "}
                  {/* ====================== LOGO ====================== */}{" "}
                  <div className="logo-premium">
                    {" "}
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
                    ) : null}{" "}
                    {/* FALLBACK */}{" "}
                    <div
                      className="brand-name-fallback"
                      style={{
                        display:
                          brand.hasValidLogo && brand.logo ? "none" : "flex",
                      }}
                    >
                      {" "}
                      {brand.name}{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* ====================== BRAND INFO ====================== */}{" "}
                  <div className="info-premium text-center">
                    {" "}
                    <h6 className="name-premium"> {brand.name} </h6>{" "}
                    <Button
                      variant="link"
                      className="shop-premium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrandClick(brand.name);
                      }}
                    >
                      {" "}
                      Explore{" "}
                      <FaArrowRight size={10} className="arrow-icon" />{" "}
                    </Button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </Container>{" "}
    </section>
  );
};
export default Arrival;
