import React, { useMemo, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

type StageCardType = {
  title: string
  subtitle: string
  color: string
}

const stages: StageCardType[] = [
  { title: '📦 Order Confirmed', subtitle: 'Your order has been received', color: '#00ff88' },
  { title: '🏭 Being Handcrafted', subtitle: 'Made with love just for you', color: '#f5c842' },
  { title: '🚚 Out for Delivery', subtitle: 'On its way to your doorstep', color: '#3b82f6' },
  { title: '🏠 Arriving Soon', subtitle: 'Almost there!', color: '#a855f7' },
  { title: '✅ Delivered!', subtitle: 'Enjoy your handmade piece ✨', color: '#f5c842' },
]

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

function FloatingLabel({ text, position }: { text: string, position: [number, number, number] }) {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 128
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.fillStyle = 'transparent'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.font = 'italic 48px serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#f5c842'
            ctx.fillText(text, canvas.width / 2, canvas.height / 2)
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [text])

    const spriteMaterial = useMemo(() => new THREE.SpriteMaterial({ map: texture, transparent: true }), [texture])

    const spriteObj = useMemo(() => {
        const s = new THREE.Sprite(spriteMaterial)
        s.position.set(position[0], position[1], position[2])
        s.scale.set(4, 1, 1)
        return s
    }, [spriteMaterial, position])

    return <primitive object={spriteObj} />
}

function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const starCount = 8000
    const pos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 200 
    }
    return pos
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.08} sizeAttenuation={true} fog={false} depthWrite={false} />
    </points>
  )
}

function City({ xOffset, isDestination }: { xOffset: number, isDestination: boolean }) {
  const buildings = useMemo(() => {
    const b = []
    const count = isDestination ? 8 : 6
    for (let i = 0; i < count; i++) {
        const height = isDestination && i === 0 ? 5 + Math.random() : 1.5 + Math.random() * 2.5
        b.push({
            position: [
              (Math.random() - 0.5) * 4, 
              height / 2, 
              (Math.random() - 0.5) * 4
            ] as [number, number, number],
            scale: [0.8 + Math.random() * 0.5, height, 0.8 + Math.random() * 0.5] as [number, number, number]
        })
    }
    return b
  }, [isDestination])

  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#0a0a2a', 
    emissive: '#0a0a0a',
    roughness: 0.9
  }), [])

  const windows = useMemo(() => {
     const w = []
     for(let i=0; i< buildings.length * 3; i++) {
         const bItem = buildings[Math.floor(Math.random() * buildings.length)];
         w.push({
             position: [
                 bItem.position[0] + (Math.random() > 0.5 ? bItem.scale[0]/2 : -bItem.scale[0]/2) * 1.01,
                 Math.random() * bItem.scale[1],
                 bItem.position[2] + (Math.random() > 0.5 ? bItem.scale[2]/2 : -bItem.scale[2]/2) * 1.01
             ] as [number, number, number]
         })
     }
     return w
  }, [buildings])

  return (
    <group position={[xOffset, 0, 0]}>
      {buildings.map((b, i) => (
        <mesh key={`b-${i}`} position={b.position} scale={b.scale} material={material}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      {windows.map((w, i) => (
         <mesh key={`w-${i}`} position={w.position}>
             <boxGeometry args={[0.1, 0.1, 0.1]} />
             <meshStandardMaterial color="#ffffff" emissive="#ffffff" />
         </mesh>
      ))}
    </group>
  )
}

function ExhaustParticles({ truckPos }: { truckPos: THREE.Vector3 }) {
  const group = useRef<THREE.Group>(null)
  const particles = useRef<{ pos: THREE.Vector3, life: number, maxLife: number }[]>([])

  useFrame(() => {
    if (Math.random() > 0.5) {
       particles.current.push({
           pos: new THREE.Vector3(truckPos.x - 0.5 + (Math.random()-0.5)*0.2, truckPos.y, truckPos.z + (Math.random()-0.5)*0.2),
           life: 0,
           maxLife: 40 + Math.random() * 20
       })
    }

    if (group.current) {
      group.current.children.forEach((mesh: any, i) => {
         const p = particles.current[i]
         if (p) {
             p.life++
             mesh.position.copy(p.pos)
             p.pos.y += 0.01
             mesh.material.opacity = 1 - (p.life / p.maxLife)
             mesh.scale.setScalar(1 + (p.life / p.maxLife) * 2)
             mesh.visible = p.life < p.maxLife
         } else {
             mesh.visible = false
         }
      })
    }
  })

  return (
    <group ref={group}>
        {Array.from({ length: 40 }).map((_, i) => (
            <mesh key={i} visible={false}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#666666" transparent opacity={0.5} />
            </mesh>
        ))}
    </group>
  )
}

function TruckAndPath({ setStage, stageRef }: { setStage: (s: number) => void, stageRef: React.MutableRefObject<number> }) {
  const truckRef = useRef<THREE.Group>(null)
  const wheelsRef = useRef<THREE.Group>(null)
  const [truckPos, setTruckPos] = useState(new THREE.Vector3(-8, 0.3, 0))

  const pathCurve = useMemo(() => {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(-8, 0.3, 0),
      new THREE.Vector3(-3, 0.3, 4),
      new THREE.Vector3(3, 0.3, -4),
      new THREE.Vector3(8, 0.3, 0),
    )
  }, [])

  const pathGeo = useMemo(() => {
    const points = pathCurve.getPoints(100)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [pathCurve])

  const progress = useRef(0)
  const confettiTriggered = useRef(false)

  const lineMat = useMemo(() => new THREE.LineDashedMaterial({ color: 0xf5c842, dashSize: 0.2, gapSize: 0.1, transparent: true, opacity: 0.6 }), [])
  const lineObj = useMemo(() => {
      const l = new THREE.Line(pathGeo, lineMat)
      l.computeLineDistances()
      return l
  }, [pathGeo, lineMat])

  const triggerConfetti = () => {
    if (confettiTriggered.current) return;
    confettiTriggered.current = true;
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6, x: 0.7 },
      colors: ['#f5c842', '#ffffff', '#fffeca'],
      gravity: 0.8,
      ticks: 300
    })
    try {
        const audio = new Audio('/audio/success.mp3') 
        audio.play().catch(() => {})
    } catch(e) {}
  }

  useFrame((_state, delta) => {
    if (!truckRef.current || !wheelsRef.current) return

    progress.current += delta * 0.03
    
    let currentProgress = progress.current;
    if (currentProgress > 1) {
       currentProgress = 0
       progress.current = 0
       confettiTriggered.current = false
       setStage(0)
       stageRef.current = 0
    }

    let currentStage = 0
    if (currentProgress > 0.2) currentStage = 1
    if (currentProgress > 0.5) currentStage = 2
    if (currentProgress > 0.75) currentStage = 3
    if (currentProgress > 0.98) currentStage = 4

    if (stageRef.current !== currentStage) {
        stageRef.current = currentStage
        setStage(currentStage)
        if (currentStage === 4) {
            triggerConfetti()
        }
    }

    const pos = pathCurve.getPointAt(currentProgress)
    const tangent = pathCurve.getTangentAt(currentProgress)

    truckRef.current.position.copy(pos)
    truckRef.current.lookAt(pos.clone().add(tangent))

    wheelsRef.current.children.forEach(wheel => {
        wheel.rotation.x -= delta * 5
    })

    setTruckPos(pos.clone())
  })

  return (
    <>
      <primitive object={lineObj} />
      
      <group ref={truckRef}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#f5c842" emissive="#332200" />
        </mesh>
        <mesh position={[0.6, 0.25, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#f5c842" />
        </mesh>

        <pointLight position={[0.9, 0.2, 0.2]} color="#ffffff" intensity={2} distance={3} />
        <pointLight position={[0.9, 0.2, -0.2]} color="#ffffff" intensity={2} distance={3} />

        <group ref={wheelsRef}>
            <mesh position={[0.5, 0, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.5, 0, -0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[-0.4, 0, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[-0.4, 0, -0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
        </group>
      </group>

      <ExhaustParticles truckPos={truckPos} />
    </>
  )
}

function Scene({ setStage, stageRef }: { setStage: (s: number) => void, stageRef: React.MutableRefObject<number> }) {
  useFrame((state) => {
     const t = state.clock.getElapsedTime()
     state.camera.position.x = Math.sin(t * 0.05) * 14
     state.camera.position.z = Math.cos(t * 0.05) * 14
     state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <color attach="background" args={['#000008']} />
      <fog attach="fog" args={['#100a20', 10, 40]} />
      <StarField />

      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={2} color="#f5c842" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050510" roughness={1} />
      </mesh>
      
      <primitive object={new THREE.GridHelper(20, 20, 0xf5c842, 0x333333)} position={[0, 0, 0]} />

      <City xOffset={-8} isDestination={false} />
      <pointLight position={[-8, 2, 0]} color="#00ff88" intensity={3} distance={10} />
      <FloatingLabel text="ORIGIN" position={[-8, 6, 0]} />
      
      <City xOffset={8} isDestination={true} />
      <pointLight position={[8, 2, 0]} color="#f5c842" intensity={3} distance={10} />
      <FloatingLabel text="DESTINATION" position={[8, 6, 0]} />

      <TruckAndPath setStage={setStage} stageRef={stageRef} />
      
      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={5} maxDistance={20} enableZoom={false} />
    </>
  )
}


export default function TrackOrderPage() {
  const { orderId } = useParams()
  const [stage, setStage] = useState(0)
  const stageRef = useRef(stage)

  const progressPct = ((stage) / 4) * 100

  return (
    <main className="h-screen w-full bg-[#000008] text-white flex flex-col md:flex-row overflow-hidden relative">
      
      <aside className="w-full md:w-[30%] h-full p-8 z-10 flex flex-col justify-between" 
             style={{ 
                 background: 'rgba(0,0,0,0.85)', 
                 backdropFilter: 'blur(10px)',
                 borderRight: '1px solid rgba(245,200,66,0.2)' 
             }}>
          
        <div>
            <div className="mb-8">
               <h1 className="text-[1.4rem] font-serif italic text-[#f5c842] mb-1">📦 ORDER #LK{orderId || '0000'}</h1>
               <p className="text-white/50 text-sm">Estimated: 3–5 Business Days</p>
            </div>

            <div className="w-full h-[8px] bg-white/20 rounded-[10px] relative mb-12">
                <div 
                    className="absolute h-full bg-gradient-to-r from-[#f5c842] to-[#ffeba8] rounded-[10px] transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPct}%` }}
                ></div>
                
                <div 
                    className="absolute w-3 h-3 bg-[#f5c842] rounded-full shadow-[0_0_10px_#f5c842] transition-all duration-1000 ease-out transform -translate-y-1/2 top-1/2"
                    style={{ left: `${progressPct}%`, marginLeft: '-6px' }}
                ></div>
            </div>

            <div className="space-y-4">
                {stages.map((s, i) => {
                    const active = i === stage
                    const past = i < stage
                    return (
                        <motion.div
                            key={i}
                            animate={active ? { scale: 1.04, opacity: 1 } : { scale: 1, opacity: past ? 0.7 : 0.25 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="p-4 rounded-xl flex items-center gap-4 relative overflow-hidden"
                            style={{
                                background: active ? `rgba(${hexToRgb(s.color)}, 0.1)` : 'transparent',
                                borderLeft: active ? `4px solid ${s.color}` : '4px solid transparent',
                                boxShadow: active ? `0 0 25px ${s.color}30` : 'none'
                            }}
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg" style={{ color: active ? s.color : 'white' }}>{s.title}</h3>
                                <p className="text-sm text-white/60">{s.subtitle}</p>
                            </div>
                            {past && <div className="text-xl" style={{ color: s.color }}>✓</div>}
                        </motion.div>
                    )
                })}
            </div>
        </div>

        <div className="mt-8">
            <Link to="/shop" className="inline-block px-6 py-3 rounded-full border border-[#f5c842] text-[#f5c842] hover:bg-[#f5c842] hover:text-black transition-colors">
                ← Back to Shop
            </Link>
        </div>
      </aside>

      <div className="flex-1 h-full relative w-full md:w-[70%]">
         <Canvas shadows dpr={[1, 2]} style={{ background: '#000008' }} camera={{ position: [0, 6, 14], fov: 45 }}>
            <Suspense fallback={null}>
               <Scene setStage={setStage} stageRef={stageRef} />
            </Suspense>
         </Canvas>
      </div>

    </main>
  )
}
