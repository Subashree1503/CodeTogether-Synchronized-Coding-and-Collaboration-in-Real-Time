const express = require('express');
const app = express();
const { createClient } = require('redis');
const cors = require('cors');
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
// // Initialize Redis client
// const client = createClient({
//   url: 'redis://redis.default.svc.cluster.local:6379'
// });
app.use(json());
app.use(cors());

// // Handle Redis connection errors
// client.on('error', console.error);
// client
//   .connect()
//   .then(() => console.log(blueBright.bold('Connected to Redis for User Service!')))
//   .catch(() => {
//     console.error(redBright.bold('Error connecting to Redis in User Service'));
//   });

// Endpoint to set a username
app.post('/set-username', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send('Username is required');

  try {
    const exists = await client.exists(`USER:${username}`);
    if (exists) return res.status(400).send('Username already exists');

    await client.hSet(`USER:${username}`, { username });
    res.status(201).send({ message: 'Username created successfully' });
  } catch (err) {
    console.error(redBright('Error setting username:', err));
    res.status(500).send('Failed to set username');
  }
});

// Start the server
app.listen(4000, () => {
  console.log(blueBright.bold('User Service running on port 4000'));
});
