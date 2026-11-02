# Lash Systema

Sistema web de controle de materiais e estoque para uma profissional de extensão de cílios. O projeto usa HTML, CSS e JavaScript no front-end, Node.js e Express na API, e PostgreSQL no banco de dados.

## Funcionalidades disponíveis

- Página de login conectada à API.
- Autenticação por e-mail e senha com senha armazenada como hash.
- Token JWT para identificar o usuário nas rotas privadas.
- Consulta do perfil autenticado.
- Listagem de produtos ativos pertencentes ao usuário autenticado.
- Verificação de saúde da API e da conexão com o banco.

Cadastro e edição de produtos, movimentações de estoque, dashboard e outras telas ainda fazem parte do roadmap.

## Tecnologias

- Node.js com módulos ES.
- Express.
- PostgreSQL e `pg`.
- `bcryptjs` para verificar senhas com hash.
- `jsonwebtoken` para emitir e validar tokens JWT.
- HTML, CSS e JavaScript sem framework no front-end.

## Estrutura do projeto

```text
database/
  schema_inicial.sql       # Tabelas e índices do PostgreSQL
public/
  assets/img/              # Imagens e texturas da interface
  css/                     # Estilos
  js/                      # JavaScript do navegador
src/
  config/                  # Conexão com PostgreSQL
  controllers/             # Entrada e resposta HTTP
  middleware/              # Autenticação e validações compartilhadas
  routes/                  # Métodos e caminhos da API
  services/                # Consultas e regras de negócio
view/
  login.html               # Página HTML de login
```

O Express serve os arquivos de `public/` e entrega `view/login.html` em `/` e `/login`. O front-end e a API usam a mesma origem durante o desenvolvimento.

## Requisitos

- Node.js instalado.
- PostgreSQL acessível.
- Banco criado e com o script `database/schema_inicial.sql` executado.

Configure as variáveis no arquivo local `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_NAME=nome_do_banco
DB_USER=usuario_do_banco
DB_PASSWORD=senha_do_banco
DB_PORT=5432
DB_SSL=false

JWT_SECRET=adicione_um_segredo_longo_e_aleatorio
```

`JWT_SECRET` assina os tokens e é obrigatório para iniciar o servidor. Use um valor aleatório e mantenha-o privado. O `.env` está listado no `.gitignore` e não deve ser enviado ao Git.

Se for criar uma conta manualmente usando `crypt()` e `gen_salt()` no PostgreSQL, habilite antes a extensão necessária:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## Executar

Na raiz do projeto, instale as dependências e inicie o modo de desenvolvimento:

```bash
npm install
npm run dev
```

No PowerShell do Windows, se a política de execução bloquear `npm.ps1`, use:

```powershell
npm.cmd run dev
```

Para iniciar sem reinício automático ao alterar arquivos:

```bash
npm start
```

A página de login fica em `http://localhost:3000/` ou `http://localhost:3000/login`.

## Rotas da API

| Método | Caminho | Autenticação | Função |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Não | Confere e-mail e senha e retorna um JWT. |
| `GET` | `/api/v1/me` | Bearer token | Retorna o perfil do usuário autenticado. |
| `GET` | `/api/v1/products` | Bearer token | Lista os produtos ativos do usuário autenticado. |
| `GET` | `/api/health` | Não | Confere se a API consegue consultar o PostgreSQL. |

### Login

`POST /api/v1/auth/login`

```json
{
  "email": "usuario@exemplo.com",
  "senha": "sua-senha"
}
```

Quando as credenciais estão corretas, a resposta `200` contém `token` e dados públicos do usuário. O token expira em uma hora. Para credenciais incorretas, a API retorna `401` sem informar se o e-mail existe.

### Perfil autenticado

`GET /api/v1/me`

Envie o token no header:

```text
Authorization: Bearer <token>
```

A resposta `200` contém o perfil público do usuário. Sem token, ou com token inválido ou expirado, a API retorna `401`.

### Listagem de produtos

`GET /api/v1/products`

Envie o mesmo header `Authorization: Bearer <token>`. A API filtra os produtos pelo ID do usuário validado no token e retorna apenas os ativos, em ordem alfabética. Se não houver produtos, a lista fica vazia. A resposta atual envolve essa lista na propriedade `user`.

## Testar pelo Insomnia

1. Inicie o servidor e envie `POST http://localhost:3000/api/v1/auth/login` com e-mail e senha no body JSON.
2. Copie o token retornado.
3. Faça `GET http://localhost:3000/api/v1/me` com o token como Bearer Token.
4. Faça `GET http://localhost:3000/api/v1/products` com o mesmo token.
5. Teste uma rota privada sem token; a resposta esperada é `401`.

## Front-end de login

O formulário em `view/login.html` envia e-mail e senha para o endpoint de login. O token é guardado em `sessionStorage`, que dura apenas enquanto a aba permanecer aberta. Ao recarregar a página, o JavaScript consulta `/api/v1/me` para validar e restaurar a sessão. O botão “Entrar com outra conta” remove o token da aba; ainda não existe uma rota no servidor para revogar um JWT.

## Organização e segurança

- A rota declara o caminho e associa middlewares e controladores.
- O middleware JWT valida o token e disponibiliza `request.user.id`.
- O controlador trata a requisição e escolhe o status e o JSON de resposta.
- O service executa a consulta e as regras de negócio.
- As consultas PostgreSQL devem usar parâmetros (`$1`, `$2` etc.).
- Rotas de dados devem limitar as consultas ao usuário autenticado.
- A resposta da API não deve incluir `password_hash` nem o valor de `JWT_SECRET`.

## Próximas etapas

- Cadastrar, consultar, editar e arquivar produtos.
- Registrar entradas, saídas e consumo com transações PostgreSQL.
- Consultar histórico, estoque baixo e dados do dashboard.
- Construir as telas de materiais e movimentações.
