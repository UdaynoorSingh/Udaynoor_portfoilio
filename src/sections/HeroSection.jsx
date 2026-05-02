import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroMercury from '../components/HeroMercury'
import MagneticButton from '../components/MagneticButton'

const roles = ['Full-Stack Engineer', 'Creative Technologist', '3D Web Developer']

function Typewriter() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = roles[roleIdx]
    let timeout

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2500)
    } else if (isDeleting && text === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setRoleIdx((prev) => (prev + 1) % roles.length)
      }, 200)
    } else {
      timeout = setTimeout(() => {
        setText(isDeleting ? current.substring(0, text.length - 1) : current.substring(0, text.length + 1))
      }, isDeleting ? 30 : 60)
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, roleIdx])

  return (
    <span className="font-mono" style={{ color: 'var(--color-accent)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', letterSpacing: '4px' }}>
      {text}
      <span style={{ animation: 'blink 1s infinite', color: 'var(--color-accent)' }}>_</span>
    </span>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
}

const itemVariants = {
  hidden: { y: 60, opacity: 0, rotateX: -15 },
  visible: { y: 0, opacity: 1, rotateX: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-12 left-1/2 flex flex-col items-center gap-3 interactive"
      style={{ transform: 'translateX(-50%)', cursor: 'pointer' }}
      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
    >
      <span className="font-mono uppercase" style={{ fontSize: '0.6rem', letterSpacing: '6px', color: 'rgba(255,255,255,0.4)' }}>
        Explore
      </span>
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '2px',
          height: '40px',
          background: 'linear-gradient(to bottom, var(--color-accent), transparent)',
          borderRadius: '2px',
        }}
      />
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section id="hero" className="hero-shell relative flex items-center justify-center overflow-hidden" style={{ zIndex: 1, minHeight: '100vh', perspective: '1000px' }}>
      <div className="hero-grid-overlay" />
      <div className="hero-radial-one" />
      <div className="hero-radial-two" />

      <div className="w-full grid grid-cols-1 xl:grid-cols-5 items-center gap-12" style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 5% 80px' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="xl:col-span-3 z-10 relative">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <span className="w-8 h-[1px] bg-white/30 block" />
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">Orbital Portfolio Interface</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-bebas leading-[0.85] select-none hero-title" style={{ fontSize: 'clamp(4.2rem, 10vw, 11rem)' }}>
            <span className="block interactive-text fx-shimmer">UDAYNOOR</span>
            <span className="block text-stroke interactive-text hero-stroke">SINGH</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="mt-8 mb-12 h-[40px]">
            <Typewriter />
          </motion.div>

          <motion.div variants={itemVariants} className="inline-flex items-center gap-6 px-6 py-3 glass-card rounded-full interactive hero-chip">
            <span className="font-dm text-sm font-light text-white/70">IIIT Allahabad | B.Tech IT</span>
            <span className="w-[1px] h-4 bg-white/20" />
            <span className="font-mono text-xs tracking-widest text-[#00e5ff] glow-cyan">CGPA 9.40</span>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-14 flex gap-6 flex-wrap">
            <MagneticButton
              href="#projects"
              className="font-mono uppercase text-xs tracking-[0.3em] rounded-none relative overflow-hidden group interactive hero-cta-primary"
              style={{
                padding: '18px 40px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">View Projects</span>
              <div className="absolute inset-0 bg-[var(--color-accent)] transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100 z-0" />
            </MagneticButton>

            <MagneticButton
              href="#contact"
              className="font-mono uppercase text-xs tracking-[0.3em] rounded-none relative overflow-hidden group interactive hero-cta-secondary"
              style={{
                padding: '18px 40px',
                background: 'transparent',
                color: 'var(--color-text)',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}
            >
              <span className="relative z-10">Contact Me</span>
              <div className="absolute inset-0 bg-white/5 transform scale-y-0 origin-bottom transition-transform duration-300 ease-out group-hover:scale-y-100 z-0" />
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden xl:block xl:col-span-2 relative hero-orb-shell"
          style={{ height: '70vh', minHeight: '500px' }}
        >
          <div className="absolute top-1/2 left-1/2 w-[120%] h-[120%] border border-white/8 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-[140%] h-[140%] border border-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none rotate-45 border-dashed" />
          <HeroMercury />
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
