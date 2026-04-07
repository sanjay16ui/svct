import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = new Database(path.join(__dirname, 'larkspur.db'))

// Ensure users table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  );
`)

const hash = bcrypt.hashSync('sathu@2004', 10)

// Delete old admin if exists then re-insert fresh
db.exec('PRAGMA foreign_keys = OFF;');
db.prepare("DELETE FROM users WHERE username = 'sathurika'").run()
db.prepare(`
  INSERT INTO users (username, email, password, role)
  VALUES ('sathurika', 'sathurika@larkspur.local', ?, 'admin')
`).run(hash)
db.exec('PRAGMA foreign_keys = ON;');

console.log('✅ Admin reset done!')
console.log('   Username: sathurika')
console.log('   Password: sathu@2004')
console.log('   Login at: http://localhost:5173/login')
