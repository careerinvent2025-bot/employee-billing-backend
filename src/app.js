import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import clientRoutes from "./routes/clientRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";

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

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});