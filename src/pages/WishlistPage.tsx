import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'
import { getImageUrl } from '../utils/getImageUrl'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Product } from '../types'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [wishlist, setWishlist] = useState<number[]>(() =>
        JSON.parse(localStorage.getItem('wishlist') || '[]')
    )
    const [wishId, setWishId] = useState('')
    const [trackedWish, setTrackedWish] = useState<any>(null)
    const [wishError, setWishError] = useState('')
    const { user } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        api.get('/api/products').then((res) => {
            const all: Product[] = res.data.products || []
            setProducts(all.filter((p) => wishlist.includes(p.id)))
        })
    }, [wishlist])

    const removeFromWishlist = (id: number) => {
        const updated = wishlist.filter((x) => x !== id)
        setWishlist(updated)
        localStorage.setItem('wishlist', JSON.stringify(updated))
        showToast('Removed from wishlist', 'default')
    }

    const orderNow = async (productId: number, price: number) => {
        if (!user) return showToast('Please login first', 'error')
        await api.post('/api/orders', { user_id: user.id, product_id: productId, quantity: 1, total_price: price })
        showToast('Order placed! 🌸', 'success')
    }

    const checkWish = async (e: React.FormEvent) => {
        e.preventDefault()
        setWishError('')
        setTrackedWish(null)
        if (!wishId) return
        try {
            const res = await api.get(`/api/wish-orders/${wishId}`)
            setTrackedWish(res.data)
        } catch (err) {
            setWishError('Wish not found or invalid ID.')
        }
    }

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="font-serif text-5xl italic mb-2">Your Wishlist</h1>
                <p className="text-white/60 mb-10">
                    {products.length ? `${products.length} piece${products.length > 1 ? 's' : ''} saved with love` : 'No items yet — browse the shop and tap ❤️'}
                </p>

                {!products.length && (
                    <div className="text-center py-20">
                        <Heart size={64} className="mx-auto text-white/20 mb-6" />
                        <p className="text-white/50 text-lg mb-6">Your wishlist is empty</p>
                        <Link
                            to="/shop"
                            className="bg-white text-black px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2"
                        >
                            <ShoppingBag size={18} /> Browse Shop
                        </Link>
                    </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p, index) => (
                        <motion.article
                            key={p.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            style={{
                                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                                border: '1px solid rgba(245,200,66,0.15)',
                                borderRadius: 20,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={getImageUrl(p)}
                                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
                                    alt={p.title}
                                    style={{ height: 260, width: '100%', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={() => removeFromWishlist(p.id)}
                                    style={{
                                        position: 'absolute', top: 12, right: 12,
                                        background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(245,200,66,0.4)',
                                        borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Heart size={18} fill="#f5c842" color="#f5c842" />
                                </button>
                            </div>

                            <div style={{ padding: 16 }}>
                                <div style={{
                                    fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
                                    fontSize: '1.15rem', color: 'white', marginTop: 12,
                                }}>
                                    {p.title}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <span className="text-amber-300">
                                        {'★'.repeat(Math.round(Number(p.avg_rating || 0)))}
                                        <span className="text-white/20">
                                            {'★'.repeat(5 - Math.round(Number(p.avg_rating || 0)))}
                                        </span>
                                    </span>
                                </div>
                                <div style={{
                                    color: '#f5c842', fontSize: '1.2rem', fontWeight: 800,
                                    textShadow: '0 0 10px rgba(245,200,66,0.4)', marginTop: 8,
                                }}>
                                    ${Number(p.price).toFixed(2)}
                                </div>
                                <p className="text-xs text-white/60 mt-2">{p.category}</p>
                                <button
                                    onClick={() => orderNow(p.id, Number(p.price))}
                                    className="mt-4 w-full bg-white text-black py-2.5 rounded-full font-semibold"
                                >
                                    Order Now
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-20 border-t border-white/10 pt-16 max-w-2xl mx-auto text-center">
                    <h2 className="font-serif text-4xl italic mb-6">My Crochet Wishes</h2>
                    <form onSubmit={checkWish} className="flex gap-3 justify-center mb-8">
                        <input
                            value={wishId}
                            onChange={(e) => setWishId(e.target.value)}
                            placeholder="Enter your Wish ID #..."
                            className="bg-white/5 border border-[#f5c842]/40 rounded-full px-6 py-3 outline-none focus:border-[#f5c842] w-64 text-white"
                        />
                        <button type="submit" className="bg-[#f5c842] text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">
                            Track Wish
                        </button>
                    </form>

                    {wishError && <p className="text-red-400">{wishError}</p>}
                    
                    {trackedWish && (
                        <div className="liquid-glass p-8 rounded-2xl border border-white/10 text-left">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-[#f5c842]">Wish #{trackedWish.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${trackedWish.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : trackedWish.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' : trackedWish.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {trackedWish.status}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mb-4">Submitted on: {new Date(trackedWish.created_at).toLocaleString()}</p>
                            <p className="text-white/80 whitespace-pre-wrap text-sm mb-6 pb-6 border-b border-white/10">
                                <span className="text-[#f5c842] block mb-2 font-bold">Your Message:</span>
                                {trackedWish.message}
                            </p>
                            
                            <div>
                                <span className="text-[#f5c842] block mb-2 font-bold">Artisan Reply:</span>
                                {trackedWish.admin_reply ? (
                                    <p className="text-white bg-white/5 p-4 rounded-xl text-sm italic">{trackedWish.admin_reply}</p>
                                ) : (
                                    <p className="text-white/40 text-sm">We are reviewing your wish... Check back soon!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
