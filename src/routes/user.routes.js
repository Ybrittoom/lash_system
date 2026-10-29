import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticateToken, getProfile);

export default router;