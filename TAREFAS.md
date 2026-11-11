# Tarefa atual

## Tratar produto duplicado como conflito

**Onde:** `src/server.js`, no middleware de tratamento de erros, marcado com `TODO`.

**Objetivo:** quando o PostgreSQL rejeitar um produto ativo com nome duplicado para o mesmo usuário, responder `409 Conflict` com uma mensagem clara. Para os demais erros, continuar retornando `500` sem expor detalhes internos do banco.

**Dicas:**

- O PostgreSQL usa o código `23505` para violação de unicidade.
- Confira também `error.constraint` para tratar especificamente `products_user_name_unique`.
- O controller já encaminha erros usando `next(error)`, então o tratamento pode ficar centralizado no middleware do servidor.

**Como conferir no Insomnia:** envie novamente um cadastro ativo com o mesmo nome de um produto existente. Experimente também mudar maiúsculas e minúsculas. A resposta deve ser `409`, e o produto duplicado não deve ser criado.

Quando concluir, me avise. Vou remover esta tarefa do arquivo e colocar somente a próxima, com o respectivo `TODO` no código.
