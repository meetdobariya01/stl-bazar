import React from "react";
import { Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./banner.css";

const NativeHero = () => {
  return (
    <section className="home-hero-section">
      <div
        className="home-hero-bg-image"
        style={{
          backgroundImage: 'url("/images/desktop-banner.webp")',
        }}
        aria-hidden="true"
      />

      <div className="home-hero-gradient" aria-hidden="true" />

      <Container className="home-hero-container">
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">
            A CURATED MARKETPLACE FOR EXCEPTIONAL INDIAN BRANDS
          </span>

          <h1 className="home-hero-title">
            India&apos;s
            <br />
            Curated
            <br />
            Discovery
          </h1>

          <p className="home-hero-subtitle">
            Handpicked brands.
            <br />
            Meaningful products.
            <br />
            Stories from across India.
          </p>

          <NavLink to="/category/All" className="home-hero-cta">
            <span>Explore the Collection</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>
      </Container>
    </section>
  );
};

export default NativeHero;
