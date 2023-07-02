// Controlador para o modelo User

var User = require('../models/user')

// Devolve a lista de Users
module.exports.list = () => {
    return User
            .find()
            .sort('name')
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}

module.exports.getUser = id => {
    return User.findOne({_id:id})
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}

module.exports.addUser = u => {
    return User.create(u)
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}


module.exports.updateUser = user => {
    return User.findByIdAndUpdate(user._id, user, {new:true})
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}

module.exports.getNextId = () => {
    return Rua.findOne().sort({_id:-1})
    .then(dados => {
        var lastId = dados._id
        lastId+=1 
        return lastId
    })
    .catch(erro => {
        return erro
    })
}

module.exports.updateUserStatus = (id, status) => {
    return User.updateOne({_id:id}, {active: status})
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}
 
module.exports.getUserByParam = (param, value) => {
    return User.findOne({[param]: value})
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}