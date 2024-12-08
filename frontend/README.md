# Front Microservice

frontend/
├── public/
├── src/
│   ├── App.jsx
│   ├── components/
│   └── services/
│       └── api.js
├── package.json
├── Dockerfile
├── README.md

# Summary of Frontend Requests

## HTTP API Requests

| Component/Function | URL                                              | Method | Payload                       | Purpose                       |
|---------------------|--------------------------------------------------|--------|-------------------------------|-------------------------------|
| EnterName.jsx       | http://localhost:3100/room/create-room-with-user | POST   | { username }                  | Create a room for the user.  |
| api.js (createRoom) | http://localhost:3100/room/create-room           | POST   | { roomId, username }          | Create a room.               |
| api.js (joinRoom)   | http://localhost:3100/room/join-room             | POST   | { roomId, username }          | Join an existing room.       |

## WebSocket Events

| Component           | Event                 | Payload                       | Purpose                              |
|---------------------|-----------------------|-------------------------------|--------------------------------------|
| RealTimeEditor.jsx  | CONNECTED_TO_ROOM     | { roomId, username }          | Notify the server about a new room connection. |
| RealTimeEditor.jsx  | CODE_CHANGED          | { code }                      | Broadcast code changes to the room. |
| RealTimeEditor.jsx  | DISCONNECT_FROM_ROOM  | { roomId, username }          | Notify the server about a user disconnect. |
