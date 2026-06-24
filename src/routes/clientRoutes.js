import express from "express";
import {
  createClient,
  getAllClients,
  getEmployeesByClient,
  deleteClient
} from "../controllers/clientController.js";

const router = express.Router();

router.post("/create", createClient);
router.get("/all", getAllClients);

// 🔥 NEW ROUTE
router.get("/:id/employees", getEmployeesByClient);

// 🔥 DELETE
router.delete("/delete/:id", deleteClient);

export default router;