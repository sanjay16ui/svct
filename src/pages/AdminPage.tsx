import { useEffect, useMemo, useState } from 'react'
import api, { API_URL } from '../api'
import LiveUsersTable from '../components/LiveUsersTable'
import SqlTerminal from '../components/SqlTerminal'
import SignupFormCard from '../components/SignupFormCard'
import { useToast } from '../context/ToastContext'
import type { Order, Product } from '../types'

type Mode = 'product' | 'database'

export default function AdminPage() {
  const [mode, setMode] = useState<Mode>('product')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
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

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <button onClick={() => setMode('product')} className={`px-5 py-2 rounded-full ${mode === 'product' ? 'bg-white text-black' : 'bg-white/10'}`}>Product Manager</button>
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
                className="glass-input"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                className="glass-input"
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
                className="glass-input"
                placeholder="Offer Label (e.g. NEW / 20% OFF)"
                value={form.offer_label}
                onChange={(e) => setForm((f) => ({ ...f, offer_label: e.target.value }))}
              />
              <input
                className="glass-input"
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
                  {imagePreview && <img src={imagePreview?.startsWith('http') || imagePreview?.startsWith('data:') ? imagePreview : imagePreview?.startsWith('/images/') ? imagePreview : `${API_URL}/${(imagePreview || '').replace(new RegExp('^/+'), '')}`} onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} alt="preview" className="h-24 w-24 rounded-xl object-cover border border-white/10" />}
                </div>
              ) : (
                <input
                  className="glass-input"
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
                  <td><img src={p.image_url?.startsWith('http') || p.image_url?.startsWith('data:') ? p.image_url : p.image_url?.startsWith('/images/') ? p.image_url : `${API_URL}/${(p.image_url || '').replace(new RegExp('^/+'), '')}`} onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} className="h-12 w-12 rounded object-cover" /></td>
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
