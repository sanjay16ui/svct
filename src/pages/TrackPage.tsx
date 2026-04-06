import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Mesh } from 'three'

const stages = [
  { title: '📦 Order Confirmed', desc: 'Your order is confirmed and ready to begin.' },
  { title: '🏭 Being Handcrafted with Love', desc: 'Your piece is being made stitch by stitch.' },
  { title: '🚚 Out for Delivery', desc: 'It’s on the move to your destination.' },
  { title: '🏠 Delivered to You!', desc: 'Delivered with love — enjoy your handmade piece.' },
]

function StarField() {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.03
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[18, 32, 32]} />
      <meshBasicMaterial color="#000000" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function Globe() {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.18
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.6, 48, 48]} />
      <meshStandardMaterial color="#0b0b0b" emissive="#f59e0b" emissiveIntensity={0.22} wireframe />
    </mesh>
  )
}

function Truck({ progress }: { progress: number }) {
  const ref = useRef<Mesh>(null)
  const t = Math.min(1, Math.max(0, progress))
  // simple curved path
  const x = -1.3 + 2.6 * t
  const z = 0.3 * Math.sin(t * Math.PI)
  const y = 0.2 * Math.sin(t * Math.PI)
  useFrame(() => {
    if (!ref.current) return
    ref.current.position.set(x, y, z)
    ref.current.rotation.y = -0.5
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.22, 0.12, 0.12]} />
      <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.35} />
    </mesh>
  )
}

export default function TrackPage() {
  const { orderId } = useParams()
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stageTimer = setInterval(() => setStage((s) => (s + 1) % stages.length), 4000)
    const progTimer = setInterval(() => setProgress((p) => (p + 0.03) % 1), 120)
    return () => {
      clearInterval(stageTimer)
      clearInterval(progTimer)
    }
  }, [])

  const displayId = useMemo(() => `#LK2024${String(orderId || '0000').padStart(4, '0')}`, [orderId])

  return (
    <main className="fixed inset-0 bg-black text-white">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0.3, 5], fov: 50 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 2]} intensity={2.2} color="#f59e0b" />
          <StarField />
          <Globe />
          <Truck progress={stage >= 2 ? progress : 0} />
        </Canvas>
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link to="/shop" className="liquid-glass px-4 py-2 rounded-full border border-white/10 text-sm">
          ← Back to Shop
        </Link>
      </div>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-6 top-24 bottom-6 w-[340px] z-10 liquid-glass rounded-3xl border border-white/10 p-6 overflow-auto"
      >
        <h1 className="font-serif text-4xl mb-1">Order Tracking</h1>
        <p className="text-white/70 mb-6">Order ID: <span className="font-mono text-white/85">{displayId}</span></p>

        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-[0.35em] mb-2">Status</p>
          <p className="font-serif text-2xl">{stages[stage].title}</p>
          <p className="text-white/70 mt-2">{stages[stage].desc}</p>
        </div>

        <div className="mt-6">
          <p className="text-white/60 text-xs uppercase tracking-[0.35em] mb-2">Estimated</p>
          <p className="text-white/80">3–5 business days</p>
        </div>

        <div className="mt-8">
          <p className="text-white/60 text-xs uppercase tracking-[0.35em] mb-3">Timeline</p>
          <div className="space-y-3">
            {stages.map((s, i) => (
              <div key={s.title} className={`liquid-glass rounded-2xl border border-white/10 p-3 ${i <= stage ? 'bg-amber-500/10' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white/85">{s.title}</span>
                  <span className="text-white/60">{i <= stage ? '✓' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>
    </main>
  )
}

