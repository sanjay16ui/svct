import { Link } from 'react-router-dom'
import HeroParticles from '../components/HeroParticles'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const descriptors = [
  'Crochet sets | Art | Cozy things',
  'Handmade happiness in every stitch ✨',
  'Turning yarn into art 🎨',
  'Crochet sets & cozy creations',
]

const bgAudio: HTMLAudioElement =
  typeof Audio !== 'undefined'
    ? new Audio('/audio/intro.mp3')
    : (null as unknown as HTMLAudioElement)

if (typeof Audio !== 'undefined') {
  bgAudio.loop = true
  bgAudio.volume = 0.4
}

const stats = [
  { value: 500, label: 'Happy Customers', suffix: '+', icon: '✨' },
  { value: 200, label: 'Handmade Pieces', suffix: '+', icon: '🧶' },
  { value: 4.9, label: 'Star Rating', suffix: '', icon: '⭐' },
  { value: 100, label: 'Fast Deliveries', suffix: '%', icon: '📦' },
]

function StatCounter({ stat, animate }: { stat: any, animate: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animate) return
    let start = 0
    const interval = setInterval(() => {
      start += (stat.value / 30)
      if (start >= stat.value) {
        setCount(stat.value)
        clearInterval(interval)
      } else {
        setCount(start)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [animate, stat.value])

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="text-3xl mb-2">{stat.icon}</span>
      <div className="font-serif italic text-5xl text-[#f5c842] mb-1">
        {count % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}{stat.suffix}
      </div>
      <span className="text-white text-sm uppercase tracking-widest">{stat.label}</span>
    </div>
  )
}

function AnimatedStatsSection() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="w-full bg-[rgba(255,255,255,0.03)] py-12 border-y border-white/5 backdrop-blur-md relative z-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <StatCounter key={i} stat={s} animate={inView} />
        ))}
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [muted, setMuted] = useState(false)
  const inlineVideoRef = useRef<HTMLVideoElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const p = document.createElement('div')
      p.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:8px;height:8px;background:radial-gradient(circle,#f5c842,transparent);
        border-radius:50%;pointer-events:none;z-index:9999;
        transform:translate(-50%,-50%);animation:sparkle 0.8s ease forwards;
      `
      document.body.appendChild(p)
      setTimeout(() => p.remove(), 800)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress((window.scrollY / total) * 100)
      setShowTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const playAudio = () => {
      bgAudio.play().catch(() => { })
    }

    playAudio()

    const events: Array<keyof DocumentEventMap> = ['click', 'touchstart', 'keydown', 'scroll']
    events.forEach((e) => document.addEventListener(e, playAudio, { once: true }))

    return () => {
      bgAudio.pause()
      bgAudio.currentTime = 0
      events.forEach((e) => document.removeEventListener(e, playAudio))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="bg-black text-white min-h-screen">
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '3px',
        width: `${scrollProgress}%`, zIndex: 99999,
        background: 'linear-gradient(90deg,#f5c842,#e8a020)',
        transition: 'width 0.1s ease'
      }} />
      {showTop && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: 32, right: 32, width: 48, height: 48,
            borderRadius: '50%', background: '#f5c842', border: 'none',
            cursor: 'pointer', zIndex: 9999, fontSize: 20,
            boxShadow: '0 0 20px #f5c84260'
          }}
        >⬆</motion.button>
      )}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-24 pb-28 overflow-hidden">
        <HeroParticles />
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-35">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" />
          </video>
        </div>
        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="font-serif italic text-white text-6xl md:text-8xl tracking-tight mb-6 opacity-90 leading-tight">
            Handmade happiness in every stitch
          </h1>
          <div className="mb-10 flex flex-col items-center gap-2">
            {descriptors.map((line) => (
              <p key={line} className="inline-block px-4 py-1.5 rounded-full liquid-glass text-white/60 text-sm italic font-serif">
                {line}
              </p>
            ))}
          </div>
          <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
            <p className="text-white/70 text-lg leading-relaxed">
              Larkspur_crochets creates handmade crochet pieces that feel warm, artistic, and special — from stylish crochet sets to cozy creations designed to bring beauty, texture, and personality into everyday life.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/login"
                state={{ message: 'Please login to continue', redirectTo: '/shop' }}
                className="bg-white text-black px-10 py-4 rounded-full text-sm font-semibold uppercase tracking-widest hover:scale-105 transition-all"
                onClick={() => {
                  bgAudio.pause()
                  bgAudio.currentTime = 0
                }}
              >
                Shop Collection
              </Link>
              <a
                href="#about"
                className="liquid-glass px-10 py-4 rounded-full text-sm font-serif italic border border-white/10 hover:bg-white/5 transition-all"
              >
                About the Brand
              </a>
              {!showVideo ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowVideo(true)
                    setTimeout(() => {
                      if (inlineVideoRef.current) {
                        inlineVideoRef.current.play().catch(() => { })
                      }
                    }, 50)
                  }}
                  className="px-10 py-4 rounded-full text-sm font-serif italic border border-[#f5c842]/60 text-white hover:bg-[#f5c842] hover:text-black transition-all shadow-[0_0_18px_rgba(245,200,66,0.12)]"
                >
                  ▶ My First Memorable Moment
                </button>
              ) : (
                <motion.div
                  initial={{ height: 0, opacity: 0, scale: 0.98 }}
                  animate={{ height: 560, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="relative"
                  style={{ width: 320 }}
                >
                  <button
                    className="absolute -top-3 -right-3 w-9 h-9 z-10 rounded-full bg-black/70 border border-white/10 text-white grid place-items-center"
                    onClick={() => {
                      if (inlineVideoRef.current) {
                        inlineVideoRef.current.pause()
                      }
                    }}
                  >
                    ⏸
                  </button>
                  <video
                    ref={inlineVideoRef}
                    src="/video/sur.mp4"
                    controls
                    playsInline
                    style={{
                      width: '320px',
                      height: '560px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      boxShadow: '0 0 30px rgba(245,200,66,0.4)',
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 md:bottom-12 z-20">
          <a
            className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
            href="https://www.instagram.com/larkspur_crochets_04?igsh=MWJ2aWZsczJ2bTM3Zw=="
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/75" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
            </svg>
          </a>
        </div>
      </section>

      <AnimatedStatsSection />

      <motion.section
        id="about"
        className="relative py-48 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,250,240,0.03)_0%,_transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-8">About Larkspur_crochets</span>
          <h2 className="font-serif text-white text-4xl md:text-6xl leading-tight tracking-tight mb-12">
            Turning <span className="italic text-white/40">yarn into art</span>, warmth, and beautiful handmade pieces
          </h2>
          <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            Our story is one of slow creation and deliberate beauty. We believe in the quiet power of handmade craftsmanship,
            where every loop of yarn is a moment of patience and intention.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="py-24 bg-black flex justify-center px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="w-full max-w-6xl relative group">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10">
            <video autoPlay className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" loop muted playsInline>
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4" />
            </video>
          </div>
          <div className="absolute -bottom-10 left-10 right-10 liquid-glass p-8 md:p-10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-white/10 shadow-2xl">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-2">Featured Collection</span>
              <p className="text-white/70 text-base leading-relaxed">
                Every Larkspur_crochets piece is thoughtfully handmade to bring softness, beauty, and character into everyday life.
              </p>
            </div>
            <Link
              to="/login"
              className="liquid-glass px-10 py-4 rounded-full text-xs uppercase font-semibold tracking-widest border border-white/20 hover:scale-105 transition-transform whitespace-nowrap"
            >
              View Collection
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-48 px-6 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-5xl md:text-7xl mb-24 tracking-tighter tracking-[0.05em]">
            Craftsmanship <span className="italic text-white/20 px-4">x Comfort</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="rounded-2xl overflow-hidden h-[600px] border border-white/5">
              <video autoPlay className="w-full h-full object-cover" loop muted playsInline>
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" />
              </video>
            </div>
            <div className="space-y-16">
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Made by hand</span>
                <h4 className="font-serif italic text-3xl">The Human Connection</h4>
                <p className="text-white/60 leading-relaxed text-lg">
                  Every piece begins with yarn, patience, and a love for beautiful detail.
                </p>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Designed to be loved</span>
                <h4 className="font-serif italic text-3xl">A Lifetime of Texture</h4>
                <p className="text-white/60 leading-relaxed text-lg">
                  Our handmade crochet pieces are created to bring warmth, charm, and quiet beauty into everyday moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-48 px-6 bg-black relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="font-serif text-6xl italic tracking-tight">What we create</h2>
            <p className="text-white/40 max-w-sm text-sm uppercase tracking-widest leading-loose text-right">
              From soft yarn to stunning art —<br />
              this is where cozy meets beautiful.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="liquid-glass rounded-[2.5rem] p-4 flex flex-col gap-6 group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(245,200,66,0.15)]">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-neutral-900">
                <video autoPlay className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" loop muted playsInline>
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10 right-10">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-white/80 mb-4 inline-block">Signature</span>
                  <h3 className="font-serif text-4xl italic mb-3">Crochet Sets</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    Every loop holds a little love 🧶<br />
                    Handcrafted with patience, finished with soul.
                  </p>
                </div>
              </div>
            </div>
            <div className="liquid-glass rounded-[2.5rem] p-4 flex flex-col gap-6 group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(245,200,66,0.15)]">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-neutral-900">
                <video autoPlay className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" loop muted playsInline>
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10 right-10">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-white/80 mb-4 inline-block">Cozy</span>
                  <h3 className="font-serif text-4xl italic mb-3">Art & Cozy Creations</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    Not just crochet — it is wearable poetry ✨<br />
                    Stitched one strand at a time, just for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-32 px-6 bg-black overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-5xl italic mb-12">Our Bestsellers 🌸</h2>

          <div className="relative w-full max-w-[800px] mx-auto aspect-square flex items-center justify-center my-20">
            {/* Center Focal Point - Static Text */}
            <div className="absolute z-50 flex justify-center items-center gap-2 md:gap-3 font-serif italic text-2xl md:text-3xl text-[#f5c842] drop-shadow-[0_0_15px_rgba(245,200,66,0.8)] backdrop-blur-md bg-black/40 px-6 py-4 rounded-full border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <span className="mr-1">✨</span>
              {['Most', 'Loved', 'Pieces'].map((word) => (
                <span
                  key={word}
                  className="inline-block origin-center"
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Orbit Rings & Images */}
            {(() => {
              const images = [
                '/images/pic1.jpg', '/images/pic2.jpg', '/images/pic3.jpg',
                '/images/pic4.jpg', '/images/pic5.jpg', '/images/pic6.jpg'
              ];
              // 3 concentric rings, 2 images per ring dynamically positioned
              const rings = [
                { id: 1, size: '45%', duration: 25, reverse: false },
                { id: 2, size: '70%', duration: 35, reverse: true },
                { id: 3, size: '100%', duration: 45, reverse: false }
              ];

              return rings.map((ring, ringIdx) => {
                const ringImages = images.slice(ringIdx * 2, ringIdx * 2 + 2);

                return (
                  <motion.div
                    key={ring.id}
                    className="absolute border border-white/10 rounded-full border-dashed"
                    style={{ width: ring.size, height: ring.size }}
                    animate={{ rotate: ring.reverse ? -360 : 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: ring.duration,
                      ease: "linear"
                    }}
                  >
                    {ringImages.map((src, imgIdx) => {
                      // Position images exactly opposite each other on the ring
                      const angle = imgIdx * 180;
                      // Determine placement offset:
                      const isTop = angle === 0;

                      return (
                        <div
                          key={src}
                          className="absolute w-20 h-28 md:w-28 md:h-40 -ml-10 -mt-14 md:-ml-14 md:-mt-20 overflow-hidden rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(245,200,66,0.15)] group"
                          style={{
                            top: isTop ? '0%' : '100%',
                            left: '50%',
                            transformOrigin: 'center center'
                          }}
                        >
                          <motion.img
                            src={src}
                            className="w-full h-full object-cover"
                            animate={{ rotate: ring.reverse ? 360 : -360 }} /* counter rotate so it stays upright */
                            transition={{
                              repeat: Infinity,
                              duration: ring.duration,
                              ease: "linear"
                            }}
                            alt="Orbital Bestseller"
                          />
                          <div
                            className="absolute inset-0 bg-transparent group-hover:bg-[#f5c842]/20 transition-colors duration-500 rounded-2xl md:rounded-[2rem] pointer-events-none"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
                              const id = imgIdx * 100 // fake ID for static bestseller items
                              if (w.includes(id)) {
                                localStorage.setItem('wishlist', JSON.stringify(w.filter((x: number) => x !== id)))
                                e.currentTarget.querySelector('svg')!.setAttribute('fill', 'transparent')
                              } else {
                                localStorage.setItem('wishlist', JSON.stringify([...w, id]))
                                e.currentTarget.querySelector('svg')!.setAttribute('fill', '#f5c842')
                              }
                            }}
                            style={{
                              position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)',
                              border: '1px solid rgba(245,200,66,0.4)', borderRadius: '50%',
                              width: 36, height: 36, cursor: 'pointer', zIndex: 10,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="transparent" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </motion.div>
                )
              });
            })()}

            {/* Glowing background gradient dust behind orbit */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,200,66,0.05)_0%,_transparent_60%)] pointer-events-none" />
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-32 px-6 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto liquid-glass p-12 md:p-20 rounded-[3rem] text-center border border-white/10">
          <h2 className="font-serif italic text-5xl mb-8">Let’s connect</h2>
          <p className="text-white/60 text-lg mb-12">Have a custom request or just want to chat about crochet? We'd love to hear from you.</p>
          <Link
            to="/login"
            onClick={() => {
              bgAudio.pause()
              bgAudio.currentTime = 0
            }}
            className="bg-white text-black px-12 py-5 rounded-full text-sm font-semibold uppercase tracking-widest hover:scale-105 transition-all inline-block"
          >
            Get in touch
          </Link>
        </div>
      </motion.section>

      <footer className="w-full py-24 px-8 flex flex-col md:flex-row justify-between items-center gap-12 bg-black border-t border-white/5">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <div className="font-serif italic text-2xl text-white/90">Larkspur_crochets</div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">© 2026 LARKSPUR_CROCHETS. ARTISAN CRAFTED.</p>
        </div>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em]">
          <a className="text-white/40 hover:text-white transition-opacity" href="https://www.instagram.com/larkspur_crochets_04?igsh=MWJ2aWZsczJ2bTM3Zw==" target="_blank" rel="noreferrer">Instagram</a>
          <span className="text-white/20">Pinterest</span>
          <span className="text-white/20">Email</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <button className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-sm text-white/70">↑</span>
          </button>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => {
          bgAudio.muted = !muted
          setMuted(!muted)
        }}
        className="fixed bottom-6 right-6 z-[999] w-[44px] h-[44px] rounded-full bg-black/60 border border-[#f5c842] grid place-items-center text-white/90"
        aria-label="Toggle audio"
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* inline video replaces fullscreen modal */}
    </main>
  )
}
