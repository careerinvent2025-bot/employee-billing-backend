import express from "express";
import {
  createBilling,
  getAllBilling,
  deleteBilling
} from "../controllers/billingController.js";

const router = express.Router();

router.post("/create", createBilling);

router.get("/all", getAllBilling);

router.delete("/delete/:id", deleteBilling);

export default router;