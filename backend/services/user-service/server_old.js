const express = require('express');
const app = express();
const cors = require('cors');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');

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
app.use(json());
app.use(cors());

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
app.listen(3300, () => {
  console.log(blueBright.bold('User Service running on port 3300'));
});
