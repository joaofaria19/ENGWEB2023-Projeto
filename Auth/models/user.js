const mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    _id: String,
    imagem: String,
    username: {
      type: String,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      unique:true,
      sparse: true
    },
    google_id: {
      type: String,
      unique: true,
      sparse: true
    },
    regist: String,
    affiliation: String,
    level: String,
    dateCreated: String,
    active: Boolean
  });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema)