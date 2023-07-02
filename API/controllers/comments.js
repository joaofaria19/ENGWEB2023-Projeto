var Comment = require('../models/comments')

module.exports.insertComment = comment => {
    return Comment.create(comment)
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
};

module.exports.getNextCommentId = () => {
  return Comment.findOne().sort({_id:-1})
  .then(dados => {
      var lastId = dados._id
      lastId+=1 
      return lastId
  })
  .catch(erro => {
      return 0
  })
}


module.exports.getComments = idRua => {
  return Comment.find({ rua_id: idRua }).sort({data:1}).sort({_id:1})
    .then((comentarios) => {
      return comentarios;
    })
    .catch((erro) => {
      return erro;
    });
};


module.exports.deleteComment = commentId => {
  return Comment.findByIdAndDelete({_id:commentId})
  .then(dados=>{
      console.log(dados)
      return dados
  })
  .catch(erro=>{
      return erro
  }) 
}