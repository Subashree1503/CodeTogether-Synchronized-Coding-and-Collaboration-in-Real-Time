const express = require('express');
const app = express();
const { createClient } = require('redis');
const cors = require('cors');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');
const redisHost = process.env.REDIS_HOST || 'redis';  // Ensure 'redis' is used

const redis = require('redis');
const client = redis.createClient({
  host: 'redis.default.svc.cluster.local',
  port: 6379,
});

client.on('connect', () => {
  console.log(blueBright.bold('Connected to Redis'));
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Retry after a delay
  setTimeout(() => {
    client.connect();
  }, 10000);  // Retry after 5 seconds
});

// Middleware
app.use(json());
app.use(cors());

// app.get('/health', async (req, res) => {
//   try {
//     if (!client.isOpen) {
//       console.warn('Redis client is closed. Attempting to reconnect...');
//       await client.connect();
//     }
//     await client.ping();
//     res.status(200).send('OK');
//   } catch (err) {
//     console.error('Health check failed:', err);
//     res.status(500).send('Redis connection error');
//   }
// });

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
