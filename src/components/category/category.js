import React, { useEffect, useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { createSlug } from "../../utils/slugUtils";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL || "https://api.native91.com/api";

const ADMIN_BACKEND_URL = "https://api-admin.native91.com";

// ======================================================
// CANONICAL CATEGORY ORDER — must match Header.jsx
// ======================================================

const CATEGORY_ORDER = [
  "Beauty & Personal Care",
  "Organic Food & Healthy Snacks",
  "Jewellery & Accessories",
  "Gifts & Hampers",
  "Home Decor & Handmade Living",
  "Ethnic Wear & Fashion",
  "Sustainable Living",
  "Kids Fashion & Toys",
  "Pet Care & Accessories",
  "Stationery & Desk Essentials",
];

// Fast lookup: slug -> index in canonical order
const ORDER_INDEX = CATEGORY_ORDER.reduce((acc, title, idx) => {
  acc[createSlug(title)] = idx;
  return acc;
}, {});

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

        // ✅ Enforce canonical order — only keep the 10 known categories,
        //    sorted to match the header.
        const ordered = activeCategories
          .map((cat) => {
            const title = cat.name || cat.title;
            const slug = cat.slug || createSlug(title);
            return { ...cat, _resolvedSlug: slug, _resolvedTitle: title };
          })
          .filter((cat) => ORDER_INDEX[cat._resolvedSlug] !== undefined)
          .sort(
            (a, b) =>
              ORDER_INDEX[a._resolvedSlug] - ORDER_INDEX[b._resolvedSlug],
          );

        // ✅ If the API doesn't contain every category, fill in the missing
        //    ones as placeholders (no image) so the order is always the same.
        const existingSlugs = new Set(ordered.map((c) => c._resolvedSlug));

        const placeholders = CATEGORY_ORDER.map((title, idx) => {
          const slug = createSlug(title);
          if (existingSlugs.has(slug)) return null;
          return {
            _id: `placeholder-${idx}`,
            name: title,
            title,
            _resolvedSlug: slug,
            _resolvedTitle: title,
            image: null,
            __placeholder: true,
          };
        }).filter(Boolean);

        const finalList = [...ordered, ...placeholders].sort(
          (a, b) =>
            ORDER_INDEX[a._resolvedSlug] - ORDER_INDEX[b._resolvedSlug],
        );

        if (mounted) {
          setCategories(finalList);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);

        if (mounted) {
          // ✅ On error, still show the 10 canonical categories as placeholders
          const fallback = CATEGORY_ORDER.map((title, idx) => ({
            _id: `fallback-${idx}`,
            name: title,
            title,
            _resolvedSlug: createSlug(title),
            _resolvedTitle: title,
            image: null,
            __placeholder: true,
          }));

          setError(true);
          setCategories(fallback);
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
          ) : categories.length === 0 ? (
            <div className="arch-categories-message">
              No categories available.
            </div>
          ) : (
            <>
              {error && (
                <div className="arch-categories-message">
                  Unable to load categories. Showing default list.
                </div>
              )}

              <div
                ref={archTrackRef}
                className="arch-categories-grid"
                onMouseDown={handleArchMouseDown}
                onMouseMove={handleArchMouseMove}
                onMouseUp={handleArchMouseEnd}
                onMouseLeave={handleArchMouseEnd}
              >
                {categories.map((cat) => {
                  const title = cat._resolvedTitle || cat.name || cat.title;
                  const slug =
                    cat._resolvedSlug || cat.slug || createSlug(title);
                  const imgUrl = getImageUrl(cat.image);

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
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={title}
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <div className="arch-image-placeholder">
                            {title.charAt(0)}
                          </div>
                        )}
                      </div>

                      <span className="arch-category-label">{title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CategoriesSection;
