var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')
var userModel = require('../models/user')
var auth = require('../auth/auth')
var User = require('../controllers/user')
const { v5: uuidv5, v4: uuidv4 } = require('uuid');

var multer = require('multer');
var fse = require('fs-extra');
var path = require('path');

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

router.get('/auth/image/:filename/:imagename', function(req, res, next) {
  const filename = req.params.filename;
  const imagename = req.params.imagename;
  const imagePath = path.join(__dirname, '../public', 'images', filename, imagename);
  res.status(200).sendFile(imagePath);
});

/* POST new regist */
router.post('/auth/register', upload.single('imagem'), function (req, res) {
  var d = new Date().toISOString().substring(0,16).replace('T',' ')
  let foto = "../default/user-image.png"
  var userData = req.body
  
  var uniqueName = userData.password;  
  var namespace = userData.username;
  var uniqueId = uuidv5(uniqueName, uuidv4(namespace));
  
  
  if (req.file){
    try {
      let image = req.file;
      let write_path = getUniquePath('public/images/'+uniqueId+'/'+ image.originalname);
      let public_path = write_path.replace('public/images/', '../');
      
      fse.outputFileSync(write_path, image.buffer);
      foto = public_path   
    }
    catch (err) {
      console.error(err);
    }
  }else{
    try {
      let default_image_path = 'public/images/default/user-image-default.png';
      let write_path = getUniquePath('public/images/'+uniqueId+'/user-image-default.png');
      
      fse.ensureDirSync(path.dirname(write_path), { recursive: true });
  
      fse.copySync(default_image_path, write_path);
  
      let public_path = write_path.replace('public/images/', '../');
      foto = public_path
    } catch (err) {
      console.error(err);
    }
  }

  var user = { _id: uniqueId, username: userData.username, 
    email: userData.email, affiliation: userData.affiliation, 
    level: "consumidor", active: true,
    dateCreated: d, imagem: foto, regist:"local"
  }

  userModel.register(new userModel(user),
                userData.password,
                function(err, u) {
                    if(err) res.status(600).jsonp({error: err}) 
                    else res.status(200).jsonp({message: "Utilizador registado" })
                })
})


/* POST Local Login */
router.post('/auth/login', passport.authenticate('local'), function(req, res){
  jwt.sign({ _id: req.user._id, username: req.user.username, level: req.user.level},
    "MapaRuasJWT",{expiresIn: 1800}, // tempo de sessão
    function(err, token) {
      if(err) res.status(601).jsonp({error: err}) 
      else res.status(200).jsonp({token: token, user: req.user})
    });
})


/* POST Google Login */
router.post('/auth/login/:registo', function (req, res) {
  if ('google' == req.params.registo) {
    var user = req.body
    user.email = req.body.email
    user.affiliation = 'Aluno'
    user.regist = req.params.registo
    user.level = 'consumidor'
    user.active = true

    var param = req.params.registo+'_id'
    var uniqueName = user.google_id;  
    var namespace = user.username;
    var uniqueId = uuidv5(uniqueName, uuidv4(namespace));
    
    User.getUserByParam(param, user[param])
      .then(db_user => {
        if (db_user === null) {
          user._id = uniqueId
          user.dateCreated = new Date().toISOString().substring(0, 16).replace('T',' ')
          User.addUser(user)
          .then(db_new_user => {
            jwt.sign(db_new_user.toObject(), 'MapaRuasJWT', { expiresIn: 1800 }, function(err, token) {
              if (err) {
                res.status(602).jsonp({ error: err });
              } 
              else {
                res.jsonp({ user: db_new_user, token: token });
              }
            });
          })
          .catch(erro => {
            res.status(522).jsonp({ error: erro })
          })
        }
        else {
          User.updateUser(db_user)
            .then(db_new_user => {
              jwt.sign(db_new_user.toObject(), 'MapaRuasJWT', { expiresIn: 1800 }, function(err, token) {
                if (err) {
                  res.status(603).jsonp({ error: err });
                } 
                else {
                  res.jsonp({ user: db_new_user, token: token });
                }
              });
            })
            .catch(err => {
              res.status(604).jsonp({ error: err })
            })
        }
      })
      .catch(err => {
        res.status(605).jsonp({ error: err });
      })
  }
  else {
    res.status(606).jsonp({ error: 'Impossível realizar Login com  ' + req.params.registo});
  }
});



/* GET the user's data */
router.get('/auth/user', auth.verificaAcesso, function(req, res){
  const userId = req.user._id
  User.getUser(userId)
    .then(dados => res.status(200).jsonp(dados))
    .catch(err => res.status(607).jsonp({error: err}))
})

/* GET the user by id */
router.get('/auth/user/:idUser', function(req, res){
  const userId = req.params.idUser
  User.getUser(userId)
    .then(dados => res.status(200).jsonp(dados))
    .catch(err => res.status(608).jsonp({error: err}))
})

/*POST from the edit of a user */
router.post('/auth/user/edit', auth.verificaAcesso, upload.single('imagem'), async function (req, res) {
  var old_user = req.user
  var id = req.user._id
  var new_user = req.body
  
  var new_password = false
  
  old_user = await User.getUser(id)
  
  if (req.body.password && req.body.password_confirm && req.body.password === req.body.password_confirm) {
    new_password = req.body.password
  }
  // Atualizar imagem
  if (req.file) {
    try {
      let foto_perfil = req.file;
      let write_path = getUniquePath('public/images/' + id + '/' + foto_perfil.originalname);
      let public_path = write_path.replace('public/images/', '../');
      
      fse.outputFileSync(write_path, foto_perfil.buffer);
      
      var imagem = public_path
      
      new_user.imagem = imagem

      let img = old_user.imagem
      let foto =  img.replace(/\.\.\//, "");
      
      let delete_path = 'public/images/' + foto
      removeDir(delete_path)
    }
    catch (err) {
      console.error(err);
    }
  }
  
  new_user._id = id
  try {
    const updatedUser = await User.updateUser(new_user);
    if (new_password) {
      await new Promise((resolve, reject) => {
        updatedUser.setPassword(new_password, (err_setPassword, user) => {
          if (err_setPassword) {
            reject(err_setPassword);
          } 
          else {
            resolve(user);
          }
        });
      });
      await updatedUser.save();
    }
    var jwt_user = {
      _id: new_user._id, 
      username: new_user.username, 
      level: req.user.level,
    }
    const token = await new Promise((resolve, reject) => {
      jwt.sign(jwt_user, 'MapaRuasJWT', { expiresIn: 1800 }, (err_jwt, token) => {
        if (err_jwt) {
          reject(err_jwt);
        } 
        else {
          resolve(token);
          res.jsonp({ user: jwt_user, token: token });
        }
      });
    });
  } 
  catch (err) {
    res.status(607).jsonp({ error: 'Erro ao atualizar o utilizador: ' + err });
  }
})


module.exports = router;
