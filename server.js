require("dotenv").config();
const express = require('express');
const app = express();
const fs = require('fs');
const usermodel = require('./DB');
const docsModel = require('./New-DB');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const sharp = require('sharp');
const redis = require('redis');
const PORT = process.env.PORT || 3210;

app.use(express.static(path.join(__dirname, 'design')));
app.use(cookieParser());
const secretkey = 'Adarsh111@';

//middleware to verify token
const verifyToken = (req, res, next) => {
    let token = req.cookies.token;
    try {
        let decoded = jwt.verify(token, secretkey);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log('Error: verifyToken shows error');
        return res.redirect('/create');
    }
}

// set-up multer to store files in 
const storage = multer.memoryStorage();
function fileFilter(req, file, cb){
    let extnames = ['.png', '.jpg', '.jpeg', '.webp'];
    let ext = path.extname(file.originalname);
    let included = extnames.includes(ext);

    if(included){
        cb(null, true);
    }
    else{
        cb(new Error('file not found'), false);
    }
}

const upload = multer({storage, fileFilter, limits: {fileSize: 6*1024*1024}});


const client = redis.createClient({
    username: 'default',
    password: 'I9UGyRIJOkorf8t9hBT3jdeCxMx9gXFC',
    socket: {
        host: 'redis-18474.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18474
    }
});

client.on('connect', () => {console.log('Redis connected')});
client.on('error', (error) => {console.log('redis error : ', error)});

client.connect();


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.get('/details', (req, res) => {
    res.render('docs');
})
app.post('/docs', upload.single('photo'), async (req, res) => {
    let newbuffer = req.file.buffer;
    try{
        if(newbuffer > 1*1024*1024){
            newbuffer = await sharp(req.file.buffer).resize(1920).toBuffer()
        }
        let { name, email, contact } = req.body;
        let docs = await docsModel.create({name, email, contact, photo: newbuffer});
        console.log('you have submitted the document successfully.');
        
        res.send('you have submitted the document successfully.')
    }
    catch(err){
        console.log('Error: please check docs route.', err); 
    }
})


app.get('/show', async (req, res) => {
    let files = await docsModel.find();
    res.render('show', {files});
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/create', (req, res) => {
    res.render('createaccount');
})
app.post('/sing-up', async (req, res) => {

    try {
        let { name, email, password } = req.body;
        let salt = await bcrypt.genSalt(8);
        let encrypt = await bcrypt.hash(password, salt);
        let enrty = await usermodel.data.create({ name, email, password: encrypt });
        res.redirect('/login');
        console.log("sign-up successfully");

    }
    catch (error) {
        console.log('Error: something went wrong');
        res.send('Error');
    }
})
app.post('/logged-in', async (req, res) => {
    try {
        let { email, password } = req.body;

        let user = await usermodel.data.findOne({ email });
        if (!user) {
            return console.log("Error: Email doesn't match. ");
        }
        let result = await bcrypt.compare(password, user.password);
        if (!result) {
            return console.log("Error: Password is incorrect. ");
        }


        const jwtToken = jwt.sign({ email: user.email, id: user._id, iss: 'motionkartstudio.com', }, secretkey);
        res.cookie('token', jwtToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        console.log(jwtToken);

        let decoded = jwt.decode(jwtToken, secretkey);
        console.log(decoded);



        console.log('logged-in successfully');
        res.redirect('/dashboard');

    }
    catch (error) {
        console.log('Error: logged-in Data');
    }
})
app.get('/dashboard', verifyToken, async (req, res) => {
    try {
        let view = await usermodel.list.find({}, 'filename -_id');
        view = view.map(file => file.filename); // Extract only the filenames
        res.render('dashboard', { view });
    }
    catch {
        console.log('Error: check dashboard folder');
    }

})
app.get('/createfile', verifyToken, (req, res) => {
    res.render('createfile');
})
app.post('/save', verifyToken, async (req, res) => {
    try {
        console.log(req.body);
        let { filename, description } = req.body;
        const user = await usermodel.list.create(req.body);
        console.log('Data saved');
        res.redirect('/dashboard');
    }
    catch {
        console.log('Error: check your save file, Data not saved');
    }
})
app.get('/open/:filename', verifyToken, async (req, res) => {
    try {
        let filename = req.params.filename;
        const user = await usermodel.list.findOne({ filename: filename });
        const filedata = { filename: user.filename, description: user.description };
        res.render('openfile', { file: filedata });
    }
    catch (err) {
        res.send('Error: Open filename shows err.');
        console.log('Error: Open filename shows err.');
    }
})
app.get('/delete/:filename', verifyToken, async (req, res) => {
    try {
        let filename = req.params.filename;
        const deleteduser = await usermodel.list.findOneAndDelete({ filename: filename });
        res.redirect('/dashboard');
    }
    catch {
        res.send('Error: Delete filename shows err.');
        console.log('Error: Delete filename shows err.');
    }
})



app.listen(PORT);