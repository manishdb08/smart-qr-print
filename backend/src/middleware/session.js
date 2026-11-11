const { getStatements } = require('../config/database');
const { UnauthorizedError } = require('../utils/errors');
const config = require('../config');

function sessionMiddleware(options = { required: true }) {
  return (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId || req.body?.sessionId;

    if (!sessionId) {
      if (options.required) {
        return next(new UnauthorizedError('Valid X-Session-Id header is required'));
      }
      return next();
    }

    const { getSession, touchSession } = getStatements();
    const session = getSession.get(sessionId);

    if (!session) {
      if (options.required) {
        return next(new UnauthorizedError('Session does not exist or has expired'));
      }
      return next();
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now > expiresAt || session.status !== 'active') {
      return next(new UnauthorizedError('Session has expired. Please re-scan QR code.'));
    }

    // Touch session activity
    const newExpiresAt = new Date(now.getTime() + config.SESSION_TTL_MINUTES * 60 * 1000).toISOString();
    touchSession.run(now.toISOString(), newExpiresAt, sessionId);

    req.session = session;
    next();
  };
}

module.exports = sessionMiddleware;
