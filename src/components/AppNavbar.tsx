import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function pageTitle(pathname: string) {
  if (pathname === '/') return 'Home'
  if (pathname.startsWith('/login')) return 'Login'
  if (pathname.startsWith('/signup')) return 'Sign Up'
  if (pathname.startsWith('/shop')) return 'Shop'
  if (pathname.startsWith('/admin')) return 'Admin Panel'
  if (pathname.startsWith('/demo')) return 'Live Demo'
  return 'Larkspur_crochets'
}

export default function AppNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const title = pageTitle(location.pathname)

  const goShop = () => {
    if (!user) return navigate('/login', { state: { message: 'Please login to continue', redirectTo: '/shop' } })
    navigate('/shop')
  }

  const doLogout = () => {
    logout()
    showToast('Logged out successfully', 'success')
    navigate('/', { replace: true })
  }

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 flex justify-between items-center px-6 py-3 liquid-glass rounded-full border border-white/20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white"
        >
          Back
        </button>
        <Link to="/" className="text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white">
          Home
        </Link>
        <BrandLogo />
      </div>

      <div className="hidden md:block text-[11px] uppercase tracking-[0.3em] text-white/65">{title}</div>

      <div className="flex items-center gap-4">
        <button onClick={goShop} className="text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white">
          Shop
        </button>
        <Link to="/login" className="text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white">
          Admin
        </Link>
        {user ? (
          <button onClick={doLogout} className="bg-white text-black px-5 py-2 rounded-full text-sm">
            Logout
          </button>
        ) : (
          <Link to="/login" className="liquid-glass px-6 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-widest border border-white/10">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

