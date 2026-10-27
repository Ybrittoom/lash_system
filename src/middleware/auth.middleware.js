import jwt from "jsonwebtoken";//pegando o jeson web token

//funçao auxiliar para enviar uma resposta de autenticaçao negada

function unauthorized(response, message) {
    /*"response" é o objeto da resposta HTTP do express 
        "message" é a explicaçao que sera enviada em JSON
    */
    return response.status(401).json({
        error: message
    });
}
//middleware que verifica se a requisiçao traz um JWT valido
//"request": contem os dados que chegaram do cliente, inclusive os headers
//"response:" permite enviar uma resposta ao cliente
//"next": FUNÇAO DO EXPRESS QUE PASSA A REQUISIÇAO PARA A PROXIMA ETAPA.
export function authenticateToken(request, response, next) {

    /**O cliente envia o token no header
     * Authorization: Bearer iejdewfejnc....
     */
    const authorization = request.headers.authorization;

    //se nao existe o header, nao ha token para verificar
    if (typeof authorization !== "string") {
        return unauthorized(response, "token de acesso obrigatorio.");
    }
    //Separa o header em partes usando espaços em branco.
    //para "Bearer abc123", o resultado é: 
                                    //scheme: "bearer",
                                    //token: "abc123",
                                    //extraPart = []
    // os 3 pontos antes do extraParts guardam qualquer parte adicional
    const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

    // Exige o formato "Bearer <token>".
    // toLowerCase permite tambem "Bearer <token>".
    // extraParts deve estar vazio: o header nao deve ter partes sobrando.
    if (
        scheme?.toLowerCase() !== "bearer" || //aceita Bearer, bearer ou outras combinaçoes
        !token ||
        extraParts.length > 0
    ) {
        return unauthorized(response, "Formato de autenticação inválido.");
    }

    //aqui guardaremos os dados que jwt.verify extrair do token validado
    let payload;

    try {
        /*
            verifica a assinatura do token com o segredo privado do servidor
            tambem verifica a expiraçao("exp") e so aceita o algoritmo HS256
        */
        payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch {
        //lança erro caso o token estiver adulterado, expirado, malformado
        return unauthorized(response, "Token inválido ou expirado.");
    }

    // No login, o ID do usuario foi colocado no campo padrao "SUB".
    // esperamos receber esse ID como texto numerico positivo
    if (
        typeof payload !== "object" ||
        payload === null ||
        typeof payload.sub !== "string" ||
        !/^[1-9]\d*$/.test(payload.sub)//verifica se a sub contem somente digitos
        //e representa um numero positivo. Assim rejeitamos um token sem um ID no formato esperado.
    ) {
        return unauthorized(response, "Token inválido ou expirado.");
    }

    // Guarda o ID validado para o próximo middleware ou controlador.
  // Rotas privadas devem usar request.user.id, e não um ID enviado
  // pelo cliente no body ou na URL.
    request.user = { id: payload.sub };

    // A autenticação passou. O Express pode continuar o fluxo da requisição.
    return next();
}