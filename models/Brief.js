var mongoose = require('mongoose')

var briefSchema = mongoose.Schema({
  title : String,
  author : String,
  institute : String,
  journal : String,
  issue : String,
  abstract : String,
  link : String
})

var Brief = mongoose.model('Brief', briefSchema)

module.exports = Brief