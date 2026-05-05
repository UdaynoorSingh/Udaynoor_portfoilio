import { useMemo } from 'react'

/**
 * OrbitRing — CSS/SVG orbit animation showing tech icons orbiting a center point.
 * Mobile fallback for the Three.js SkillConstellation.
 */

const defaultRings = [
  {
    radius: 90,
    duration: '20s',
    items: ['React', 'Node.js', 'MongoDB'],
  },
  {
    radius: 155,
    duration: '28s',
    items: ['Express', 'C++', 'Python', 'JavaScript'],
  },
  {
    radius: 220,
    duration: '36s',
    items: ['TypeScript', 'Git', 'Docker', 'JWT', 'REST APIs'],
  },
]

export default function OrbitRing({
  rings = defaultRings,
  centerLabel = 'SKILLS',
  className = '',
}) {
  const orbitSize = useMemo(() => {
    const maxR = Math.max(...rings.map((r) => r.radius))
    return (maxR + 50) * 2
  }, [rings])

  return (
    <div
      className={`orbit-ring-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${orbitSize}px`,
        aspectRatio: '1 / 1',
        margin: '0 auto',
      }}
    >
      {/* Center core */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.4) 0%, rgba(0,229,255,0.05) 70%, transparent 100%)',
          boxShadow: '0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: '0.45rem',
            letterSpacing: '0.2em',
            color: '#00e5ff',
            textAlign: 'center',
          }}
        >
          {centerLabel}
        </span>
      </div>

      {/* Orbit rings */}
      {rings.map((ring, ringIdx) => (
        <div
          key={ringIdx}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${ring.radius * 2}px`,
            height: `${ring.radius * 2}px`,
            marginLeft: `-${ring.radius}px`,
            marginTop: `-${ring.radius}px`,
            border: '1px dashed rgba(0,229,255,0.15)',
            borderRadius: '50%',
          }}
        >
          {/* Orbiting items */}
          <div
            className="orbit-ring__track"
            style={{
              position: 'absolute',
              inset: 0,
              animation: `orbit ${ring.duration} linear infinite`,
              animationDirection: ringIdx % 2 === 0 ? 'normal' : 'reverse',
            }}
          >
            {ring.items.map((item, itemIdx) => {
              const angle = (360 / ring.items.length) * itemIdx
              return (
                <div
                  key={item}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${angle}deg) translateX(${ring.radius}px) rotate(-${angle}deg)`,
                    marginLeft: '-28px',
                    marginTop: '-12px',
                  }}
                >
                  <span
                    className="font-mono interactive"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.55rem',
                      letterSpacing: '0.06em',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0,229,255,0.08)',
                      border: '1px solid rgba(0,229,255,0.2)',
                      color: 'rgba(255,255,255,0.7)',
                      whiteSpace: 'nowrap',
                      /* Counter-rotate to keep upright */
                      animation: `orbit ${ring.duration} linear infinite reverse`,
                      animationDirection: ringIdx % 2 === 0 ? 'reverse' : 'normal',
                    }}
                  >
                    {item}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
