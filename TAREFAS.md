# Tarefa atual

## Conferir o cadastro com estoque inicial zero

**Onde:** `src/controllers/products.controller.js`, no `TODO` dentro de `postProducts`.

**Objetivo:** confirmar manualmente que o cadastro cria o produto com saldo zero e não aceita `quantity` enviado pelo cliente.

**Como conferir no Insomnia:**

1. Envie um produto válido sem `quantity`. Espere `201 Created` e `product.quantity` igual a `0.000`.
2. Envie outro cadastro válido incluindo `"quantity": 5`. Espere `400 Bad Request` com a mensagem de que produtos começam com estoque zero.
3. Confirme que o cadastro rejeitado não criou uma linha.

`minimum_quantity` continua permitido porque representa o limite para alerta, não o saldo atual.

Quando concluir e me avisar, vou remover esta tarefa e registrar a próxima: implementar uma entrada de estoque em transação PostgreSQL.
