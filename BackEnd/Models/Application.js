// src/models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 20,
    },
    applyingFor: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      enum: [
        "Content Writer Intern",
        "Social Media Intern",
        "General / Other",
      ],
    },
    socialProfile: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    resume: {
      originalName: { type: String, required: true },
      fileName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "rejected", "hired"],
      default: "new",
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.ipAddress;
        delete ret.userAgent;
        return ret;
      },
    },
  }
);

applicationSchema.index({ email: 1, applyingFor: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);