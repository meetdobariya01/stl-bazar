// src/routes/careerRoutes.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const router = express.Router();

const upload = require("../Comfig/upload");
const {
  applicationValidationRules,
  validate,
} = require("../Comfig/validate");
const Application = require("../Models/Application");
const { AppError } = require("../Comfig/errorHandler");
const logger = require("../utils/logger");
const {
  sendApplicationToHR,
  sendAcknowledgementToApplicant,
} = require("../utils/emailService");

/* =========================================================
   RATE LIMITER
========================================================= */

const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many applications from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================================================
   ADMIN AUTH
========================================================= */

const adminAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  next();
};

/* =========================================================
   PUBLIC ROUTES
========================================================= */

// Submit a job application
router.post(
  "/apply",
  applyLimiter,
  upload.single("resume"),
  applicationValidationRules,
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError("Resume file is required", 400));
      }

      const {
        fullName,
        email,
        phone,
        applyingFor,
        socialProfile = "",
        message = "",
      } = req.body;

      const application = await Application.create({
        fullName,
        email,
        phone,
        applyingFor,
        socialProfile,
        message,
        resume: {
          originalName: req.file.originalname,
          fileName: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || "",
      });

      logger.info(`New application received from ${email} for ${applyingFor}`);

      Promise.allSettled([
        sendApplicationToHR(application),
        sendAcknowledgementToApplicant(application),
      ]).catch((err) => logger.error("Email dispatch error:", err));

      res.status(201).json({
        success: true,
        message: "Application submitted successfully! We'll be in touch soon.",
        data: {
          id: application._id,
          fullName: application.fullName,
          applyingFor: application.applyingFor,
          submittedAt: application.createdAt,
        },
      });
    } catch (error) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.error("Failed to clean up file:", err.message);
        });
      }
      next(error);
    }
  }
);

/* =========================================================
   ADMIN ROUTES
========================================================= */

// List all applications
router.get("/applications", adminAuth, async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 20, search = "" } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (role) filter.applyingFor = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single application
router.get("/applications/:id", adminAuth, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError("Application not found", 404));
    }
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// Update application status
router.patch("/applications/:id/status", adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "reviewed", "shortlisted", "rejected", "hired"];

    if (!allowed.includes(status)) {
      return next(new AppError("Invalid status value", 400));
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// Download resume
router.get("/applications/:id/resume", adminAuth, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    const filePath = application.resume.path;
    if (!fs.existsSync(filePath)) {
      return next(new AppError("Resume file not found on server", 404));
    }

    res.download(filePath, application.resume.originalName);
  } catch (error) {
    next(error);
  }
});

// Delete application
router.delete("/applications/:id", adminAuth, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    if (fs.existsSync(application.resume.path)) {
      fs.unlink(application.resume.path, (err) => {
        if (err) logger.error("Failed to delete file:", err.message);
      });
    }

    await application.deleteOne();

    res.json({ success: true, message: "Application deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
