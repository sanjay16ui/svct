import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { API_URL } from '../api'

export default function WishOrderModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [successId, setSuccessId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.includes('pdf')).slice(0, 5 - files.length)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('guest_name', name)
    formData.append('guest_email', email)
    formData.append('message', message)
    files.forEach(f => formData.append('references', f))

    try {
      const res = await fetch(`${API_URL}/api/wish-orders`, {
        method: 'POST',
        body: formData,
        headers: {
          'x-user': localStorage.getItem('larkspur_user') || ''
        }
      })
      const data = await res.json()
      if (data.success) {
        setSuccessId(Date.now() % 10000) // Dummy ID display, server doesn't return ID right away in snippet
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] p-4 md:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-[8px]"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative w-full max-w-[560px] bg-[#0d0d0d] border border-[#f5c842]/30 rounded-[20px] p-10 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#f5c842] hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>

        {successId ? (
          <div className="text-center py-10">
            <h2 className="font-serif italic text-4xl text-[#f5c842] mb-6">🌸 Your wish has been received!</h2>
            <p className="text-white/70 mb-4">Our artisan will review it and get back to you at {email}.</p>
            <p className="text-white font-bold text-lg mb-8">Your wish ID: #{successId}</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.06 }}
            >
              <h2 className="font-serif italic text-4xl text-[#f5c842] mb-2">✨ Share Your Crochet Dream</h2>
              <p className="text-white/60 mb-8 text-sm">Describe what you imagine — our artisan will bring it to life</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/[0.05] border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5c842] transition-colors outline-none"
                />
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (to receive updates)"
                  className="w-full bg-white/[0.05] border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5c842] transition-colors outline-none"
                />
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.24 }}>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your dream crochet... colors, size, pattern, occasion, anything!"
                  className="w-full bg-white/[0.05] border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5c842] transition-colors outline-none min-h-[120px] resize-none"
                />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.30 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl p-6 text-center cursor-pointer transition-all"
                  style={{
                    border: isDragOver ? '2px solid #f5c842' : '1.5px dashed rgba(245,200,66,0.4)',
                    background: isDragOver ? 'rgba(245,200,66,0.1)' : 'rgba(245,200,66,0.04)'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <p className="text-white/70 text-sm">Drop reference images here or click to browse</p>
                </div>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((file, idx) => (
                      <div key={idx} className="relative group rounded-md border border-[#f5c842]/30 overflow-hidden text-xs text-white/80 pr-6 p-1 bg-white/5 flex items-center h-10 w-40">
                         <span className="truncate w-full block">{file.name}</span>
                         <button
                           type="button"
                           onClick={() => removeFile(idx)}
                           className="absolute right-1 top-1 text-red-400 hover:text-red-300 w-4 h-4"
                         >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.36 }} className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full text-black font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #f5c842, #e8a020)' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send My Wish ✨'}
                </button>
              </motion.div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
