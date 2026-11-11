const { initDatabase, getDb, getStatements } = require('../config/database');

function ensureDb() {
  let db = getDb();
  if (!db) {
    const initialized = initDatabase();
    return initialized.db;
  }
  return db;
}

module.exports = {
  getDb: ensureDb,
  getStatements
};
