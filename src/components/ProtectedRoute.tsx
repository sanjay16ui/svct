import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace state={{ message: 'Please login to continue', redirectTo: '/shop' }} />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace state={{ message: 'Admin access only', redirectTo: '/admin' }} />
  return <>{children}</>
}
