const express = require('express');
const app = express();
const { createClient } = require('redis');
const cors = require('cors');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');
const promClient = require('prom-client'); // Prometheus client

// Prometheus Metrics Registry
const register = new promClient.Registry();

// Enable collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom Metrics
const roomsCreatedCounter = new promClient.Counter({
  name: 'room_service_rooms_created_total',
  help: 'Total number of rooms created',
});
register.registerMetric(roomsCreatedCounter);

const roomCreationErrorsCounter = new promClient.Counter({
  name: 'room_service_room_creation_errors_total',
  help: 'Total number of errors during room creation',
});
register.registerMetric(roomCreationErrorsCounter);

// Redis client
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

app.use(json());
app.use(cors());

// Endpoint to create a new room
app.post('/create-room-with-user', async (req, res) => {
  const { username } = req.body;
  const roomId = v4();

  try {
    await client.hSet(`${roomId}:info`, {
      created: moment().toISOString(),
      updated: moment().toISOString(),
    });

    roomsCreatedCounter.inc(); // Increment room creation counter
    res.status(201).send({ roomId });
  } catch (err) {
    roomCreationErrorsCounter.inc(); // Increment error counter
    console.error(redBright('Error creating room info:', err));
    res.status(500).send('Failed to create room');
  }
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
app.listen(3400, () => {
  console.log(blueBright.bold('Room Service running on port 3400'));
});