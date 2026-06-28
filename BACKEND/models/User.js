const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },

    // Extended profile fields
    phone: { type: String, trim: true },
    employeeId: { type: String, trim: true, unique: true, sparse: true }, // Sparse index allows null/missing values to not conflict with unique constraint
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    joiningDate: { type: Date },
    address: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    profilePicture: { type: String, default: "" }, // URL to the picture

    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);