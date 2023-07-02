var mongoose = require('mongoose');

var comentarioSchema = new mongoose.Schema({
    _id: Number,
    rua_id: String,
    user_id: String,
    data: String,
    comentario: String
})

module.exports = mongoose.model('comentarios', comentarioSchema)