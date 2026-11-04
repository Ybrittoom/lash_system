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

export async function registerProduct(userId, name,category, unit, quantity, minimum_quantity, is_active) {
    const result = await pool.query(
        `
            INSERT INTO products (
                name,
                category,
                unit,
                quantity,
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
                $6,
                $7
            ) 
             RETURNING *
                
        `,
        [
            name,
            category,
            unit,
            quantity,
            minimum_quantity,
            is_active,
            userId
        ]
    )
    return result.rows[0];
}