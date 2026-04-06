import express from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body
  const exists = db.get('SELECT id FROM users WHERE email = ?', [email])
  if (exists) {
    return res.json({ success: false, message: 'Account not registered. Please create an account first.' })
  }
  const hashed = await bcrypt.hash(password, 10)
  db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [
    username,
    email,
    hashed,
    'user',
  ])
  return res.json({ success: true, message: 'Account created successfully! You can now log in.' })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const identifier = String(email || '').trim()
  const user = db.get(
    identifier.includes('@')
      ? 'SELECT * FROM users WHERE email = ?'
      : 'SELECT * FROM users WHERE username = ?',
    [identifier],
  )
  if (!user) {
    return res.json({ success: false, message: 'Account not found. Please sign up first.' })
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.json({ success: false, message: 'Incorrect password.' })
  db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id])
  return res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } })
})

export default router
