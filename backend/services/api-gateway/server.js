const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/user', createProxyMiddleware({ target: 'http://user-service:4000', changeOrigin: true }));
app.use('/room', createProxyMiddleware({ target: 'http://room-service:5000', changeOrigin: true }));
app.use('/code', createProxyMiddleware({ target: 'http://code-service:6000', changeOrigin: true }));

app.listen(3000, () => console.log('API Gateway running on port 3000'));
