const mongoose = require('mongoose');


const document = new mongoose.Schema({
   name: String,
   email: String,
   contact: Number,
   photo: Buffer
})
module.exports = mongoose.model('docs', document);