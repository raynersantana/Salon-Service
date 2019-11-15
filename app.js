require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const Auth = require('./firebase.js');
const ejs = require('ejs');
const $ = require("jquery");
var goToRegister;
var userLogged;
var userId;

//Datas e horários
var d = new Date();
var n = d.toLocaleTimeString();
var systemHour = n.substring(0,2);
var systemMin = n.substring(3,5);
var systemDay = d.getDate();

function goToRegister(){
    goToRegister = true;
}

var verifyLogin = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if(user){
            userLogged = user
            userId = user.id
        } else {
            userLogged = null
            userId = null
        }
    });
}

const app = express()
app.set('view engine', 'ejs');
var publicDir = require('path').join(__dirname,'/public');

// Configurações básicas de layout e funcionamento
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/style', express.static(__dirname + '/style/')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/vendor/css'));
app.use('/images', express.static(__dirname + '/vendor/images'));
app.use('/js', express.static(__dirname + '/vendor/js'));

// Rota inicial
app.get('/', (req, res) => {
    verifyLogin();
    if(userLogged){
        res.redirect('/dashboard');
    }else{
        res.render('index');
    }
})

//Rota para criação de usuário
app.post('/createuser', (req, res) => {
    Auth.SignUpWithEmailAndPassword(req.body.email,req.body.password).then((user) => {
       if(!user.err){
        res.redirect('/dashboard')
       }else{
          res.redirect('/')
       }
   })
})

//Rota para redirecionamento à página de criação de usuário
app.get('/register', (req, res) => {
    res.render('register')
    goToRegister = false;
})

//Rota para efetuar login
app.post('/login', (req, res) => {
    let getBody = req.body;
    Auth.SignInWithEmailAndPassword(getBody.email, getBody.password)
    .then((login) => {
        if(!login.err){
            res.redirect('dashboard')
        }else{
            res.redirect('/register')
        }
    })
})

//Rota para efetuar o logout
app.post('/exit', (req, res) => {
    Auth.signOut().then(() => {
        res.redirect('/')
    })
})

//Rota para redirecionar para área de agendamento
app.get('/schedule', (req, res) => {
    verifyLogin();
    if(userLogged){
        res.render('schedule')
    }else{
        res.render('index');
    }
})

//Rota para criar um agendamento
app.post('/createSchedule', (req, res) => {
    verifyLogin();
    if(userLogged){
        console.log(userLogged.uid)    
        let getBody = req.body;    
        let clientHour = getBody.hour.substring(0,2);
        let clientMin = getBody.hour.substring(3,5);
        let clientDay = getBody.date.substring(0,2);
        let clientMonth = getBody.date.substring(3,5);
        let clientYear = getBody.date.substring(6,10);
        let pathToGlory = 'schedules/' + clientDay + '-' + clientMonth + '-' + clientYear + '/' + clientHour;
        
        if(clientDay != systemDay){
            firebase.database().ref('schedules/' + clientDay + '-' + clientMonth + '-' + clientYear + '/' + clientHour).push({
                user: userLogged.uid
            })
            res.redirect('/dashboard');
        }else{
            console.log('deu merda')
        }
    }else{
        console.log('não logado')
    }
})



//remover
app.post('/input', (req, res) => {
    let {name} = req.body
    Auth.InputData(name).then(() => {
        res.render('dashboard')
    })
})

app.get('/dashboard', function(req, res){
    if(userLogged){
        res.render('dashboard');
    }else{
        res.redirect('/')
    }
});

app.listen(process.env.PORT || 3000)