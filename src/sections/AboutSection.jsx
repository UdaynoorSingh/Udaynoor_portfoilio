import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import IconCloud from '../components/IconCloud'
import MagicCard from '../components/MagicCard'
import OrbitRing from '../components/OrbitRing'
import TextReveal from '../components/TextReveal'

const skillNames = [
  'React', 'Node.js', 'MongoDB', 'Express', 'C++', 'Python', 'JavaScript', 
  'TypeScript', 'Git', 'Docker', 'JWT', 'REST APIs', 'WebSockets', 
  'TailwindCSS', 'React Native', 'Three.js', 'Framer Motion', 'Next.js'
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
}

export default function AboutSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      <div className="content-max">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
              <span className="subheading">
                01 — IDENTIFIER
              </span>
            </motion.div>

            <TextReveal
              as="h2"
              className="heading-2 text-stroke hover:text-white transition-all duration-500"
            >
              WHO I AM
            </TextReveal>
            
            <div className="section-divider mt-8 mb-10" />
            
            <motion.div variants={fadeUp}>
              <MagicCard className="p-8 sm:p-10 space-y-6 body-text">
                <p>
                  I'm a B.Tech Information Technology student at <span className="text-white font-medium">IIIT Allahabad</span> with a CGPA of <span className="text-[var(--color-accent)] font-mono">9.40</span>.
                  I engineer immersive digital experiences that blur the line between highly performant full-stack applications and interactive art.
                </p>
                <p>
                  Specializing in the modern ecosystem (<span className="text-white">React, Node.js, Three.js</span>), I possess a robust competitive programming background (Codeforces Expert, 1847 on LeetCode),
                  allowing me to optimize complex 3D logic and backend architectures with rigorous efficiency.
                </p>
                <p>
                  Selected for the <span style={{ color: 'var(--color-accent-secondary)', fontWeight: 500 }}>Sakura Science Program (Japan)</span> and
                  the <span style={{ color: 'var(--color-accent-secondary)', fontWeight: 500 }}>INSPIRE Award MANAK (Top 60 in India)</span>,
                  I bring a global perspective and relentless curiosity to every project I touch.
                </p>
              </MagicCard>
            </motion.div>
          </motion.div>

          {/* Right — Interactive Icon Cloud */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full relative"
          >
            {/* Desktop: Interactive 3D Icon Cloud */}
            <div className="hidden lg:flex h-[700px] glass-card items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
              <IconCloud items={skillNames} radius={220} />
            </div>

            {/* Mobile: OrbitRing fallback */}
            <div className="lg:hidden glass-card p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
              <OrbitRing />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
