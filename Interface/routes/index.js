var express = require('express');
var router = express.Router();
var env = require('../config/config.js');
var axios = require('axios')
var auth = require('../auth/auth');
var FormData = require('form-data');
var multer = require('multer');
var passport = require('passport')

var upload = multer({
  fileFilter: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, true);
  }
});

/* GET images from api server */
router.get('/api/*', function(req, res, next) {
  const imageURL = env.api + '/' + decodeURIComponent(req.params[0]); 
  axios.get(imageURL, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(res);
    })
    .catch(err => {
      res.status(404).send('Imagem não encontrada.');
    });
});

/* GET images from authentication server */
router.get('/auth/*', function(req, res, next) {
  const imageURL = env.auth + '/' + decodeURIComponent(req.params[0]); 
  axios.get(imageURL, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(res);
    })
    .catch(err => {
      res.status(404).send('Imagem não encontrada.');
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  res.status(200).render('home', {d:data})
});

/* GET list of roads page. */
router.get('/ruas', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  axios.get(env.api + '/ruas')
  .then(response =>{
    res.status(200).render('ruas', {ruas: response.data, d:data })
  }) 
    
  .catch(erro => res.status(600).render('error', { message: 'Não foi possível obter a lista de ruas', error:erro}))
});

/* GET list of roads orderly or by name, date, entity or place page. */
router.get('/ruas/pesquisa', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  if(req.query.ordem){
    axios.get(env.api + '/ruas?ordem='+req.query.ordem)
    .then(response => res.status(200).render('ruas', {ruas: response.data, d:data }))
    .catch(erro => res.status(601).render('error', { message: 'Não foi possível obter a lista de ruas ordenada', error:erro}))
  }
  else{
    axios.get(env.api + '/ruas/search/' + req.query.elemento)
    .then(response => res.status(200).render('ruas', {ruas: response.data, d:data }))
    .catch(erro => res.status(602).render('error', { message: 'Não foi possível obter a lista de ruas do elemento fornecido', error:erro}))
  }
});

/* GET form add road */
router.get('/ruas/adicionar',auth.verificaAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  res.status(201).render('addRua', {d:data })
});

/* POST add road */
router.post('/ruas/adicionar', auth.verificaAdmin, upload.array('imagens'), function (req, res, next) {
  const formData = new FormData();

  for (key in req.body) {
    var value = req.body[key]
    if (Array.isArray(value)) {
      for (i in value) {
        formData.append(key + '[]', value[i]);
      }
    }
    else {
      formData.append(key, value);
    }
  }
  
  for (var i = 0; i < req.files.length; i++) {
    var imagem = req.files[i];
    formData.append('imagens', imagem.buffer, { filename: imagem.originalname });
  }
  axios.post(env.api + '/ruas/adicionar', formData, {
    headers: formData.getHeaders(),
  })
    .then(response => {
      res.status(200).redirect('/ruas/' + response.data._id);
    })
    .catch(err => {
      res.status(603).render('error', { error: err });
    });
});

/* GET edit page. */
router.get('/ruas/editar/:idRua', auth.verificaAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  
  axios.get(env.api+'/ruas/'+req.params.idRua)
  .then(response => {
    var rua = response.data
    var idRua = rua._id
    axios.get(env.api+"/comments/"+idRua)
    .then(response=>{

      var comentarios = response.data
      var users = []
      var getUserPromises = [];
      for (let i = 0; i < comentarios.length; i++) {  
        var idUser = response.data[i].user_id;
        var getUserPromise = axios.get(env.auth + '/user/' + idUser)
        .then(response => {
          if(!users.includes(response.data)){
            users.push(response.data);
          }
        })
        .catch(erro => {
          res.status(610).render('error',{message:'Não foi possível obter os utilizadores que comentaram a rua especificada', error:erro})
        });
        getUserPromises.push(getUserPromise);
      }
      Promise.all(getUserPromises)
      .then(()=>{
        var comments = []
        if(comentarios){
          for (let i = 0; i < comentarios.length; i++){
            var comment = {}
            comment['_id'] = comentarios[i]._id
            comment['data'] = comentarios[i].data
            comment['comentario'] = comentarios[i].comentario
            for (let j = 0; j < users.length;j++){
              if(comentarios[i].user_id == users[j]._id){
                comment['user_id'] = users[j]._id
                comment['user'] = users[j].username
                comment['foto'] = users[j].imagem
                comment['registo'] = users[j].registo
              }
            }
            comments.push(comment)
          }
        }
        axios.get(env.api+'/ruas/'+req.params.idRua)
        .then(response => res.status(200).render('editRua', { rua: response.data, comentarios:comments, d:data }))
        .catch(erro => res.status(603).render('error', { message: 'Não foi possível obter a rua especificada', error:erro}))
      })
    .catch(erro => res.status(604).render('error', { message: erro.message, error: erro }));
    })
  })
  .catch(erro => res.status(605).render('error', { message: erro.message, error: erro }));
  
});

/* POST edit page. */
router.post('/ruas/editar/:idRua', auth.verificaAdmin, upload.array('imagens'), function(req, res, next) {
  var idRua = req.params.idRua
  var comentarios = []
  const formData = new FormData();
  for (key in req.body) {
    var value = req.body[key]
    if (Array.isArray(value)) {
      for (i in value) {
        formData.append(key + '[]', value[i]);
      }
    }
    else {
      formData.append(key, value);
    }
  }
  for (var i = 0; i < req.files.length; i++) {
    var imagem = req.files[i];
    formData.append('imagens', imagem.buffer, { filename: imagem.originalname });
  }
  if(req.body.comentarios_id){
    for(let j =0; j< req.body.comentarios_id.length; j++){
      var comment = {}
      comment._id = req.body.comentarios_id[j]
      comment.user = req.body.comentarios_user[j]
      comment.data = req.body.comentarios_data[j]
      comment.comentario = req.body.comentarios_comentario[j]
      comentarios.push(comment)
    }
  }
  axios.post(env.api+"/comments/delete/"+idRua, comentarios)
  .then(() => {
    axios.post(env.api+'/ruas/editar/'+idRua, formData, {
      headers: formData.getHeaders(),
    })
    .then(response => {
      res.status(200).redirect('/ruas/' + response.data._id);
    })
    .catch(err => {
      res.status(606).render('error', { error: err });
    });
  })
  .catch(err =>{res.status(607).render('error', { error: err })})
  
});

/* GET confirm delete page */
router.get('/ruas/apagar/confirmar/:idRua',auth.verificaAdmin, function(req, res) {
  res.status(200).render('confirmDelete',{idRua: req.params.idRua})
});

/* GET delete for the road*/
router.get('/ruas/apagar/:idRua', function(req, res) {
  axios.delete(env.api+"/ruas/"+ req.params.idRua)
  .then(response => {
    res.redirect('/ruas')
  })
  .catch(err => {
    res.status(607).render('error', {error: err})
  })
});

/* GET all the posts */
router.get('/posts', auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16).replace('T',' ');
  axios.get(env.api + '/posts/')
    .then(response => {
      var posts = response.data;
      var users = [];
      var ruas = []
      var getUserPromises = [];
      var getRuaPromises = []
      
      for (let i = 0; i < posts.length; i++) {  
          var userId = posts[i].user_id;
          var getUserPromise = axios.get(env.auth + '/user/' + userId)
          .then(response => {
            if (!users.includes(response.data)) {
              users.push(response.data);
            }
          })
          .catch(error => res.status(608).render('error', { message: 'Erro na obtenção do utilizador que realizou o post', error: error }));
          
          getUserPromises.push(getUserPromise);

          var ruaId = posts[i].rua_id
          var getRuaPromise = axios.get(env.api + '/ruas/' + ruaId)
          .then(response => {
            if (!ruas.includes(response.data)){
              ruas.push(response.data)
            }
          })
          .catch(error => res.status(609).render('error', { message: 'Erro na obtenção da rua partilhada', error: error }));
          
          getRuaPromises.push(getRuaPromise);
      }
      Promise.all([...getUserPromises,...getRuaPromises])
      .then(() => {
          var formattedPosts = [];
          if (posts) {
            for (let i = 0; i < posts.length; i++) {
              var formattedPost = {
                _id: posts[i]._id,
                data: posts[i].data,
                desc: posts[i].desc,
                comentarios: [],
              };
              for (let j = 0; j < users.length; j++) {
                if (posts[i].user_id === users[j]._id) {
                  formattedPost.user = {
                    _id: users[j]._id,
                    username: users[j].username,
                    foto: users[j].imagem,
                    registo: users[j].regist
                  };
                }
              }

              for (let j = 0; j < ruas.length; j++) {
                if (posts[i].rua_id === ruas[j]._id) {
                  formattedPost.rua = {
                    _id: ruas[j]._id,
                    nome: ruas[j].nome,
                    para: ruas[j].para,
                    figuras: ruas[j].figuras,
                    lista_casas: ruas[j].lista_casas,
                    datas: ruas[j].datas,
                    entidades: ruas[j].entidades,
                    lugares: ruas[j].lugares
                  };
                }
              }
              formattedPosts.push(formattedPost)
            }
          }
          res.status(200).render('posts',{posts:formattedPosts, d:data})
        })
        .catch(error => res.status(610).render('error', { message: error.message, error: error }));
      })
    .catch(error => res.status(611).render('error', { message: 'Failed to fetch the list of posts for the specified street', error: error }));
});

/* GET the page to make a post about a Road */
router.get('/ruas/post/:idRua', auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  axios.get(env.api+'/ruas/'+req.params.idRua)
  .then(response => {
    res.status(200).render('postRua', {rua: response.data, d:data})
  })
  .catch(error => res.status(612).render('error', { message: "Erro a tentar obter a página de partilha", error: error }));
  
})

/* POST from the post made about the street */
router.post('/ruas/post/:idRua', auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var user = req.user;
  var userId = user._id;

  var newPost = {
    rua_id: req.params.idRua,
    user_id: userId,
    data: data,
    desc: req.body.desc,
    comentarios: []
  };
  
  axios.post(env.api + '/posts', newPost)
  .then(response => {
    res.status(201).redirect('/posts')
  })
  .catch(error => {
    res.status(613).json({ message: 'Erro a criar o post', error: error.message });
  });
  
});

/* GET from the comments page about a post by admin */
router.get('/posts/comentario/admin/:idPost',auth.verificaAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var postId = req.params.idPost
  var query = req.query.seeOnly;
  var seeOnly = false;
  if(query=="true") seeOnly = true;

    axios.get(env.api+'/posts/'+postId)
    .then(response => {
      var posts = response.data[0];
      var user = '0'
      var rua = 0
      var userId = posts.user_id;
      var ruaId = posts.rua_id
     
      var getUserPromise = axios.get(env.auth + '/user/' + userId)
      .then(response => user = response.data)
      .catch(error => res.status(614).render('error', { message: 'Erro na obtenção do utilizador que realizou o post', error: error }));
             
      var getRuaPromise = axios.get(env.api + '/ruas/' + ruaId)
      .then(response => rua = response.data)
      .catch(error => res.status(615).render('error', { message: 'Erro na obtenção da rua partilhada', error: error }));
      
      Promise.all([getUserPromise,getRuaPromise])
      .then(() => {
          var formattedPost = {};
          if (posts) {
            formattedPost = {
              _id: posts._id,
              data: posts.data,
              desc: posts.desc,
            };
            formattedPost.user = {
              _id: user._id,
              username: user.username,
              foto: user.imagem,
              registo: user.regist
            };
            formattedPost.rua = {
              _id: rua._id,
              nome: rua.nome,
              para: rua.para,
              figuras: rua.figuras,
              lista_casas: rua.lista_casas,
              datas: rua.datas,
              entidades: rua.entidades,
              lugares: rua.lugares
            };
          }

          var users = []
          var getUserPromises = [];
          for (let i = 0; i < posts.comentarios.length; i++) {  
            var idUser = posts.comentarios[i].user_id;
            var getUserPromise = axios.get(env.auth + '/user/' + idUser)
            .then(response => {
              if(!users.includes(response.data)){
                users.push(response.data);
              } 
            })
            .catch(erro => {
              res.status(616).render('error',{message: 'Não foi possível obter os utilizadores que comentaram a rua especificada',error:erro})
            });

            getUserPromises.push(getUserPromise);
          }
          Promise.all(getUserPromises)
          .then(()=>{
            var comments = []
            if(posts.comentarios){
              for (let i = 0; i < posts.comentarios.length; i++){
                var comment = {}
                comment['_id'] = posts.comentarios[i]._id
                comment['data'] = posts.comentarios[i].data
                comment['comentario'] = posts.comentarios[i].comentario
                for (let j = 0; j < users.length;j++){
                  if(posts.comentarios[i].user_id == users[j]._id){
                    comment['user_id'] = users[j]._id
                    comment['user'] = users[j].username
                    comment['foto'] = users[j].imagem
                    comment['registo'] = users[j].regist
                  }
                }
                comments.push(comment)
              }
            }
          formattedPost.comentarios = comments
          res.status(200).render('postAdmin',{post:formattedPost, seeOnly: seeOnly, d:data})
        })
      .catch(error => res.status(617).render('error', { message: 'Erro na formatação de um post', error: error }));
    })
    .catch(error => res.status(618).render('error', { message: 'Erro na obtenção de um determinado post', error: error }));
    });
  
})

/* GET from the comments page about a post */
router.get('/posts/comentario/:idPost',auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var postId = req.params.idPost
  var query = req.query.seeOnly;
  var seeOnly = false;
  if(query=="true") seeOnly = true;

    axios.get(env.api+'/posts/'+postId)
    .then(response => {
      var posts = response.data[0];
      var user = '0'
      var rua = 0
      var userId = posts.user_id;
      var ruaId = posts.rua_id
     
      var getUserPromise = axios.get(env.auth + '/user/' + userId)
      .then(response => user = response.data)
      .catch(error => res.status(614).render('error', { message: 'Erro na obtenção do utilizador que realizou o post', error: error }));
             
      var getRuaPromise = axios.get(env.api + '/ruas/' + ruaId)
      .then(response => rua = response.data)
      .catch(error => res.status(615).render('error', { message: 'Erro na obtenção da rua partilhada', error: error }));
      
      Promise.all([getUserPromise,getRuaPromise])
      .then(() => {
          var formattedPost = {};
          if (posts) {
            formattedPost = {
              _id: posts._id,
              data: posts.data,
              desc: posts.desc,
            };
            formattedPost.user = {
              _id: user._id,
              username: user.username,
              foto: user.imagem,
              registo: user.regist
            };
            formattedPost.rua = {
              _id: rua._id,
              nome: rua.nome,
              para: rua.para,
              figuras: rua.figuras,
              lista_casas: rua.lista_casas,
              datas: rua.datas,
              entidades: rua.entidades,
              lugares: rua.lugares
            };
          }

          var users = []
          var getUserPromises = [];
          for (let i = 0; i < posts.comentarios.length; i++) {  
            var idUser = posts.comentarios[i].user_id;
            var getUserPromise = axios.get(env.auth + '/user/' + idUser)
            .then(response => {
              if(!users.includes(response.data)){
                users.push(response.data);
              } 
            })
            .catch(erro => {
              res.status(616).render('error',{message: 'Não foi possível obter os utilizadores que comentaram a rua especificada',error:erro})
            });

            getUserPromises.push(getUserPromise);
          }
          Promise.all(getUserPromises)
          .then(()=>{
            var comments = []
            if(posts.comentarios){
              for (let i = 0; i < posts.comentarios.length; i++){
                var comment = {}
                comment['_id'] = posts.comentarios[i]._id
                comment['data'] = posts.comentarios[i].data
                comment['comentario'] = posts.comentarios[i].comentario
                for (let j = 0; j < users.length;j++){
                  if(posts.comentarios[i].user_id == users[j]._id){
                    comment['user_id'] = users[j]._id
                    comment['user'] = users[j].username
                    comment['foto'] = users[j].imagem
                    comment['registo'] = users[j].regist
                  }
                }
                comments.push(comment)
              }
            }
          formattedPost.comentarios = comments
          res.status(200).render('post',{post:formattedPost, seeOnly: seeOnly, d:data})
        })
      .catch(error => res.status(617).render('error', { message: 'Erro na formatação de um post', error: error }));
    })
    .catch(error => res.status(618).render('error', { message: 'Erro na obtenção de um determinado post', error: error }));
    });
  
})

/* POST a comment on a post */
router.post('/posts/comentario/:idPost', auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var user = req.user
  var post = {}

  post['user_id'] = user._id
  post['post_id'] = req.params.idPost
  post['data'] = data
  post['comentario'] = req.body.comentario

  // Depois fazer o redirect para a pásgina de posts
  axios.post(env.api+'/posts/comments/'+req.params.idPost, post)
  .then(response => res.status(200).redirect('/posts/comentario/'+req.params.idPost))
  .catch(erro => res.status(619).render('error', { message: 'Não foi possível obter a rua especificada', error:erro}))
});

/* Get a delete for the post by admin*/
router.get('/posts/remover/admin/:idPost',auth.verificaAdmin,function(req, res, next) {
  var id = req.params.idPost;
  axios.delete(env.api + "/posts/delete/"+id)
  .then(response => res.status(200).redirect('/perfil/posts/admin'))
  .catch(erro => res.status(620).render('error', { message: 'Não foi possível remover o posts pedido', error:erro}))
})

/* Get a delete for the comment in a post */
router.get('/posts/remover/comment/:idPost/:idComment',auth.verificaAdmin,function(req, res, next) {
  var idPost = req.params.idPost;
  var idComment = req.params.idComment;
  axios.delete(env.api + "/posts/comments/delete/"+idPost+"/"+idComment)
  .then(response => res.status(200).redirect('/posts/comentario/admin/'+idPost))
  .catch(erro => res.status(621).render('error', { message: 'Não foi possível remover o posts pedido', error:erro}))
})

/* Get a delete for the post */
router.get('/posts/remover/:idPost',function(req, res, next) {
  var id = req.params.idPost;
  axios.delete(env.api + "/posts/delete/"+id)
  .then(response => res.status(200).redirect('/perfil/posts'))
  .catch(erro => res.status(622).render('error', { message: 'Não foi possível remover o posts pedido', error:erro}))
})

/* GET road page. */
router.get('/ruas/:idRua',auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var token = req.cookies.token
  var user = req.user
  
  var authorized = false
  var admin = false 
  
  if(token) authorized = true

  if(user && user.level == 'administrador') admin = true
  axios.get(env.api+'/comments/'+req.params.idRua)
  .then(response=>{
    var comentarios = response.data
    var users = []
    var getUserPromises = [];
    for (let i = 0; i < comentarios.length; i++) {  
      var idUser = response.data[i].user_id;
      var getUserPromise = axios.get(env.auth + '/user/' + idUser)
        .then(response => {
          if(!users.includes(response.data)){
            users.push(response.data);
          }
        })
        .catch(erro => {
          res.status(622).render('error',{message:'Não foi possível obter os utilizadores que comentaram a rua especificada', error:erro})
        });

      getUserPromises.push(getUserPromise);
    }
    Promise.all(getUserPromises)
    .then(()=>{
      var comments = []
      if(comentarios){
        for (let i = 0; i < comentarios.length; i++){
          var comment = {}
          comment['data'] = comentarios[i].data
          comment['comentario'] = comentarios[i].comentario
          for (let j = 0; j < users.length;j++){
            if(comentarios[i].user_id == users[j]._id){
              comment['_id'] = users[j]._id
              comment['registo'] = users[j].regist
              comment['user'] = users[j].username
              comment['foto'] = users[j].imagem
            }
          }
          comments.push(comment)
        }
      }
      axios.get(env.api+'/ruas/'+req.params.idRua)
      .then(response => res.status(200).render('rua', { rua: response.data, comentarios:comments, isAuthorized: authorized, isAdmin: admin, d:data }))
      .catch(erro => res.status(624).render('error', { message: 'Não foi possível obter a rua especificada', error:erro}))
    })
    .catch(erro => res.status(625).render('error', { message: erro.message, error: erro }));
  })
  .catch(erro => res.status(626).render('error', { message: 'Não foi possível obter a lista de comentarios da rua especificada', error:erro}))
});

/* POST a comment about the road. */
router.post('/ruas/:idRua',auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var user = req.user
  var post = {}

  post['user_id'] = user._id
  post['rua_id'] = req.params.idRua
  post['data'] = data
  post['comentario'] = req.body.mensagem
  
  
  axios.post(env.api+'/comments/'+req.params.idRua, post)
  .then(response => res.status(200).redirect('/ruas/'+req.params.idRua))
  .catch(erro => res.status(627).render('error', { message: 'Não foi possível obter a rua especificada', error:erro}))
});

/* GET profile page. */
router.get('/perfil', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var token = req.cookies.token
  var admin = false

  axios.get(env.auth+'/user', {headers: {authorization: token}})
  .then(response =>{
    var user = response.data
    if (user.level == 'administrador') admin = true
    res.status(200).render('profile', {user:response.data, isAdmin: admin, d:data})
  })
  .catch(erro => res.status(628).render('gotologin'))
});

/* GET edit profile page. */
router.get('/perfil/editar', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var token = req.cookies.token
  var admin = false 

  axios.get(env.auth+'/user',{headers: {authorization: token}})
  .then(response =>{
    var user = response.data
    if (user.level == 'administrador') admin = true
    res.status(200).render('editProfile', {user:response.data, isAdmin:admin, d:data})
  })
  .catch(erro => res.status(629).render('error', { message: 'Não foi possível aceder à edição do utilizador', error:erro}))
});

/* POST edit profile page. */
router.post('/perfil/editar', upload.single('imagem'),function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  var token = req.cookies.token
  
  const formData = new FormData();
  for (key in req.body) {
    var value = req.body[key]
    if (Array.isArray(value)) {
      for (i in value) {
        formData.append(key + '[]', value[i]);
      }
    }
    else {
      formData.append(key, value);
    }
  }

  if(req.file){
    formData.append('imagem', req.file.buffer, { filename: req.file.originalname });
  }

  axios.post(env.auth+'/user/edit',  formData, {headers: {authorization: token}})
  .then(response => {
    const token = response.data.token
    
    res.cookie('token', token, { secure: true, httpOnly: true, maxAge: 1800000 });
   
    res.status(200).redirect('/perfil')
     
  })
  .catch(erro => res.status(630).render('error', { message: 'Não foi possível aceder ao perfil do utilizador', error:erro}))
});


/* GET personal posts page. */
router.get('/perfil/posts',auth.verificaUser, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16).replace('T',' ');
  var user = req.user;
  var admin = false 

  if(user && user.level == 'administrador') admin = true

  axios.get(env.api + '/posts/user/'+ user._id)
  .then(response => {
    var posts = response.data;
    var ruas = []
    var getRuaPromises = []
    
    for (let i = 0; i < posts.length; i++) {  
        var ruaId = posts[i].rua_id
        var getRuaPromise = axios.get(env.api + '/ruas/' + ruaId)
        .then(response => {
          if (!ruas.includes(response.data)){
            ruas.push(response.data)
          }
        })
        .catch(error => res.status(631).render('error', { message: 'Erro na obtenção da rua partilhada', error: error }));
        
        getRuaPromises.push(getRuaPromise);
    }
    Promise.all(getRuaPromises)
    .then(() => {
        var formattedPosts = [];
        if (posts) {
          for (let i = 0; i < posts.length; i++) {
            var formattedPost = {
              _id: posts[i]._id,
              data: posts[i].data,
              desc: posts[i].desc,
              comentarios: [],
            };
            
            formattedPost.user = {
              _id: user._id,
              username: user.username,
              foto: user.imagem,
              registo: user.regist
            };
            
            for (let j = 0; j < ruas.length; j++) {
              if (posts[i].rua_id === ruas[j]._id) {
                formattedPost.rua = {
                  _id: ruas[j]._id,
                  nome: ruas[j].nome,
                  para: ruas[j].para,
                  figuras: ruas[j].figuras,
                  lista_casas: ruas[j].lista_casas,
                  datas: ruas[j].datas,
                  entidades: ruas[j].entidades,
                  lugares: ruas[j].lugares
                };
              }
            }
            formattedPosts.push(formattedPost)
          }
        }
        res.status(200).render('myposts',{posts:formattedPosts, isAdmin:admin, d:data})
    })
    .catch(error => res.status(632).render('error', { message: error.message, error: error }));
  })
  .catch(error => res.status(633).render('error', { message: 'Failed to fetch the list of posts for the specified street', error: error }));

});

/* GET all the posts for the admin user */
router.get('/perfil/posts/admin',auth.verificaAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16).replace('T',' ');

  axios.get(env.api + '/posts')
  .then(response => {
    var posts = response.data;
    var users = [];
    var ruas = []
    var getUserPromises = [];
    var getRuaPromises = []
    for (let i = 0; i < posts.length; i++) {  
        var userId = posts[i].user_id;
        var getUserPromise = axios.get(env.auth + '/user/' + userId)
        .then(response => {
          if (!users.includes(response.data)) {
            users.push(response.data);
          }
        })
        .catch(error => res.status(634).render('error', { message: 'Erro na obtenção do utilizador que realizou o post', error: error }));
        
        getUserPromises.push(getUserPromise);
        var ruaId = posts[i].rua_id
        var getRuaPromise = axios.get(env.api + '/ruas/' + ruaId)
        .then(response => {
          if (!ruas.includes(response.data)){
            ruas.push(response.data)
          }
        })
        .catch(error => res.status(635).render('error', { message: 'Erro na obtenção da rua partilhada', error: error }));
        
        getRuaPromises.push(getRuaPromise);
    }
    Promise.all([...getUserPromises,...getRuaPromises])
    .then(() => {
      var formattedPosts = [];
      if (posts) {
        for (let i = 0; i < posts.length; i++) {
          var formattedPost = {
            _id: posts[i]._id,
            data: posts[i].data,
            desc: posts[i].desc,
            comentarios: [],
          };
          for (let j = 0; j < users.length; j++) {
            if (posts[i].user_id === users[j]._id) {
              formattedPost.user = {
                _id: users[j]._id,
                username: users[j].username,
                foto: users[j].imagem,
                registo: users[j].regist
              };
            }
          }
          for (let j = 0; j < ruas.length; j++) {
            if (posts[i].rua_id === ruas[j]._id) {
              formattedPost.rua = {
                _id: ruas[j]._id,
                nome: ruas[j].nome,
                para: ruas[j].para,
                figuras: ruas[j].figuras,
                lista_casas: ruas[j].lista_casas,
                datas: ruas[j].datas,
                entidades: ruas[j].entidades,
                lugares: ruas[j].lugares
              };
            }
          }
          formattedPosts.push(formattedPost)
        }
      }
      res.status(200).render('postsAdmin',{posts:formattedPosts, d:data})
    })
    .catch(error => res.status(636).render('error', { message: error.message, error: error }));
  })
  .catch(error => res.status(637).render('error', { message: 'Failed to fetch the list of posts for the specified street', error: error }));
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  res.status(200).render('login', {d:data})
});

/* POST login page. */
router.post('/login', function(req, res, next) {
  var userData = req.body
  axios.post(env.auth+'/login', userData)
  .then(response => {
    res.cookie('token', response.data.token, { secure: true, httpOnly: true, maxAge: 1800000 });
    res.status(200).redirect('/')
  })
  .catch(erro => {
    const errorMessage = "Credencias inválidas! Pressione OK para tentar novamente...";
    const script = `<script>alert("${errorMessage}"); window.location.href = "/login";</script>`;
    res.status(401).send(script);
  })
});

/* GET sign up page. */
router.get('/registo', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16).replace('T',' ')
  res.status(200).render('registo', {d:data})
});

/* POST sign up page. */
router.post('/registo',  upload.single('imagem'), function(req, res, next) {
  const formData = new FormData();
  for (key in req.body) {
    var value = req.body[key]
    if (Array.isArray(value)) {
      for (i in value) {
        formData.append(key + '[]', value[i]);
      }
    }
    else {
      formData.append(key, value);
    }
  }
  if(req.file){
    formData.append('imagem', req.file.buffer, { filename: req.file.originalname });
  }
  axios.post(env.auth + '/register', formData, {
    headers: formData.getHeaders(),
  })
  .then(response => {
    res.status(200).redirect("/login")})
  .catch(erro => {
    const errorMessage = erro.response.data.error.message + ". Press OK to try again...";
    const script = `<script>alert("${errorMessage}"); window.location.href = "/registo";</script>`;
    res.status(401).send(script);
  })
});


/*GET the login google page*/
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

/*GET the login google page callback*/
router.get('/login/google/callback', passport.authenticate('google', { failureRedirect: '/login/google' }),(req, res) => {
  if (req.isAuthenticated()) {
    
    var google_user = {}
    google_user.google_id = req.user._json.sub
    google_user.username = req.user._json.name
    google_user.imagem = req.user._json.picture
    google_user.email = req.user._json.email
    
    axios.post(env.auth + '/login/google', google_user)
    .then(response => {
      res.cookie('token', response.data.token, { secure: true, httpOnly: true, maxAge: 1800000 });
      res.status(200).redirect('/')
    })
    .catch(err => {
      res.status(638).render('error', {error:err, message: 'Não foi possível efetuar login com conta Google.'})
    })
    
  }
  else {
    res.status(639).jsonp({ message: 'Erro ao iniciar a sessão do utilizador' })
  }
});
  
router.get('/logout',function(req, res, next) {
  res.clearCookie('token')
  res.status(200).redirect("/")
})
  module.exports = router;
  
  
