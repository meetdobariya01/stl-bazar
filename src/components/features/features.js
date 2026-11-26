import React from "react";
import { NavLink } from "react-router-dom";
import "./features.css";

const StorySection = () => {
  return (
    <section className="home-story-section">
      <div className="home-story-grid">
        <div className="home-story-media">
          <img
            src="/images/storycontent3.webp"
            alt="Indian craftsmanship"
            loading="lazy"
          />
        </div>
        <div className="home-story-content">
          <div className="home-story-inner">
            <span className="story-eyebrow">THE NATIVE91 STORY</span>
            <h2 className="story-serif-heading">People. Craft. Purpose.</h2>
            <p className="story-desc">
              A platform that brings India&apos;s finest makers and mindful
              shoppers together.
            </p>
            <NavLink to="/aboutus" className="story-text-link">
              Read Our Story →
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
