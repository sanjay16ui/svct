import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { getImageUrl } from '../utils/getImageUrl'
import LiveUsersTable from '../components/LiveUsersTable'
import SqlTerminal from '../components/SqlTerminal'
import SignupFormCard from '../components/SignupFormCard'
import { useToast } from '../context/ToastContext'
import type { Order, Product } from '../types'

type Mode = 'product' | 'database' | 'wishes'

interface WishOrder {
  id: number
  user_id: number | null
  guest_name: string
  guest_email: string
  message: string
  reference_files: string
  status: string
  admin_reply: string | null
  created_at: string
}

export default function AdminPage() {
  const [mode, setMode] = useState<Mode>('product')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [wishOrders, setWishOrders] = useState<WishOrder[]>([])
  const [lastSeenOrderId, setLastSeenOrderId] = useState<number>(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Crochet Sets',
    offer_label: '',
    image_url: '',
    stock: 0,
  })
  const [confirm, setConfirm] = useState<{ action: null | 'users' | 'products' | 'orders' | 'all' }>({ action: null })
  const [refreshKey, setRefreshKey] = useState(0)
  const { showToast } = useToast()

  const loadAll = () => {
    api.get('/api/products').then((r) => setProducts(r.data.products || []))
    api.get('/api/orders').then((r) => setOrders(r.data.orders || []))
    api.get('/api/wish-orders').then((r) => setWishOrders(r.data || []))
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    const poll = async () => {
      const { data } = await api.get('/api/orders')
      const list: Order[] = data.orders || []
      setOrders(list)
      const newest = list[0]?.id || 0
      if (lastSeenOrderId && newest > lastSeenOrderId) {
        const o = list[0]
        showToast(`🛍️ New Order! ${o.username} ordered ${o.product_title}`, 'success', 3500)
      }
      if (newest) setLastSeenOrderId((prev) => (prev ? Math.max(prev, newest) : newest))
    }
    poll()
    const t = setInterval(poll, 5000)
    return () => clearInterval(t)
  }, [lastSeenOrderId, showToast])

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders])

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.price) return setFormError('Title and Price are required.')
    await api.post('/api/products', form)
    setForm({
      title: '',
      description: '',
      price: '',
      category: 'Crochet Sets',
      offer_label: '',
      image_url: '',
      stock: 0,
    })
    setImagePreview('')
    loadAll()
  }

  const deleteProduct = async (id: number) => {
    await api.delete(`/api/products/${id}`)
    loadAll()
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price || ''),
      category: product.category || 'Crochet Sets',
      offer_label: product.offer_label || '',
      image_url: product.image_url || '',
      stock: Number(product.stock || 0),
    })
    setImagePreview(product.image_url || '')
  }

  const saveEdit = async () => {
    if (!editingId) return
    await api.put(`/api/products/${editingId}`, form)
    setEditingId(null)
    setForm({
      title: '',
      description: '',
      price: '',
      category: 'Crochet Sets',
      offer_label: '',
      image_url: '',
      stock: 0,
    })
    setImagePreview('')
    loadAll()
  }

  const [wishReplyId, setWishReplyId] = useState<number | null>(null)
  const [wishReplyForm, setWishReplyForm] = useState({ admin_reply: '', status: 'in-progress' })
  const [expandedWishId, setExpandedWishId] = useState<number | null>(null)

  const handleWishReply = async (id: number) => {
    await api.patch(`/api/wish-orders/${id}/reply`, wishReplyForm)
    setWishReplyId(null)
    loadAll()
  }

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <button onClick={() => setMode('product')} className={`px-5 py-2 rounded-full ${mode === 'product' ? 'bg-white text-black' : 'bg-white/10'}`}>Products & Orders</button>
          <button onClick={() => setMode('wishes')} className={`px-5 py-2 rounded-full ${mode === 'wishes' ? 'bg-white text-black' : 'bg-white/10'}`}>Wish Orders</button>
          <button onClick={() => setMode('database')} className={`px-5 py-2 rounded-full ${mode === 'database' ? 'bg-white text-black' : 'bg-white/10'}`}>Database Terminal</button>
        </div>
      </div>

      {mode === 'product' && (
        <section className="space-y-5">
          <div className="liquid-glass rounded-2xl border border-white/10 p-4 flex items-center justify-between">
            <h2 className="font-serif text-4xl">Product Manager</h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-3 w-3 rounded-full ${pendingOrders ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
              <span className="text-sm">{pendingOrders} new/pending orders</span>
            </div>
          </div>
          <form onSubmit={addProduct} className="liquid-glass rounded-2xl border border-white/10 p-4">
            <div className="grid md:grid-cols-3 gap-3">
              <input
                className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-4 py-2 w-full"
                style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-4 py-2 w-full"
                style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
                placeholder="Price *"
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
              <select
                className="glass-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {['Crochet Sets', 'Art', 'Accessories', 'Cozy Things', 'Special Edition'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <textarea
                className="glass-input"
                style={{ borderRadius: 24 }}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-4 py-2 w-full"
                style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
                placeholder="Offer Label (e.g. NEW / 20% OFF)"
                value={form.offer_label}
                onChange={(e) => setForm((f) => ({ ...f, offer_label: e.target.value }))}
              />
              <input
                className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-4 py-2 w-full"
                style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
                placeholder="Stock quantity"
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-3 items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-4 py-2 rounded-full text-sm ${imageMode === 'upload' ? 'bg-white text-black' : 'bg-white/10'}`}
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-4 py-2 rounded-full text-sm ${imageMode === 'url' ? 'bg-white text-black' : 'bg-white/10'}`}
                >
                  Use URL
                </button>
              </div>

              {imageMode === 'upload' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFormError('')
                      const file = e.target.files?.[0]
                      if (!file) return
                      const okTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                      if (!okTypes.includes(file.type)) return setFormError('Accepted formats: jpg, png, gif, webp.')
                      if (file.size > 5 * 1024 * 1024) return setFormError('Max image size is 5MB.')
                      const reader = new FileReader()
                      reader.onload = () => {
                        const base64 = String(reader.result || '')
                        setForm((f) => ({ ...f, image_url: base64 }))
                        setImagePreview(base64)
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  {imagePreview && <img src={getImageUrl({ image_url: imagePreview })} onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} alt="preview" className="h-24 w-24 rounded-xl object-cover border border-white/10" />}
                </div>
              ) : (
                <input
                  className="bg-black text-white border border-yellow-400/40 placeholder-white/40 focus:outline-none focus:border-yellow-400 rounded-md px-4 py-2 w-full"
                  style={{ background: '#000', color: '#fff', border: '1px solid rgba(245,200,66,0.4)', caretColor: '#f5c842' }}
                  placeholder="Image URL"
                  value={form.image_url}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, image_url: e.target.value }))
                    setImagePreview(e.target.value)
                  }}
                />
              )}

              <button className="bg-white text-black rounded-full py-3 font-semibold">
                {editingId ? 'Add Product (finish edit below)' : 'Add Product'}
              </button>
            </div>

            {formError && <p className="mt-3 text-red-300 text-sm">{formError}</p>}
          </form>
          <div className="liquid-glass rounded-2xl border border-white/10 p-3 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Offer</th>
                  <th>Stock</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{products.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white/[0.03]' : ''}>
                  <td><img src={getImageUrl(p)} onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} className="h-12 w-12 rounded object-cover" /></td>
                  <td>{p.title}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.category}</td>
                  <td>{p.offer_label}</td>
                  <td>{p.stock ?? 0}</td>
                  <td className="text-white/70 text-sm">
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="space-x-2">
                    <button className="text-emerald-300" onClick={() => startEdit(p)}>Edit</button>
                    <button className="text-red-300" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {editingId && <button onClick={saveEdit} className="bg-emerald-400 text-black px-4 py-2 rounded-full">Save Product Edit</button>}
        </section>
      )}

      {mode === 'wishes' && (
        <section className="space-y-5">
          <div className="liquid-glass rounded-2xl border border-white/10 p-4">
            <h2 className="font-serif text-4xl mb-4">Wish Orders</h2>
            <div className="overflow-auto border border-white/10 rounded-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5">
                    <th className="p-3">ID / Date</th>
                    <th className="p-3">Guest Details</th>
                    <th className="p-3">Message (Brief)</th>
                    <th className="p-3">Files</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>{wishOrders.map((w, i) => (
                  <tr key={w.id} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-3">
                      <div>#{w.id}</div>
                      <div className="text-xs text-white/50">{new Date(w.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3">
                      <div>{w.guest_name}</div>
                      <div className="text-xs text-[#f5c842]">{w.guest_email}</div>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-white/80">
                      {w.message}
                    </td>
                    <td className="p-3">
                      {w.reference_files ? w.reference_files.split(',').length : 0} file(s)
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs lowercase ${w.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : w.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' : w.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 space-y-1">
                      <button onClick={() => setExpandedWishId(expandedWishId === w.id ? null : w.id)} className="block text-white/70 hover:text-white text-xs underline">View Full</button>
                      <button onClick={() => {
                        setWishReplyId(w.id)
                        setWishReplyForm({ admin_reply: w.admin_reply || '', status: w.status })
                      }} className="block text-[#f5c842] hover:text-[#f5c842]/80 text-xs underline">Reply / Edit</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            
            {expandedWishId && (() => {
              const ew = wishOrders.find(x => x.id === expandedWishId)
              if (!ew) return null
              return (
                <div className="mt-4 p-5 liquid-glass rounded-2xl border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-2xl text-[#f5c842]">Full Wish Detail #{ew.id}</h3>
                    <button onClick={() => setExpandedWishId(null)} className="text-white/60 hover:text-white">✕</button>
                  </div>
                  <p className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed mb-6">{ew.message}</p>
                  {ew.reference_files && (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-[#f5c842] mb-3">Reference Files</h4>
                      <div className="flex flex-wrap gap-4">
                        {ew.reference_files.split(',').map((f, i) => (
                           f.endsWith('.pdf') ? 
                             <a key={i} href={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads/${f}` : `http://localhost:5000/uploads/${f}`} target="_blank" className="w-24 h-24 bg-white/10 rounded flex items-center justify-center p-2 text-center text-xs break-all border border-white/20">📄 {f}</a> :
                             <a key={i} href={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads/${f}` : `http://localhost:5000/uploads/${f}`} target="_blank"><img src={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads/${f}` : `http://localhost:5000/uploads/${f}`} alt="ref" className="w-24 h-24 object-cover rounded border border-white/20 hover:scale-105 transition-transform" /></a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {wishReplyId && (
              <div className="mt-4 p-5 bg-[#1a1a1a] rounded-2xl border border-[#f5c842]/30">
                 <div className="flex justify-between items-center mb-3">
                   <h4 className="font-bold text-[#f5c842]">Reply to Wish #{wishReplyId}</h4>
                   <button onClick={() => setWishReplyId(null)} className="text-white/60">✕</button>
                 </div>
                 <textarea
                   value={wishReplyForm.admin_reply}
                   onChange={e => setWishReplyForm(f => ({ ...f, admin_reply: e.target.value }))}
                   placeholder="Type your reply here..."
                   className="w-full bg-black/50 border border-white/10 rounded my-2 p-3 text-sm min-h-[100px] outline-none text-white"
                 />
                 <div className="flex items-center gap-3 mt-2">
                   <select
                     value={wishReplyForm.status}
                     onChange={e => setWishReplyForm(f => ({ ...f, status: e.target.value }))}
                     className="bg-black/50 border border-white/10 cursor-pointer rounded p-2 text-sm outline-none"
                   >
                     <option value="pending">pending</option>
                     <option value="in-progress">in-progress</option>
                     <option value="completed">completed</option>
                     <option value="rejected">rejected</option>
                   </select>
                   <button onClick={() => handleWishReply(wishReplyId)} className="bg-[#f5c842] text-black rounded px-5 py-2 font-bold text-sm hover:opacity-90">
                     Send Reply
                   </button>
                 </div>
              </div>
            )}
          </div>
        </section>
      )}

      {mode === 'database' && (
        <section className="grid md:grid-cols-2 gap-4 h-[calc(100vh-92px)]">
          <div className="liquid-glass rounded-2xl border border-white/10 p-4 overflow-auto">
            <h3 className="font-serif text-3xl mb-3">Live User Activity</h3>
            <SignupFormCard embedded />
          </div>
          <div className="space-y-4 overflow-auto">
            <h3 className="font-serif text-3xl">Database Live View</h3>
            <div className="liquid-glass rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3">Clear Database</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { k: 'users', label: '🗑 Clear All Users' },
                  { k: 'products', label: '🗑 Clear All Products' },
                  { k: 'orders', label: '🗑 Clear All Orders' },
                  { k: 'all', label: '🗑 Clear Everything' },
                ].map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setConfirm({ action: b.k as any })}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {confirm.action && (
                <div className="mt-4 liquid-glass rounded-2xl border border-red-400/30 p-4">
                  <p className="text-white/85 mb-3">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        const started = Date.now()
                        const endpoint =
                          confirm.action === 'users'
                            ? '/api/admin/clear/users'
                            : confirm.action === 'products'
                              ? '/api/admin/clear/products'
                              : confirm.action === 'orders'
                                ? '/api/admin/clear/orders'
                                : '/api/admin/clear/all'
                        const { data } = await api.delete(endpoint)
                        showToast('Database cleared successfully ✅', 'success')
                        setConfirm({ action: null })
                        setRefreshKey((k) => k + 1)
                        // best-effort: reload products/orders lists too
                        loadAll()
                        // show a terminal-style meta line via toast (keeps UI premium)
                        if (data.removed?.users !== undefined) {
                          showToast(
                            `DELETE executed — ${data.removed.users + data.removed.products + data.removed.orders} rows removed in ${Date.now() - started}ms`,
                            'default',
                            2600,
                          )
                        } else {
                          showToast(`DELETE executed — ${data.removed ?? 0} rows removed in ${data.executionTime}`, 'default', 2600)
                        }
                      }}
                      className="bg-red-400 text-black px-4 py-2 rounded-full font-semibold"
                    >
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirm({ action: null })} className="bg-white/10 px-4 py-2 rounded-full">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <SqlTerminal />
            <LiveUsersTable key={refreshKey} />
          </div>
        </section>
      )}
    </main>
  )
}
