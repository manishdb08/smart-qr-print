const { getStatements } = require('../config/database');
const { generateSessionId } = require('../utils/ids');
const { NotFoundError, ValidationError } = require('../utils/errors');
const config = require('../config');
const logger = require('../utils/logger');

async function createSession(kioskCode) {
  const { getKioskByCode, createSession: insertSession } = getStatements();
  const kiosk = getKioskByCode.get(kioskCode);

  if (!kiosk) {
    throw new NotFoundError(`No kiosk found with code: ${kioskCode}`);
  }

  if (kiosk.status === 'offline') {
    throw new ValidationError(`Kiosk ${kiosk.name} is currently offline for maintenance.`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.SESSION_TTL_MINUTES * 60 * 1000);

  const session = {
    id: generateSessionId(),
    kiosk_id: kiosk.id,
    kiosk_code: kiosk.code,
    status: 'active',
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    last_active_at: now.toISOString()
  };

  insertSession.run(session);
  logger.info(`Created active session ${session.id} for kiosk ${kiosk.code}`);

  return {
    ...session,
    kiosk: {
      id: kiosk.id,
      name: kiosk.name,
      location: kiosk.location,
      paperCount: kiosk.paper_count,
      tonerBlack: kiosk.toner_bw,
      tonerColor: kiosk.toner_color
    }
  };
}

async function getSessionById(sessionId) {
  const { getSession, getKioskById } = getStatements();
  const session = getSession.get(sessionId);

  if (!session) {
    throw new NotFoundError(`Session not found: ${sessionId}`);
  }

  const kiosk = getKioskById.get(session.kiosk_id);

  return {
    ...session,
    kiosk
  };
}

function sweepExpiredSessions() {
  const { sweepExpiredSessions: sweepStmt } = getStatements();
  const now = new Date().toISOString();
  const result = sweepStmt.run(now);
  if (result.changes > 0) {
    logger.info(`Swept ${result.changes} expired sessions from database.`);
  }
  return result.changes;
}

module.exports = {
  createSession,
  getSessionById,
  sweepExpiredSessions
};
