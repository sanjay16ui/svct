import express from 'express'
import db from '../db.js'
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  const { user_id, product_id, quantity, total_price } = req.body
  const result = db.run('INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)', [
    Number(user_id),
    Number(product_id),
    Number(quantity || 1),
    Number(total_price || 0),
  ])
  res.json({ success: true, orderId: result.lastInsertId })
})

router.get('/', requireAdmin, async (_req, res) => {
  const orders = db.all(`
    SELECT o.*, u.username, u.email, p.title AS product_title
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN products p ON o.product_id = p.id
    ORDER BY o.id DESC
  `)
  res.json({ success: true, orders })
})

router.get('/user/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && Number(req.params.id) !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' })
  }
  const orders = db.all(`
    SELECT o.*, p.title AS product_title
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.id DESC
  `, [Number(req.params.id)])
  res.json({ success: true, orders })
})

router.put('/:id', requireAdmin, async (req, res) => {
  db.run('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, Number(req.params.id)])
  res.json({ success: true })
})

export default router
