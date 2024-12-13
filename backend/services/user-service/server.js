const express = require('express');
const app = express();
const cors = require('cors');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');
const promClient = require('prom-client'); // Prometheus client

// Prometheus Metrics Registry
const register = new promClient.Registry();

// Enable collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom Metrics
const usernamesCreatedCounter = new promClient.Counter({
  name: 'user_service_usernames_created_total',
  help: 'Total number of usernames created successfully',
});
register.registerMetric(usernamesCreatedCounter);

const usernameCreationErrorsCounter = new promClient.Counter({
  name: 'user_service_username_creation_errors_total',
  help: 'Total number of errors during username creation',
});
register.registerMetric(usernameCreationErrorsCounter);

// Redis client
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
    if (exists) {
      res.status(400).send('Username already exists');
      return;
    }

    await client.hSet(`USER:${username}`, { username });
    usernamesCreatedCounter.inc(); // Increment counter for successful username creation
    res.status(201).send({ message: 'Username created successfully' });
  } catch (err) {
    usernameCreationErrorsCounter.inc(); // Increment error counter
    console.error(redBright('Error setting username:', err));
    res.status(500).send('Failed to set username');
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
app.listen(3300, () => {
  console.log(blueBright.bold('User Service running on port 3300'));
});