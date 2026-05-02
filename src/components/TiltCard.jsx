import { useRef, useState } from 'react'

export default function TiltCard({
  className = '',
  style,
  children,
  maxTilt = 10,
  glare = true,
}) {
  const ref = useRef(null)
  const [state, setState] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false })

  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height

    const ry = (px - 0.5) * maxTilt * 2
    const rx = -(py - 0.5) * maxTilt * 2

    setState({ rx, ry, gx: px * 100, gy: py * 100, hovering: true })
  }

  const onLeave = () => setState((s) => ({ ...s, rx: 0, ry: 0, hovering: false }))
  const onEnter = () => setState((s) => ({ ...s, hovering: true }))

  return (
    <div
      ref={ref}
      className={`tilt-card ${state.hovering ? 'tilt-card-hover' : ''} ${className}`}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg)`,
        ...style,
      }}
    >
      {glare && (
        <div
          className="tilt-glare"
          style={{
            background: `radial-gradient(circle at ${state.gx}% ${state.gy}%, rgba(0,207,255,0.18), transparent 55%)`,
            opacity: state.hovering ? 1 : 0,
          }}
        />
      )}
      <div className="tilt-inner">{children}</div>
    </div>
  )
}

