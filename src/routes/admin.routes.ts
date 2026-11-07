import { Router } from "express";
import {
  getDashboardStats,
  addInventoryBatch,
  getInventoryBatches,
  getAuditLogs,
} from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.get("/stats", authenticate, requireRole(Role.ADMIN, Role.PHARMACIST), getDashboardStats);
router.post("/batches", authenticate, requireRole(Role.ADMIN, Role.PHARMACIST), addInventoryBatch);
router.get("/batches", authenticate, requireRole(Role.ADMIN, Role.PHARMACIST), getInventoryBatches);
router.get("/audit-logs", authenticate, requireRole(Role.ADMIN), getAuditLogs);

export default router;
