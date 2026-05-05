import { useMemo } from 'react'

/**
 * Meteors — animated diagonal streaks for hero/section backgrounds.
 * PERF: Reduced default count, uses will-change:transform, GPU-composited animation.
 */
export default function Meteors({ count = 10 }) {
  const meteors = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const width = 150 + Math.random() * 60
      const top = Math.random() * 100
      const left = 40 + Math.random() * 60
      const delay = Math.random() * 8
      const duration = 1.8 + Math.random() * 2
      const opacity = 0.3 + Math.random() * 0.4

      return { id: i, width, top, left, delay, duration, opacity }
    })
  }, [count])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden
    >
      {meteors.map((m) => (
        <div
          key={m.id}
          className="meteor"
          style={{
            position: 'absolute',
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: `${m.width}px`,
            height: '1px',
            transform: 'rotate(-45deg)',
            background: `linear-gradient(90deg, rgba(0,229,255,${m.opacity}), transparent)`,
            borderRadius: '2px',
            animation: `meteor ${m.duration}s ${m.delay}s linear infinite`,
            willChange: 'transform, opacity',
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
