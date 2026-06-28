const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get("/profile", protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    // Optional validation for profile fields
    body("phone", "Phone number is not valid").optional().isMobilePhone(),
    body("employeeId", "Employee ID cannot be empty").optional().not().isEmpty(),
    body("department", "Department cannot be empty").optional().not().isEmpty(),
    body("dob", "Date of birth is not a valid date").optional().isISO8601().toDate(),
  ],
  validate,
  updateUserProfile
);

module.exports = router;