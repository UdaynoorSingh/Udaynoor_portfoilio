import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import TiltCard from '../components/TiltCard'
import MagneticButton from '../components/MagneticButton'

const defaultProjects = [
  {
    title: 'Bug Tracker',
    description: 'Full-featured bug tracking system with priority queues, status workflows, team collaboration, and CI/CD deployment.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT', 'Vercel'],
    status: 'Live',
    link: '#',
    color: 'var(--color-accent)',
  },
  {
    title: 'Sluglime',
    description: 'Real-time collaborative platform with WebSocket-powered live updates, mobile-first React Native interface.',
    tech: ['React Native', 'WebSockets', 'Node.js', 'MongoDB'],
    status: 'In Dev',
    link: '#',
    color: '#d4a843',
  },
  {
    title: 'Docu-Signer',
    description: 'Cryptographic PDF document signing system with digital certificate verification and tamper-proof audit trails.',
    tech: ['React', 'Node.js', 'Cryptography', 'PDF.js', 'MongoDB'],
    status: 'Live',
    link: '#',
    color: 'var(--color-accent-secondary)',
  },
]

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef()

  const handleMouse = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 80, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-50px' }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-full interactive"
    >
      <TiltCard
        className="glass-card h-full flex flex-col"
        glare={true}
        style={{
          padding: '40px 32px',
        }}
      >
        {/* Dynamic Inner Cursor Spotlight */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${project.color}15 0%, transparent 60%)`,
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          zIndex: 0
        }} />

        <div className="flex-grow z-10 flex flex-col tilt-inner">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="badge" style={{ color: project.color, borderColor: `${project.color}40`, background: `${project.color}10` }}>
              {project.status}
            </span>
            <span className="font-mono text-white/45 text-xs tabular-nums">0{index + 1}</span>
          </div>

          <h3 className="font-bebas text-stroke hover:text-white transition-all duration-300" style={{ fontSize: '3rem', lineHeight: 1.0 }}>
            {project.title}
          </h3>
          <p className="font-dm mt-4" style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.98rem', lineHeight: 1.75 }}>
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mt-auto pt-8">
            {project.tech.map((t) => (
              <span key={t} className="font-mono fx-chip interactive"
                style={{
                  fontSize: '0.6rem',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  letterSpacing: '1px',
                }}
              >{t}</span>
            ))}
          </div>

          {/* View link */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <MagneticButton
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono inline-flex items-center gap-3 relative group fx-underline interactive"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '4px',
                color: hovered ? project.color : 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.4s ease',
                fontWeight: 600
              }}
            >
              <span>VIEW ORIGIN</span>
              <span className="transform transition-transform duration-300 group-hover:translate-x-2">→</span>
            </MagneticButton>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}

export default function ProjectsSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [projects, setProjects] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/projects/', { credentials: 'same-origin' })
        if (!res.ok) throw new Error('projects_unavailable')
        const data = await res.json()
        const list = Array.isArray(data.results) ? data.results : []
        if (!cancelled) setProjects(list)
      } catch {
        if (!cancelled) setProjects(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayProjects = projects === null ? defaultProjects : projects

  return (
    <section id="projects" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      <div className="content-max">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
              <span className="font-mono text-[0.68rem] tracking-[0.22em] text-[var(--color-accent)]">
                03 — DIGITAL ARCHIVE
              </span>
            </motion.div>

            <motion.h2
              className="font-bebas select-none text-stroke hover:text-white transition-all duration-500"
              style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', lineHeight: 0.85 }}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              SELECTED WORK
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="hidden md:block max-w-xs text-right"
          >
            <p className="font-dm text-sm font-normal text-white/65 leading-relaxed">
              A collection of digital experiences blending robust engineering with cinematic aesthetics.
            </p>
          </motion.div>
        </div>

        <div className="section-divider section-divider--wide mt-10 mb-14" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects.map((p, i) => (
            <ProjectCard
              key={p.slug ? `${p.slug}-${p.id ?? i}` : `${p.title}-${i}`}
              project={p}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
