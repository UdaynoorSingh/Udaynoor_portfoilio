/**
 * GridPattern — SVG grid-line background with radial fade and subtle pulse.
 * PERF: Uses will-change:opacity for GPU compositing, simple CSS animation.
 */
export default function GridPattern({
  gridSize = 64,
  strokeColor = 'rgba(130,185,255,0.06)',
  strokeWidth = 1,
  className = '',
}) {
  return (
    <div
      className={`grid-pattern ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.15,
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        animation: 'grid-pulse 6s ease-in-out infinite',
        willChange: 'opacity',
      }}
      aria-hidden
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid-lines"
            x="0"
            y="0"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-lines)" />
      </svg>
    </div>
  )
}
