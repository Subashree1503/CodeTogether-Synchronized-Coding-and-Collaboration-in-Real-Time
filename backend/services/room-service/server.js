const express = require('express');
const app = express();
app.use(express.json());

const rooms = {};

app.post('/create-room', (req, res) => {
  const { roomId, username } = req.body;
  if (!roomId || !username) return res.status(400).send('Room ID and username are required');
  if (rooms[roomId]) return res.status(400).send('Room already exists');
  rooms[roomId] = [username];
  res.status(201).send({ message: 'Room created successfully', roomId });
});

app.post('/join-room', (req, res) => {
  const { roomId, username } = req.body;
  if (!roomId || !username) return res.status(400).send('Room ID and username are required');
  if (!rooms[roomId]) return res.status(404).send('Room not found');
  rooms[roomId].push(username);
  res.send({ message: 'Joined room successfully', roomId });
});

app.listen(5050, () => console.log('Room Service running on port 5050'));
