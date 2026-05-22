const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// Check if Google credentials exist
const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && 
                             process.env.GOOGLE_CLIENT_SECRET && 
                             process.env.GOOGLE_CALLBACK_URL;

if (hasGoogleCredentials) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }]
          });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              fullName: profile.displayName,
              photo: profile.photos[0].value,
              provider: "google"
            });
          }

          // Create JWT
          const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "30d" }
          );

          done(null, { token, user });
        } catch (err) {
          console.error("Google Strategy Error:", err);
          done(err, null);
        }
      }
    )
  );
  
  console.log("✅ Google OAuth Strategy configured");
} else {
  // console.log("⚠️ Google OAuth disabled - Missing credentials in .env file");
  // console.log("   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL");
}

// Serialization/Deserialization (needed for sessions)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;