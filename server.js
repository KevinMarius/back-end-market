var express = require('express');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var apiRouter = require('./apiRouter').Router;

var server = express();

// body parser configuration
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

server.get('/', function (req, res){
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('<h1>bonjour sur mon serveur</h1>');
});

server.use('/api/', apiRouter);

server.listen('8080', function () {
  console.log('server en ecoute et disponible sur le port 8080');
})