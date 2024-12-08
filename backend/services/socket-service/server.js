const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('redis');
const { blueBright, greenBright, redBright } = require('chalk');

const redis = require('redis');
const client = redis.createClient({
  host: 'redis.default.svc.cluster.local',
  port: 6379,
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Retry after a delay
  setTimeout(() => {
    client.connect();
  }, 5000);  // Retry after 5 seconds
});




// // Initialize Redis client
// const client = createClient({
//   url: 'redis://redis.default.svc.cluster.local:6379'
// });
// app.use(cors());

// // Handle Redis connection errors
// client.on('error', console.error);
// client
//   .connect()
//   .then(() => console.log(blueBright.bold('Connected to Redis for Socket Service!')))
//   .catch(() => {
//     console.error(redBright.bold('Error connecting to Redis in Socket Service'));
//   });

// Initialize Socket.IO
const io = new Server(server);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(greenBright(`User connected: ${socket.id}`));

  // Handle "CODE_CHANGED" event
  socket.on('CODE_CHANGED', async (code) => {
    const { roomId } = await client.hGetAll(socket.id);
    const roomName = `ROOM:${roomId}`;

    if (roomId) {
      socket.to(roomName).emit('CODE_CHANGED', code);
    }
  });

  // Handle "CONNECTED_TO_ROOM" event
  socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
    const roomName = `ROOM:${roomId}`;

    // Add user to Redis with socketId
    await client.lPush(`${roomId}:users`, JSON.stringify({ username, socketId: socket.id }));
    await client.hSet(socket.id, { roomId, username });

    // Get all users in the room
    const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);

    // Join the room and notify all users
    socket.join(roomName);
    io.in(roomName).emit('ROOM:CONNECTION', users);

    console.log(blueBright(`${username} connected to room: ${roomId}`));
  });

  // Handle "disconnect" event
  socket.on('disconnect', async () => {
    const { roomId, username } = await client.hGetAll(socket.id);

    if (!roomId) return; // Exit if the user wasn't in a room

    const roomName = `ROOM:${roomId}`;
    const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);

    // Remove the disconnected user by socketId
    const newUsers = users.filter((user) => user.socketId !== socket.id);

    // Update Redis list
    await client.del(`${roomId}:users`);
    if (newUsers.length > 0) {
      await client.rPush(`${roomId}:users`, ...newUsers.map(JSON.stringify));
    }

    // Notify remaining users in the room
    io.in(roomName).emit('ROOM:CONNECTION', newUsers);

    console.log(redBright(`${username} disconnected from room: ${roomId}`));
  });
});

// Start the server
server.listen(3200, () => {
  console.log(greenBright.bold('Listening on *:3200'));
});
