require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const Auth = require('./firebase.js');
const ejs = require('ejs');
const $ = require("jquery");

//sms
const accountSid = 'ACf5b0a48acab6f23cbb16a0c9f29166e8';
const authToken = 'e819ab7d0575076b3b30df8daa2fdcb4';
const client = require('twilio')(accountSid, authToken);

var goToRegister;
var userLogged;
var userId;

//Infos do usuário
var name, phone, email;

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
            firebase.database().ref(`users/${user.uid}`).once("value", snapshot => {
                if (snapshot.exists()){
                    const userData = snapshot.val();
                    console.log("Existe!", userData)
                    name = userData.name;
                    email = userData.email;
                    phone = userData.phone;
                 }else{
                     console.log('Usuário enviado ao db')
                        firebase.database().ref('users').child(user.uid).set({
                            name: name,
                            phone: phone,
                            email: email
                    });
                 }
             })
             .catch(function(error) {
                 console.log('Erro no verifyLogin' + error);
             })
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
        name = req.body.name;
        phone = req.body.phone;
        email = req.body.email;
        console.log(req.body);
        res.redirect('/dashboard')
       }else{
          res.redirect('/')
       }
   }).catch(function(error) {
    console.log('error ao criar usuário ' + error);
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
        console.log('Código do usuário: ' + userLogged.uid)
        let getBody = req.body;    
        let clientHour = getBody.hour.substring(0,2);
        let clientMin = getBody.hour.substring(3,5);
        let clientDay = getBody.date.substring(0,2);
        let clientMonth = getBody.date.substring(3,5);
        let clientYear = getBody.date.substring(6,10);
        // let pathToGlory = 'schedules/' + clientDay + '-' + clientMonth + '-' + clientYear + '/' + clientHour;
        
        if(clientDay != systemDay){
            console.log('Dia escolhido diferente do sistema!')
            firebase.database().ref('schedules/').child(userLogged.uid).child(clientDay + '-' + clientMonth + '-' + clientYear).child(clientHour).set({
                user: userLogged.uid,
                name: name,
                phone: phone,
                email: email
            })
            //Iniciando envio do sms
            client.messages
                .create({
                    body: `Olá ${name}, está é uma mensagem automática do Salon Service. Apenas para confirmar que o agendamento foi um sucesso ;)`,
                    from: '+12018174032',
                    to: `+55${phone}`
                })
                .then(message => console.log(message.sid))
                .catch(function(error) {
                    console.log('Erro ao enviar o sms' + error);
                })
            res.redirect('/dashboard');
        }else{
            console.log('deu merda')
        }
    }else{
        console.log('não logado')
    }
})

//Rota para direcionar à página de consulta dos agendamentos
app.get('/mySchedules', function(req, res){
    firebase.database().ref(`schedules/${userLogged.uid}`).once("value", snapshot => {
        if (snapshot.exists()){
            var scheduleData = snapshot.val();
            console.log("Existe!", scheduleData)
        }
    })
res.render('mySchedules', {item: JSON.stringify(scheduleData)});
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