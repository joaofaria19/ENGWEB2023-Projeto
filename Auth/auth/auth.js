var jwt = require('jsonwebtoken')

module.exports.verificaAcesso = function (req, res, next){
    var myToken = req.headers.authorization
    if(myToken){
      jwt.verify(myToken, "MapaRuasJWT", function(err, payload){
        if(err){
          res.status(403).jsonp({error: err})
        }
        else{
          req.user = payload;
          next()
        }
      })
    }
    else{
      res.status(401).jsonp({error: "Token inexistente!"})
    }
}