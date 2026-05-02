import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'

const ratings = [
  { platform: 'Codeforces', value: 1617, label: 'Expert', sublabel: 'Rank 111 Global', color: 'var(--color-accent)' },
  { platform: 'CodeChef', value: 1637, label: '3 Star', sublabel: 'Rating', color: 'var(--color-accent-secondary)' },
  { platform: 'LeetCode', value: 1847, label: 'Max Rating', sublabel: 'Peak Performance', color: '#ffffff' },
  { platform: 'Problems', value: 400, label: '400+', sublabel: 'Solved on Codeforces', color: 'var(--color-accent)' },
]

function RatingBlock({ rating, index }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: rating.value,
      duration: 2.5,
      delay: index * 0.15,
      ease: 'power2.out',
      onUpdate: () => setDisplayVal(Math.round(obj.val)),
    })
  }, [inView, rating.value, index])

  return (
    <motion.div
      ref={ref}
      className="glass-card flex flex-col items-center text-center interactive group transition-all duration-500 hover:-translate-y-2"
      style={{ padding: '50px 24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Platform label */}
      <span className="font-mono mb-6 transition-colors duration-300 group-hover:text-white" style={{ fontSize: '0.65rem', letterSpacing: '4px', color: rating.color }}>
        {rating.platform.toUpperCase()}
      </span>

      {/* Big number */}
      <span className="font-bebas transition-all duration-300 group-hover:scale-110" style={{ fontSize: 'clamp(4rem, 6vw, 6rem)', color: '#ffffff', lineHeight: 1, textShadow: `0 0 30px ${rating.color}40` }}>
        {displayVal}{rating.platform === 'Problems' && '+'}
      </span>

      {/* Label */}
      <span className="font-dm mt-4 tracking-widest uppercase transition-colors duration-300" style={{ color: rating.color, fontSize: '0.85rem', fontWeight: 600 }}>
        {rating.label}
      </span>

      {/* Sublabel */}
      <span className="font-mono mt-3 opacity-60 transition-opacity duration-300 group-hover:opacity-100" style={{ fontSize: '0.55rem', letterSpacing: '2px', color: 'var(--color-text)' }}>
        {rating.sublabel}
      </span>
    </motion.div>
  )
}

export default function RatingsSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="ratings" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        {/* Section label */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
          <span className="font-mono text-[0.65rem] tracking-[0.4em] text-[var(--color-accent)]">
            04 — COMPETITIVE
          </span>
        </motion.div>

        <motion.h2
          className="font-bebas text-stroke hover:text-white transition-all duration-500"
          style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', lineHeight: 0.85 }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          RATINGS
        </motion.h2>
        <div className="section-divider mt-8 mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ratings.map((r, i) => (
            <RatingBlock key={r.platform} rating={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
