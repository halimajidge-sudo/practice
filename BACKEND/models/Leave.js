const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullname:   { type: String, required: true },
  department: { type: String, required: true },
  leaveType:  { type: String, required: true },
  fromDate:   { type: String, required: true },
  toDate:     { type: String, required: true },
  totalDays:  { type: String },
  reason:     { type: String, required: true },
  status:     { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);