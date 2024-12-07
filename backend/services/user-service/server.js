const express = require('express');
const { createClient } = require('redis'); // Import the redis module
const cors = require('cors');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');

const app = express();

const client = createClient({
  url: 'redis://redis.default.svc.cluster.local:6379'
});


app.use(json());
app.use(cors());

// Handle Redis connection errors
client.on('error', (err) => {
  console.error(redBright.bold('Redis Client Error:', err));
});

client
  .connect()
  .then(() => console.log(blueBright.bold('Connected to Redis for User Service!')))
  .catch((err) => {
    console.error(redBright.bold('Error connecting to Redis in User Service:', err));
  });

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
