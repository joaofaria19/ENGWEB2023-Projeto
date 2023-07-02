var express = require('express');
var router = express.Router();
var Rua = require('../controllers/ruas')
var Comment = require('../controllers/comments');
var Post = require('../controllers/posts');

var multer = require('multer');
var fse = require('fs-extra');
var path = require('path');


function getDifferentElements(list1, list2) {
  const differentElements = [];

  for (let i = 0; i < list1.length; i++) {
    let found = false;
    for (let j = 0; j < list2.length; j++) {
      if (isEqualImage(list1[i], list2[j])) {
        found = true;
        break;
      }
    }
    if (!found) {
      differentElements.push(list1[i]);
    }
  }
  
  return differentElements;
}

function isEqualImage(obj1, obj2) {
  return obj1.id === obj2.id;
}

function removeDir(delete_path){
  fse.remove(delete_path)
  .then(() => {          
    console.log('Ficheiro eliminado na diretoria: \'' + delete_path + '\'');
    
    let dir_path = path.dirname(delete_path);
    fse.rmdir(dir_path)
    .then(() => {
      console.log('Diretoria vazia eliminada: \'' + dir_path + '\'');
    })
    .catch(err => {
      console.error('Erro ao eliminar diretoria: \'' + dir_path + '\'' + err);
    });
  })
  .catch(err => {
    console.error('Erro ao eliminar o ficheiro na diretoria: \'' + delete_path + '\'' + err);
  });
}

router.get('/api/image/:filename/:imagename', function(req, res, next) {
  const filename = req.params.filename;
  const imagename = req.params.imagename;
  const imagePath = path.join(__dirname, '../public', 'images', filename, imagename);
  res.status(200).sendFile(imagePath);
});

var upload = multer({
  fileFilter: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, true);
  }
});

function getUniquePath(write_path) {
  if (fse.existsSync(write_path)) {
    const base_dir = path.dirname(write_path);
    const ext = path.extname(write_path);
    const base_filename = path.basename(write_path, ext);
    let index = 0;

    do {
      index++;
      var new_filename = base_filename + `(${index})${ext}`;
      var new_path = path.join(base_dir, new_filename);
    } while (fse.existsSync(new_path));

    write_path = new_path;
  }

  return write_path;
}

/* POST a new Road*/
router.post('/api/ruas/adicionar', upload.array('imagens'), function (req, res) {
  Rua.getNextId()
  .then(id => {
    var rua = {}
    var data = req.body
    rua._id = id;
    rua.nome = data.nome
    rua.para = data.para.split(/\r\n\s*/)
    rua.figuras = [];
    rua.lista_casas = [];
    rua.lugares = [];
    rua.datas = [];
    rua.entidades = [];
    rua.comentarios = [];

    for (i in data.datas) {
      rua.datas.push({ 'data': data.datas[i], 'rua': id })
    }

    for (i in data.lugares) {
      rua.lugares.push({ 'lugar': data.lugares[i], 'rua': id})
    }

    if(data.entidades_tipo){
      for (let i = 0; i < data.entidades_tipo.length; i++) {
        let entidade = {}
        let nome = data.entidades_nome[i]
        let tipo = data.entidades_tipo[i]
        
        entidade['tipo'] = tipo
        entidade['entidade'] = nome
        entidade['rua'] = id
        rua.entidades.push(entidade)
        
      }
    }
    if(data.casas_numero){

      for (let i= 0;i<data.casas_numero.length;i++) {
        let casa = {}
        let numero = data.casas_numero[i]
        let vista = data.casas_vista[i]
        let enfiteuta = data.casas_enfiteuta[i]
        let foro = data.casas_foro[i]
        let descricao = data.casas_descricao[i]
        if (descricao !== '') {
          casa['desc'] = descricao
        }
        if (foro !== '') {
          casa['foro'] = foro
        }
        if (enfiteuta !== '') {
          casa['enfiteuta'] = enfiteuta
        }
        if (vista !== '') {
          casa['vista'] = vista
        }
        if (numero !== '') {
          casa['número'] = numero
        }
        rua.lista_casas.push(casa)
      }
    }
    for (let i = 0; i < req.files.length; i++) {
      try {
        let imagem = req.files[i];
        let write_path = getUniquePath('public/images/'+id+'/' + imagem.originalname);
        let public_path = write_path.replace('public/images/', '../');
        let filename = path.basename(write_path);
        
        fse.outputFileSync(write_path, imagem.buffer);
        let figura = {
          id: filename,
          imagem: public_path,
        }
        
        figura.legenda = req.body.legendas[i]
        
        rua.figuras.push(figura);
      }
      catch (err) {
        console.error(err);
      }
    }

    Rua.addRua(rua)
      .then(response => {
        res.status(200).jsonp(response)
      })
      .catch(erro => {
        res.status(600).jsonp({ error: 'Erro na inserção da rua.' })
      })
    })
    .catch(erro => {
      res.status(601).jsonp({ error: 'Erro na obtenção de um Id para a rua a inserir.' });
    });
});

/* POST from the edition of a Road*/
router.post('/api/ruas/editar/:idRua', upload.array('imagens'), function (req, res) {
  var idRua = req.params.idRua
  Rua.getRua(idRua)
  .then( rua => {
    var data = req.body
    var old_fig = rua.figuras
    rua._id = idRua;
    rua.nome = data.nome
    rua.para = data.para
    rua.lista_casas = []
    rua.figuras = []
    rua.datas = []
    rua.lugares = []
    rua.entidades = []
    rua.comentarios = []

    for (i in data.datas) {
      rua.datas.push({ 'data': data.datas[i], 'rua': idRua })
    }
    for (i in data.lugares) {
      rua.lugares.push({ 'lugar': data.lugares[i], 'rua': idRua})
    }
    if(data.entidades_tipo){
      for (let i = 0; i < data.entidades_tipo.length; i++) {
        let entidade = {}
        let nome = data.entidades_nome[i]
        let tipo = data.entidades_tipo[i]
        
        entidade['tipo'] = tipo
        entidade['entidade'] = nome
        entidade['rua'] = idRua
        rua.entidades.push(entidade)
        
      }
    }
    if(data.casas_numero){
    
      for (let i= 0;i<data.casas_numero.length;i++) {
        let casa = {}
        
        let numero = data.casas_numero[i]
        casa['número'] = numero
        
        if (data.casas_vista){
          let vista = data.casas_vista[i]
          casa['vista'] = vista
        }
        if(data.casas_enfiteuta){
          let enfiteuta = data.casas_enfiteuta[i]
          casa['enfiteuta'] = enfiteuta
        }
        if(data.casas_foro){
          let foro = data.casas_foro[i]
          casa['foro'] = foro
        }
        if(data.casas_desc){
          let descricao = data.casas_desc[i]
          casa['desc'] = descricao
        }        
        
        rua.lista_casas.push(casa)
      }
    }
    
    //Adicionar as imagens já existentes
    if(data.imagens_id){
      for(let i= 0 ; i < data.imagens_id.length ; i++) {
        let imagem = {}
        let id = data.imagens_id[i]
        let img = data.imagens_imagem[i]
        let leg = data.imagens_legenda[i]
        
        imagem['id'] = id
        imagem['imagem'] = img
        imagem['legenda'] = leg
        
        rua.figuras.push(imagem)
      }
    }else{
      //Eliminar todas as imagens caso a rua não contenha mais imagens na BD
      if(old_fig.length>0){
        for(let i = 0;i<old_fig.length;i++){
          let img = old_fig[i].imagem
          let imagem =  img.replace(/\.\.\//, "");
          let delete_path = 'public/images/'+imagem
          removeDir(delete_path)
          
        }
      }
    }
    
    //Eliminar as imagens que já não se encontram na BD
    const difElem = getDifferentElements(old_fig,rua.figuras)
    if(difElem){
      for(let i = 0;i<difElem.length;i++){
        let img = difElem[i].imagem
        let imagem =  img.replace(/\.\.\//, "");
        let delete_path = 'public/images/'+imagem
        fse.remove(delete_path)
          .then(() => {
            console.log('Ficheiro eliminado na diretoria2: \'' + delete_path + '\'');
          })
          .catch(err => {
            console.error('Erro ao eliminar o ficheiro na diretoria: \'' + delete_path + '\'' + err);
          });
      }
    }
    
    // Adicionar novas imagens 
    for (let i = 0; i < req.files.length; i++) {
      try {
        let imagem = req.files[i];
        let write_path = getUniquePath('public/images/'+idRua+'/' + imagem.originalname);
        let public_path = write_path.replace('public/images/', '../');
        let filename = path.basename(write_path);
        
        fse.outputFileSync(write_path, imagem.buffer);
        let figura = {
          id: filename,
          imagem: public_path,
        }
        var leg = i
        if(req.body.imagens_id){
          leg = req.body.imagens_id.length
        }
        figura.legenda = req.body.imagens_legenda[leg]
        

        rua.figuras.push(figura);
      }
      catch (err) {
        console.error(err);
      }
    }

    Rua.updateRua(rua)
    .then(response => {
      res.status(200).jsonp(response)
    })
    .catch(erro => {
      res.status(602).jsonp({ error: 'Erro na inserção da rua.' })
    })

    })
  .catch(erro => {
    res.status(603).jsonp({ error: 'Erro na obtenção de um Id para a rua a inserir.' });
  });
})

/* GET list of roads. */
router.get('/api/ruas', function(req, res, next) {
    if (req.query.ordem){
      var ordem = req.query.ordem;
      if(ordem=='asc'){
        Rua.listAsc()
        .then(listaRuas=>{
        res.status(200).jsonp(listaRuas)
      })
      .catch(err=>{
        res.status(604).json({error:err})
      })
    }
    else if(ordem=='desc'){
      
      Rua.listDesc()
      .then(listaRuas=>{
        res.status(200).jsonp(listaRuas)
      })
      .catch(err=>{
        res.status(605).json({error:err})
      })
      
    }
  }
  else{
    Rua.list()
    .then(listaRuas=>{
      res.status(200).jsonp(listaRuas)
    })
    .catch(err=>{
      res.status(606).json({error:err})
    })
  }
});


/* GET a list of roads with a specific name, date, entity or place*/
router.get('/api/ruas/search/:object', function(req, res, next) {
  var listaRuas = [];
  var object = req.params.object;
  Rua.listName(object)
  .then(lista => {
      listaRuas.push(...lista);
      return Rua.listDate(object);
    })
    .then(lista => {
      listaRuas.push(...lista);
      return Rua.listEntity(object);
    })
    .then(lista => {
      listaRuas.push(...lista);
      return Rua.listPlaces(object);
    })
    .then(lista => {
      listaRuas.push(...lista);
      res.status(200).json(listaRuas);
    })
    .catch(err => {
      res.status(607).json({ error: err });
    });
});


/* GET a Road*/
router.get('/api/ruas/:idRua', function(req, res, next) {
    Rua.getRua(req.params.idRua)
    .then(rua=>{
      res.status(200).jsonp(rua)
  })
  .catch(err=>{
    res.status(608).json({error:err})
  })
});

/* DELETE a Road*/
router.delete('/api/ruas/:id', (req,res) => {
  Rua.deleteRua(req.params.id)
  .then(rua =>{
    if(rua.figuras){
      for(let i = 0;i<rua.figuras.length;i++){
        let img = rua.figuras[i].imagem
        let imagem =  img.replace(/\.\.\//, "");
        let delete_path = 'public/images/'+imagem
        removeDir(delete_path)
      }
    }
    res.status(200).json(rua)
    })
    .catch(erro => res.status(609).json({erro: erro, mensagem: "Não consegui apagar a rua."}))
})

/* GET a comments of a Road*/
router.get('/api/comments/:idRua', function(req, res, next) {
  var id = req.params.idRua
  Comment.getComments(id)
  .then(comentarios=>{
    res.status(200).jsonp(comentarios)
  })
  .catch(err=>{
    res.status(610).json({error:err})
  })
});

/* POST a comment from a Road*/
router.post('/api/comments/delete/:idRua', function(req, res, next) {
  var id = req.params.idRua
  var info = req.body

  var deleteList = []
  Comment.getComments(id)
  .then(comentarios =>{
    if(info.length > 0){
      for(let i=0; i<comentarios.length; i++){
        for(let j=0; j<info.length; j++){
          var id_info = parseInt(info[j]._id) 
          if(id_info != comentarios[i]._id){
            deleteList.push(comentarios[i])
            break
          }
        }
      }
    }
    else{
      deleteList = comentarios
    }
    if (deleteList.length>0){
      Promise.all(deleteList.map(comment => Comment.deleteComment(comment._id)))
      .then(deletedComments => {
        res.status(200).json({ message: "Comentarios eliminados com sucesso" });
      })
      .catch(err => {
        res.status(611).json({ error: err });
      });
    }
    else{
      res.status(200).json({ message: "Não existem comentários para eliminar" });
    }
  })
  .catch(err => {
    res.status(612).json({ error: err });
  });
});

/* POST a comment in a Road*/
router.post('/api/comments/:idRua', function(req, res, next) {
  var id = req.params.idRua
  var info = req.body
  Comment.getNextCommentId(id)
  .then(idComment =>{
    info['_id'] = idComment
    Comment.insertComment(info)
    .then(rua=>{
      res.status(200).jsonp(rua)
    })
    .catch(err=>{
      res.status(613).json({error:err})
    })
  }).catch(err=>{
      res.status(614).json({error:err})
  })
  
});


/* GET all the posts */
router.get('/api/posts', function(req, res, next) {
  Post.getPosts()
  .then(posts=>{
    res.status(200).jsonp(posts)
  })
  .catch(err=>{
    res.status(615).json({error:err})
  })
});

/* POST a post in a Road*/
router.post('/api/posts', function(req, res, next) {
  var post = req.body
  Post.getNextPostId(id)
  .then(idPost =>{
    post['_id'] = idPost
    Post.insertPost(post)
    .then(post=>{
      res.status(200).jsonp(post)
    })
    .catch(err=>{
      res.status(616).json({error:err})
    })
  }).catch(err=>{
      res.status(617).json({error:err})
  })
  
});

/* DELETE a comment in a post */
router.delete('/api/posts/comments/delete/:idPost/:idComment', function(req, res, next) {
  var idComment = req.params.idComment
  var idPost = req.params.idPost
  Post.deleteCommentFromPost(idPost,idComment)
  .then(post=>{
    res.status(200).jsonp(post)
  }).catch(err=>{
    res.status(618).json({error:err})
  })
});

/* POST a comment in a post */
router.post('/api/posts/comments/:idPost', function(req, res, next) {
  var comment = req.body
  var idPost = req.params.idPost
  
  Post.getNextCommentId(idPost)
  .then(id=>{
    comment['_id'] = id
    Post.insertCommentInPost(idPost,comment)
    .then(comment =>{
      res.status(200).jsonp(comment)
    })
    .catch(err=>{
      res.status(619).json({error:err})
    })
  }).catch(err=>{
      res.status(620).json({error:err})
  })
});

/* GET all the comments */
router.get('/api/posts/comments/:idPost', function(req, res, next) {
  var id = req.params.idPost
  Post.getCommentsFromPost(id)
  .then(comments=>{
    res.status(200).jsonp(comments)
  })
  .catch(err=>{
    res.status(621).json({error:err})
  })
});

/* GET all the posts from a user */
router.get('/api/posts/user/:idUser', function(req, res, next) {
  var idUser = req.params.idUser
  Post.getPostsFromUser(idUser)
  .then(posts=>{
    res.status(200).jsonp(posts)
  }).catch(err=>{
    res.status(622).json({error:err})
  })
});

/* DELETE a post */
router.delete('/api/posts/delete/:idPost', function(req, res, next){
  var id = req.params.idPost
  Post.deletePost(id)
  .then(response=>{
    res.status(200).jsonp(response)
  })
  .catch(err=>{
    res.status(623).json({error:err})
  })
})
/* GET a post */
router.get('/api/posts/:idPost', function(req, res, next) {
  var idPost = req.params.idPost
  Post.getPost(idPost)
  .then(post=>{
    res.status(200).jsonp(post)
  }).catch(err=>{
    res.status(624).json({error:err})
  })
});


module.exports = router;
