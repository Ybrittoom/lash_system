import {listProducts, registerProduct} from "../services/products.service.js";
import { isValidAmount } from "../utils/validator.utils.js";

export async function getProducts(req, res, next) {
    try {
        //pegando o ID do usuario 
        const userId = req.user.id;

        const products = await listProducts(userId);//chamando a funçao e passando o ID do usuario 

        //retornar somente os dados publicos produzidos pelo serviço
        return res.status(200).json({ products })
    } catch (error) {
        return next(error)   
    }
}

export async function postProducts(req, res, next) {
    try {
        // O middleware authenticateToken valida o JWT e coloca o ID aqui.
        // Não aceite user_id do body, pois o cliente poderia escolher outro usuário.
        const userId = req.user.id;

        // O cliente precisa enviar um objeto JSON, por exemplo: { "name": "Pinça" }.
        // Essa verificação também evita erro ao tentar desestruturar body ausente ou inválido.
        if (
            req.body === null ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                error: "O corpo da requisição deve ser um objeto JSON.",
            });
        }

        // Object.hasOwn verifica se a propriedade foi enviada, inclusive se o valor for 0 ou null.
        // Rejeitamos o campo inteiro para ninguém definir saldo pelo cadastro; entradas serão movimentações.
        if (Object.hasOwn(req.body, "quantity")) {
            return res.status(400).json({
                error: "Não envie quantity no cadastro. Novos produtos começam com estoque zero.",
            });
        }

        const {
            name,
            category,
            unit,
            minimum_quantity = 0,
            is_active = true,
        } = req.body;

        // Colete os problemas para devolver ao cliente todos de uma vez.
        const validationErrors = [];
        const allowedUnits = ["unidade", "par", "caixa", "frasco", "ml", "g"];

        // Nome é obrigatório, deve ser texto não vazio e caber na coluna VARCHAR(150).
        if (typeof name !== "string" || name.trim().length === 0) {
            validationErrors.push("name é obrigatório e deve ser um texto não vazio.");
        } else if (name.trim().length > 150) {
            validationErrors.push("name deve ter no máximo 150 caracteres.");
        }

        // Categoria pode ser omitida ou nula; se vier, precisa ser texto de até 80 caracteres.
        if (
            category !== undefined &&
            category !== null &&
            (typeof category !== "string" || category.trim().length > 80)
        ) {
            validationErrors.push("category deve ser um texto de até 80 caracteres ou null.");
        }

        // A lista precisa coincidir com as opções do CHECK constraint no schema SQL.
        if (!allowedUnits.includes(unit)) {
            validationErrors.push(`unit deve ser uma destas opções: ${allowedUnits.join(", ")}.`);
        }

        // NUMERIC(12,3) aceita até três casas decimais e valores não negativos.
        const isValidAmount = (value) =>
            typeof value === "number" &&
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 999999999.999 &&
            Number(value.toFixed(3)) === value;

        if (!isValidAmount(minimum_quantity)) {
            validationErrors.push("minimum_quantity deve ser um número não negativo com até 3 casas decimais.");
        }

        // Para unidades contáveis, o limite mínimo também deve ser inteiro.
        if (
            allowedUnits.includes(unit) &&
            !["ml", "g"].includes(unit) &&
            Number.isFinite(minimum_quantity) &&
            !Number.isInteger(minimum_quantity)
        ) {
            validationErrors.push("minimum_quantity deve ser inteiro para esta unidade.");
        }

        if (typeof is_active !== "boolean") {
            validationErrors.push("is_active deve ser true ou false.");
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: "Dados do produto inválidos.",
                details: validationErrors,
            });
        }

        // Normaliza espaços e valores vazios antes de persistir.
        const product = await registerProduct(
            userId,
            name.trim(),
            typeof category === "string" && category.trim() !== ""
                ? category.trim()
                : null,
            unit,
            minimum_quantity,
            is_active
        );

        return res.status(201).json({ product });

    } catch (error) {
        return next(error)
    }
}

export async function postEntry(req, res, next) {
    try {
        //pegando o id do usuario parça
        const userId = req.user.id
        const userProduct = req.params.productId
        
        if( req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                error: "O corpo da requisiçao deve ser um objeto JSON!"
            })
        }

        if (!isValidAmount(quantity) || quantity <= 0) {
            return "Quantity deve ser inteiro e maior que zero!"
        }

        const {
            quantity,
            notes
        } = req.body

        const entry = await registerEntry(
            userId,
            quantity,
            notes
        )

        return res.status(201).json({ entry })
    } catch (error) {
        return next(error)
    }
}
