import { Router } from "express";
import { register, login, getProfile, addAddress, getAddresses } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.post("/addresses", authenticate, addAddress);
router.get("/addresses", authenticate, getAddresses);

export default router;
