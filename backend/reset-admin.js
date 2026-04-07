import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('./larkspur.db')

const hash = bcrypt.hashSync('sathu@2004', 10)

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL
);
`)

db.prepare(`
  INSERT OR REPLACE INTO admins (id, username, password_hash)
  VALUES (1, 'sathurika', ?)
`).run(hash)

console.log('Admin reset done! Login: sathurika / sathu@2004')
