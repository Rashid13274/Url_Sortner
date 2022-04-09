const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  urlCode:{
    type: String,
    required:true,
    unique:true
  },
  longUrl:{
    type: String,
    required:true,
    unique:true
  },shortUrl:{
    type: String,
    required:true,
    unique:true
  },
  

  date: { type: String, default: Date.now }
});

module.exports = mongoose.model('Url', urlSchema);