var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var clk = require("chalk");

var config = JSON.parse(fs.readFileSync("config/config.json"));
var data = JSON.parse(fs.readFileSync("config/data.json"));
var show = false;
var connectedViews = [];
var visibleViews = {};

app.use('/control', express.static(__dirname + '/web/build/control'));
app.use('/overlay', express.static(__dirname + '/web/build/overlay'));

io.on('connection', function(socket) {
    socket.authed = false;
    console.log(clk.green.underline.bold(socket.handshake.address) + clk.green(" has connected"));
    console.log(clk.green('Waiting for authentification...'));
    socket.on('authenticate', function (password) {
        if (password === config.password) {
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
        if (connectedViews.indexOf(socket) !== -1) {
            connectedViews.splice(connectedViews.indexOf(socket), 1);
            console.log(clk.red.underline.bold(socket.viewName) + clk.red(" view is has disconnected"));
            var lastViewType = true;
            connectedViews.forEach(function (view) {
                if (view.viewName === socket.viewName) {
                    lastViewType = false;
                }
            });
            if (lastViewType) {
                delete visibleViews[socket.viewName];
                io.emit('visible', visibleViews);
            }
        }
    });

    socket.on('viewAvailable', function(viewName) {
        console.log(clk.blue.underline.bold(viewName) + clk.blue(" view is avalable"));
        socket.viewName = viewName;
        if (visibleViews[viewName] === undefined) {
            visibleViews[viewName] = false;
            io.emit('visible', visibleViews);
        }
        connectedViews.push(socket);
    });

    socket.on('setVisible', function(view) {
        if (socket.authed) {
            if (visibleViews[view.viewName] !== undefined) {
                visibleViews[view.viewName] = view.visible;
                io.emit('visible', visibleViews);
                console.log(clk.green('Set visibility to ' + view.visible));
            } else {
                console.log(clk.red('View not found'));
            }
        } else {
            console.log(clk.red('Not authed'));
        }
    });

    socket.on('getAll', function () {
        socket.emit('all', {"views": visibleViews, "data": data});
    });

    socket.on('getVisible', function() {
        socket.emit('visible', visibleViews);
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
