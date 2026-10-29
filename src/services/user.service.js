import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

export async function findUserById(userId) {
    const result = await pool.query(
        `SELECT id, name, email
        from users
        where id = $1
        `,
        [userId]
    );

    const user = result.rows[0];

    if(!user) {
        return null;
    }

    return {
        id: userId,
        name: user.name,
        email: user.email
    }
}