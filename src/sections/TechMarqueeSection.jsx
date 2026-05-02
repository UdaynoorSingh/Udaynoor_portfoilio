import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const techRow1 = [
  'REACT NATIVE', 'NODE.JS', 'THREE.JS', 'FRAMER MOTION', 'TAILWIND CSS', 'MONGODB', 'EXPRESS', 'REACT NATIVE', 'NODE.JS', 'THREE.JS', 'FRAMER MOTION'
]
const techRow2 = [
  'C++', 'JAVASCRIPT', 'TYPESCRIPT', 'GSAP', 'WEBGL', 'NEXT.JS', 'POSTGRESQL', 'C++', 'JAVASCRIPT', 'TYPESCRIPT', 'GSAP'
]

function MarqueeRow({ items, direction = 1, speed = 15 }) {
  const containerRef = useRef(null)
  
  // Create an infinite animation loop
  return (
    <div ref={containerRef} className="flex whitespace-nowrap overflow-hidden py-4">
      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: speed }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="font-bebas text-stroke hover:text-[var(--color-accent)] transition-colors duration-300 interactive cursor-default"
            style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', lineHeight: 0.9 }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function TechMarqueeSection() {
  const { scrollYProgress } = useScroll()
  // Add a slight scroll velocity effect to the skew to make it feel physical
  const smoothVelocity = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 400
  })
  
  return (
    <section className="relative w-full py-24 bg-[var(--color-bg)] overflow-hidden" style={{ zIndex: 1 }}>
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent-secondary)] to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-30"></div>

      <div className="relative transform -rotate-2 scale-105 my-12">
        <MarqueeRow items={techRow1} direction={1} speed={25} />
        <MarqueeRow items={techRow2} direction={-1} speed={30} />
      </div>
      
      {/* Heavy gradient shadows on edges to fade out text smoothly */}
      <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
    </section>
  )
}
