const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const promClient = require('prom-client'); // Prometheus client

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

// Prometheus Metrics Registry
const register = new promClient.Registry();

// Enable collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom Metrics
const activeConnectionsGauge = new promClient.Gauge({
  name: 'code_service_active_connections',
  help: 'Number of active WebSocket connections',
});
register.registerMetric(activeConnectionsGauge);

const eventsEmittedCounter = new promClient.Counter({
  name: 'code_service_events_emitted_total',
  help: 'Total number of events emitted',
  labelNames: ['event'],
});
register.registerMetric(eventsEmittedCounter);

const connectionErrorsCounter = new promClient.Counter({
  name: 'code_service_connection_errors_total',
  help: 'Total number of connection errors',
});
register.registerMetric(connectionErrorsCounter);

// Track active connections
let activeConnections = 0;

// WebSocket logic
io.on('connection', (socket) => {
  activeConnections++;
  activeConnectionsGauge.set(activeConnections);
  console.log('A user connected');

  // Handle JOIN_ROOM event
  socket.on('JOIN_ROOM', ({ roomId, username }) => {
    try {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(username);
      io.to(roomId).emit('USER_JOINED', rooms[roomId]);
      eventsEmittedCounter.inc({ event: 'USER_JOINED' }); // Increment event counter
    } catch (err) {
      console.error('Error in JOIN_ROOM:', err);
      connectionErrorsCounter.inc(); // Increment error counter
    }
  });

  // Handle CODE_CHANGED event
  socket.on('CODE_CHANGED', ({ roomId, code }) => {
    try {
      io.to(roomId).emit('CODE_CHANGED', code);
      eventsEmittedCounter.inc({ event: 'CODE_CHANGED' }); // Increment event counter
    } catch (err) {
      console.error('Error in CODE_CHANGED:', err);
      connectionErrorsCounter.inc(); // Increment error counter
    }
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    activeConnections--;
    activeConnectionsGauge.set(activeConnections);
    console.log('A user disconnected');
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
server.listen(3500, () => console.log('Code Collaboration Service running on port 3500'));
