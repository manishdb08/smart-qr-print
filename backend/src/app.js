const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const { globalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allows inline previews in dev/kiosk if needed
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN,
  credentials: true
}));

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(globalLimiter);

// Silence favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health and Readiness probes (supports both /health and /api/health)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'SMART QR PRINT Backend',
    team: 'VisionX Debug (Gufran, Kunal, Nirmiti, Mahek)'
  });
});

app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    database: {
      healthy: true,
      type: 'sqlite'
    }
  });
});

// Swagger & OpenAPI Docs endpoint (supports both /docs and /docs/json)
app.get('/docs/json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Smart QR Print System API',
      version: '2.0.0',
      description: 'API documentation for SMART QR PRINT self-service kiosk system'
    },
    paths: {
      '/v1/qr-sessions': {
        post: { summary: 'Create or look up QR pairing session' }
      },
      '/v1/printers/{printerId}': {
        get: { summary: 'Get printer status and supplies' }
      },
      '/api/health': {
        get: { summary: 'Health check' }
      },
      '/api/assistant': {
        post: { summary: 'AI print intent analysis' }
      },
      '/api/pricing/calculate': {
        post: { summary: 'Authoritative server pricing calculation' }
      }
    }
  });
});

app.get('/docs', (req, res) => {
  res.json({
    message: 'Smart QR Print Documentation',
    spec: '/docs/json',
    health: '/health',
    ready: '/ready',
    api: '/api'
  });
});

// Root greeting & meta endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'SMART QR PRINT API',
    team: 'VisionX Debug (Gufran, Kunal, Nirmiti, Mahek)',
    domain: 'HealthTech · Software / Hardware',
    status: 'online',
    version: '2.0.0',
    documentation: '/api/health'
  });
});

// Mount all API routers under /api
app.use('/api', routes);

// 404 Catch-all handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
