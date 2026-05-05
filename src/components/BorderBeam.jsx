import { useRef, useState, useEffect } from 'react'

/**
 * BorderBeam — wrapper adding a rotating conic-gradient border animation.
 * PERF: Uses will-change:transform on the spinning element and pauses via
 * IntersectionObserver when off-screen. Uses CSS containment.
 */
export default function BorderBeam({
  children,
  className = '',
  borderRadius = '20px',
  duration = '4s',
  colorFrom = '#00e5ff',
  colorTo = '#7b2cbf',
  style = {},
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`border-beam ${className}`}
      style={{
        position: 'relative',
        borderRadius,
        contain: 'layout style',
        ...style,
      }}
    >
      {/* Spinning gradient beam — only animates when visible */}
      <div
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden
      >
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 10%, ${colorTo} 20%, transparent 30%, transparent 100%)`,
            animation: visible ? `border-beam-rotate ${duration} linear infinite` : 'none',
            willChange: 'transform',
          }}
        />
        {/* Inner mask */}
        <div
          style={{
            position: 'absolute',
            inset: '1px',
            borderRadius: `calc(${borderRadius} - 1px)`,
            background: 'var(--color-bg, #020205)',
          }}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
