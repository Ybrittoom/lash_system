# Próxima tarefa

## Criar endpoint para ativar ou desativar um produto

**Estado:** a página lista os estados e filtra produtos ativos/inativos; o endpoint para mudar esse estado ainda não existe.

**Onde começar:** `src/routes/products.routes.js`, no `TODO` logo abaixo da rota de cadastro.

**Objetivo:** implementar `PATCH /api/v1/products/:productId/status`, protegido pelo middleware JWT. A requisição deve receber `{ "is_active": false }` ou `{ "is_active": true }`.

**Regras para implementar:**

1. Validar o `productId` da URL e o corpo da requisição.
2. Usar `request.user.id` para garantir que só o dono altere o produto.
3. Atualizar apenas `is_active` e `updated_at`, retornando o produto atualizado.
4. Responder `404` se o produto não existir para aquele usuário.
5. Considerar conflito `409` ao reativar um produto cujo nome já esteja sendo usado por outro produto ativo do mesmo usuário.

**Arquivos para seguir:** rota → controller → service → teste manual no Insomnia.

**Como conferir:** enviar o PATCH com token e `is_active: false`, conferir que o produto aparece como inativo na listagem; depois enviar `is_active: true` e conferir que volta a aparecer como ativo. Testar também ID inválido, produto de outro usuário e corpo inválido.

Não altere quantidade nem histórico de estoque neste endpoint.
