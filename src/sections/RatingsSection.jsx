import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import NumberTicker from '../components/NumberTicker'
import TextReveal from '../components/TextReveal'
import MagicCard from '../components/MagicCard'

const ratings = [
  { platform: 'Codeforces', value: 1617, label: 'Expert', sublabel: 'Rank 111 Global', color: 'var(--color-accent)' },
  { platform: 'CodeChef', value: 1637, label: '3 Star', sublabel: 'Rating', color: 'var(--color-accent-secondary)' },
  { platform: 'LeetCode', value: 1847, label: 'Max Rating', sublabel: 'Peak Performance', color: '#ffffff' },
  { platform: 'Problems', value: 400, label: '400+', sublabel: 'Solved on Codeforces', color: 'var(--color-accent)' },
]

function RatingBlock({ rating, index }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <MagicCard 
        className="flex flex-col items-center text-center interactive group transition-all duration-500 hover:-translate-y-2 h-full"
        style={{ padding: '50px 24px' }}
      >
        {/* Platform label */}
        <span className="subheading mb-6 transition-colors duration-300 group-hover:text-white relative z-10" style={{ color: rating.color }}>
          {rating.platform.toUpperCase()}
        </span>

        {/* Big number — NumberTicker */}
        <div className="relative z-10">
          <NumberTicker
            value={rating.value}
            suffix={rating.platform === 'Problems' ? '+' : ''}
            className="font-bebas transition-all duration-300 group-hover:scale-110"
            style={{ fontSize: 'clamp(4rem, 6vw, 6rem)', color: '#ffffff', lineHeight: 1, textShadow: `0 0 30px ${rating.color}40` }}
            digitHeight={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
          />
        </div>

        {/* Label */}
        <span className="font-dm mt-4 tracking-widest uppercase transition-colors duration-300 relative z-10" style={{ color: rating.color, fontSize: '0.85rem', fontWeight: 600 }}>
          {rating.label}
        </span>

        {/* Sublabel */}
        <span className="font-mono mt-3 opacity-75 transition-opacity duration-300 group-hover:opacity-100 relative z-10" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
          {rating.sublabel}
        </span>
      </MagicCard>
    </motion.div>
  )
}

export default function RatingsSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="ratings" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      <div className="content-max">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
          <span className="subheading">
            04 — COMPETITIVE
          </span>
        </motion.div>

        <TextReveal
          as="h2"
          className="heading-2 text-stroke hover:text-white transition-all duration-500"
        >
          RATINGS
        </TextReveal>
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
