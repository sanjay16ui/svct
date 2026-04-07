import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import db from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import reviewRoutes from './routes/reviews.js'
import { requireAdmin } from './middleware/authMiddleware.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: true,
  credentials: true
}))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage });
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
  const match = await bcrypt.compare(password, admin.password_hash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })
  res.json({ success: true, token: 'admin-token' })
})

app.get('/api/wish-orders', (req, res) => {
  const orders = db.all('SELECT * FROM wish_orders ORDER BY created_at DESC')
  res.json(orders)
})

app.post('/api/wish-orders', upload.array('references', 5), (req, res) => {
  const { user_id, guest_name, guest_email, message } = req.body
  const files = req.files ? req.files.map(f => f.filename).join(',') : ''
  db.run(`
    INSERT INTO wish_orders (user_id, guest_name, guest_email, message, reference_files)
    VALUES (?, ?, ?, ?, ?)
  `, [user_id || null, guest_name || 'Guest', guest_email || '', message, files])
  res.json({ success: true, message: 'Wish order submitted!' })
})

app.patch('/api/wish-orders/:id/reply', (req, res) => {
  const { admin_reply, status } = req.body
  db.run('UPDATE wish_orders SET admin_reply = ?, status = ? WHERE id = ?',
    [admin_reply, status || 'in-progress', req.params.id])
  res.json({ success: true })
})

app.get('/api/wish-orders/:id', (req, res) => {
  const order = db.get('SELECT * FROM wish_orders WHERE id = ?', [req.params.id])
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
})

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
  // Primary admin — sathurika / sathu@2004
  const row = db.get('SELECT id FROM users WHERE username = ?', ['sathurika'])
  if (!row) {
    const passwordHash = await bcrypt.hash('sathu@2004', 10)
    db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')", [
      'sathurika',
      'sathurika@larkspur.local',
      passwordHash,
    ])
  }
  // Fallback admin — admin / admin123
  const genericAdmin = db.get('SELECT id FROM users WHERE username = ?', ['admin'])
  if (!genericAdmin) {
    const hash = await bcrypt.hash('admin123', 10)
    db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')", [
      'admin',
      'admin@larkspur.local',
      hash,
    ])
  }
}

app.listen(PORT, async () => {
  await ensureAdmin()
  console.log(`Server running on port ${PORT}`)
})
