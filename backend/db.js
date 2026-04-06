import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

const backendDir = process.cwd()
const dbPath = path.join(backendDir, 'larkspur.db')

const SQL = await initSqlJs({
  locateFile: (file) => path.join(backendDir, 'node_modules', 'sql.js', 'dist', file),
})

const sqlite = fs.existsSync(dbPath)
  ? new SQL.Database(fs.readFileSync(dbPath))
  : new SQL.Database()

function persistIfWrite(sql) {
  if (!/^\s*(insert|update|delete|replace|create|drop|alter)\s+/i.test(sql)) return
  const data = sqlite.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function rowsFromExecResult(execResult) {
  if (!execResult.length) return { columns: [], rows: [] }
  const { columns, values } = execResult[0]
  const rows = values.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column, row[index]])),
  )
  return { columns, rows }
}

function all(sql, params = []) {
  const stmt = sqlite.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function get(sql, params = []) {
  return all(sql, params)[0] || null
}

function run(sql, params = []) {
  sqlite.run(sql, params)
  const rowCount = sqlite.getRowsModified()
  persistIfWrite(sql)
  let lastInsertId = null
  if (/^\s*insert\s+/i.test(sql)) {
    const row = get('SELECT last_insert_rowid() AS id')
    lastInsertId = row?.id ?? null
  }
  return { rowCount, lastInsertId }
}

function exec(sql) {
  const result = sqlite.exec(sql)
  persistIfWrite(sql)
  return rowsFromExecResult(result)
}

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
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`)
persistIfWrite('CREATE TABLE IF NOT EXISTS users')

// lightweight migration for older db files
try {
  sqlite.exec('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;')
  persistIfWrite('ALTER TABLE products ADD COLUMN stock')
} catch {
  // ignore if column exists
}

const db = {
  all,
  get,
  run,
  exec,
}

export default db
export { dbPath }
