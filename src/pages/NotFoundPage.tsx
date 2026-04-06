import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="liquid-glass rounded-3xl border border-white/10 p-10 w-full max-w-xl text-center">
        <p className="text-white/60 text-[11px] uppercase tracking-[0.35em] mb-4">404</p>
        <h1 className="font-serif text-6xl mb-3">Lost in the void</h1>
        <p className="text-white/70 mb-8">
          This page doesn’t exist — but your next handmade piece still can.
        </p>
        <Link to="/" className="bg-white text-black px-8 py-3 rounded-full font-semibold">
          Go Home
        </Link>
      </div>
    </main>
  )
}

