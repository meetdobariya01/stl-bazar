// Cookies.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './cookies.css';

const Cookies = () => {
  const [show, setShow] = useState(false);
  const API = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Helper function to send data to DB
  const saveConsentToDB = async (status) => {
    try {
      const guestId = localStorage.getItem("guestId") || "Unknown Guest";
      
      await axios.post(`${API}/cookie-consent/save`, {
        consentStatus: status,
        guestId: guestId,
      }, { withCredentials: true }); // withCredentials sends the login cookie

      console.log(`✅ Consent '${status}' saved to DB`);
    } catch (error) {
      console.error("Failed to save consent to DB:", error);
    }
  };

  const handleAccept = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
    await saveConsentToDB('accepted'); // 🆕 Send to DB
  };

  const handleDecline = async () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
    await saveConsentToDB('declined'); // 🆕 Send to DB
    
    // Optional: Clear user data if declined
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    window.dispatchEvent(new Event('userUpdated'));
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
