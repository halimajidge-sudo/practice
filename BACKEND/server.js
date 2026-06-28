const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Load env vars
dotenv.config();

// Route files
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const leaveRoutes = require("./routes/leave.routes"); // Assuming you will create this

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/leave", leaveRoutes); // You can uncomment this when leave routes are ready

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});