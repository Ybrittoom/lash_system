import { authenticateUser } from "../services/auth.service.js";

export async function login(request, response, next) {
  try {
    const { email, senha } = request.body ?? {};

    // Valida o formato básico antes de consultar o banco.
    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return response.status(400).json({
        error: "Informe um e-mail e uma senha válidos.",
      });
    }

    if (email.length > 255 || senha.length > 1024) {
      return response.status(400).json({
        error: "E-mail ou senha excede o tamanho permitido.",
      });
    }

    const user = await authenticateUser(email, senha);

    if (!user) {
      // A mesma resposta é usada para e-mail inexistente ou senha incorreta.
      return response.status(401).json({
        error: "E-mail ou senha inválidos.",
      });
    }

    return response.status(200).json({
      message: "Login realizado com sucesso.",
      token: user.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
}
