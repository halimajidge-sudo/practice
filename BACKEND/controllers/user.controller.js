const User = require("../models/User");

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware, providing the user's ID
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GetUserProfile Error:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};

/**
 * @desc    Update user profile (for profile completion and subsequent updates)
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Dynamically update fields that are present in the request body
    const fieldsToUpdate = {
      phone: req.body.phone || user.phone,
      employeeId: req.body.employeeId || user.employeeId,
      department: req.body.department || user.department,
      designation: req.body.designation || user.designation,
      gender: req.body.gender || user.gender,
      dob: req.body.dob || user.dob,
      joiningDate: req.body.joiningDate || user.joiningDate,
      address: req.body.address || user.address,
      emergencyContact: req.body.emergencyContact || user.emergencyContact,
      profilePicture: req.body.profilePicture || user.profilePicture,
      profileCompleted: true, // Always set to true on profile update
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true, context: 'query' }
    ).select("-password");
    
    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });

  } catch (error) {
    console.error("UpdateProfile Error:", error);
    // Handle potential validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error while updating profile." });
  }
};