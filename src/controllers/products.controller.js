import {listProducts} from "../services/products.service.js";

export async function getProducts(req, res, next) {
    try {
        //pegando o ID do usuario 
        const userId = req.user.id;

        const user = await listProducts(userId);//chamando a funçao e passando o ID do usuario 

        if(!user) {
            return res.status(401).json({
                error: "Usuario da sessao nao encontrado. Faça login novamente.",
            })
        }

        //retornar somente os dados publicos produzidos pelo serviço
        return res.status(200).json({ user })
    } catch (error) {
        return next(error)   
    }
}