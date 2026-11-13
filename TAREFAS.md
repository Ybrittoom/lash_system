# Tarefa atual

## Conferir o endpoint de entrada de estoque

**Estado:** implementação concluída; pendente apenas a conferência manual no Insomnia.

**Onde:** `src/controllers/products.controller.js`, no `TODO` dentro de `postEntry`.

**Como conferir no Insomnia:**

1. Faça uma entrada válida para um produto do usuário autenticado. Espere `201`, o saldo atualizado em `entry.product.quantity` e os dados da movimentação em `entry.movement`.
2. Envie quantidade zero ou negativa. Espere `400` e confirme que nem o saldo nem o histórico mudaram.
3. Para uma unidade contável, envie quantidade fracionada. Espere `400`; para `ml` ou `g`, uma fração válida deve ser aceita.
4. Use um ID de produto inexistente ou pertencente a outro usuário. Espere `404` e confirme que não houve alteração.

Todas as respostas de erro devem ser JSON. O saldo e o histórico precisam continuar consistentes porque as duas gravações são feitas na mesma transação.
