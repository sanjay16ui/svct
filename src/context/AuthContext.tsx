import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  login: (newUser: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('larkspur_user')
    return raw ? (JSON.parse(raw) as User) : null
  })

  const value = useMemo(
    () => ({
      user,
      login: (newUser: User) => {
        setUser(newUser)
        localStorage.setItem('larkspur_user', JSON.stringify(newUser))
      },
      logout: () => {
        setUser(null)
        localStorage.removeItem('larkspur_user')
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
