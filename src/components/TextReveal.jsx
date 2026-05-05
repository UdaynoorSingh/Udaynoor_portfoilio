import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * TextReveal — cinematic word-by-word slide-up reveal animation.
 * Splits children text into words, each masked and animated translateY.
 * Pass-through className and style for font-bebas, text-stroke, etc.
 */
export default function TextReveal({
  children,
  as: Tag = 'span',
  className = '',
  style = {},
  stagger = 0.05,
  duration = 0.7,
  once = true,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-80px' })

  // Extract text from children
  const text = typeof children === 'string' ? children : String(children ?? '')
  const words = text.split(/\s+/).filter(Boolean)

  return (
    <Tag ref={ref} className={className} style={{ ...style, display: 'inline-flex', flexWrap: 'wrap', gap: '0 0.3em' }}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            overflow: 'hidden',
            display: 'inline-block',
            verticalAlign: 'bottom',
          }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : { y: '110%' }}
            transition={{
              duration,
              delay: i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
