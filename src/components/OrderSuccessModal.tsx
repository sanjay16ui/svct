import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { useNavigate } from 'react-router-dom'

function ThreadLoop() {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.5
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1, 0.2, 22, 80]} />
      <meshStandardMaterial emissive="#fef3c7" color="#d4d4d8" metalness={0.5} roughness={0.25} />
    </mesh>
  )
}

export default function OrderSuccessModal({ onClose, orderId }: { onClose: () => void; orderId: number | null }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-xl rounded-3xl border border-white/10 overflow-hidden p-10 text-center"
      >
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
            <ambientLight intensity={0.65} />
            <pointLight position={[2, 3, 2]} intensity={3} color="#fde68a" />
            <ThreadLoop />
          </Canvas>
        </div>
        <div className="relative z-10">
          <h3 className="font-serif text-4xl mb-4">Order Placed Successfully!</h3>
          <p className="text-white/80">
            Your handmade piece is on its way ✨
            <br />
            Thank you for choosing Larkspur_crochets
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const trackId = orderId ?? 1
                navigate(`/track/${trackId}`)
                onClose()
              }}
              className="bg-amber-300 text-black px-6 py-3 rounded-full font-semibold"
              disabled={false}
            >
              Track Your Order 🗺️
            </button>
            <button onClick={onClose} className="bg-white text-black px-8 py-3 rounded-full font-semibold">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
