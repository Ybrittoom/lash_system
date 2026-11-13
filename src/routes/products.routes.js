import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProducts, postProducts, postEntry } from "../controllers/products.controller.js";

const router = Router();

router.get("/products", authenticateToken, getProducts);

router.post("/products", authenticateToken, postProducts)

// A rota e a autenticação já estão ligadas; falta concluir controller, validação e service transacional.
// TODO: implementar o registro da entrada e atualizar saldo e histórico na mesma transação.
//===============
//SEÇAO DE ESTOQUE(ENTRADA/ SAIDA)
//===============
router.post("/products/:productId/movements", authenticateToken, postEntry);

export default router;
