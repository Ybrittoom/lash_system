import {listProducts, registerProduct} from "../services/products.service.js";

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

export async function postProducts(req, res, next) {
    try {
        //pegando o id do usuariooooooooo
        const userId = req.user.id
        
        const {
            name,
            category,
            unit,
            quantity,
            minimum_quantity,
            is_active
        } = req.body

        //TODO : Validar o BODY antes de chamar o service


        // if (!user) {
        //     return res.status(401).json({
        //         error: "Usuario da sessao nao encontrado. Faça login novamente."
        //     })
        // }

        const result = await registerProduct(
            userId,//passar esse PARAMETROOOOA
            name,
            category,
            unit,
            quantity,
            minimum_quantity,
            is_active
        ) 

        res.status(201).json(result)//oq eu coloco aqui bbzete ?

    } catch (error) {
        return next(error)
    }
}