/**
 * ShimmerButton — a button/anchor with an animated highlight sweep across its surface.
 * Composable: can wrap existing MagneticButton or be used standalone.
 */
export default function ShimmerButton({
  as: Comp = 'a',
  children,
  className = '',
  style = {},
  shimmerColor = 'rgba(255,255,255,0.25)',
  shimmerDuration = '2.5s',
  ...props
}) {
  return (
    <Comp
      className={`shimmer-btn interactive ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    >
      {/* Shimmer sweep overlay */}
      <span
        className="shimmer-btn__sweep"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(
            110deg,
            transparent 25%,
            ${shimmerColor} 50%,
            transparent 75%
          )`,
          backgroundSize: '200% 100%',
          animation: `shimmer-sweep ${shimmerDuration} ease-in-out infinite`,
          zIndex: 1,
        }}
        aria-hidden
      />
      {/* Content sits above shimmer */}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </Comp>
  )
}
