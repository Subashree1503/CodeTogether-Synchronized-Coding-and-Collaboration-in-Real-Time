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
| socket-service | 3200 | 3200 |
| user-service | 3300 | 3300 |
| room-service | 3400 | 3400 |
| code-service | 3500 |	3500 |	

