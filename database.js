require('dotenv').config()
const mongoose = require("mongoose");

const UserCredential = mongoose.model('UserCredential', new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true
  },
  email: String,
  password: String
}))

const favMovies = mongoose.model('favMovie', new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true
  },
  image: String,
  title: String,
  description: String
}))

const watchList = mongoose.model('watchList', new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true
  },
  image: String,
  title: String,
  description: String
}))

const UserDatas = mongoose.model('UserData', new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true
  },
  fav: [String],
  watchList: [String]
}))

module.exports = { UserCredential, UserDatas, favMovies, watchList }