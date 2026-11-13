import pool from "../config/database.js";

export async function listProducts(userId) { //preciso do ID pra buscar somente daquele usuario
    const result = await pool.query(
        `
        SELECT name, category, unit, quantity, is_active 
        from products
        where user_id = $1
        AND is_active = $2
        ORDER BY name ASC;
        `,
        [userId, true]
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

export async function registerEntry(userId, quantity, notes) {
    const result = await pool.query(
        `
            SELECT id, quantity, unit 
            FROM products 
            WHERE id = $1
                AND user_id = $2
                AND is_active = TRUE
            FOR UPDATE

            UPDATE products
SET quantity = quantity + $1,
    updated_at = NOW()
WHERE id = $2
  AND user_id = $3
  AND is_active = TRUE
RETURNING id, name, unit, quantity;

INSERT INTO stock_movements (
    user_id, product_id, type, quantity, notes
)
VALUES ($1, $2, 'entrada', $3, $4)
RETURNING id, user_id, product_id, type, quantity, notes, created_at;
        `
    )
}
