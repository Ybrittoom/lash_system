import pool from "../config/database.js";
import { isValidAmount } from "../utils/validator.utils.js";

export async function listProducts(userId) { //preciso do ID pra buscar somente daquele usuario
    const result = await pool.query(
        `
        SELECT id, name, category, unit, quantity, minimum_quantity, is_active
        from products
        where user_id = $1
        ORDER BY name ASC;
        `,
        [userId]
    )

    //result.rows ja retorna um array de todos os produtos encontrados([] vazio caso nao tiver nada)
    return result.rows;
}

export async function registerProduct(userId, name, category, unit, minimum_quantity, is_active) {
    // A coluna quantity foi omitida intencionalmente: o schema define DEFAULT 0,
    // então o PostgreSQL inicia o saldo zerado sem o cliente poder escolher a quantidade.
    // RETURNING * devolve a linha criada para o controller responder com o produto e seu saldo.
    const result = await pool.query(
        `
            INSERT INTO products (
                name,
                category,
                unit,
                minimum_quantity,
                is_active,
                user_id
            )
            VALUES 
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            ) 
             RETURNING *
                
        `,
        [
            // A ordem destes valores corresponde aos placeholders $1 a $6 do INSERT.
            name,
            category,
            unit,
            minimum_quantity,
            is_active,
            userId,
        ]
    )
    return result.rows[0];
}

// Registra a entrada no saldo e no histórico como uma única operação lógica.
export async function registerEntry(userId, productId, quantity, notes = null) {
    // isValidAmount permite zero porque também é usada para limites mínimos;
    // para uma entrada, a regra é mais restrita: a quantidade deve ser positiva.
    if (!isValidAmount(quantity) || quantity <= 0) {
        const error = new Error("A quantidade da entrada deve ser positiva e ter até três casas decimais.");
        error.code = "INVALID_ENTRY_QUANTITY";
        throw error;
    }

    if (notes !== null && notes !== undefined && typeof notes !== "string") {
        const error = new Error("As observações devem ser um texto ou null.");
        error.code = "INVALID_ENTRY_NOTES";
        throw error;
    }

    // Reservamos uma conexão porque BEGIN/COMMIT só valem para a mesma conexão.
    const client = await pool.connect();
    let releaseError;

    try {
        await client.query("BEGIN");

        // O filtro por id e user_id impede acesso ao produto de outra conta.
        // FOR UPDATE mantém esta linha bloqueada até confirmar ou desfazer a transação.
        const productResult = await client.query(
            `
                SELECT id, name, unit, quantity
                FROM products
                WHERE id = $1
                  AND user_id = $2
                  AND is_active = TRUE
                FOR UPDATE
            `,
            [productId, userId]
        );

        const product = productResult.rows[0];

        // Para não revelar se outro usuário tem esse produto, tratamos os casos como não encontrado.
        if (!product) {
            const error = new Error("Produto não encontrado.");
            error.code = "PRODUCT_NOT_FOUND";
            throw error;
        }

        // O schema permite frações apenas para ml e g; unidades contáveis exigem inteiro.
        if (!["ml", "g"].includes(product.unit) && !Number.isInteger(quantity)) {
            const error = new Error("A quantidade deve ser inteira para esta unidade.");
            error.code = "INVALID_ENTRY_QUANTITY";
            throw error;
        }

        // $1 = entrada, $2 = produto, $3 = usuário. A soma usa o saldo atual no PostgreSQL.
        const updatedProductResult = await client.query(
            `
                UPDATE products
                SET quantity = quantity + $1,
                    updated_at = NOW()
                WHERE id = $2
                  AND user_id = $3
                  AND is_active = TRUE
                RETURNING id, name, unit, quantity
            `,
            [quantity, productId, userId]
        );

        // Gravamos o histórico junto com o saldo. O tipo fica fixo porque esta rota
        // é apenas para entradas; o cliente não pode transformá-la em uma saída.
        const movementResult = await client.query(
            `
                INSERT INTO stock_movements (
                    user_id,
                    product_id,
                    type,
                    quantity,
                    notes
                )
                VALUES ($1, $2, 'entrada', $3, $4)
                RETURNING id, user_id, product_id, type, quantity, notes, created_at
            `,
            [userId, productId, quantity, notes ?? null]
        );

        // Só confirmamos depois que o UPDATE e o INSERT forem concluídos.
        await client.query("COMMIT");

        return {
            movement: movementResult.rows[0],
            product: updatedProductResult.rows[0],
        };
    } catch (error) {
        // Qualquer erro antes do COMMIT desfaz as mudanças desta transação.
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            // Se não conseguimos desfazer, evitamos devolver uma conexão em estado incerto ao pool.
            releaseError = rollbackError;
            console.error("Falha ao desfazer a transação de entrada:", rollbackError.message);
        }

        throw error;
    } finally {
        // Libera a conexão mesmo quando houve erro; o pool descarta-a se releaseError existir.
        client.release(releaseError);
    }
}
