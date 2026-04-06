import express from 'express'
import db from '../db.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  const products = db.all(`
    SELECT
      p.*,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    GROUP BY p.id
    ORDER BY p.id DESC
  `)
  res.json({ success: true, products })
})

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, price, image_url, category, offer_label, stock } = req.body
  db.run('INSERT INTO products (title, description, price, image_url, category, offer_label, stock) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    title,
    description || '',
    Number(price),
    image_url || '',
    category || '',
    offer_label || '',
    Number(stock || 0),
  ])
  res.json({ success: true })
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { title, description, price, image_url, category, offer_label, stock } = req.body
  db.run('UPDATE products SET title = ?, description = ?, price = ?, image_url = ?, category = ?, offer_label = ?, stock = ? WHERE id = ?', [
    title,
    description || '',
    Number(price),
    image_url || '',
    category || '',
    offer_label || '',
    Number(stock || 0),
    Number(req.params.id),
  ])
  res.json({ success: true })
})

router.delete('/:id', requireAdmin, async (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [Number(req.params.id)])
  res.json({ success: true })
})

export default router
