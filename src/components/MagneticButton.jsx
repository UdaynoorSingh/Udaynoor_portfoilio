import { useRef, useState } from 'react'

export default function MagneticButton({
  as: Comp = 'a',
  strength = 14,
  className = '',
  style,
  children,
  ...props
}) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const nx = Math.max(-1, Math.min(1, dx / (r.width / 2)))
    const ny = Math.max(-1, Math.min(1, dy / (r.height / 2)))
    setPos({ x: nx * strength, y: ny * strength })
  }

  const onEnter = () => setActive(true)
  const onLeave = () => {
    setActive(false)
    setPos({ x: 0, y: 0 })
  }

  return (
    <Comp
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`magnetic ${active ? 'magnetic-active' : ''} ${className}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        ...style,
      }}
      {...props}
    >
      <span className="magnetic-inner">{children}</span>
    </Comp>
  )
}

