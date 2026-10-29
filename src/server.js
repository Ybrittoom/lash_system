import "dotenv/config";
import express from "express";
import pool from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// O servidor não inicia sem o segredo usado para assinar os tokens.
if (!process.env.JWT_SECRET) {
  throw new Error("A variável JWT_SECRET precisa estar definida no arquivo .env.");
}

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

//ROTAS DE APIs
//=================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", userRoutes);

app.get("/api/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Resposta padrão para caminhos sem rota correspondente.
app.use((request, response) => {
  response.status(404).json({
    error: "Rota não encontrada",
    path: request.originalUrl,
  });
});

// Evita enviar detalhes internos do servidor ao cliente.
app.use((error, _request, response, _next) => {
  console.error("Erro na API:", error.message);
  response.status(500).json({ error: "Erro interno do servidor" });
});

const server = app.listen(port, () => {
  console.log(`Servidor Lash Systema disponível em http://localhost:${port}`);
});

// Fecha as conexões HTTP e do banco ao interromper o processo.
function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando servidor...`);

  server.close(async (error) => {
    if (error) {
      console.error("Erro ao encerrar o servidor HTTP:", error.message);
      process.exitCode = 1;
    }

    try {
      await pool.end();
    } catch (poolError) {
      console.error("Erro ao encerrar conexão com o banco:", poolError.message);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
