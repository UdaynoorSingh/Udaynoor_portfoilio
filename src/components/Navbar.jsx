import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'ABOUT', href: '#about' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'RATINGS', href: '#ratings' },
  { label: 'ACHIEVEMENTS', href: '#achievements' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)

      // Find active section
      const sections = links.map(l => l.href.slice(1))
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) current = id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileOpen(false)
    }
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 py-3.5 md:py-4"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background: scrolled ? 'rgba(2,2,5,0.88)' : 'rgba(2,2,5,0.52)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.45)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div className="content-max flex items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="font-playfair italic text-2xl tracking-wide relative interactive glow-text-cyan transition-colors fx-underline fx-rgb"
          style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          U·S
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-4 lg:gap-6 min-w-0">
          {links.map((link) => {
            const isActive = activeSection === link.href.slice(1)
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-mono relative shrink-0 py-1 interactive fx-underline fx-sheen"
                data-active={isActive}
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.14em',
                  color: isActive ? 'var(--color-accent)' : 'rgba(245, 248, 255, 0.88)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s ease',
                }}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex shrink-0 flex-col gap-1 p-2 interactive"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{
            width: '20px', height: '1px', background: 'var(--color-primary)',
            transform: mobileOpen ? 'rotate(45deg) translateY(4px)' : 'none',
            transition: 'transform 0.3s ease',
          }} />
          <span style={{
            width: '20px', height: '1px', background: 'var(--color-primary)',
            opacity: mobileOpen ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }} />
          <span style={{
            width: '20px', height: '1px', background: 'var(--color-primary)',
            transform: mobileOpen ? 'rotate(-45deg) translateY(-4px)' : 'none',
            transition: 'transform 0.3s ease',
          }} />
        </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(2,2,5,0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '24px',
            }}
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="font-mono interactive"
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '4px',
                    color: activeSection === link.href.slice(1) ? 'var(--color-accent)' : 'var(--color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
