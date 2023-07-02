var Post = require('../models/posts.js')

module.exports.insertPost = post => {
    return Post.create(post)
    .then(dados => {
        return dados
    })
    .catch(erro => {
        return erro
    })
};

module.exports.deleteCommentFromPost = (idPost, idComment) => {
  return Post.updateOne(
    { _id: idPost },
    { $pull: { comentarios: { _id: idComment } } }
  )
  .then(dados=>{
    return dados
  })
  .catch(error => {
    return error;
  });
};

module.exports.getNextPostId = () => {
  return Post.findOne().sort({_id:-1})
  .then(dados => {
      var lastId = dados._id
      lastId+=1 
      return lastId
  })
  .catch(erro => {
      return 0
  })
}

module.exports.getNextCommentId = (postId) => {
  var id = parseInt(postId)
  console.log(id)
  return Post.find({_id:id})
    .then(post => {
      console.log(post)
      var lastComment = post[0].comentarios.slice(-1)[0];
      console.log(lastComment)
      var lastId = lastComment ? lastComment._id : 0; 
      var nextId = lastId + 1;
      return nextId;
    })
    .catch(error => {
      return 0;
    });
};


module.exports.getPost = idPost => {
  return Post.find({ _id: idPost })
    .then((comentarios) => {
      return comentarios;
    })
    .catch((erro) => {
      return erro;
    });
};


module.exports.getPosts = () => {
    return Post.find().sort({data:-1}).sort({_id:-1})
      .then((comentarios) => {
        return comentarios;
      })
      .catch((erro) => {
        return erro;
      });
  };


module.exports.insertCommentInPost = (postId,novoComentario) => {
  return Post.findByIdAndUpdate(
    postId,
    { $push: { comentarios: novoComentario } },
    { new: true }
  )  
  .then((comentarios) => {
      return comentarios;
    })
    .catch((erro) => {
      return erro;
    });
};


module.exports.getCommentsFromPost = postId => {
  return Post.find({_id:postId}).sort({data:1}).sort({_id:1})
  .then((post) => {
      return post.comentarios;
    })
    .catch((erro) => {
      return erro;
    });
};

module.exports.getPostsFromUser = userId => {
  return Post.find({user_id:userId}).sort({data:-1}).sort({_id:-1})
  .then((posts) => {
      return posts;
    })
    .catch((erro) => {
      return erro;
    });
};

module.exports.deletePost = postId => {
  return Post.findByIdAndDelete({_id:postId})
  .then(dados=>{
      console.log(dados)
      return dados
  })
  .catch(erro=>{
      return erro
  }) 
}