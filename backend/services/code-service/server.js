const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('JOIN_ROOM', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(username);
    io.to(roomId).emit('USER_JOINED', rooms[roomId]);
  });

  socket.on('CODE_CHANGED', ({ roomId, code }) => {
    io.to(roomId).emit('CODE_CHANGED', code);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3500, () => console.log('Code Collaboration Service running on port 3500'));
