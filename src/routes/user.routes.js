import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getProfile } from "../controller/user.controller.js";

const router = Router();

router.get("/me", authenticateToken, getProfile);

export default router;