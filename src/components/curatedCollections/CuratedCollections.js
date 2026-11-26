import React from "react";
import { Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "./CuratedCollections.css";

const CURATED_COLLECTIONS = [
  {
    title: "Festive Edit",
    subtitle: "Celebrate traditions in style",
    slug: "ethnic-fashion",
    image: "/images/navaratri-edits.webp",
  },
  {
    title: "Home Essentials",
    subtitle: "Elevate your everyday spaces",
    slug: "handmade-home-decor",
    image: "/images/Category/Handmade.webp",
  },
  {
    title: "The Jewellery Edit",
    subtitle: "Timeless pieces with a modern soul",
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
            <span className="section-eyebrow">THOUGHTFULLY CURATED</span>
            <h2 className="section-serif-heading">Curated Collections</h2>
            <p className="section-intro-desc">
              Thoughtfully chosen edits for every occasion and mood.
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
                  <span className="curated-edit-link">Explore →</span>
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
