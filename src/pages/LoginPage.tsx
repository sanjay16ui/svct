import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const infoMessage = (location.state as any)?.message as string | undefined
  const redirectTo = (location.state as any)?.redirectTo as string | undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      if (!data.success) return setError(data.message)
      login(data.user)
      if (data.user.role === 'admin') {
        showToast('Welcome Admin Sathurika 👑', 'success')
        navigate('/admin')
      } else {
        showToast('Login successful! Welcome back ✨', 'success')
        navigate(redirectTo || '/shop')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.')
    }
  }

  return (
    <main className="min-h-screen bg-black grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="liquid-glass rounded-3xl p-8 w-full max-w-md border border-white/10">
        <h1 className="font-serif text-5xl mb-2">Welcome back</h1>
        <p className="text-white/65 mb-8">Sign in to your Larkspur_crochets account</p>
        {infoMessage && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 liquid-glass rounded-2xl border border-white/10 p-3 text-sm text-white/80">
            {infoMessage}
          </motion.div>
        )}
        <input className="glass-input mb-4" placeholder="Email or Username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative mb-2">
          <input className="glass-input pr-12" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-3 text-white/70">{showPassword ? <EyeOff /> : <Eye />}</button>
        </div>
        {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
        <button className="w-full mt-3 bg-white text-black py-3 rounded-full font-semibold">Login</button>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center text-white/70 text-xs tracking-[0.35em] uppercase mb-4">— Admin Access —</div>
          <div className="liquid-glass rounded-2xl border border-amber-300/30 p-4">
            <p className="text-xs text-white/70 mb-3">Admins: use the button below to autofill credentials.</p>
            <button
              type="button"
              onClick={() => {
                setEmail('sathurika')
                setPassword('Sathu@200604')
              }}
              className="w-full bg-amber-400/90 hover:bg-amber-300 text-black py-2.5 rounded-full font-semibold"
            >
              Login as Admin
            </button>
          </div>
        </div>

        <p className="text-white/70 mt-5 text-sm">Don&apos;t have an account? <Link to="/signup" className="text-white underline">Sign Up</Link></p>
      </form>
    </main>
  )
}
