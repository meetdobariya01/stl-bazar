import React from "react";
import "./privacypolicy.css";

const Privacypolicy = () => {
  return (
    <div>
      <div className="privacy-page">
        <div className="container py-5">
          <div className="row g-4">
            {/* Left Sidebar */}

            <div className="col-lg-3">
              <div className="toc-card">
                <h4>Contents</h4>

                <a href="#intro">Welcome</a>
                <a href="#collect">1. Information We Collect</a>
                <a href="#usage">2. How We Use Your Information</a>
                <a href="#cookies">3. Cookies</a>
                <a href="#payment">4. Payment Security</a>
                <a href="#sharing">5. Sharing Information</a>
                <a href="#security">6. Data Security</a>
                <a href="#rights">7. Your Rights</a>
                <a href="#contact">Contact</a>
              </div>
            </div>

            {/* Right */}

            <div className="col-lg-9">
              <section id="intro" className="policy-card">
                <h1>Welcome to Brandel</h1>
                <p>
                  Welcome to Brandel. Your privacy is important to us. This
                  Privacy Policy explains how we collect, use, disclose and
                  protect your information.
                </p>
              </section>

              <section id="collect" className="policy-card">
                <h2>1. Information We Collect</h2>

                <h5>Personal Information</h5>

                <ul>
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Billing Address</li>
                  <li>Shipping Address</li>
                  <li>Payment Information</li>
                </ul>
              </section>

              <section id="usage" className="policy-card">
                <h2>2. How We Use Your Information</h2>

                <ul>
                  <li>Process Orders</li>
                  <li>Customer Support</li>
                  <li>Improve Services</li>
                  <li>Fraud Prevention</li>
                </ul>
              </section>

              <section id="cookies" className="policy-card">
                <h2>3. Cookies</h2>

                <p>We use cookies to improve your browsing experience.</p>
              </section>

              <section id="payment" className="policy-card">
                <h2>4. Payment Security</h2>

                <p>
                  Payments are processed securely using trusted payment
                  gateways.
                </p>
              </section>

              <section id="sharing" className="policy-card">
                <h2>5. Sharing Your Information</h2>

                <ul>
                  <li>Payment Providers</li>
                  <li>Shipping Partners</li>
                  <li>Analytics Providers</li>
                </ul>
              </section>

              <section id="security" className="policy-card">
                <h2>6. Data Security</h2>

                <ul>
                  <li>SSL Encryption</li>
                  <li>Secure Servers</li>
                  <li>Access Control</li>
                </ul>
              </section>

              <section id="rights" className="policy-card">
                <h2>7. Your Rights</h2>

                <ul>
                  <li>Access Data</li>
                  <li>Delete Data</li>
                  <li>Correct Information</li>
                </ul>
              </section>

              <section id="contact" className="policy-card">
                <h2>Contact Us</h2>

                <p>Email : support@brandel.com</p>

                <p>Phone : +91 XXXXXXXXXX</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacypolicy;
