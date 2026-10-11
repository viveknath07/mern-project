import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// All order routes are protected
router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.patch("/:id/status", isAuthenticated, updateOrderStatus); // Bonus

export default router;
