import React, { useEffect, useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { createSlug } from "../../utils/slugUtils";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL || "https://api.native91.com/api";

const ADMIN_BACKEND_URL = "https://api-admin.native91.com";

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return null;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/images/categories/")) {
    return `${ADMIN_BACKEND_URL}${imagePath}`;
  }

  if (imagePath.startsWith("/images/")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${ADMIN_BACKEND_URL}${imagePath}`;
  }

  return `${ADMIN_BACKEND_URL}/images/categories/${imagePath}`;
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const archTrackRef = useRef(null);

  const archDragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  // Fetch categories from existing backend
  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await axios.get(`${API_URL}/categories`, {
          params: { _t: Date.now() },
          timeout: 10000,
        });

        let categoriesData = [];

        if (response.data?.success && Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (Array.isArray(response.data?.categories)) {
          categoriesData = response.data.categories;
        }

        const activeCategories = categoriesData.filter((cat) => {
          const name = String(cat.name || cat.title || "")
            .trim()
            .toLowerCase();

          return (
            (!cat.status || cat.status === "active") && name && name !== "all"
          );
        });

        if (mounted) {
          setCategories(activeCategories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);

        if (mounted) {
          setError(true);
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // Mouse drag scrolling
  const handleArchMouseDown = (e) => {
    if (e.button !== 0) return;

    const track = archTrackRef.current;
    if (!track) return;

    archDragState.current = {
      isDown: true,
      startX: e.pageX - track.getBoundingClientRect().left,
      scrollLeft: track.scrollLeft,
      hasMoved: false,
    };
  };

  const handleArchMouseMove = (e) => {
    const track = archTrackRef.current;

    if (!archDragState.current.isDown || !track) return;

    const x = e.pageX - track.getBoundingClientRect().left;
    const walk = x - archDragState.current.startX;

    if (Math.abs(walk) > 6) {
      archDragState.current.hasMoved = true;
    }

    if (archDragState.current.hasMoved) {
      e.preventDefault();
      track.scrollLeft = archDragState.current.scrollLeft - walk * 1.3;
    }
  };

  const handleArchMouseEnd = () => {
    if (!archDragState.current.isDown) return;

    archDragState.current.isDown = false;

    setTimeout(() => {
      archDragState.current.hasMoved = false;
    }, 0);
  };

  return (
    <section className="home-arch-categories">
      <Container fluid className="arch-section-container">
        <div className="arch-categories-wrapper">
          {loading ? (
            <div className="arch-categories-message">Loading categories...</div>
          ) : error ? (
            <div className="arch-categories-message">
              Unable to load categories. Please try again later.
            </div>
          ) : categories.length === 0 ? (
            <div className="arch-categories-message">
              No categories available.
            </div>
          ) : (
            <div
              ref={archTrackRef}
              className="arch-categories-grid"
              onMouseDown={handleArchMouseDown}
              onMouseMove={handleArchMouseMove}
              onMouseUp={handleArchMouseEnd}
              onMouseLeave={handleArchMouseEnd}
            >
              {categories.map((cat) => {
                const title = cat.name || cat.title;
                const slug = cat.slug || createSlug(title);

                return (
                  <NavLink
                    key={cat._id || slug}
                    to={`/category/${slug}`}
                    className="arch-category-card"
                    draggable={false}
                    onClick={(e) => {
                      if (archDragState.current.hasMoved) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="arch-image-frame">
                      {getImageUrl(cat.image) && (
                        <img
                          src={getImageUrl(cat.image)}
                          alt={title}
                          loading="lazy"
                          draggable={false}
                        />
                      )}
                    </div>

                    <span className="arch-category-label">{title}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CategoriesSection;
