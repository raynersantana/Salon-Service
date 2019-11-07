const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

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

app.get('/', (req, res) => {
    res.render('index');
})

app.listen(3000);