const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const redis = require('redis');

const app = express();

// // Redis connection for caching or session management
// const redisClient = redis.createClient({ url: 'redis://redis.default.svc.cluster.local:6379' });
// redisClient.connect().then(() => {
//   console.log('Connected to Redis from API Gateway!');
// }).catch((err) => {
//   console.error('Error connecting to Redis:', err);
// });

app.use('/user', createProxyMiddleware({ target: 'http://user-service:3300', changeOrigin: true }));
app.use('/room', createProxyMiddleware({ target: 'http://room-service:3400', changeOrigin: true }));
app.use('/code', createProxyMiddleware({ target: 'http://code-service:3500', changeOrigin: true }));
app.use('/socket', createProxyMiddleware({target: 'http://socket-service:3200', ws: true, changeOrigin: true}));


app.listen(3100, () => console.log('API Gateway running on port 3100'));
