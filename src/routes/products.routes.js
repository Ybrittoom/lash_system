import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProducts } from "../controllers/products.controller.js";

const router = Router();

router.get("/products", authenticateToken, getProducts);

export default router;