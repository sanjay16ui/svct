import express from 'express'
import db from '../db.js'
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:productId', async (req, res) => {
  const productId = Number(req.params.productId)
  const reviews = db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [productId])
  res.json({ success: true, reviews })
})

router.post('/', requireAuth, async (req, res) => {
  const { product_id, rating, review_text } = req.body
  const productId = Number(product_id)
  const userId = Number(req.user.id)
  const stars = Number(rating)

  if (!Number.isFinite(productId) || !Number.isFinite(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ success: false, message: 'Invalid review.' })
  }

  const ordered = db.get('SELECT id FROM orders WHERE user_id = ? AND product_id = ? LIMIT 1', [userId, productId])
  if (!ordered) return res.status(403).json({ success: false, message: 'You can review only after ordering.' })

  const exists = db.get('SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1', [userId, productId])
  if (exists) return res.status(400).json({ success: false, message: 'You already reviewed this product.' })

  db.run(
    'INSERT INTO reviews (product_id, user_id, username, rating, review_text) VALUES (?, ?, ?, ?, ?)',
    [productId, userId, req.user.username, stars, String(review_text || '')],
  )

  res.json({ success: true })
})

// admin moderation
router.get('/admin/by-product/:productId', requireAdmin, async (req, res) => {
  const productId = Number(req.params.productId)
  const reviews = db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [productId])
  res.json({ success: true, reviews })
})

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const result = db.run('DELETE FROM reviews WHERE id = ?', [id])
  res.json({ success: true, removed: result.rowCount ?? 0 })
})

export default router

