import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './cookies.css';

const Cookies = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  return (
    <>
      <div className={`cookie-banner-backdrop ${show ? 'show' : ''}`} />
      <div className={`cookie-banner-container ${show ? 'show' : ''}`}>
        <div className="cookie-banner-card">
          <div className="cookie-banner-body">
            <div className="cookie-banner-icon-container">
              <span className="cookie-banner-icon" role="img" aria-label="cookie">🍪</span>
            </div>
            <div className="cookie-banner-text">
              <h5 className="cookie-banner-title">Cookie Consent</h5>
              <p className="cookie-banner-desc">
                We use cookies to improve your shopping experience, remember your cart, and analyze our website traffic. By clicking "Accept All", you consent to our use of cookies. Read our <Link to="/privacypolicy" className="cookie-policy-link">Privacy Policy</Link> for details.
              </p>
            </div>
          </div>
          <div className="cookie-banner-actions">
            <button className="cookie-btn cookie-btn-decline" onClick={handleDecline}>
              Decline
            </button>
            <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;

