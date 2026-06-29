import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import clientRoutes from "./routes/clientRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express(); // ✅ THIS WAS MISSING

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/clients", clientRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/billing", billingRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database(), current_user;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});