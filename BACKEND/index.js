const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const leaveRoutes = require("./routes/leaveRoutes"); // ← ADD

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes); // ← ADD

app.get("/", (req, res) => res.send("Backend is Running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));