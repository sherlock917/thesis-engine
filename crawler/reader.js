var fs = require('fs')
  , mongoose = require('mongoose')
  , Brief = require('./models/Brief')

mongoose.connect('mongodb://localhost/ThesisEngine')

var count = 0

Brief.find(function (err, data) {
  console.log((new Date()) + ' -- start')
  for (var i = 0; i < data.length; i++) {
    fs.appendFile('result.txt', JSON.stringify(data[i]) + '\r\n', function (err) {
      count++
      if (count >= data.length) {
        console.log((new Date()) + ' -- done')
        mongoose.disconnect()
      }
    })
  }
})