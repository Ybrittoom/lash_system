import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
});

pool.on("error", (error) => {
  console.error("Erro inesperado no pool do PostgreSQL:", error.message);
});

export default pool;
