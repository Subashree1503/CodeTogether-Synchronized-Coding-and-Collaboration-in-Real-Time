const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
const { blueBright, greenBright, redBright } = require('chalk');

const { createClient } = require('redis');

const client = createClient({
  url: 'redis://redis.default.svc.cluster.local:6379',
});

client.connect()
  .then(() => {
    console.log('Connected to Redis');
  })
  .catch((err) => {
    console.error('Redis connection error:', err);
  });


  client.on('error', (err) => {
    console.error('Redis connection error:', err.message || err);
  });

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
  // socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
  //   const roomName = `ROOM:${roomId}`;

  //   // Add user to Redis with socketId
  //   await client.lPush(`${roomId}:users`, JSON.stringify({ username, socketId: socket.id }));
  //   await client.hSet(socket.id, { roomId, username });

  //   // Get all users in the room
  //   const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);

  //   // Join the room and notify all users
  //   socket.join(roomName);
  //   io.in(roomName).emit('ROOM:CONNECTION', users);

  //   console.log(blueBright(`${username} connected to room: ${roomId}`));
  // });

  socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
    const roomName = `ROOM:${roomId}`;
    console.log(`Adding ${username} to room: ${roomId}`);
  
    try {
      // Add user to Redis
      await client.lPush(`${roomId}:users`, JSON.stringify({ username, socketId: socket.id }));
      console.log(`User ${username} added to Redis`);
  
      await client.hSet(socket.id, { roomId, username });
      console.log(`Socket ID ${socket.id} associated with user ${username}`);
  
      // Get all users in the room
      const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);
      console.log(`Users in room ${roomId}:`, users);
  
      // Join the room and notify all users
      socket.join(roomName);
      io.in(roomName).emit('ROOM:CONNECTION', users);
  
      console.log(blueBright(`${username} connected to room: ${roomId}`));
    } catch (err) {
      console.error('Error handling CONNECTED_TO_ROOM:', err);
    }
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
