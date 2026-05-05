import { useRef, useEffect, useState } from 'react'

/**
 * ParticleField — canvas-based floating ambient particles.
 * PERF: Pauses rAF when off-screen, uses low particle count, respects DPR cap.
 */
export default function ParticleField({
  count = 40,
  color = [0, 229, 255],
  maxRadius = 1.5,
  speed = 0.3,
  className = '',
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // Visibility observer
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const dpr = Math.min(window.devicePixelRatio, 1.5)

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight }
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const w = () => canvas.width / dpr
    const h = () => canvas.height / dpr

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: 0.5 + Math.random() * maxRadius,
        opacity: 0.15 + Math.random() * 0.45,
      }))
    }

    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [count, maxRadius, speed])

  // Animate only when visible
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 1.5)

    const animate = () => {
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      ctx.clearRect(0, 0, cw, ch)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > cw) p.vx *= -1
        if (p.y < 0 || p.y > ch) p.vy *= -1
        p.x = Math.max(0, Math.min(cw, p.x))
        p.y = Math.max(0, Math.min(ch, p.y))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${p.opacity})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [visible, color])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden
    />
  )
}
