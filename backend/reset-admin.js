import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'sathurika'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sathu@2004'

const db = new Database(path.join(__dirname, 'larkspur.db'))

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

const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)

db.exec('PRAGMA foreign_keys = OFF;');
db.prepare("DELETE FROM users WHERE username = ?").run(ADMIN_USERNAME)
db.prepare(`
  INSERT INTO users (username, email, password, role)
  VALUES (?, ?, ?, 'admin')
`).run(ADMIN_USERNAME, ADMIN_USERNAME + '@larkspur.local', hash)
db.exec('PRAGMA foreign_keys = ON;');

console.log('✅ Admin reset done!')
console.log('   Username:', ADMIN_USERNAME)
console.log('   Password:', ADMIN_PASSWORD)
