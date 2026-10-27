import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

export async function authenticateUser(email, senha) {
  const normalizedEmail = email.trim().toLowerCase();

  // O valor do e-mail é enviado como parâmetro para evitar SQL injection.
  const result = await pool.query(
    `SELECT id, name, email, password_hash
       FROM users
      WHERE LOWER(email) = $1
      LIMIT 1`,
    [normalizedEmail],
  );

  const user = result.rows[0];

  // Retorna o mesmo resultado para usuário inexistente e senha incorreta.
  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(senha, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  // O identificador BIGINT do PostgreSQL é mantido como texto no token.
  const token = jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: "1h",
      algorithm: "HS256",
    },
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token,
  };
}

class AuthService {
  async findUserById(userId) {}
}
