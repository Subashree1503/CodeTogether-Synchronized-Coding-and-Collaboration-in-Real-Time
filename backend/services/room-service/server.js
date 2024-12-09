const express = require('express');
const app = express();
const { createClient } = require('redis');

const cors = require('cors');
const { v4 } = require('uuid');
const moment = require('moment');
const { json } = require('body-parser');
const { blueBright, redBright } = require('chalk');


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
