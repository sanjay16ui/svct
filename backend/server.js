import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import db from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import reviewRoutes from './routes/reviews.js'
import { requireAdmin } from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  const users = db.all('SELECT id, username, email, password, role, created_at, last_login FROM users ORDER BY id DESC')
  res.json({ success: true, users })
})

const DANGEROUS_SQL = /(drop\s+table|truncate|alter\s+table|attach\s+database|detach\s+database|pragma|vacuum|reindex)/i
const ALLOWED_SQL = /^(select|insert|update|delete)\s+/i

app.post('/api/admin/query', requireAdmin, async (req, res) => {
  const query = String(req.body?.query || '').trim()
  if (!query) return res.status(400).json({ success: false, error: 'Query is required.' })
  if (DANGEROUS_SQL.test(query)) return res.status(400).json({ success: false, error: 'Blocked for safety.' })
  if (!ALLOWED_SQL.test(query)) return res.status(400).json({ success: false, error: 'Only SELECT/INSERT/UPDATE/DELETE are allowed.' })

  const started = Date.now()
  try {
    if (/^select\s+/i.test(query)) {
      const { columns, rows } = db.exec(query)
      return res.json({
        success: true,
        columns,
        rows,
        rowCount: rows.length,
        executionTime: `${Date.now() - started}ms`,
      })
    }
    const result = db.run(query)
    return res.json({
      success: true,
      columns: [],
      rows: [],
      rowCount: result.rowCount ?? 0,
      executionTime: `${Date.now() - started}ms`,
    })
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/clear/users', requireAdmin, async (_req, res) => {
  const started = Date.now()
  try {
    const result = db.run("DELETE FROM users WHERE role != 'admin'")
    return res.json({ success: true, removed: result.rowCount ?? 0, executionTime: `${Date.now() - started}ms` })
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/clear/products', requireAdmin, async (_req, res) => {
  const started = Date.now()
  try {
    const result = db.run('DELETE FROM products')
    return res.json({ success: true, removed: result.rowCount ?? 0, executionTime: `${Date.now() - started}ms` })
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/clear/orders', requireAdmin, async (_req, res) => {
  const started = Date.now()
  try {
    const result = db.run('DELETE FROM orders')
    return res.json({ success: true, removed: result.rowCount ?? 0, executionTime: `${Date.now() - started}ms` })
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/clear/all', requireAdmin, async (_req, res) => {
  const started = Date.now()
  try {
    const orders = db.run('DELETE FROM orders')
    const products = db.run('DELETE FROM products')
    const users = db.run("DELETE FROM users WHERE role != 'admin'")
    return res.json({
      success: true,
      removed: {
        users: users.rowCount ?? 0,
        products: products.rowCount ?? 0,
        orders: orders.rowCount ?? 0,
      },
      executionTime: `${Date.now() - started}ms`,
    })
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message })
  }
})

async function ensureAdmin() {
  const row = db.get('SELECT id FROM users WHERE username = ?', ['sathurika'])
  if (row) return
  const passwordHash = await bcrypt.hash('Sathu@200604', 10)
  db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')", [
    'sathurika',
    'sathurika@larkspur.local',
    passwordHash,
  ])
}

app.listen(PORT, async () => {
  await ensureAdmin()
  console.log(`Server running on port ${PORT}`)
})
