import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/** Fallback cycles when API is unreachable — duplicated client-side for seamless loop (same visual length as before). */
const FALLBACK_BASE_ROW1 = [
  'REACT NATIVE',
  'NODE.JS',
  'THREE.JS',
  'FRAMER MOTION',
  'TAILWIND CSS',
  'MONGODB',
  'EXPRESS',
]
const FALLBACK_BASE_ROW2 = ['C++', 'JAVASCRIPT', 'TYPESCRIPT', 'GSAP', 'WEBGL', 'NEXT.JS', 'POSTGRESQL']

function doubleCycle(base) {
  if (!base?.length) return []
  return [...base, ...base]
}

function MarqueeRow({ items, direction = 1, speed = 15 }) {
  const containerRef = useRef(null)
  
  // Create an infinite animation loop
  return (
    <div ref={containerRef} className="flex whitespace-nowrap overflow-hidden py-4">
      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: speed }}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-bebas text-stroke hover:text-[var(--color-accent)] transition-colors duration-300 interactive cursor-default"
            style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', lineHeight: 0.9 }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function TechMarqueeSection() {
  const [marquee, setMarquee] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/tech-marquee/', { credentials: 'same-origin' })
        if (!res.ok) throw new Error('tech_marquee_unavailable')
        const data = await res.json()
        const r1 = Array.isArray(data.row1) ? data.row1 : []
        const r2 = Array.isArray(data.row2) ? data.row2 : []
        if (!cancelled) setMarquee({ row1: r1, row2: r2 })
      } catch {
        if (!cancelled) setMarquee(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const techRow1 = useMemo(
    () => doubleCycle(marquee?.row1?.length ? marquee.row1 : FALLBACK_BASE_ROW1),
    [marquee],
  )
  const techRow2 = useMemo(
    () => doubleCycle(marquee?.row2?.length ? marquee.row2 : FALLBACK_BASE_ROW2),
    [marquee],
  )

  return (
    <section className="relative w-full py-24 bg-[var(--color-bg)] overflow-hidden" style={{ zIndex: 1 }}>
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent-secondary)] to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-30"></div>

      <div className="relative transform -rotate-2 scale-105 my-12">
        <MarqueeRow items={techRow1} direction={1} speed={25} />
        <MarqueeRow items={techRow2} direction={-1} speed={30} />
      </div>
      
      {/* Heavy gradient shadows on edges to fade out text smoothly */}
      <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
    </section>
  )
}
