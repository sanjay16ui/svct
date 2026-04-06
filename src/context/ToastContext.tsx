import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastTone = 'default' | 'success' | 'error'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: Toast | null
  showToast: (message: string, tone?: ToastTone, durationMs?: number) => void
  clearToast: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)

  const value = useMemo(
    () => ({
      toast,
      showToast: (message: string, tone: ToastTone = 'default', durationMs = 2200) => {
        const id = String(Date.now())
        setToast({ id, message, tone })
        window.setTimeout(() => {
          setToast((t) => (t?.id === id ? null : t))
        }, durationMs)
      },
      clearToast: () => setToast(null),
    }),
    [toast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

