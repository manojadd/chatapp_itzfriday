const express = require('express')
    , app = express()
    , server = require('http').Server(app)
    , io = require('socket.io').listen(server)
    , client = require('./redisclient.js')
    , mongoose = require('mongoose')
    , socket = require('./sockets/socket.js');
const db = require('./../dbconnect.js');

//MongoDB Connection ---------->
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});



//Redis connection ---------->
client.on('connect', function() {
  console.log('Connected');
});

//Socket Server ---------->
server.listen(8000, function () {
  console.log('server started on  8000');
});

//Socket.io connection ---------->
io.on('connection', socket.bind(null, io));
