const express = require('express');
const app = express();
const { createClient } = require('redis');
const cors = require('cors');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');

// Initialize Redis client
const client = createClient({
  url: 'redis://redis.default.svc.cluster.local:6379',
});

client.on('connect', () => {
  console.log(blueBright.bold('Connected to Redis'));
});

client.on('error', (err) => {
  console.error(redBright.bold('Redis connection error:', err));
});

// Middleware
app.use(json());
app.use(cors());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check Redis connectivity
    await client.ping();
    res.status(200).send('OK');
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).send('Redis connection error');
  }
});

// Endpoint to create a new room
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
    console.error(redBright('Error creating room info:', err));
    res.status(500).send('Failed to create room');
  }
});

// Start the server
app.listen(5050, () => {
  console.log(blueBright.bold('Room Service running on port 5050'));
});
