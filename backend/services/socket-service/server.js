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

const promClient = require('prom-client'); // Prometheus client

// Prometheus Metrics Registry
const register = new promClient.Registry();

// Enable collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom Metrics
const activeConnectionsGauge = new promClient.Gauge({
  name: 'socket_service_active_connections',
  help: 'Number of active WebSocket connections',
});
register.registerMetric(activeConnectionsGauge);

const eventsReceivedCounter = new promClient.Counter({
  name: 'socket_service_events_received_total',
  help: 'Total number of events received by the Socket.IO server',
  labelNames: ['event'],
});
register.registerMetric(eventsReceivedCounter);

const eventsEmittedCounter = new promClient.Counter({
  name: 'socket_service_events_emitted_total',
  help: 'Total number of events emitted by the Socket.IO server',
  labelNames: ['event'],
});
register.registerMetric(eventsEmittedCounter);

// Connect to Redis
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

// Track active connections
let activeConnections = 0;

// Socket.io connection logic
io.on('connection', (socket) => {
  activeConnections++;
  activeConnectionsGauge.set(activeConnections);
  console.log(greenBright(`User connected: ${socket.id}`));

  // Increment received events counter for each event
  socket.onAny((event) => {
    eventsReceivedCounter.inc({ event });
  });

  // Handle "CODE_CHANGED" event
  socket.on('CODE_CHANGED', async (code) => {
    const { roomId } = await client.hGetAll(socket.id);
    const roomName = `ROOM:${roomId}`;

    if (roomId) {
      socket.to(roomName).emit('CODE_CHANGED', code);
      eventsEmittedCounter.inc({ event: 'CODE_CHANGED' }); // Increment emitted events counter
    }
  });

  // Handle "CONNECTED_TO_ROOM" event
  socket.on('CONNECTED_TO_ROOM', async ({ roomId, username }) => {
    const roomName = `ROOM:${roomId}`;
    console.log(`Adding ${username} to room: ${roomId}`);

    try {
      // Add user to Redis
      await client.lPush(`${roomId}:users`, JSON.stringify({ username, socketId: socket.id }));
      await client.hSet(socket.id, { roomId, username });

      // Get all users in the room
      const users = (await client.lRange(`${roomId}:users`, 0, -1)).map(JSON.parse);

      // Join the room and notify all users
      socket.join(roomName);
      io.in(roomName).emit('ROOM:CONNECTION', users);
      eventsEmittedCounter.inc({ event: 'ROOM:CONNECTION' }); // Increment emitted events counter
    } catch (err) {
      console.error('Error handling CONNECTED_TO_ROOM:', err);
    }
  });

  // Handle "disconnect" event
  socket.on('disconnect', async () => {
    activeConnections--;
    activeConnectionsGauge.set(activeConnections);

    const { roomId, username } = await client.hGetAll(socket.id);

    if (!roomId) return;

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
    eventsEmittedCounter.inc({ event: 'ROOM:CONNECTION' }); // Increment emitted events counter

    console.log(redBright(`${username} disconnected from room: ${roomId}`));
  });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.send(metrics);
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).send('Error fetching metrics');
  }
});

// Start the server
server.listen(3200, () => {
  console.log(greenBright.bold('Listening on *:3200'));
});