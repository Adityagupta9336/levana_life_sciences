import { Router } from "express";
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  getCategories,
} from "../controllers/product.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.get("/categories", getCategories);
router.get("/:identifier", getProductByIdOrSlug);
router.get("/", getProducts);
router.post("/", authenticate, requireRole(Role.ADMIN), createProduct);

export default router;

