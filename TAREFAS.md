# Tarefa atual

## Concluir o endpoint de entrada de estoque

**Onde:** `src/routes/products.routes.js`, no `TODO` da rota `POST /products/:productId/movements`.

**Estado atual:** a rota autenticada e a função `postEntry` já foram iniciadas. O controller ainda precisa validar e encaminhar os dados corretamente; o service ainda não implementa `registerEntry`.

**O que falta:**

1. No controller, leia `quantity` e `notes` de `req.body` antes de validar `quantity`. Leia `productId` de `req.params.productId` e use `req.user.id` como `userId`. Responda com JSON e status `400` para entrada inválida; não retorne uma string solta.
2. Importe/chame `registerEntry` passando `userId`, `productId`, `quantity` e `notes`.
3. No service, use `pool.connect()` e um único `client` para executar `BEGIN`, as queries, `COMMIT` ou `ROLLBACK`, e sempre `client.release()` no `finally`.
4. Dentro da transação, busque e bloqueie um produto ativo pertencente ao usuário (`SELECT ... FOR UPDATE`) para validar existência, propriedade e unidade.
5. Valide que a quantidade é positiva e que unidades contáveis recebem números inteiros. Atualize `products.quantity` e insira em `stock_movements` com o tipo fixo `entrada`.
6. Se tudo funcionar, confirme a transação e retorne os dados; se algo falhar, desfaça as operações. Não aceite `user_id` do body.

**Como conferir no Insomnia:** uma entrada válida deve responder `201`, aumentar o saldo e criar uma linha em `stock_movements`. Quantidade inválida ou produto de outro usuário não deve alterar nenhuma das tabelas.
