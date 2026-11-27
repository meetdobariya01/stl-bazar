// Router/cookieRouter.js
const express = require("express");
const router = express.Router();
const CookieConsent = require("../Models/CookieConsent");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

router.post("/save", async (req, res) => {
  try {
    const { consentStatus, guestId } = req.body;

    if (!consentStatus) {
      return res.status(400).json({ success: false, message: "Consent status required" });
    }

    // 1. Try to find if the user is logged in (using the token cookie)
    let userId = null;
    let email = guestId || "Guest"; // Fallback to guestId if not logged in

    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey");
        const user = await User.findById(decoded.id);
        if (user) {
          userId = user._id;
          email = user.email;
        }
      } catch (err) {
        // Token invalid or expired, proceed as guest
      }
    }

    // 2. Save to Database
    const newConsent = new CookieConsent({
      userId,
      email,
      consentStatus,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    await newConsent.save();

    res.status(200).json({
      success: true,
      message: `Cookie consent '${consentStatus}' saved to database.`,
    });
  } catch (error) {
    console.error("Error saving cookie consent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
