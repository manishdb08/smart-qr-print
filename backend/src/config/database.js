const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./index');
const logger = require('../utils/logger');

let dbInstance = null;
let preparedStatements = null;

function initDatabase(dbPath = config.DB_PATH) {
  if (dbInstance) {
    return { db: dbInstance, statements: preparedStatements };
  }

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  logger.info(`Initializing SQLite database at: ${dbPath}`);
  dbInstance = new Database(dbPath);

  // WAL mode for superior concurrent read/write performance
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  createSchema(dbInstance);
  seedDefaultKiosks(dbInstance);

  preparedStatements = createPreparedStatements(dbInstance);

  return { db: dbInstance, statements: preparedStatements };
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kiosks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'online',
      paper_count INTEGER DEFAULT 500,
      max_paper INTEGER DEFAULT 500,
      toner_bw REAL DEFAULT 100.0,
      toner_color REAL DEFAULT 100.0,
      ip_address TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      kiosk_id TEXT NOT NULL,
      kiosk_code TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT,
      total_pages INTEGER DEFAULT 1,
      color_pages_json TEXT,
      bw_pages_json TEXT,
      fingerprint TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      kiosk_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      claim_pin TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      settings_json TEXT NOT NULL,
      pricing_json TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      current_page INTEGER DEFAULT 0,
      total_pages INTEGER NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'unpaid',
      payment_reference TEXT,
      error_message TEXT,
      fingerprint TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
      FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_pin ON jobs(claim_pin);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON jobs(fingerprint);
  `);
}

function seedDefaultKiosks(db) {
  const count = db.prepare('SELECT count(*) as count FROM kiosks').get().count;
  if (count === 0) {
    const seed = db.prepare(`
      INSERT INTO kiosks (id, name, location, code, status, paper_count, max_paper, toner_bw, toner_color, ip_address, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const defaultKiosks = [
      ['kiosk-01', 'VisionX Kiosk #01 (Central Library)', 'Campus Library, Ground Floor East Wing', 'LIB-4091', 'online', 420, 500, 88.0, 74.0, '192.168.1.101', now],
      ['kiosk-02', 'VisionX Kiosk #02 (Tech Hub)', 'Engineering Building B, 2nd Floor Commons', 'ENG-2044', 'online', 310, 500, 62.0, 91.0, '192.168.1.102', now],
      ['kiosk-03', 'VisionX Health Kiosk #03 (Medical Wing)', 'Health Sciences Clinic, Lobby A', 'MED-7712', 'online', 180, 500, 94.0, 82.0, '192.168.1.103', now],
      ['kiosk-04', 'VisionX Kiosk #04 (Dormitory Hub)', 'Student Residence Hall 3, Foyer', 'DRM-5018', 'online', 350, 500, 75.0, 60.0, '192.168.1.104', now]
    ];

    for (const k of defaultKiosks) {
      seed.run(...k);
    }
    logger.info(`Seeded ${defaultKiosks.length} default kiosks into database.`);
  }
}

function createPreparedStatements(db) {
  return {
    // Sessions
    createSession: db.prepare(`
      INSERT INTO sessions (id, kiosk_id, kiosk_code, status, created_at, expires_at, last_active_at)
      VALUES (@id, @kiosk_id, @kiosk_code, @status, @created_at, @expires_at, @last_active_at)
    `),
    getSession: db.prepare('SELECT * FROM sessions WHERE id = ?'),
    touchSession: db.prepare('UPDATE sessions SET last_active_at = ?, expires_at = ? WHERE id = ?'),
    sweepExpiredSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),

    // Documents
    createDocument: db.prepare(`
      INSERT INTO documents (id, session_id, file_name, file_path, file_size, mime_type, total_pages, color_pages_json, bw_pages_json, fingerprint, created_at)
      VALUES (@id, @session_id, @file_name, @file_path, @file_size, @mime_type, @total_pages, @color_pages_json, @bw_pages_json, @fingerprint, @created_at)
    `),
    getDocument: db.prepare('SELECT * FROM documents WHERE id = ?'),
    getDocumentsBySession: db.prepare('SELECT * FROM documents WHERE session_id = ? ORDER BY created_at DESC'),

    // Kiosks
    getKioskById: db.prepare('SELECT * FROM kiosks WHERE id = ?'),
    getKioskByCode: db.prepare('SELECT * FROM kiosks WHERE code = ?'),
    listKiosks: db.prepare('SELECT * FROM kiosks ORDER BY name ASC'),
    updateKioskSupplies: db.prepare(`
      UPDATE kiosks
      SET paper_count = @paper_count, toner_bw = @toner_bw, toner_color = @toner_color, status = @status, updated_at = @updated_at
      WHERE id = @id
    `),

    // Jobs
    createJob: db.prepare(`
      INSERT INTO jobs (id, session_id, kiosk_id, document_id, claim_pin, status, settings_json, pricing_json, progress, current_page, total_pages, payment_method, payment_status, payment_reference, fingerprint, created_at, updated_at)
      VALUES (@id, @session_id, @kiosk_id, @document_id, @claim_pin, @status, @settings_json, @pricing_json, @progress, @current_page, @total_pages, @payment_method, @payment_status, @payment_reference, @fingerprint, @created_at, @updated_at)
    `),
    getJobById: db.prepare('SELECT * FROM jobs WHERE id = ?'),
    getJobByPin: db.prepare('SELECT * FROM jobs WHERE claim_pin = ?'),
    getJobByFingerprint: db.prepare("SELECT * FROM jobs WHERE fingerprint = ? AND status != 'completed' AND status != 'failed'"),
    updateJobStatus: db.prepare(`
      UPDATE jobs
      SET status = @status, progress = @progress, current_page = @current_page, updated_at = @updated_at, completed_at = @completed_at, error_message = @error_message
      WHERE id = @id
    `),
    updateJobPayment: db.prepare(`
      UPDATE jobs
      SET payment_status = @payment_status, payment_method = @payment_method, payment_reference = @payment_reference, updated_at = @updated_at
      WHERE id = @id
    `),
    listRecentJobs: db.prepare('SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?'),
    getAllJobsStats: db.prepare(`
      SELECT
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(total_pages) as total_pages_printed
      FROM jobs
    `)
  };
}

module.exports = {
  initDatabase,
  getDb: () => dbInstance,
  getStatements: () => preparedStatements
};
