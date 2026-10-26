# Lash Systema

API em Node.js, Express e PostgreSQL para o sistema Lash Systema.

## Requisitos

- Node.js
- PostgreSQL

## Configuração

Defina as variáveis abaixo no arquivo `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_NAME=nome_do_banco
DB_USER=usuario_do_banco
DB_PASSWORD=senha_do_banco
DB_PORT=5432
DB_SSL=false

JWT_SECRET=use_um_segredo_longo_e_aleatorio
```

O `JWT_SECRET` assina os tokens de autenticação. Gere um valor aleatório e mantenha-o em segredo. Não envie o `.env` ao Git ou a outras pessoas. A aplicação não inicia se essa variável estiver ausente.

## Executar

Modo de desenvolvimento, reiniciando o servidor quando os arquivos mudarem:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Estrutura da API

As rotas ficam em `src/routes`, os controladores HTTP em `src/controllers` e as regras de negócio em `src/services`. A conexão compartilhada com PostgreSQL fica em `src/config/database.js`.

Fluxo de uma requisição:

1. A rota encaminha o caminho ao controlador.
2. O controlador valida a entrada e chama o serviço.
3. O serviço executa a regra de negócio e acessa o banco quando necessário.
4. O controlador transforma o resultado em uma resposta HTTP.

## Autenticação

### Login

`POST /api/v1/auth/login`

Corpo da requisição:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "sua-senha"
}
```

Resposta de sucesso (`200`):

```json
{
  "message": "Login realizado com sucesso.",
  "token": "token-jwt",
  "user": {
    "id": "1",
    "name": "Nome do usuário",
    "email": "usuario@exemplo.com"
  }
}
```

O token JWT expira em uma hora. A resposta não inclui o hash da senha. Para credenciais incorretas, a API retorna a mesma mensagem, seja o e-mail inexistente ou a senha incorreta.

Respostas de erro:

- `400`: e-mail ou senha ausente ou com formato/tamanho inválido.
- `401`: e-mail ou senha incorretos.
- `500`: erro interno do servidor.

### Saúde da API

`GET /api/health` verifica se a API consegue consultar o banco de dados.

## Usando este padrão para novos endpoints

Ao criar um endpoint, siga o fluxo documentado acima: declare o caminho em uma rota, valide entrada e resposta no controlador e mantenha a regra de negócio no serviço. Use consultas parametrizadas (`$1`, `$2`...) para valores enviados ao PostgreSQL. Retorne apenas os campos que o cliente precisa receber e escolha códigos HTTP que descrevam o resultado.
