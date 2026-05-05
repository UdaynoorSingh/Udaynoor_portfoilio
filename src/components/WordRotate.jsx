import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * WordRotate — cycles through words with smooth framer-motion transitions.
 * Replaces typewriter effect with a cleaner vertical slide animation.
 */
export default function WordRotate({
  words = [],
  interval = 2500,
  className = '',
  style = {},
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, interval)
    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        ...style,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block' }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
