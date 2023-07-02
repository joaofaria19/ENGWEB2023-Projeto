var jwt = require('jsonwebtoken')

module.exports.verificaAdmin = function (req, res, next){
    var myToken = req.cookies.token
    if(myToken){
      jwt.verify(myToken, "MapaRuasJWT", function(err, payload){
        if(err){
            res.status(401).render('gotologin');
        }
        else{
            req.user = payload;
            if(payload.level == 'administrador')
                next()
            else
                res.status(401).render('error', {message:"Página restrita a administradores"});
                
        }
      })
    }
    else{
        res.status(401).render('gotologin');
    }
}

module.exports.verificaUser = function (req, res, next){
    var myToken = req.cookies.token
    if(myToken){
      jwt.verify(myToken, "MapaRuasJWT", function(err, payload){
        if(err){
            res.status(401).render('gotologin');
        }
        else{
          req.user = payload;
          next()
        }
      })
    }
    else{
        res.status(401).render('gotologin');
    }
}