import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLANET_NAV_META } from '../context/planetNavConfig'

export default function PlanetNavOverlay({ planetKey, onExit, onScrollToSection }) {
  const meta = planetKey ? PLANET_NAV_META[planetKey] : null

  useEffect(() => {
    if (planetKey) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [planetKey])

  return (
    <AnimatePresence>
      {meta && (
        <div
          className="fixed inset-x-0 bottom-0 z-[95] flex justify-center pointer-events-none"
          style={{ paddingBottom: 'max(24px, 4vh)' }}
        >
        <motion.div
          key={meta.key}
          className="planet-nav-overlay glass-card interactive pointer-events-auto w-[min(92vw,440px)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="planet-nav-title"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.99 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: 'clamp(20px, 4vw, 28px)',
            textAlign: 'left',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.24em',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
            }}
          >
            {meta.label} · {meta.accent}
          </span>
          <h2 id="planet-nav-title" className="font-bebas mt-2" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.4rem)', lineHeight: 1, color: '#fff' }}>
            {meta.title}
          </h2>
          <p className="font-dm mt-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            {meta.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onScrollToSection?.(meta.sectionId)}
              className="rounded border border-white/25 bg-white/[0.08] px-4 py-2.5 font-mono text-[0.62rem] tracking-[0.15em] text-white transition-colors hover:border-[var(--color-accent)]/60 hover:text-[var(--color-accent)] interactive"
            >
              OPEN SECTOR
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded border border-white/15 bg-transparent px-4 py-2.5 font-mono text-[0.62rem] tracking-[0.15em] text-white/70 transition-colors hover:text-white interactive"
            >
              RESUME VOYAGE
            </button>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
