const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

function notFound(req, res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  logger.error(`[Error] ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    details: err.details
  });

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}

module.exports = {
  notFound,
  errorHandler
};
