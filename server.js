var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var clk = require("chalk");

var config = JSON.parse(fs.readFileSync("config/config.json"));
var data = JSON.parse(fs.readFileSync("config/data.json"));
var show = false;

app.use('/control', express.static(__dirname + '/web/build/control'));
app.use('/overlay', express.static(__dirname + '/web/build/overlay'));

io.on('connection', function(socket) {
    socket.authed = false;
    console.log(clk.green.underline.bold(socket.handshake.address) + clk.green(" has connected"));
    console.log(clk.green('Waiting for authentification...'));
    socket.on('authenticate', function (password) {
        if (password === "qwerty") {
            socket.authed = true;
            console.log(clk.green('Successfully authenticated'));
            socket.emit('authenticate', true);
        } else {
            console.log(clk.red('Failed to authenticate'));
            socket.emit('authenticate', false);
        }
    });
    socket.on('disconnect', function() {
        console.log(clk.red.underline.bold(socket.handshake.address) + clk.red(" has disconnected"));
    });
    socket.on('setVisible', function(bool) {
        if (socket.authed) {
            show = bool;
            io.emit('visible', bool);
            console.log(clk.green('Set visibility to ' + bool));
        } else {
            console.log(clk.red('Not authed'));
        }
    });
    socket.on('getVisible', function() {
        socket.emit('visible', show);
    });
    socket.on('setData', function(newValue) {
        if (socket.authed) {
            data = newValue;
            io.emit('data', data);
            console.log(clk.green('Data updated!'));
        } else {
            console.log(clk.red('Not authed'));
        }
    });
    socket.on('getData', function() {
        socket.emit('data', data);
    });
    socket.on('saveToFile', function() {
        fs.writeFileSync("config/data.json", JSON.stringify(data));
    });
});

http.listen(config.port, function(){
    console.log('listening on *:' + config.port);
});
