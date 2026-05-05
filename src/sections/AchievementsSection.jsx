import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import DotPattern from '../components/DotPattern'
import TextReveal from '../components/TextReveal'
import MagicCard from '../components/MagicCard'

const achievements = [
  {
    title: 'Sakura Science Program',
    description: 'Selected for the prestigious Japan-Asia Youth Exchange Program in Science, fostering international research collaboration.',
    icon: '🌸',
    color: 'var(--color-accent-secondary)',
  },
  {
    title: 'INSPIRE Award MANAK',
    description: 'Top 60 in India — recognized by the Department of Science & Technology, Government of India for outstanding innovation.',
    icon: '🏛️',
    color: 'var(--color-accent)',
  },
  {
    title: 'Codeforces Round 1069',
    description: 'Achieved Rank 111 Globally in a competitive programming contest with thousands of participants worldwide.',
    icon: '⚔️',
    color: 'var(--color-accent)',
  },
  {
    title: 'Academic Excellence',
    description: 'CGPA 9.40 — Top of Department in B.Tech Information Technology at IIIT Allahabad.',
    icon: '🎓',
    color: '#ffffff',
  },
]

function AchievementCard({ achievement, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <MagicCard 
        className="interactive group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
        style={{ padding: '40px' }}
      >
        {/* Icon + color bar */}
        <div className="flex items-center gap-5 mb-6 relative z-10">
          <span className="group-hover:scale-125 transition-transform duration-500" style={{ fontSize: '2rem' }}>{achievement.icon}</span>
          <div className="group-hover:opacity-100 opacity-30 transition-opacity duration-500" style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${achievement.color}, transparent)` }} />
        </div>

        <h3 className="heading-3 tracking-wide transition-colors duration-300 relative z-10" style={{ color: achievement.color, textShadow: `0 0 20px ${achievement.color}40` }}>
          {achievement.title}
        </h3>
        <p className="body-text mt-4 relative z-10">
          {achievement.description}
        </p>
      </MagicCard>
    </motion.div>
  )
}

export default function AchievementsSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="achievements" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      {/* Dot pattern background */}
      <DotPattern dotColor="rgba(123,44,191,0.12)" />

      <div className="content-max">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="w-8 h-[1px] bg-[var(--color-accent-secondary)] block"></span>
          <span className="subheading" style={{ color: 'var(--color-accent-secondary)' }}>
            05 — RECOGNITION
          </span>
        </motion.div>

        <TextReveal
          as="h2"
          className="heading-2 text-stroke hover:text-white transition-all duration-500"
        >
          ACHIEVEMENTS
        </TextReveal>
        <div className="section-divider mt-8 mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((a, i) => (
            <AchievementCard key={a.title} achievement={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
