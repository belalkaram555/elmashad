const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');

let usePostgres = false;
let useSQLite = false;
let pool = null;
let db = null;

// Check if PostgreSQL credentials are available (Neon/URI or DATABASE_URL)
const hasValidPostgresConfig = !!(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);

if (hasValidPostgresConfig) {
  // Use PostgreSQL when DATABASE_URL is properly configured
  usePostgres = true;
  pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });

  console.log('🌐 PostgreSQL mode (Online)');
} else {
  // Use SQLite for local/offline mode
  useSQLite = true;
  const dataDir = path.join(os.homedir(), '.elmashad');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(path.join(dataDir, 'elmashad.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('💾 SQLite mode (Offline - Local database)');
}

// Unified query interface
const query = async (text, params = []) => {
  if (usePostgres) {
    return pool.query(text, params);
  } else if (useSQLite) {
    // Convert PostgreSQL syntax to SQLite
    let sqliteText = text
      .replace(/\$(\d+)/g, '?') // Replace $1, $2 with ?
      .replace(/NOW\(\)/g, "datetime('now')")
      .replace(/ON CONFLICT.*DO UPDATE SET/g, 'ON CONFLICT DO UPDATE SET')
      .replace(/RETURNING \*/g, ''); // Remove RETURNING clause for SQLite

    try {
      const stmt = db.prepare(sqliteText);
      const result = stmt.all(...params);
      return { rows: result };
    } catch (err) {
      throw err;
    }
  }
};

const getClient = () => {
  if (usePostgres) {
    return pool.connect();
  } else {
    return Promise.resolve({
      query,
      release: () => {}
    });
  }
};

module.exports = { query, getClient, pool, db, usePostgres, useSQLite };
