const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const passport = require("passport");
const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // include password explicitly
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error:", err); // logs the real error
    res.status(500).json({ message: "Server error" });
  }
});


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/* GOOGLE CALLBACK */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure"
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token, user } = req.user;

    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  }
);


module.exports = router;
