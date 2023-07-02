var Rua = require('../models/ruas')

/* Get the list of roads*/
module.exports.list = () => {
    return Rua.find()
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}

module.exports.listAsc = () => {
    return Rua.find().sort({nome:1})
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}

module.exports.listDesc = () => {
    return Rua.find().sort({nome:-1})
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}



/* Get the list of roads by name*/
module.exports.listName = name => {
    var nome = decodeURIComponent(name)   
    return Rua.find({ nome:{$regex: nome} })
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}

/* Get the list of roads by date*/
module.exports.listDate = date => {
    return Rua.find({ datas: { $elemMatch: { data:{$regex: date} } }})
    //return Rua.find({'datas.data': date})
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}

/* Get the list of roads by entity*/
module.exports.listEntity = entity => {
    var entidade = decodeURIComponent(entity.toUpperCase())   
    return Rua.find({ entidades: { $elemMatch: { entidade:{$regex: entidade} } }})
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
}

/* Get the list of roads by places*/
module.exports.listPlaces = place => {
    var lugar = decodeURIComponent(place.toUpperCase())   
    return Rua.find({ lugares: { $elemMatch: { lugar:{$regex: lugar} } }})
    .then(dados => {
        console.log(lugar)
        return dados
    })
    .catch(erro => {
        return erro
    })
}

/* Get a Road*/
module.exports.getRua = idRua => {
    id = parseInt(idRua)
    return Rua.findOne({_id: id})
    .then(dados => {
        return dados
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
        return 0
    })
}


module.exports.addRua = rua =>{
    return Rua.create(rua)
    .then(dados=>{
        return dados
    })
    .catch(erro=>{
        return erro
    }) 
}

module.exports.updateRua = rua =>{
    return Rua.findByIdAndUpdate(rua._id,rua)
    .then(dados=>{
        return dados
    })
    .catch(erro=>{
        return erro
    }) 
}

module.exports.deleteRua = idRua =>{
    var id = parseInt(idRua)
    return Rua.findByIdAndDelete({_id:id})
    .then(dados=>{
        return dados
    })
    .catch(erro=>{
        return erro
    }) 
}

