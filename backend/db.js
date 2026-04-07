import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const backendDir = process.cwd()
export const dbPath = path.join(backendDir, 'larkspur.db')

const sqlite = new Database(dbPath)

function rowsFromExecResult(stmt) {
  // Not directly equivalent, better-sqlite3 doesn't return rows on exec
  return { columns: [], rows: [] }
}

function all(sql, params = []) {
  const stmt = sqlite.prepare(sql)
  return stmt.all(params)
}

function get(sql, params = []) {
  const stmt = sqlite.prepare(sql)
  return stmt.get(params)
}

function run(sql, params = []) {
  const stmt = sqlite.prepare(sql)
  const result = stmt.run(params)
  return { rowCount: result.changes, lastInsertId: result.lastInsertRowid }
}

function exec(sql) {
  if (sql.trim().toLowerCase().startsWith('select')) {
      const stmt = sqlite.prepare(sql)
      const rows = stmt.all()
      const columns = rows.length ? Object.keys(rows[0]) : []
      return { columns, rows, rowCount: rows.length }
  }
  sqlite.exec(sql)
  return { columns: [], rows: [], rowCount: 0 }
}

// Ensure tables exist
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category TEXT,
  offer_label TEXT,
  stock INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price REAL,
  status TEXT DEFAULT 'pending',
  ordered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  username TEXT,
  rating INTEGER,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wish_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  guest_name TEXT,
  guest_email TEXT,
  message TEXT NOT NULL,
  reference_files TEXT,
  status TEXT DEFAULT 'pending',
  admin_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`)

try {
  sqlite.exec('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;')
} catch {
  // ignore
}

const db = {
  all,
  get,
  run,
  exec,
  prepare: (sql) => sqlite.prepare(sql) // Expose prepare to match user requirements
}

export default db
