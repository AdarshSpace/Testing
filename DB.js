const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;
mongoose.connect(mongoURL)
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.log('Error: something went wrong', err));


const khata = new mongoose.Schema({
   name: String,
   email: String,
   password: String,
})
const data = mongoose.model('user', khata);

const project = new mongoose.Schema({
   filename: String,
   description: { type: String },
})
const list = mongoose.model('Details',  project);

module.exports =  { data, list };
