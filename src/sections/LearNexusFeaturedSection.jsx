import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import LearNexusMiniBoard from '../components/LearNexusMiniBoard'

const challenges = [
  'Isolating the Nexus Board from monolithic state so feature teams could ship without cross-breakage under tight college deadlines',
  'Coordinating role-aware data (faculty, clubs, students) with audit-friendly updates across overlapping academic calendars',
  'Keeping real-time signals responsive on congested campus networks during exhibition demos and stall walkthroughs',
  'Designing a versioned event surface so the Nexus Board could evolve without invalidating cached client bundles',
  'Balancing rich UI with performance budgets so the experience stayed smooth on mid-range laptops on the show floor',
]

const galleryPlaceholders = [
  { label: 'Stall overview' },
  { label: 'Live demo' },
  { label: 'Visitor flow' },
]

export default function LearNexusFeaturedSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="learn-nexus" ref={ref} className="section-padding relative" style={{ zIndex: 1 }}>
      <div className="content-max">
        {/* Header rhythm matches Projects / Experience */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="w-8 h-[1px] bg-[var(--color-accent)] block" />
              <span className="font-mono text-[0.68rem] tracking-[0.22em] text-[var(--color-accent)]">
                SPOTLIGHT — LEARN NEXUS
              </span>
            </motion.div>

            <motion.h2
              className="font-bebas select-none text-stroke hover:text-white transition-all duration-500"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.88 }}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              FEATURED PROJECT
            </motion.h2>

            <motion.p
              className="font-mono mt-3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}
            >
              LearNexus · collegiate operations & discovery
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="hidden md:block max-w-xs text-right font-dm text-sm font-normal text-white/65 leading-relaxed"
          >
            A complex campus-scale application: isolated Nexus Board architecture, challenges on the ground, and exhibition
            presence.
          </motion.p>
        </div>

        <div className="section-divider section-divider--wide mt-10 mb-10" />

        <motion.article
          className="glass-card learn-nexus-panel interactive"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ padding: 'clamp(24px, 4vw, 40px)' }}
        >
          <h3
            className="font-bebas"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1, color: '#fff', marginBottom: '0.75rem' }}
          >
            Nexus board architecture
          </h3>
          <p
            className="font-dm learn-nexus-prose"
            style={{ color: 'var(--color-text-muted)', fontWeight: 400, lineHeight: 1.8, fontSize: '0.98rem' }}
          >
            The <strong>Nexus Board</strong> is an isolated control plane: a dedicated service boundary that ingests course
            signals, club operations, and campus resource windows, then fans them out through a <strong>versioned event bus</strong>.
            Feature modules—timetable, forums, admin surfaces—subscribe to stable contracts, so student-facing UI and back-office
            tools can ship on separate cadences without tripping shared state in the monolith. The board surfaces as a coordinated
            layer in the client: read-optimised projections, write paths through idempotent commands, and circuit breakers when
            third-party college systems slow down.
          </p>

          <LearNexusMiniBoard />

          <h4 className="font-mono learn-nexus-subhead">Challenges</h4>
          <ul className="learn-nexus-list font-dm">
            {challenges.map((item) => (
              <li key={item} className="learn-nexus-list__item">
                {item}
              </li>
            ))}
          </ul>

          <h4 className="font-mono learn-nexus-subhead learn-nexus-subhead--spaced">Exhibition gallery</h4>
          <p
            className="font-dm"
            style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1rem' }}
          >
            Placeholder frames for photos and video stills from the LearNexus stall and walkthrough demos.
          </p>
          <div className="learn-nexus-gallery" role="list">
            {galleryPlaceholders.map((slot) => (
              <div key={slot.label} className="learn-nexus-gallery__slot" role="listitem">
                <div className="learn-nexus-gallery__frame" aria-hidden />
                <span className="font-mono learn-nexus-gallery__caption">{slot.label}</span>
              </div>
            ))}
          </div>
        </motion.article>

        <div className="section-divider section-divider--wide mt-12 mb-2" />
      </div>
    </section>
  )
}
