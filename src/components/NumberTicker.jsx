import { useRef, useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * NumberTicker — slot-machine style vertical digit ticker.
 * Each digit column scrolls to the target digit independently.
 */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function DigitColumn({ digit, delay = 0, digitHeight = 80, triggered }) {
  return (
    <div
      style={{
        height: `${digitHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        width: '0.62em',
      }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={triggered ? { y: -digit * digitHeight } : { y: 0 }}
        transition={{
          duration: 1.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            style={{
              height: `${digitHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {d}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function NumberTicker({
  value = 0,
  suffix = '',
  className = '',
  style = {},
  digitHeight = 80,
}) {
  const ref = useRef(null)
  const [triggered, setTriggered] = useState(false)

  // Parse value into array of digits
  const digits = useMemo(() => {
    return String(value).split('').map(Number)
  }, [value])

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      {digits.map((digit, i) => (
        <DigitColumn
          key={i}
          digit={digit}
          delay={i * 0.05}
          digitHeight={digitHeight}
          triggered={triggered}
        />
      ))}
      {suffix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={triggered ? { opacity: 1 } : {}}
          transition={{ delay: digits.length * 0.05 + 0.3, duration: 0.4 }}
        >
          {suffix}
        </motion.span>
      )}
    </span>
  )
}
