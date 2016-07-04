var port = process.env.PORT || 8080;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var vec3 = require('gl-matrix').vec3;

app.use(express.static('public'));

var players = [];

/* Main connection callback */
io.sockets.on('connection', function (socket) {
  console.log(
    'connected client sockid: ' +
    (socket.id).toString());

  var player = {
    id: socket.id,
    name: 'default',
    pos: vec3.create()
  };
  players.push(player);

  for (var i = 0; i < players.length; i++) {
    if (players[i] != player)
      socket.emit('add_user', players[i]);
  }

  console.log('Start send new user to all/exs');

  socket.emit('add_user', {
    id: null,
    name: player.name,
    pos: player.pos
  });
  socket.broadcast.emit('add_user', player);

  console.log('Sent new user to all/exs');

  socket.on('send_name', function (data) {
    console.log('Start changing name sockid: ' +
      (socket.id).toString() + ' ' +
      player.name);

    player.name = data;
    socket.broadcast.emit('send_name', {
      id: player.id,
      name: player.name
    });

    console.log('Changed name sockid: ' +
      (socket.id).toString() + ' ' +
      player.name)
  });

  socket.on('send_acceleration', function (data) {
    console.log('Start changing pos sockid: ' +
      (socket.id).toString());

    vec3.add(player.pos, player.pos, data);
    socket.emit('send_pos', {
      id: null,
      pos: player.pos
    });

    socket.broadcast.emit('send_pos', {
      id: player.id,
      pos: player.pos
    });

    console.log('Changed pos sockid: ' +
      (socket.id).toString() + '\n' +
      player.pos[0] + ' ' +
      player.pos[1] + ' ' +
      player.pos[2]);
  });

  socket.on('disconnect', function () {
    socket.broadcast.emit('rem_user', {
      id: player.id
    });

    var i = 0;

    while (i < players.length && players[i].id != player.id)
      i++;

    players.splice(i, 1);

    console.log('disconnected sockid: ' +
      (socket.id).toString());
  });
});

http.listen(port, function () {
  console.log('listening on port: ' + port.toString());
});
