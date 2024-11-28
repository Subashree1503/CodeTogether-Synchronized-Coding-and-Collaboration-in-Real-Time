const express = require('express');
const app = express();
app.use(express.json());

const users = {};

app.post('/set-username', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send('Username is required');
  if (users[username]) return res.status(400).send('Username already exists');
  users[username] = { username };
  res.status(201).send({ message: 'Username created successfully' });
});

app.listen(4000, () => console.log('User Service running on port 4000'));
