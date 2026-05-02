import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import BlackHole from '../components/BlackHole'

const links = [
  { label: 'noor2022singh@gmail.com', href: 'mailto:noor2022singh@gmail.com', prefix: 'email' },
  { label: 'linkedin.com/in/udaynoor-singh', href: 'https://linkedin.com/in/udaynoor-singh', prefix: 'linkedin' },
  { label: 'github.com/UdaynoorSingh', href: 'https://github.com/UdaynoorSingh', prefix: 'github' },
]

function TypewriterLine({ text, prefix, href, delay }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    const full = `> open ${prefix}://${text}`
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(full.substring(0, i + 1))
      i++
      if (i >= full.length) clearInterval(interval)
    }, 25)
    return () => clearInterval(interval)
  }, [started, text, prefix])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono block py-2 transition-colors duration-300 interactive"
      style={{
        fontSize: '0.8rem',
        color: 'var(--color-accent)',
        textDecoration: 'none',
        letterSpacing: '0.5px',
      }}
      onMouseEnter={(e) => e.target.style.color = 'var(--color-text)'}
      onMouseLeave={(e) => e.target.style.color = 'var(--color-accent)'}
    >
      {displayed}
      <span style={{ animation: 'blink 1s infinite', color: 'var(--color-accent)' }}>█</span>
    </a>
  )
}

export default function ContactSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [blackHoleOn, setBlackHoleOn] = useState(false)

  return (
    <section id="contact" className="relative w-full overflow-hidden" style={{ zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center' }} ref={ref}>
      {blackHoleOn ? <BlackHole /> : (
        <div className="absolute inset-0 z-0 bg-black pointer-events-none" aria-hidden />
      )}

      <div className="section-padding relative z-10 w-full" style={{ background: 'linear-gradient(to bottom, var(--color-bg) 0%, transparent 50%, var(--color-bg) 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="w-8 h-[1px] bg-[var(--color-accent-secondary)] block"></span>
            <span className="font-mono text-[0.65rem] tracking-[0.4em] text-[var(--color-accent-secondary)]">
              06 — TERMINAL
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-accent-secondary)] block"></span>
          </motion.div>

          <motion.h2
            className="font-bebas text-stroke hover:text-white transition-all duration-500"
            style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', lineHeight: 0.85 }}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            LET'S CONNECT
          </motion.h2>

          <motion.p
            className="font-dm mx-auto mt-12"
            style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.8, maxWidth: '500px' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </motion.p>

          {/* Terminal */}
          <motion.div
            className="glass-card mx-auto mt-12 interactive hover:scale-[1.02] transition-transform duration-500"
            style={{ maxWidth: '600px', textAlign: 'left', padding: '28px 32px', borderRadius: '12px', background: 'rgba(2,2,5,0.7)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Terminal header — black hole toggle lives here (Contact section only) */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                <span className="font-mono ml-1 truncate md:ml-3" style={{ fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--color-text-muted)' }}>
                  UDAYNOOR@SYSTEM ~ $
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBlackHoleOn((v) => !v)}
                className="shrink-0 rounded border border-white/20 bg-white/[0.06] px-3 py-1.5 font-mono text-[0.6rem] tracking-widest text-white/80 transition-colors hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] interactive"
                aria-pressed={blackHoleOn}
              >
                {blackHoleOn ? 'Black hole: ON' : 'Black hole: OFF'}
              </button>
            </div>

            {links.map((link, i) => (
              <TypewriterLine
                key={link.prefix}
                text={link.label}
                prefix={link.prefix}
                href={link.href}
                delay={inView ? 600 + i * 800 : 99999}
              />
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-24 font-mono"
            style={{ fontSize: '0.6rem', letterSpacing: '4px', color: 'var(--color-text-muted)' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            DESIGNED & BUILT BY UDAYNOOR SINGH · 2025
          </motion.div>
        </div>
      </div>
    </section>
  )
}
