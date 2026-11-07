import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/mine", authenticate, getMyOrders);
router.get("/all", authenticate, requireRole(Role.PHARMACIST, Role.ADMIN), getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.put("/:id/status", authenticate, requireRole(Role.PHARMACIST, Role.ADMIN), updateOrderStatus);

export default router;
