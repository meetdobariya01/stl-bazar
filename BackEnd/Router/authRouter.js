const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const passport = require("passport");
const router = express.Router();

// ============================================
// SESSION STORE (Use Redis in production)
// ============================================
const activeSessions = new Map(); // email -> { token, device, loginTime, expiresAt }

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(email);
      console.log(`🧹 Cleaned up expired session for: ${email}`);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// HELPER: Check if user is already logged in
// ============================================
const isUserLoggedIn = (email) => {
  const session = activeSessions.get(email);
  if (!session) return false;
  
  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    activeSessions.delete(email);
    return false;
  }
  
  return true;
};

// ============================================
// HELPER: Create session
// ============================================
const createSession = (email, token, device = 'Unknown Device') => {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeSessions.set(email, {
    token,
    device,
    loginTime: new Date().toISOString(),
    expiresAt,
  });
  return { email, expiresAt };
};

// ============================================
// HELPER: Logout user (remove session)
// ============================================
const logoutUser = (email) => {
  if (activeSessions.has(email)) {
    activeSessions.delete(email);
    return true;
  }
  return false;
};

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

    // ✅ Check if user is already logged in
    if (isUserLoggedIn(user.email)) {
      return res.status(409).json({
        success: false,
        message: "This account is already logged in from another device. Please logout from that device first.",
        code: "ALREADY_LOGGED_IN"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ✅ Create active session
    const device = req.headers['user-agent'] || 'Unknown Device';
    createSession(user.email, token, device);

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
    console.error("Login error:", error);
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
      const { token, user } = req.user;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      // ✅ Check if user is already logged in
      if (user && isUserLoggedIn(user.email)) {
        // Redirect with error
        return res.redirect(`${clientUrl}/login?error=already_logged_in`);
      }
      
      // ✅ Create active session for Google login
      if (user) {
        const device = req.headers['user-agent'] || 'Unknown Device';
        createSession(user.email, token, device);
      }
      
      // DIRECT HOME PAGE REDIRECT WITH TOKEN
      res.redirect(`${clientUrl}/?token=${token}`);
    } catch (error) {
      console.error("Google callback error:", error);
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

    // ✅ Check if user is already logged in
    if (isUserLoggedIn(user.email)) {
      return res.status(409).json({
        success: false,
        message: "This account is already logged in from another device. Please logout from that device first.",
        code: "ALREADY_LOGGED_IN"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ✅ Create active session
    const device = req.headers['user-agent'] || 'Unknown Device';
    createSession(user.email, token, device);

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
    console.error("Google verify error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid Google token"
    });
  }
});

// ============================================
// LOGOUT - Remove session
// ============================================
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({
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

    // ✅ Remove session
    const loggedOut = logoutUser(user.email);

    res.json({
      success: true,
      message: loggedOut ? "Logged out successfully" : "No active session found",
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
});

// ============================================
// CHECK SESSION STATUS
// ============================================
router.get("/session-status", async (req, res) => {
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

    const session = activeSessions.get(user.email);
    
    res.json({
      success: true,
      isLoggedIn: !!session,
      session: session ? {
        device: session.device,
        loginTime: session.loginTime,
        expiresAt: session.expiresAt,
        expiresIn: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
      } : null,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Session status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check session status"
    });
  }
});

// ============================================
// FORCE LOGOUT ALL DEVICES (Admin only)
// ============================================
router.post("/admin/force-logout/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check if admin (you can add admin verification here)
    const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const loggedOut = logoutUser(email);
    
    res.json({
      success: true,
      message: loggedOut ? `User ${email} logged out from all devices` : "No active session found",
    });

  } catch (error) {
    console.error("Force logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to force logout"
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

    // ✅ Check if session is still valid
    if (!isUserLoggedIn(user.email)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
        code: "SESSION_EXPIRED"
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
    console.error("Get user error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

// ============================================
// GET ACTIVE SESSIONS (Admin only)
// ============================================
router.get("/admin/active-sessions", async (req, res) => {
  try {
    // Check if admin
    const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const sessions = [];
    for (const [email, session] of activeSessions.entries()) {
      sessions.push({
        email,
        ...session,
        isExpired: session.expiresAt < Date.now()
      });
    }

    res.json({
      success: true,
      sessions,
      total: sessions.length
    });

  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active sessions"
    });
  }
});

module.exports = router;