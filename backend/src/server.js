const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const config = require('./config');
const { initDatabase, getDb } = require('./config/database');
const { sweepExpiredSessions } = require('./services/session.service');
const logger = require('./utils/logger');

// Initialize database & seed kiosks
initDatabase();

const server = app.listen(config.PORT, config.HOST, () => {
  logger.info(`🚀 SMART QR PRINT Server is running on http://${config.HOST}:${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Health check: http://${config.HOST}:${config.PORT}/api/health`);
});

// Periodic session sweep every 5 minutes
const sweepInterval = setInterval(() => {
  try {
    sweepExpiredSessions();
  } catch (err) {
    logger.error('Error during scheduled session sweep', err);
  }
}, 5 * 60 * 1000);

// Graceful shutdown handling
let isShuttingDown = false;
function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}. Gracefully shutting down SMART QR PRINT server...`);
  clearInterval(sweepInterval);

  server.close(() => {
    logger.info('HTTP server closed.');
    try {
      const db = getDb();
      if (db) {
        db.close();
        logger.info('SQLite database connection closed.');
      }
    } catch (err) {
      logger.error('Error closing database', err);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception captured:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;
