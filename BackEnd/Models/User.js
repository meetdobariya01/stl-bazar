const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      select: false // hides password from queries
    },

    googleId: {
      type: String
    },

    photo: {
      type: String
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
