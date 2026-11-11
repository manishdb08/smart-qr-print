require('./setup-env');
const { initDatabase, getDb } = require('../src/config/database');

function setupTestDb() {
  const { db, statements } = initDatabase(':memory:');
  return { db, statements };
}

function teardownTestDb() {
  const db = getDb();
  if (db && db.open) {
    db.close();
  }
}

module.exports = {
  setupTestDb,
  teardownTestDb
};
