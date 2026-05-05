import { useEffect, useRef, useState, useMemo } from 'react'

/**
 * 3D Icon Cloud — A highly optimized, interactive spherical cloud of tags.
 * Uses mathematical 3D projection to render items onto a 2D plane with scale/opacity depth.
 */
export default function IconCloud({ items = [], radius = 180 }) {
  const containerRef = useRef(null)
  
  // Track continuous rotation angles
  const rotation = useRef({ x: 0, y: 0 })
  // Track target velocity based on mouse
  const velocity = useRef({ x: 0.003, y: 0.003 }) 
  
  const requestRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const isHovered = useRef(false)

  // Generate initial 3D coordinates using Fibonacci Sphere algorithm
  const points = useMemo(() => {
    const pts = []
    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle
    for (let i = 0; i < items.length; i++) {
      const y = 1 - (i / (items.length - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      pts.push({ x, y, z, label: items[i] })
    }
    return pts
  }, [items])

  const [projectedPoints, setProjectedPoints] = useState([])

  // Main animation loop
  useEffect(() => {
    const update = () => {
      // Ease velocity back to base when not hovered
      if (!isHovered.current) {
        velocity.current.x += (0.003 - velocity.current.x) * 0.05
        velocity.current.y += (0.003 - velocity.current.y) * 0.05
      }

      rotation.current.x += velocity.current.x
      rotation.current.y += velocity.current.y

      const { x: rx, y: ry } = rotation.current
      const cosX = Math.cos(rx)
      const sinX = Math.sin(rx)
      const cosY = Math.cos(ry)
      const sinY = Math.sin(ry)

      // Project each point
      const projected = points.map((p) => {
        // Rotate around Y axis
        const x1 = p.x * cosY - p.z * sinY
        const z1 = p.x * sinY + p.z * cosY
        
        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX
        const z2 = p.y * sinX + z1 * cosX

        // Perspective projection
        // z2 ranges roughly from -1 to 1. 
        // We want scale to be smaller when z2 is negative (far away)
        const scale = (z2 + 2) / 3 
        const opacity = Math.max(0.15, (z2 + 1.5) / 2.5)
        const zIndex = Math.round((z2 + 1) * 100)

        return {
          ...p,
          px: x1 * radius,
          py: y2 * radius,
          scale,
          opacity,
          zIndex
        }
      })

      // Sort by zIndex to ensure front elements render on top
      setProjectedPoints(projected.sort((a, b) => a.zIndex - b.zIndex))
      requestRef.current = requestAnimationFrame(update)
    }

    requestRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(requestRef.current)
  }, [points, radius])

  // Mouse interaction
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    // Map mouse position to -1 to 1 range
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    
    // Update velocity based on mouse position
    // Moving mouse right (positive x) should rotate around Y axis
    // Moving mouse down (positive y) should rotate around X axis
    velocity.current.x = y * -0.015
    velocity.current.y = x * 0.015
  }

  const handleMouseEnter = () => { isHovered.current = true }
  const handleMouseLeave = () => { isHovered.current = false }

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px', minHeight: '500px' }}
    >
      <div className="relative" style={{ width: 0, height: 0 }}>
        {projectedPoints.map((p, i) => (
          <div
            key={`${p.label}-${i}`}
            className="absolute flex items-center justify-center interactive"
            style={{
              transform: `translate3d(-50%, -50%, 0) translate3d(${p.px}px, ${p.py}px, 0px) scale(${p.scale})`,
              opacity: p.opacity,
              zIndex: p.zIndex,
              transition: 'opacity 0.1s linear',
              willChange: 'transform, opacity'
            }}
          >
            <div 
              className="font-mono text-center px-4 py-2 whitespace-nowrap rounded-lg backdrop-blur-md transition-colors duration-300 hover:text-white"
              style={{
                background: 'rgba(0, 229, 255, 0.04)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 229, 255, 0.05)',
              }}
            >
              {p.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
