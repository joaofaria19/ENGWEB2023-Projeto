var mongoose = require('mongoose');


var comentarioSchema = new mongoose.Schema({
    _id: Number,
    post_id: Number,
    user_id: String,
    data: String,
    comentario: String
})


var postSchema = new mongoose.Schema({
    _id: Number,
    rua_id: Number,
    user_id: String,
    data: String,
    desc: String,
    comentarios: [comentarioSchema]
})

module.exports = mongoose.model('posts', postSchema)