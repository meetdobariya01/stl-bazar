import React from "react";
import { FaLeaf, FaHeart, FaSeedling, FaArrowRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./banner.css";

const NativeHero = () => {
  return (
    <section className="native-hero">
      <div className="native-hero-overlay"></div>

      <div className="container h-100">
        <div className="row vh-100 banner-height align-items-center">
          <div className="col-12 col-lg-6">
            <div className="native-hero-content">
              {/* Top Label */}
              <div className="native-hero-topline">
                <span>ROOTED IN INDIA</span>
                <span className="dot">•</span>
                <span>MADE WITH PURPOSE</span>
{/* 
                <span className="line"></span>
                <FaLeaf className="leaf-icon" /> */}
              </div>

              {/* Main Heading */}
              <h1 className="native-hero-title">
                Discover What’s
                <br />
                <span>Truly Native.</span>
              </h1>

              {/* Description */}
              <p className="native-hero-description">
               Native91 brings together a carefully curated collection of homegrown Indian brands, thoughtfully selected for their products, design, craftsmanship and the stories behind them. From emerging names to brands you’ll soon wonder how you missed, this is where discovery begins.
              </p>

              {/* Buttons */}
              <div className="native-hero-buttons">
                <NavLink
                  to="/category/All"
                  className="native-btn native-btn-primary"
                >
                  <span>Let’s Explore</span>
                  <FaArrowRight />
                </NavLink>

                <NavLink to="/sell" className="native-btn native-btn-outline">
                  <span>Start Discovering</span>
                  {/* <FaArrowRight /> */}
                </NavLink>
              </div>

              {/* Bottom Features */}
              <div className="native-hero-features">
                <div className="native-feature">
                  <FaLeaf />
                  <span>DISCOVER</span>
                </div>

                <span className="feature-dot">•</span>

                <div className="native-feature">
                  <FaHeart />
                  <span>SUPPORT</span>
                </div>

                <span className="feature-dot">•</span>

                <div className="native-feature">
                  <FaSeedling />
                  <span>CELEBRATE HOMEGROWN INDIA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NativeHero;
