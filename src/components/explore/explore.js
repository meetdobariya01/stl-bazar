import React from "react";
import { Container } from "react-bootstrap";
import {
  FiAward,
  FiHeart,
  FiGlobe,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import "./explore.css";

const TRUST_PROPS = [
  {
    icon: <FiAward />,
    title: "Curated Brands",
    subtitle: "Only the remarkable",
  },
  {
    icon: <FiShield />,
    title: "Trusted Shopping",
    subtitle: "Secure payments & data",
  },
  {
    icon: <FiGlobe />,
    title: "Easy Delivery",
    subtitle: "Across India",
  },
  {
    icon: <FiRefreshCw />,
    title: "Hassle-free Exchange",
    subtitle: "Shop with confidence",
  },
  {
    icon: <FiHeart />,
    title: "Meaningful Impact",
    subtitle: "Supporting Indian makers",
  },
];

const Explore = () => {
  return (
    <section className="home-trust-strip">
      <Container>
        <div className="trust-strip-grid">
          {TRUST_PROPS.map((item) => (
            <div key={item.title} className="trust-strip-item">
              <span className="trust-strip-icon">{item.icon}</span>
              <div className="trust-strip-text">
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Explore;
