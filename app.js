require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const firebase = require('firebase');
const Auth = require('./firebase.js');

let userLogged;
const app = express();
var publicDir = require('path').join(__dirname, '/public');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(publicDir));
app.use('/', express.static(__dirname + '/www'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
// app.use('/style', express.static(__dirname + '/style/'));
app.set('view engine', 'ejs');

firebase.auth().onAuthStateChanged((user) => {
    if(user){
        userLogged = user
    }else{
        userLogged = null
    }
})

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/cadastro', (req, res) => {
    Auth.SignUpWithEmailAndPassword(req.body.email, req.body.password)
    .then((user) => {
        if(!user.err){
            let userData = JSON.parse(user)
            userData = userData.user
            Auth.insertUserData(userData).then(() => {
                res.redirect('/dashboard')
            })
        }else{
            return user.err
        }
    })
})

app.post('/login', (req, res) => {
    let getBody = req.body;
    Auth.SignInWithEmailAndPassword(getBody.email, getBody.password)
    .then((login) => {
        if(!login.err){
            res.redirect('/dashboard')
        }else{
            res.redirect('/')
        }
    })
})

app.get('/dashboard', function(req, res){
    if(userLogged){
        res.render('dashboard', {user: user, snapshot: snapshot});
    }else{
        res.redirect('/')
    }
})

app.listen(3000);