const express = require('express');
const app = express();
const { createClient } = require('redis');

const cors = require('cors');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');


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

// const client = createClient({
//   url: 'redis://redis.default.svc.cluster.local:6379'
// });
app.use(json());
app.use(cors());

// // Handle Redis connection errors
// client.on('error', console.error);
// client
//   .connect()
//   .then(() => console.log(blueBright.bold('Connected to Redis for Room Service!')))
//   .catch(() => {
//     console.error(redBright.bold('Error connecting to Redis in Room Service'));
//   });

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
app.listen(3400, () => {
  console.log(blueBright.bold('Room Service running on port 3400'));
});
