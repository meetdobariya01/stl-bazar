import React from "react";
import "./explore.css";

const Explore = () => {
  return (
    <div>
      <div className="container py-5">
        <div className="row g-4">
          {/* Buyer Card */}
          <div className="col-lg-6">
            <div className="custom-card buyer-card h-100">
              <div className="row align-items-center h-100">
                {/* Content */}
                <div className="col-md-6">
                  <div className="card-content">
                    <span className="top-line"></span>

                    <h2 className="card-title">For Buyers</h2>

                    <h5 className="sub-title">Discover. Shop. Support.</h5>

                    <p className="description">
                      Explore unique, high-quality products from trusted small
                      brands across India.
                    </p>

                    <ul className="feature-list">
                      <li>Curated & Quality Products</li>
                      <li>Secure Payments</li>
                      <li>Easy Returns</li>
                      <li>Fast Delivery</li>
                      <li>Great Customer Support</li>
                    </ul>

                    <button className="custom-btn buyer-btn">
                      Start Shopping
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="col-md-6 text-center">
                  <div className="image-wrapper">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                      alt="Buyer"
                      className="img-fluid card-image"
                    />

                    <div className="floating-icon buyer-icon">🛍</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="col-lg-6">
            <div className="custom-card seller-card h-100">
              <div className="row align-items-center h-100">
                {/* Content */}
                <div className="col-md-6">
                  <div className="card-content">
                    <span className="top-line"></span>

                    <h2 className="card-title">For Sellers</h2>

                    <h5 className="sub-title">Grow. Reach. Succeed.</h5>

                    <p className="description">
                      Join Brandel and grow your brand with India's most
                      seller-friendly marketplace.
                    </p>

                    <ul className="feature-list">
                      <li>Low Fees, Higher Profits</li>
                      <li>Faster Payouts</li>
                      <li>Done-for-you Support</li>
                      <li>Marketing & Growth Tools</li>
                      <li>Trusted by Thousands</li>
                    </ul>

                    <button className="custom-btn seller-btn">
                      Start Selling
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="col-md-6 text-center">
                  <div className="image-wrapper">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                      alt="Seller"
                      className="img-fluid card-image"
                    />

                    <div className="floating-icon seller-icon">🏪</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
