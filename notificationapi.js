var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var onSocketConnect = require('./OnSocketConnect');




server.listen(8000, function() {
    console.log("Server Started");
});


io.on('connection',onSocketConnect.bind(null, io));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');

});
