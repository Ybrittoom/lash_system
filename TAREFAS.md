# Tarefa atual

## Criar a primeira tela de produtos

**Estado:** estrutura HTML e estilos CSS criados; integração JavaScript e rota do servidor continuam pendentes.

**Onde:** `public/js/login.js`, no `TODO` dentro de `showAuthenticatedState`.

**Objetivo:** começar o front usando as APIs que já estão prontas para listar produtos, cadastrar um produto sem saldo inicial e registrar entradas.

**Arquivos previstos:**

- `src/view/products.html` para a estrutura da tela.
- `public/css/products.css` para os estilos.
- `public/js/products.js` para carregar e enviar dados à API.
- `src/server.js` para servir a página em `/products`.
- `public/js/login.js` para navegar à tela depois do login e ao restaurar uma sessão existente.

**A tela inicial deve permitir:**

1. Listar produtos com nome, categoria, unidade, saldo atual e limite mínimo, usando `GET /api/v1/products`.
2. Cadastrar produto sem campo de quantidade, usando `POST /api/v1/products`.
3. Registrar uma entrada a partir do produto selecionado, usando `POST /api/v1/products/:productId/movements`.
4. Enviar o JWT salvo em `sessionStorage` no header `Authorization: Bearer <token>`.

O ID do produto deve ficar associado ao item selecionado na interface; a cliente escolhe o produto pelo nome e não precisa digitar o ID.

**Como conferir:** entrar pelo login, abrir a tela de produtos, carregar a lista, cadastrar um produto e registrar uma entrada. A lista deve refletir o saldo atualizado.

Saídas de estoque e consulta do histórico ainda serão implementadas em tarefas posteriores.
