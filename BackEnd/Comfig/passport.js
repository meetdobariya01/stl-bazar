const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
                   `${process.env.BACKEND_URL || 'http://localhost:9000'}/api/auth/google/callback`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName, photos } = profile;
        const email = emails && emails[0] ? emails[0].value : null;

        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: displayName || email.split('@')[0],
            email: email,
            googleId: id,
            provider: 'google',
            profilePicture: photos && photos[0] ? photos[0].value : '',
            isVerified: true,
          });
          await user.save();
        } else if (!user.googleId) {
          user.googleId = id;
          user.provider = 'google';
          if (photos && photos[0] && !user.profilePicture) {
            user.profilePicture = photos[0].value;
          }
          await user.save();
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET || 'supersecretjwtkey',
          { expiresIn: process.env.JWT_EXPIRE || "7d" }
        );

        return done(null, { token, user });

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;