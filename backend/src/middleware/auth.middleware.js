const crypto = require('crypto');
const config = require('../config');
const { UnauthorizedError } = require('../utils/errors');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers['x-admin-key'] || req.headers['authorization'];
  let providedKey = '';

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      providedKey = authHeader.slice(7).trim();
    } else {
      providedKey = authHeader.trim();
    }
  }

  if (!providedKey) {
    return next(new UnauthorizedError('Admin API key required in X-Admin-Key header'));
  }

  const expectedKey = config.ADMIN_API_KEY;

  // Constant-time comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  if (providedBuffer.length !== expectedBuffer.length) {
    return next(new UnauthorizedError('Invalid Admin API key'));
  }

  const isEqual = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  if (!isEqual) {
    return next(new UnauthorizedError('Invalid Admin API key'));
  }

  next();
}

module.exports = {
  adminAuthMiddleware
};
