const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const passport = require("passport");
const router = express.Router();

// ============================================
// REGISTER
// ============================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters" 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      provider: 'local'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
});

// ============================================
// LOGIN
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (user.provider === 'google') {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please use 'Login with Google'."
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "No password set for this account. Please use Google login."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
});

// ============================================
// GOOGLE LOGIN - Initiate
// ============================================
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  accessType: 'offline',
  prompt: 'select_account'
}));

// ============================================
// GOOGLE LOGIN - Callback (Direct Home Page)
// ============================================
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      const { token } = req.user;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      // DIRECT HOME PAGE REDIRECT WITH TOKEN
      res.redirect(`${clientUrl}/?token=${token}`);
    } catch (error) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
  }
);

// ============================================
// VERIFY GOOGLE TOKEN (One-Tap Login)
// ============================================
router.post("/google-verify", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name: name || email.split('@')[0],
        googleId,
        provider: 'google',
        isVerified: true,
        profilePicture: picture || ''
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      user.isVerified = true;
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Google token"
    });
  }
});

// ============================================
// GET CURRENT USER
// ============================================
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

module.exports = router;