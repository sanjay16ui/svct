import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { getImageUrl } from '../utils/getImageUrl'
import OrderSuccessModal from '../components/OrderSuccessModal'
import ProductDetailModal from '../components/ProductDetailModal'
import WishOrderModal from '../components/WishOrderModal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Product } from '../types'
import { Search, Heart } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [wishModalOpen, setWishModalOpen] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const { user } = useAuth()
  const { showToast } = useToast()
  const [crafting, setCrafting] = useState(47)
  const [points, setPoints] = useState(150)
  const [socialToast, setSocialToast] = useState<{ title: string; body: string } | null>(null)
  const location = useLocation()
  
  const [wishlist, setWishlist] = useState<number[]>(() => 
    JSON.parse(localStorage.getItem('wishlist') || '[]')
  )

  const toggleWishlist = (id: number) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id]
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  useEffect(() => {
    const load = () => api.get('/api/products').then((res) => setProducts(res.data.products || []))
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const s = params.get('search') || ''
    const c = params.get('category') || 'All'
    setSearch(s)
    setCategory(c)
    setPage(1)
  }, [location.search])

  useEffect(() => {
    const timer = setInterval(() => {
      setCrafting((c) => {
        const next = c + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(60, Math.max(40, next))
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const names = ['Priya', 'Aarav', 'Kavya', 'Rohan', 'Ananya', 'Isha', 'Vikram', 'Meera']
    const cities = ['Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Kochi', 'Pune', 'Coimbatore']
    const timer = setInterval(() => {
      if (!products.length) return
      const p = products[Math.floor(Math.random() * products.length)]
      const n = names[Math.floor(Math.random() * names.length)]
      const c = cities[Math.floor(Math.random() * cities.length)]
      setSocialToast({
        title: `${n} from ${c} just ordered`,
        body: `${p.title} 🛍️`,
      })
      setTimeout(() => setSocialToast(null), 4000)
    }, 17000)
    return () => clearInterval(timer)
  }, [products])

  const orderNow = async (productId: number, price: number) => {
    if (!user) return
    const { data } = await api.post('/api/orders', { user_id: user.id, product_id: productId, quantity: 1, total_price: price })
    console.log("FULL ORDER RESPONSE:", data)
    setLastOrderId(data.orderId ?? data.id ?? data.order?.id ?? 1)
    const earned = Math.round(Number(price) * 10)
    setPoints((p) => p + earned)
    showToast(`You earned ${earned} Larkspur Points! 🌸`, 'success', 2600)
    setShowModal(true)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)

      const matchCategory =
        category === 'All'
          ? true
          : category === 'Offers'
            ? !!p.offer_label
            : (p.category || '').toLowerCase() === category.toLowerCase()

      return matchSearch && matchCategory
    })
  }, [products, search, category])

  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <video
        src="/video/background.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 p-6">
        <div className="marquee liquid-glass rounded-full border border-white/10 px-4 py-2">
          <div className="marquee__inner font-serif text-white/85">
            <span>🌸 Spring Collection 2025 — Now Live!</span>
            <span>🌸 Spring Collection 2025 — Now Live!</span>
            <span>🌸 Spring Collection 2025 — Now Live!</span>
            <span>🌸 Spring Collection 2025 — Now Live!</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-white/85 font-serif text-2xl">Hello, {user?.username} 👋</div>
          <div className="text-white/70 text-sm">✨ {points} Points</div>
        </div>

        <div className="mt-2 text-white/75">
          🧶 <span className="font-semibold">{crafting}</span> pieces being handcrafted right now
        </div>

        <section className="mt-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[500px] relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search handmade pieces..."
                className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-12 py-3 w-full"
                style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
              />
            </div>
            <div className="w-full overflow-x-auto">
              <div className="flex gap-3 w-max px-1">
                {['All', 'Crochet Sets', 'Art', 'Accessories', 'Cozy Things', 'Special Edition', 'Offers'].map((c) => {
                  const active = category === c
                  return (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setCategory(c)
                        setPage(1)
                      }}
                      className={
                        active
                          ? 'rounded-full bg-[#f5c842] text-black font-bold px-4 py-2 text-sm'
                          : 'rounded-full border border-[#f5c842]/60 text-[#f5c842] px-4 py-2 text-sm hover:bg-[#f5c842]/20'
                      }
                    >
                      {c}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          <h1 className="font-serif text-5xl mb-8">Our Collections</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((p, index) => (
              <motion.article
                key={p.id}
                onClick={() => setSelected(p)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                  border: '1px solid rgba(245,200,66,0.15)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'all 0.35s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px) scale(1.02)'
                    ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,0.5)'
                    ; (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(245,200,66,0.15)'
                }}
                onMouseLeave={(e) => {
                  ; (e.currentTarget as HTMLElement).style.transform = 'none'
                    ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,0.15)'
                    ; (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }}
                    style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.6)',
                      border:'1px solid rgba(245,200,66,0.4)',borderRadius:'50%',
                      width:36,height:36,cursor:'pointer',zIndex:10,
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Heart size={18} fill={wishlist.includes(p.id)?'#f5c842':'transparent'} color="#f5c842"/>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(p)
                    }}
                    className="absolute inset-0 m-auto w-max h-max bg-black/60 border border-[#f5c842] text-white px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                  >
                    Quick View 👁️
                  </button>
                  <img
                    src={getImageUrl(p)}
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                    alt={p.title}
                    style={{
                      height: 260,
                      width: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      transform: 'scale(1)',
                    }}
                    className="group-hover:scale-[1.08]"
                  />

                  {!!p.offer_label && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'linear-gradient(90deg, #f5c842, #e8a020)',
                        color: 'black',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}
                    >
                      {p.offer_label}
                    </div>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      fontFamily: '"Instrument Serif", serif',
                      fontStyle: 'italic',
                      fontSize: '1.15rem',
                      color: 'white',
                      letterSpacing: '0.03em',
                      marginTop: 12,
                    }}
                  >
                    {p.title}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-amber-300">
                      {'★'.repeat(Math.round(Number(p.avg_rating || 0)))}
                      <span className="text-white/20">
                        {'★'.repeat(5 - Math.round(Number(p.avg_rating || 0)))}
                      </span>
                    </span>
                    <span className="text-white/60">({p.review_count || 0} reviews)</span>
                  </div>

                  <div
                    style={{
                      color: '#f5c842',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      textShadow: '0 0 10px rgba(245,200,66,0.4)',
                      marginTop: 8,
                    }}
                  >
                    ${Number(p.price).toFixed(2)}
                  </div>

                  <p className="text-xs text-white/60 mt-2">{p.category}</p>
                  <p className="text-[11px] opacity-50 italic mt-1">
                    Added: {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      orderNow(p.id, Number(p.price))
                    }}
                    className="mt-4 w-full bg-white text-black py-2.5 rounded-full font-semibold"
                  >
                    Order Now
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    orderNow(p.id, Number(p.price))
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    border: 0,
                    padding: '14px 16px',
                    fontWeight: 800,
                    color: 'black',
                    background: 'linear-gradient(90deg, #f5c842, #e8a020)',
                    borderRadius: '0 0 20px 20px',
                    transform: 'translateY(100%)',
                    transition: '0.3s ease',
                  }}
                  className="group-hover:translate-y-0"
                >
                  Add to Cart
                </button>
              </motion.article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-full border border-[#f5c842]/60 text-[#f5c842] hover:bg-[#f5c842]/20"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1
                const active = n === page
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={
                      active
                        ? 'px-4 py-2 rounded-full bg-[#f5c842] text-black font-bold'
                        : 'px-4 py-2 rounded-full border border-[#f5c842]/60 text-[#f5c842] hover:bg-[#f5c842]/20'
                    }
                  >
                    {n}
                  </button>
                )
              })}
              <button
                className="px-4 py-2 rounded-full border border-[#f5c842]/60 text-[#f5c842] hover:bg-[#f5c842]/20"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {socialToast && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            className="fixed bottom-6 left-6 z-10 liquid-glass rounded-2xl border border-white/10 px-4 py-3 max-w-sm"
          >
            <p className="text-white/85 text-sm">{socialToast.title}</p>
            <p className="text-white/65 text-sm">{socialToast.body}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && <OrderSuccessModal orderId={lastOrderId} onClose={() => setShowModal(false)} />}
      {selected && (
        <ProductDetailModal
          product={selected}
          onClose={() => setSelected(null)}
          onOrder={() => orderNow(selected.id, Number(selected.price))}
        />
      )}

      <button
        onClick={() => setWishModalOpen(true)}
        className="wish-btn"
        style={{
          position: 'fixed', bottom: 90, right: 28, zIndex: 9998,
          background: 'linear-gradient(135deg, #f5c842, #e8a020)',
          color: '#1a1000', fontWeight: 700, fontSize: 14,
          border: 'none', borderRadius: 50, padding: '14px 22px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Instrument Serif', serif", letterSpacing: 0.5,
          whiteSpace: 'nowrap'
        }}
      >
        ✨ Your Wish
      </button>

      <AnimatePresence>
        {wishModalOpen && <WishOrderModal onClose={() => setWishModalOpen(false)} />}
      </AnimatePresence>
    </main>
  )
}
