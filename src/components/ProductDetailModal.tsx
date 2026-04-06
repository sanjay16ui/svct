import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import api, { API_URL } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Product, Review } from '../types'

function Stars({ value }: { value: number }) {
  const v = Math.round(value)
  return (
    <span className="text-amber-300">
      {'★★★★★'.split('').map((_, i) => (
        <span key={i} className={i < v ? '' : 'text-white/20'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProductDetailModal({
  product,
  onClose,
  onOrder,
}: {
  product: Product
  onClose: () => void
  onOrder: () => void
}) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const avg = useMemo(() => (product.avg_rating ? Number(product.avg_rating) : 0), [product.avg_rating])

  const load = async () => {
    const { data } = await api.get(`/api/reviews/${product.id}`)
    setReviews(data.reviews || [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const submitReview = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.post('/api/reviews', {
        product_id: product.id,
        rating,
        review_text: text,
      })
      if (!data.success) throw new Error(data.message)
      showToast('Review submitted ✨', 'success')
      setText('')
      await load()
    } catch (e: any) {
      showToast(e.response?.data?.message || e.message || 'Review failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 p-4 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="liquid-glass w-full max-w-3xl rounded-3xl border border-white/10 overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-0">
            <img 
              src={product.image_url?.startsWith('http') || product.image_url?.startsWith('data:') ? product.image_url : product.image_url?.startsWith('/images/') ? product.image_url : `${API_URL}/${(product.image_url || '').replace(new RegExp('^/+'), '')}`} 
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} 
              className="w-full h-[420px] object-cover rounded-2xl border border-white/10" 
            />
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-4xl">{product.title}</h3>
                <p className="text-white/70 mt-1">${Number(product.price).toFixed(2)}</p>
                <p className="text-white/60 text-sm mt-1">{product.category}</p>
              </div>
              <button onClick={onClose} className="bg-white/10 px-3 py-2 rounded-full">
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Stars value={avg} />
              <span className="text-white/70 text-sm">
                ({product.review_count || 0} reviews)
              </span>
            </div>

            <p className="text-white/70 mt-4">{product.description}</p>

            <button onClick={onOrder} className="mt-6 w-full bg-white text-black py-3 rounded-full font-semibold">
              Order Now
            </button>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3">Reviews</p>
              <div className="liquid-glass rounded-2xl border border-white/10 p-4">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-2xl ${n <= rating ? 'text-amber-300' : 'text-white/20'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className="glass-input"
                  style={{ borderRadius: 18 }}
                  placeholder="Share your experience..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  disabled={!user || loading}
                  onClick={submitReview}
                  className="mt-3 bg-amber-300 text-black px-5 py-2 rounded-full font-semibold disabled:opacity-50"
                >
                  Submit Review
                </button>
                {!user && <p className="text-white/60 text-sm mt-2">Login to submit a review.</p>}
              </div>

              <div className="mt-4 space-y-3 max-h-56 overflow-auto pr-1">
                {reviews.map((r) => (
                  <div key={r.id} className="liquid-glass rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/85">{r.username}</p>
                      <span className="text-amber-300">{'★'.repeat(r.rating)}<span className="text-white/20">{'★'.repeat(5 - r.rating)}</span></span>
                    </div>
                    {r.review_text && <p className="text-white/70 mt-2">{r.review_text}</p>}
                    <p className="text-white/40 text-xs mt-2">{r.created_at}</p>
                  </div>
                ))}
                {!reviews.length && <p className="text-white/50 text-sm">No reviews yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

