import { Pool } from "pg";
import dotenv from "dotenv";

//carregando o arquivo .env
dotenv.config();

const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false
});

async function testarConexao() {
  try {
    const { rows } = await pool.query("SELECT NOW() AS horario");
    console.log("Conexão funcionando! Horário do banco:", rows[0].horario);
  } catch (erro) {
    console.error("Falha na conexão:", erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testarConexao();