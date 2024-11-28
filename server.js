const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
const io = new Server(server);
const { createClient } = require('redis');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, greenBright, redBright } = require('chalk');

// Environment variables for Redis and app port
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const PORT = process.env.PORT || 3001;

// Initialize Redis client with environment variables
const client = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

app.use(json());
app.use(cors());

// Handle Redis connection errors
client.on('error', console.error);
client
  .connect()
  .then(() => console.log(blueBright.bold(`Connected to Redis at ${redisHost}:${redisPort}!`)))
  .catch(() => {
    console.error(redBright.bold('Error connecting to Redis'));
  });

// Base endpoint
app.get('/', (req, res) => {
  res.send({ msg: 'Welcome to the Collaborative Coding Platform!' });
});

// Create a new room with a user
app.post('/create-room-with-user', async (req, res) => {
  const { username } = req.body;
  const roomId = v4();

  try {
    await client.hSet(`${roomId}:info`, {
      created: moment().toISOString(),
      updated: moment().toISOString(),
    });

    res.status(201).send({ roomId });
  } catch (err) {
    console.error('Error creating room info:', err);
    res.status(500).send({ error: 'Failed to create room' });
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(greenBright(`User connected: ${socket.id}`));

  // Handle "CODE_CHANGED" event
  socket.on('CODE_CHANGED', async (code) => {
    try {
      const { roomId } = await client.hGetAll(socket.id);
      const roomName = `ROOM:${roomId}`;

      if (roomId) {
        socket.to(roomName).emit('CODE_CHANGED', code);
      }
    } catch (err) {
      console.error('Error broadcasting code changes:', err);
    }
  });

  // Handle "CONNECTED_TO_ROOM" event
  socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
    const roomName = `ROOM:${roomId}`;

    try {
      // Add user to Redis with socketId
      await client.lPush(`${roomId}:users`, JSON.stringify({ username, socketId: socket.id }));
      await client.hSet(socket.id, { roomId, username });

      // Get all users in the room
      const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);

      // Join the room and notify all users
      socket.join(roomName);
      io.in(roomName).emit('ROOM:CONNECTION', users);

      console.log(blueBright(`${username} connected to room: ${roomId}`));
    } catch (err) {
      console.error('Error connecting user to room:', err);
    }
  });

  // Handle "disconnect" event
  socket.on('disconnect', async () => {
    try {
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
    } catch (err) {
      console.error('Error handling user disconnect:', err);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(greenBright.bold(`Server running on port ${PORT}`));
});
