import express from "express";

import {
  createEmployee,
  getAllEmployees,
  deleteEmployee,
  updateEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/create", createEmployee);

router.get("/all", getAllEmployees);

router.put("/update/:id", updateEmployee);

router.delete("/delete/:id", deleteEmployee);

export default router;

