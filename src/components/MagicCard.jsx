import React, { useRef, useState, useEffect } from 'react'

/**
 * MagicCard — Premium, highly interactive Awwwards-style card wrapper.
 * Integrates physical noise textures, continuous border lighting (Shine Border), 
 * interactive mouse spotlights, and subtle 3D tilt (Glare Card).
 */
export default function MagicCard({ 
  children, 
  className = '', 
  style = {},
  spotlightColor = 'rgba(255, 255, 255, 0.4)', // White inner glow
  borderBeamColor = 'rgba(255, 255, 255, 0.8)', // White moving border light
  enableTilt = true
}) {
  const cardRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    if (enableTilt) {
      // Calculate subtle 3D tilt (-3deg to 3deg max)
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = ((y - centerY) / centerY) * -3 
      const rotateY = ((x - centerX) / centerX) * 3
      setTilt({ x: rotateX, y: rotateY })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (enableTilt) {
      setTilt({ x: 0, y: 0 }) // Reset tilt
    }
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden group rounded-[20px] interactive ${className}`}
      style={{
        ...style,
        // Base dark styling
        backgroundColor: 'rgba(5, 5, 10, 0.65)', 
        backdropFilter: 'blur(16px)',
        // 3D Transform
        transform: enableTilt ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
        transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Physical Glass Noise Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. Interactive Inner Mouse Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      
      {/* 3. Shine Border (Masked edge layer) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{
          padding: '1px', // This creates the 1px border mask
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        {/* Continuous Spinning Beam */}
        <div 
           className="absolute inset-[-50%]"
           style={{
             background: `conic-gradient(from 0deg, transparent 0%, ${borderBeamColor} 10%, #ffffff 20%, transparent 30%, transparent 100%)`,
             animation: 'border-beam-rotate 6s linear infinite',
             willChange: 'transform'
           }}
        />
        
        {/* Interactive Mouse Border Highlight */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,1), transparent 30%)`,
          }}
        />
      </div>

      {/* 4. Children Content (Pushed slightly forward in Z-space if tilt is on) */}
      <div 
        className="relative z-20 w-full h-full" 
        style={{ 
          transform: enableTilt ? 'translateZ(15px)' : 'none',
          transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {children}
      </div>
    </div>
  )
}
