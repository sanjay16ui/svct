import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'

export default function ToastHost() {
  const { toast } = useToast()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          className="fixed top-8 right-8 z-[100] liquid-glass px-5 py-3 rounded-2xl border border-white/10"
          style={{
            borderColor:
              toast.tone === 'error'
                ? 'rgba(248,113,113,0.45)'
                : toast.tone === 'success'
                  ? 'rgba(52,211,153,0.35)'
                  : 'rgba(255,255,255,0.12)',
          }}
        >
          <div className="text-white/90">{toast.message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

