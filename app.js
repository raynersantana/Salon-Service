require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const Auth = require('./firebase.js');
const ejs = require('ejs');
var goToRegister;
let userLogged;

var verifyLogin = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if(user){
            userLogged = user
        } else {
            userLogged = null
        }
    });
}

const app = express()
app.set('view engine', 'ejs');
var publicDir = require('path').join(__dirname,'/public');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/style', express.static(__dirname + '/style/')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/vendor/css'));

app.get('/', (req, res) => {
    verifyLogin();
    if(userLogged){
        res.redirect('/dashboard');
    }else{
        res.render('index');
    }
})

app.post('/createuser', (req, res) => {
    Auth.SignUpWithEmailAndPassword(req.body.email,req.body.password).then((user) => {
       if(!user.err){
        res.redirect('/dashboard')
       }else{
          return user.err
       }
   })
  })

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/login', (req, res) => {
    if(goToRegister){
        res.redirect('register')
        goToRegister = false;
    }else{
        let getBody = req.body;
        Auth.SignInWithEmailAndPassword(getBody.email, getBody.password)
        .then((login) => {
            if(!login.err){
                res.redirect('/dashboard')
            }else{
                res.redirect('/')
            }
        })
    }
})

app.post('/input', (req, res) => {
    let {name} = req.body
    Auth.InputData(name).then(() => {
        res.render('dashboard')
    })
})

app.get('/dashboard', function(req, res){
    if(userLogged){
        Auth.GetData().then((data) => {
            res.render('dashboard', {data});
        })
    }else{
        res.redirect('/')
    }
});

function goToRegister(){
    goToRegister = true;
}

app.listen(process.env.PORT || 3000)