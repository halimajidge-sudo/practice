const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const protect = require("../middleware/authMiddleware");

// Apply Leave (Employee)
router.post("/apply", protect, async (req, res) => {
  try {
    const { fullname, department, leaveType, fromDate, toDate, totalDays, reason } = req.body;

    const leave = await Leave.create({
      userId: req.user.id,
      fullname,
      department,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      status: "Pending"
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get My Leave History (Employee)
router.get("/my", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Leaves (Admin)
router.get("/all", protect, async (req, res) => {
  try {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access denied" });

    const leaves = await Leave.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve Leave (Admin)
router.put("/approve/:id", protect, async (req, res) => {
  try {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access denied" });

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );
    res.json({ message: "Leave approved", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject Leave (Admin)
router.put("/reject/:id", protect, async (req, res) => {
  try {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access denied" });

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    res.json({ message: "Leave rejected", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;