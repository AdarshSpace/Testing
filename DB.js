const mongoose = require('mongoose');
//const mongoURL = process.env.mongoURL;

const mongoURL = 'mongodb+srv://adarshspace:Adarsh79923@cluster0.h6vwm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURL)
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.log('Error: something went wrong', err));


const khata = new mongoose.Schema({
   name: {
      type: String,
      
   },
   email: {
      type: String,
      required: true
   },
   password: {
      type: String,
      required: true
   },
   folder: [{type: mongoose.Schema.Types.ObjectId, ref: 'details'}]

})
const data = mongoose.model('user', khata);



const project = new mongoose.Schema({

   user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user'
   },

   filename: {
      type: String,
      required: true
   },
   description: {
      type: String,
      required: true
   },
})
const list = mongoose.model('Details',  project);



module.exports =  { data, list };
