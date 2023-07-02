var mongoose = require('mongoose');

var figuraSchema = new mongoose.Schema({
    id: String,
    imagem: String,
    legenda: String
})

var casaSchema = new mongoose.Schema({
    número: String,
    vista: String,
    enfiteuta: String,
    foro: String,
    desc: String
})


var lugaresSchema = new mongoose.Schema({
    _id: String,
    lugar: String,
    rua: String
})


var datasSchema = new mongoose.Schema({
    _id: String,
    data: String,
    rua: String
})

var entidadesSchema = new mongoose.Schema({
    _id: String,
    tipo: String,
    entidade: String,
    rua: String
})


var ruaSchema = new mongoose.Schema({
    _id: Number,
    nome: String,
    para: [String],
    figuras: [figuraSchema],
    lista_casas: [casaSchema],
    lugares: [lugaresSchema],
    datas: [datasSchema],
    entidades: [entidadesSchema]
})

module.exports = mongoose.model('ruas', ruaSchema)