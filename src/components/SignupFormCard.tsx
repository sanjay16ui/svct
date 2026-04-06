import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import confetti from 'canvas-confetti'

interface Props {
  embedded?: boolean
  onSuccess?: () => void
}

export default function SignupFormCard({ embedded = false, onSuccess }: Props) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    try {
      const { data } = await api.post('/api/auth/signup', form)
      if (!data.success) return setError('This email is already registered. Please login.')
      setMessage('Account registered successfully! Please login.')
      confetti({
        particleCount: 140,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#f59e0b', '#ffffff'],
      })
      onSuccess?.()
      if (!embedded) setTimeout(() => navigate('/login'), 2000)
      setForm({ username: '', email: '', password: '', confirmPassword: '' })
    } catch {
      setError('This email is already registered. Please login.')
    }
  }

  return (
    <form onSubmit={submit} className="liquid-glass rounded-3xl p-8 w-full max-w-md border border-white/10">
      <h1 className="font-serif text-5xl mb-2">Create your account</h1>
      <p className="text-white/65 mb-8">Join Larkspur_crochets</p>
      <input className="glass-input mb-4" placeholder="Username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
      <input className="glass-input mb-4" placeholder="Email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <div className="relative mb-4">
        <input className="glass-input pr-12" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-3 text-white/70">{showPassword ? <EyeOff /> : <Eye />}</button>
      </div>
      <div className="relative mb-2">
        <input className="glass-input pr-12" type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" required value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
        <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-4 top-3 text-white/70">{showConfirm ? <EyeOff /> : <Eye />}</button>
      </div>
      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
      {message && <p className="text-emerald-300 text-sm mb-3">{message}</p>}
      <button className="w-full mt-3 bg-white text-black py-3 rounded-full font-semibold">Create Account</button>
      {!embedded && <p className="text-white/70 mt-5 text-sm">Already have an account? <Link to="/login" className="text-white underline">Login</Link></p>}
    </form>
  )
}
