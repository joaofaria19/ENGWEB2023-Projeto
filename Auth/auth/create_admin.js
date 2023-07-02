const User = require('../controllers/user');
const userModel = require('../models/user');
const { v5: uuidv5, v4: uuidv4 } = require('uuid');

var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/MapaRuas';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

async function create_admin(username, email, password) {
  try {
    const new_user = {
      name:'admin',
      _id: '0000',
      imagem: "../default/admin.png",
      email: email,
      affiliation: 'Admin',
      level: 'administrador',
      dateCreated: new Date().toISOString().substring(0,16).replace('T',' '),
      active: true,
      username: username,
      regist: "local"
    };

    const user = await userModel.register(new userModel(new_user), password);
    console.log('Utilizador admin criado com sucesso:', user);

  } catch (error) {
    console.error('Erro ao criar utilizador admin:', error);
  }
}

const args = process.argv.slice(2);
let username = 'admin';
let email = 'admin@admin.com';
let password = 'admin';

if (args.length >= 3) {
  username = args[0];
  email = args[1];
  password = args[2];
}

create_admin(username, email, password)
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });