import { useEffect } from 'react'
import api from '../api'
import LiveUsersTable from '../components/LiveUsersTable'
import SignupFormCard from '../components/SignupFormCard'
import SqlTerminal from '../components/SqlTerminal'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function DemoPage() {
  const { user, login } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const ensureAdmin = async () => {
      if (user?.role === 'admin') return
      const { data } = await api.post('/api/auth/login', { email: 'sathurika@larkspur.local', password: 'Sathu@200604' })
      if (data.success) login(data.user)
    }
    ensureAdmin()
  }, [user, login])

  return (
    <main className="min-h-screen bg-black text-white p-3">
      <div className="liquid-glass rounded-2xl p-3 text-center mb-3 border border-white/10 font-semibold">
        🔴 LIVE DEMO — Larkspur_crochets Database System
      </div>
      <div className="grid md:grid-cols-2 gap-3 h-[calc(100vh-76px)]">
        <section className="liquid-glass rounded-2xl border border-white/10 p-4 overflow-auto">
          <h2 className="font-serif text-3xl mb-3">User Registration</h2>
          <SignupFormCard embedded />
        </section>
        <section className="liquid-glass rounded-2xl border border-white/10 p-4 overflow-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-3xl">MySQL Database — Live View</h2>
            <button onClick={() => setRefreshKey((k) => k + 1)} className="bg-white text-black px-4 py-2 rounded-full text-sm">
              Refresh
            </button>
          </div>
          <SqlTerminal />
          <LiveUsersTable key={refreshKey} />
        </section>
      </div>
    </main>
  )
}
