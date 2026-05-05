import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import BlackHole from '../components/BlackHole'
import ParticleField from '../components/ParticleField'
import BorderBeam from '../components/BorderBeam'
import TextReveal from '../components/TextReveal'
import { getCsrfToken } from '../utils/csrf'

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
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState(null)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('sending')
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setFormStatus('ok')
        setForm({ name: '', email: '', message: '' })
      } else {
        setFormStatus('error')
      }
    } catch {
      setFormStatus('error')
    }
  }

  return (
    <section id="contact" className="relative w-full overflow-hidden" style={{ zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center' }} ref={ref}>
      {/* Particle field behind everything */}
      <ParticleField count={60} />

      {blackHoleOn ? <BlackHole /> : (
        <div className="absolute inset-0 z-0 bg-black pointer-events-none" aria-hidden />
      )}

      <div className="section-padding relative z-10 w-full" style={{ background: 'linear-gradient(to bottom, var(--color-bg) 0%, transparent 50%, var(--color-bg) 100%)' }}>
        <div className="content-max content-max--contact text-center">

          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="w-8 h-[1px] bg-[var(--color-accent-secondary)] block"></span>
            <span className="subheading" style={{ color: 'var(--color-accent-secondary)' }}>
              06 — TERMINAL
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-accent-secondary)] block"></span>
          </motion.div>

          <TextReveal
            as="h2"
            className="heading-2 text-stroke hover:text-white transition-all duration-500"
            style={{ justifyContent: 'center' }}
          >
            LET'S CONNECT
          </TextReveal>

          <motion.p
            className="body-text mx-auto mt-10 max-w-lg"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </motion.p>

          {/* Terminal with BorderBeam */}
          <BorderBeam borderRadius="14px" duration="4s">
            <motion.div
              className="glass-card mx-auto mt-12 interactive hover:scale-[1.02] transition-transform duration-500"
              style={{ maxWidth: '640px', textAlign: 'left', padding: '28px clamp(20px,4vw,32px)', borderRadius: '14px', background: 'rgba(6, 8, 16, 0.82)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {/* Terminal header — black hole toggle lives here (Contact section only) */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
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
          </BorderBeam>

          <motion.form
            onSubmit={handleContactSubmit}
            className="glass-card mx-auto mt-10 max-w-[640px] w-full text-left interactive"
            style={{ padding: '28px clamp(20px,4vw,32px)', borderRadius: '14px', background: 'rgba(6, 8, 16, 0.82)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <p className="font-mono mb-5" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--color-accent-secondary)' }}>
              MESSAGE — POST /api/contact/
            </p>
            <div className="flex flex-col gap-4">
              <label className="font-mono block" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--color-text-muted)' }}>
                NAME
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-2 w-full rounded border border-white/15 bg-white/[0.04] px-3 py-2.5 font-dm text-sm text-white outline-none transition-colors focus:border-[var(--color-accent)]/50"
                  autoComplete="name"
                />
              </label>
              <label className="font-mono block" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--color-text-muted)' }}>
                EMAIL
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-2 w-full rounded border border-white/15 bg-white/[0.04] px-3 py-2.5 font-dm text-sm text-white outline-none transition-colors focus:border-[var(--color-accent)]/50"
                  autoComplete="email"
                />
              </label>
              <label className="font-mono block" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--color-text-muted)' }}>
                MESSAGE
                <textarea
                  required
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-2 w-full resize-y rounded border border-white/15 bg-white/[0.04] px-3 py-2.5 font-dm text-sm text-white outline-none transition-colors focus:border-[var(--color-accent)]/50"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="rounded border border-white/20 bg-white/[0.08] px-5 py-2.5 font-mono text-[0.65rem] tracking-[0.2em] text-white transition-colors hover:border-[var(--color-accent)]/60 hover:text-[var(--color-accent)] interactive disabled:opacity-50"
              >
                {formStatus === 'sending' ? 'SENDING…' : 'SEND'}
              </button>
              {formStatus === 'ok' && (
                <span className="font-mono text-[0.65rem]" style={{ color: 'var(--color-accent)' }}>
                  Sent. Thank you.
                </span>
              )}
              {formStatus === 'error' && (
                <span className="font-mono text-[0.65rem]" style={{ color: '#ff6b6b' }}>
                  Could not send. Try email instead.
                </span>
              )}
            </div>
          </motion.form>

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
