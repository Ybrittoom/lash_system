import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProducts, postProducts } from "../controllers/products.controller.js";

const router = Router();

router.get("/products", authenticateToken, getProducts);
//TODO: padronizar a rota para POST/api/v1/products
router.post("/register-product", authenticateToken, postProducts)

export default router;