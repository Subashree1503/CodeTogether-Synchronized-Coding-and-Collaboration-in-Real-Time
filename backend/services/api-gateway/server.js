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
});

// Register the custom metric
register.registerMetric(httpRequestCounter);

// Middleware to count HTTP requests
app.use((req, res, next) => {
  httpRequestCounter.inc({
    method: req.method,
    path: req.originalUrl,
  });
  next();
});

// Proxy middleware
const proxyMiddleware = (target, path, ws = false) => {
  app.use(path, createProxyMiddleware({ target, changeOrigin: true, ws }));
};

// Setup proxy routes
proxyMiddleware('http://user-service:3300', '/user');
proxyMiddleware('http://room-service:3400', '/room');
proxyMiddleware('http://code-service:3500', '/code');
proxyMiddleware('http://socket-service:3200', '/socket', true); // WebSocket support

// Metrics endpoint
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
app.listen(3100, () => console.log('API Gateway running on port 3100'));
