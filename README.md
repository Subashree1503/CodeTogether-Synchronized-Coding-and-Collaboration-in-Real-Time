# CodeTogether-Synchronized-Coding-and-Collaboration-in-Real-Time

# How to install & run it locally

```bash
$ cd CodeTogether-Synchronized-Coding-and-Collaboration-in-Real-Time
$ npm i 
$ npm run dev --- To run the app
$ node server.js -- To check if the app is running: Expected response "hi"

Service port numbers on kubernetes

| Service | Port | TargetPort |
| -------- | ------- | -------- |
| frontend | 80 | 80 |
| api-gateway | 3100 | 3100 |	
| code-service | 6000 |	6000 |	
| room-service | 5050 | 5050 |
| socket-service | 8081 | 3200 |
| user-service | 4000 | 4000 |