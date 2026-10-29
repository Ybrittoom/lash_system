import { findUserById } from "../services/user.service.js";

/**
 * Retorna o perfil do usuário autenticado.
 *
 * Esta função é um controlador Express: ela recebe a requisição HTTP,
 * chama o serviço que consulta os dados e escolhe a resposta HTTP.
 * A rota precisa executar authenticateToken antes deste controlador,
 * para que o middleware valide o JWT e preencha request.user.id.
 */
export async function getProfile(request, response, next) {
  try {
    // O middleware de autenticação extrai o ID do token já validado
    // e o coloca em request.user.id. Não usamos ID enviado pelo cliente.
    const userId = request.user.id;

    // O controlador delega a consulta ao serviço. O serviço cuida do banco;
    // o controlador fica responsável pelo fluxo HTTP.
    const user = await findUserById(userId);

    // Um token pode ter sido emitido para um usuário que não existe mais
    // no banco. Nesse caso, a sessão não pode ser usada para identificar
    // um usuário atual.
    if (!user) {
      return response.status(401).json({
        error: "Usuário da sessão não encontrado. Faça login novamente.",
      });
    }

    // Retorna somente os dados públicos produzidos pelo serviço.
    // O status 200 indica que a consulta foi concluída com sucesso.
    return response.status(200).json({ user });
  } catch (error) {
    // Encaminha falhas inesperadas (por exemplo, erro no banco) para o
    // middleware central de erros configurado no server.js.
    return next(error);
  }
}
