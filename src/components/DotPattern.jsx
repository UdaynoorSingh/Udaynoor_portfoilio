/**
 * DotPattern — SVG dot-grid background with radial fade mask.
 * Subtle decorative texture for section backgrounds.
 */
export default function DotPattern({
  dotRadius = 1,
  dotColor = 'rgba(0,229,255,0.15)',
  spacing = 24,
  className = '',
}) {
  return (
    <div
      className={`dot-pattern ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
      }}
      aria-hidden
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotRadius}
              fill={dotColor}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  )
}
