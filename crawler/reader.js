var mongoose = require('mongoose')
  , Brief = require('./models/Brief')

mongoose.connect('mongodb://localhost/ThesisEngine')

Brief.find(function (err, data) {
  console.log(data.length)
})