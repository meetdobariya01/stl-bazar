import React from "react";
import { FaGem, FaLeaf, FaHeart } from "react-icons/fa";
import { GiLotus } from "react-icons/gi";
import "./features.css";

const StorySection = () => {
  return (
    <section className="jewellery-brand-section lexend">
      <div className="container-fluid px-0">
        <div className="row g-0 jewellery-brand-row">
          {/* LEFT IMAGE */}
          <div className="col-lg-4 jewellery-image-col d-none d-md-block">
            <div className="jewellery-left-image">
              <img
                src="./images/storycontent2.webp"
                alt="Neephairen Jewels"
                className="img-fluid"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-lg-8 jewellery-content-col">
            <div className="jewellery-content">
              <span className="jewellery-small-title">THE BRAND EDIT</span>

              <div className="jewellery-line"></div>

              <h1>Neephairen Jewels</h1>

              <h2>
                Timeless Polki Jewellery,
                <br />
                Rooted in Indian Heritage
              </h2>

              <p>
                Discover handcrafted polki jewellery that brings together
                traditional Indian craftsmanship, intricate artistry and
                timeless elegance.
              </p>

              <a href="/company/NEEPA%20HIREN%20JEWELS" className="jewellery-btn">
                EXPLORE NEEPAHIREN JEWELS
                <span>→</span>
              </a>

              {/* FEATURES */}
              <div className="jewellery-features">
                <div className="jewellery-feature">
                  <FaGem className="feature-icon-home" />
                  <span>AUTHENTIC</span>
                  <small>POLKI CRAFT</small>
                </div>

                <div className="jewellery-feature">
                  <GiLotus className="feature-icon-home" />
                  <span>TIMELESS</span>
                  <small>DESIGNS</small>
                </div>

                <div className="jewellery-feature">
                  <FaLeaf className="feature-icon-home" />
                  <span>HANDCRAFTED</span>
                  <small>WITH CARE</small>
                </div>

                <div className="jewellery-feature">
                  <FaHeart className="feature-icon-home" />
                  <span>PROUDLY</span>
                  <small>INDIAN</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
