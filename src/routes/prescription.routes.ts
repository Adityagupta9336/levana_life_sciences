import { Router } from "express";
import {
  uploadPrescription,
  getMyPrescriptions,
  getPharmacistQueue,
  reviewPrescription,
} from "../controllers/prescription.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { uploadMiddleware } from "../utils/upload.js";
import { Role } from "@prisma/client";

const router = Router();

router.post("/upload", authenticate, uploadMiddleware.single("prescription"), uploadPrescription);
router.get("/mine", authenticate, getMyPrescriptions);
router.get("/pharmacist/queue", authenticate, requireRole(Role.PHARMACIST, Role.ADMIN), getPharmacistQueue);
router.put("/:id/review", authenticate, requireRole(Role.PHARMACIST, Role.ADMIN), reviewPrescription);

export default router;
