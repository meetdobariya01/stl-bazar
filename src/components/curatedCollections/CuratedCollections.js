import React from "react";
import { Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "./CuratedCollections.css";

const CURATED_COLLECTIONS = [
  {
    title: "Christmas Gifting Edit",
    subtitle: "Thoughtful gifts, wrapped in magic",
    slug: "handmade-home-decor",
    image: "/images/navaratri-edits.webp",
  },
  {
    title: "Indian Wedding Edit",
    subtitle: "Standout style for every celebration.",
    slug: "ethic-fashion",
    image: "/images/Category/Handmade.webp",
  },
  {
    title: "Winter Is Here",
    subtitle: "Cozy layers for cooler days.",
    slug: "jewellery-accessories",
    image: "/images/storycontent2.webp",
  },
];

const CuratedCollections = () => {
  const navigate = useNavigate();

  return (
    <section className="home-curated-section">
      <Container>
        <div className="home-split-layout">
          <div className="home-section-intro">
            <span className="section-eyebrow">THE SEASONAL EDIT</span>
            <h2 className="section-serif-heading">Celebrate the Season</h2>
            <p className="section-intro-desc">
              estive gatherings, winter escapes and wedding celebrations,
              thoughtfully brought together.
            </p>
            <NavLink to="/category/All" className="section-text-link">
              Explore All Collections →
            </NavLink>
          </div>

          <div className="curated-cards-grid">
            {CURATED_COLLECTIONS.map((col) => (
              <div
                key={col.title}
                className="curated-edit-card"
                onClick={() => navigate(`/category/${col.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/category/${col.slug}`);
                }}
              >
                <img
                  src={col.image}
                  alt={col.title}
                  className="curated-edit-img"
                  loading="lazy"
                />
                <div className="curated-edit-overlay" />
                <div className="curated-edit-content">
                  <h3>{col.title}</h3>
                  <p>{col.subtitle}</p>
                  <span className="curated-edit-link">Buy Now →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CuratedCollections;
