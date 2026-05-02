import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const experiences = [
  {
    title: 'Web Development Intern',
    company: 'Labmentix',
    period: 'Jun – Aug 2025',
    points: [
      'Built production MERN stack applications with JWT authentication and role-based access control',
      'Developed Docu-Signer — cryptographic PDF signature verification system using digital certificates',
      'Created TaskLoft — a full-featured freelancer marketplace with real-time task management',
      'Implemented bug tracking module with priority queues, status workflows, and team collaboration',
      'Built team invite link system with expiring tokens and onboarding flows',
    ],
  },
  {
    title: 'Member',
    company: 'App Dev Club, IIIT Allahabad',
    period: '2024 – Present',
    points: [
      'Developed mobile and web applications using modern frameworks and best practices',
      'Conducted peer code reviews to ensure code quality and knowledge sharing',
      'Participated in OOC Hackathon — rapid prototyping under tight deadlines',
      'Organized and attended workshops on emerging technologies and dev tools',
    ],
  },
]

function TimelineCard({ exp, index, isLast }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className="relative interactive"
      style={{ paddingLeft: '48px' }}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Timeline dot */}
      <div style={{
        position: 'absolute', left: 0, top: '6px',
        width: '12px', height: '12px', borderRadius: '50%',
        border: '2px solid var(--color-accent-secondary)',
        background: 'var(--color-bg)',
        zIndex: 2,
      }} />
      {/* Dot inner glow */}
      <div style={{
        position: 'absolute', left: '3px', top: '9px',
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'var(--color-accent-secondary)',
        boxShadow: '0 0 12px var(--color-accent-secondary)',
      }} />
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: '5px', top: '18px', bottom: '-48px',
          width: '2px', background: 'linear-gradient(to bottom, var(--color-accent-secondary), transparent)',
          opacity: 0.4
        }} />
      )}

      {/* Content */}
      <div className="glass-card transition-all duration-300 hover:scale-[1.02]" style={{ padding: '40px' }}>
        <span className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '4px', color: 'var(--color-accent-secondary)', textTransform: 'uppercase' }}>
          {exp.period}
        </span>
        <h3 className="font-bebas mt-3" style={{ fontSize: '2.5rem', color: '#ffffff', lineHeight: 1.0 }}>
          {exp.title}
        </h3>
        <span className="font-mono block mt-3" style={{ color: 'var(--color-accent)', fontSize: '0.8rem', letterSpacing: '1px' }}>
          {exp.company}
        </span>
        <ul className="mt-6 space-y-4 border-t border-white/5 pt-6">
          {exp.points.map((point, i) => (
            <li key={i} className="font-dm flex group" style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.8 }}>
              <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--color-accent-secondary)', marginRight: '14px', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '3px' }}>▸</span>
              <span className="group-hover:text-white/90 transition-colors duration-300">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function ExperienceSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="experience" ref={ref} className="section-padding relative" style={{ zIndex: 1 }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Section label */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
          <span className="font-mono text-[0.65rem] tracking-[0.4em] text-[var(--color-accent)]">
            02 — TIMELINE
          </span>
        </motion.div>

        <motion.h2
          className="font-bebas text-stroke hover:text-white transition-all duration-500"
          style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', lineHeight: 0.85 }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          EXPERIENCE
        </motion.h2>
        <div className="section-divider mt-8 mb-16" />

        {/* Timeline */}
        <div className="flex flex-col gap-16 relative">
          {experiences.map((exp, i) => (
            <TimelineCard key={i} exp={exp} index={i} isLast={i === experiences.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
