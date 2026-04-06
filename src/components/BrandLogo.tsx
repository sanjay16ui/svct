export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="thread-logo h-8 w-8">
        <svg viewBox="0 0 44 44" fill="none" className="h-full w-full">
          <path
            d="M8 24c0-8 6-14 14-14 9 0 14 8 10 14-4 7-15 5-15-2 0-4 3-7 7-7 3 0 6 2 6 5 0 3-2 4-4 4-2 0-3-1-3-3"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="thread-shimmer"
          />
          <path
            d="M23 25c2 1 4 4 2 7-1 2-4 3-6 2"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-serif text-xl tracking-tight brand-glow">
        Larkspur<span className="underscore-shimmer">_</span>crochets
      </span>
    </div>
  )
}
