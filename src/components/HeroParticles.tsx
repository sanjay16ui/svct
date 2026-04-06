import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Points } from 'three'

function Particles() {
  const ref = useRef<Points>(null)
  const points = useMemo(() => {
    const arr = new Float32Array(70 * 3)
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (Math.random() - 0.5) * 11
      arr[i + 1] = (Math.random() - 0.5) * 6
      arr[i + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.04
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fef3c7" size={0.04} transparent opacity={0.45} />
    </points>
  )
}

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
        <ambientLight intensity={0.4} />
        <Particles />
      </Canvas>
    </div>
  )
}
