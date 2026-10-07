// middleware/validate.js
const { body, validationResult } = require("express-validator");

const applicationValidationRules = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Full name must be 2-120 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[+\d][\d\s\-()]{7,19}$/)
    .withMessage("Please provide a valid phone number"),

  body("applyingFor")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      "Content Writer Intern",
      "Social Media Intern",
      "General / Other",
    ])
    .withMessage("Invalid role selected"),

  body("socialProfile")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Social profile must be a valid URL"),

  body("message")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = {
  applicationValidationRules,
  validate,
};