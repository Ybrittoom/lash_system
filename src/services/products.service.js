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