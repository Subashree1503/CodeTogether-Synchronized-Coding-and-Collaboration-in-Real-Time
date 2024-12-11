// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// // const redis = require('redis');

// const app = express();

// // // Redis connection for caching or session management
// // const redisClient = redis.createClient({ url: 'redis://redis.default.svc.cluster.local:6379' });
// // redisClient.connect().then(() => {
// //   console.log('Connected to Redis from API Gateway!');
// // }).catch((err) => {
// //   console.error('Error connecting to Redis:', err);
// // });

// app.use('/user', createProxyMiddleware({ target: 'http://user-service:3300', changeOrigin: true }));
// app.use('/room', createProxyMiddleware({ target: 'http://room-service:3400', changeOrigin: true }));
// app.use('/code', createProxyMiddleware({ target: 'http://code-service:3500', changeOrigin: true }));
// app.use('/socket', createProxyMiddleware({target: 'http://socket-service:3200', ws: true, changeOrigin: true}));


// app.listen(3100, () => console.log('API Gateway running on port 3100'));

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const client = require('prom-client');

const app = express();

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics, e.g., HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'api_gateway_http_requests_total',
  help: 'Total number of HTTP requests handled by the API gateway',
  labelNames: ['method', 'path'],
  register: [register],
});

// Proxy middleware and metrics increment
const proxyMiddleware = (target, path) => {
  app.use(path, (req, res, next) => {
    httpRequestCounter.inc({
      method: req.method,
      path: req.path,
    });
    next();
  }, createProxyMiddleware({ target, changeOrigin: true }));
};

// Setup proxy routes
proxyMiddleware('http://user-service:3300', '/user');
proxyMiddleware('http://room-service:3400', '/room');
proxyMiddleware('http://code-service:3500', '/code');
proxyMiddleware('http://socket-service:3200', '/socket', true);  // Assuming websocket support as before

// Metrics endpoint
// app.get('/metrics', (req, res) => {
//   res.set('Content-Type', register.contentType);
//   res.send(register.metrics());
// });

app.get('/metrics', (req, res) => {
    register.metrics().then(metrics => {
      console.log(metrics);  // Log metrics to console for inspection
      res.set('Content-Type', register.contentType);
      res.send(metrics);
    }).catch(err => {
      console.error('Error getting metrics', err);
      res.status(500).send('Error getting metrics');
    });
  });
  

// Start the server
app.listen(3100, () => console.log('API Gateway running on port 3100'));
