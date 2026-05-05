import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'

/* ──────────────────────────────────────────────
   INTERACTIVE ELEMENT DETECTION
   ────────────────────────────────────────────── */

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], .interactive, .glass-card, .magnetic, .tilt-card, summary, label[for]'

const TYPE_LABELS = {
  link: 'OPEN',
  external: 'OPEN ↗',
  button: 'GO',
  text: 'READ',
  card: 'VIEW',
  media: 'PLAY',
  field: 'TYPE',
  default: '',
}

const MAGNET_STRENGTH = {
  button: 0.3,
  field: 0.16,
  link: 0.24,
  external: 0.24,
  card: 0.14,
  text: 0.1,
  media: 0.14,
  default: 0,
}

function resolveCursor(target) {
  if (!(target instanceof Element)) {
    return { interactive: null, type: 'default', label: '' }
  }

  const labelEl = target.closest('[data-cursor-label]')
  let customLabel = labelEl?.getAttribute('data-cursor-label') ?? ''
  customLabel = typeof customLabel === 'string' ? customLabel.trim() : ''

  const interactive = target.closest(INTERACTIVE_SELECTOR)
  if (!interactive) {
    return { interactive: null, type: 'default', label: customLabel }
  }

  const forced = interactive.getAttribute('data-cursor')?.trim()
  const allowed = new Set(['link', 'external', 'button', 'text', 'card', 'media', 'field', 'default'])
  if (forced && allowed.has(forced)) {
    return {
      interactive,
      type: forced,
      label: customLabel || TYPE_LABELS[forced] || '',
    }
  }

  let type = 'default'
  if (interactive.matches('input, textarea, select')) type = 'field'
  else if (interactive.matches('a[href^="http"], a[href^="//"]')) type = 'external'
  else if (interactive.matches('button, [role="button"]')) type = 'button'
  else if (interactive.matches('a')) type = 'link'
  else if (interactive.matches('video, canvas')) type = 'media'
  else if (interactive.matches('.glass-card, .tilt-card')) type = 'card'
  else if (target.closest('.text-effect, h1, h2, h3, h4')) type = 'text'
  else if (interactive.matches('.interactive, .magnetic')) type = 'card'

  const label = customLabel || TYPE_LABELS[type] || ''
  return { interactive, type, label }
}

/* ──────────────────────────────────────────────
   CURSOR STYLE STATES
   ────────────────────────────────────────────── */

const cursorStyles = {
  default: {
    outer: { width: 48, height: 48, borderColor: 'rgba(0, 229, 255, 0.35)' },
    inner: { width: 10, height: 10, background: 'white' },
  },
  link: {
    outer: { width: 72, height: 72, borderColor: 'rgba(0, 229, 255, 0.7)' },
    inner: {
      width: 38,
      height: 38,
      background: 'radial-gradient(circle, rgba(0,229,255,0.65), rgba(0,229,255,0.12))',
    },
  },
  button: {
    outer: { width: 78, height: 78, borderColor: 'rgba(180, 100, 255, 0.65)', borderWidth: '2.5px' },
    inner: {
      width: 34,
      height: 34,
      background: 'radial-gradient(circle, rgba(180,100,255,0.8), rgba(180,100,255,0.2))',
    },
  },
  text: {
    outer: { width: 96, height: 28, borderColor: 'rgba(255,255,255,0.35)', borderRadius: '14px' },
    inner: { width: 0, height: 0, background: 'transparent' },
  },
  card: {
    outer: { width: 66, height: 66, borderColor: 'rgba(0,229,255,0.55)', borderStyle: 'dashed' },
    inner: { width: 10, height: 10, background: 'rgba(0,229,255,0.9)' },
  },
  external: {
    outer: { width: 80, height: 80, borderColor: 'rgba(0,255,150,0.55)' },
    inner: {
      width: 44,
      height: 44,
      background: 'radial-gradient(circle, rgba(0,255,150,0.6), transparent)',
    },
  },
  media: {
    outer: { width: 86, height: 86, borderColor: 'rgba(255,200,100,0.5)' },
    inner: {
      width: 50,
      height: 50,
      background: 'radial-gradient(circle, rgba(255,200,100,0.5), transparent)',
    },
  },
  field: {
    outer: { width: 64, height: 64, borderColor: 'rgba(255, 190, 120, 0.5)' },
    inner: { width: 6, height: 6, background: 'rgba(255, 210, 150, 0.9)' },
  },
}

/* ──────────────────────────────────────────────
   CONFETTI COLORS (Magic UI Cool-Mode Inspired)
   ────────────────────────────────────────────── */

const CONFETTI_PALETTE = [
  '#00e5ff', '#7b2cbf', '#ff6b9d', '#00ff96',
  '#ffd700', '#ff4757', '#70a1ff', '#a29bfe',
  '#fd79a8', '#00cec9', '#e056fd', '#f9ca24',
]

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export default function CursorFX() {
  const canvasRef = useRef(null)
  const ringRef = useRef(null)
  const magnetRef = useRef(null)
  const clickRipplesRef = useRef([])
  const hoverElRef = useRef(null)
  const wasHoveringRef = useRef(false)
  const isHoveringRef = useRef(false)
  const tiltRef = useRef(0)
  const velRef = useRef({ x: 0, y: 0, speed: 0 })
  const prevMouseRef = useRef({ x: -100, y: -100 })
  const trailRef = useRef([])
  const confettiRef = useRef([])
  const hueRef = useRef(190)

  const reducedMotion = useReducedMotion()
  const [pointerFine, setPointerFine] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true,
  )

  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [cursorType, setCursorType] = useState('default')
  const [hoverLabel, setHoverLabel] = useState('')
  const [isClicking, setIsClicking] = useState(false)

  const targetX = useMotionValue(-100)
  const targetY = useMotionValue(-100)
  const dotX = useSpring(targetX, { stiffness: 550, damping: 32, mass: 0.8 })
  const dotY = useSpring(targetY, { stiffness: 550, damping: 32, mass: 0.8 })
  const ringX = useSpring(dotX, { stiffness: 85, damping: 18, mass: 0.95 })
  const ringY = useSpring(dotY, { stiffness: 85, damping: 18, mass: 0.95 })
  const ringTilt = useSpring(0, { stiffness: 200, damping: 24 })

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const onChange = () => setPointerFine(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!pointerFine || reducedMotion) return
    document.documentElement.classList.add('cursor-enabled')
    return () => document.documentElement.classList.remove('cursor-enabled')
  }, [pointerFine, reducedMotion])

  useEffect(() => {
    if (!pointerFine || reducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let particles = []
    let animationFrameId
    let mouse = { x: -100, y: -100 }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    /* ─── Trail particle ─── */
    const pushTrailParticle = (x, y) => {
      // Disabled in favor of FluidCursor
    }

    /* ─── Magic UI Cool-Mode confetti burst ─── */
    const spawnConfetti = (x, y, count = 22) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = Math.random() * 8 + 4
        const color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)]
        const size = Math.random() * 8 + 4
        const shape = Math.random() > 0.5 ? 'circle' : 'rect'
        confettiRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 3,
          size,
          life: 1,
          decay: Math.random() * 0.012 + 0.006,
          color,
          shape,
          spin: Math.random() * 360,
          spinSpeed: (Math.random() - 0.5) * 18,
          gravity: 0.12 + Math.random() * 0.08,
        })
      }
    }

    /* ─── Hover burst ─── */
    const pushHoverBurst = (x, y) => {
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14
        const speed = Math.random() * 4 + 2
        trailRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          life: 1,
          decay: Math.random() * 0.025 + 0.012,
          hue: 190 + Math.random() * 80,
        })
      }
    }

    const applyHoverFromTarget = (target) => {
      const { interactive, type, label } = resolveCursor(target)
      hoverElRef.current = interactive
      const nowHover = Boolean(interactive)
      isHoveringRef.current = nowHover
      setIsHovering(nowHover)
      setCursorType(type)
      setHoverLabel(label)

      if (nowHover && !wasHoveringRef.current) {
        pushHoverBurst(mouse.x, mouse.y)
      }
      wasHoveringRef.current = nowHover
      return { interactive, type }
    }

    const moveCursor = (e) => {
      setIsVisible(true)
      const dx = e.clientX - prevMouseRef.current.x
      const dy = e.clientY - prevMouseRef.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)
      velRef.current = { x: dx, y: dy, speed }
      prevMouseRef.current = { x: e.clientX, y: e.clientY }

      // Shift hue based on velocity for aurora effect
      hueRef.current = (hueRef.current + speed * 0.3) % 360

      mouse = { x: e.clientX, y: e.clientY }
      const { interactive, type } = applyHoverFromTarget(e.target)

      tiltRef.current = tiltRef.current * 0.8 + e.movementX * 0.4
      ringTilt.set(Math.max(-16, Math.min(16, tiltRef.current)))

      const mag = MAGNET_STRENGTH[type] ?? MAGNET_STRENGTH.default

      let tx = e.clientX
      let ty = e.clientY
      if (interactive && mag > 0) {
        const r = interactive.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        tx = e.clientX + (cx - e.clientX) * mag
        ty = e.clientY + (cy - e.clientY) * mag
      }

      targetX.set(tx)
      targetY.set(ty)

      // Trail — spawn rate increases with speed
      if (speed > 1.5) {
        pushTrailParticle(e.clientX, e.clientY)
        if (speed > 8) pushTrailParticle(e.clientX, e.clientY)
        if (speed > 18) pushTrailParticle(e.clientX, e.clientY)
      }
    }

    const checkHover = (e) => applyHoverFromTarget(e.target)

    const handleMouseLeave = () => {
      setIsVisible(false)
      isHoveringRef.current = false
      setIsHovering(false)
      wasHoveringRef.current = false
      hoverElRef.current = null
      setCursorType('default')
      setHoverLabel('')
      ringTilt.set(0)
    }

    const handleMouseDown = (e) => {
      setIsClicking(true)
      // Cool-mode confetti on click
      spawnConfetti(e.clientX, e.clientY, 18)
      clickRipplesRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (magnetRef.current) {
        gsap.to(magnetRef.current, {
          scale: 1.9,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        })
      }
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    /* ═══════════════════════════════════════════
       RENDER LOOP
       ═══════════════════════════════════════════ */
    const renderEffects = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const hovering = isHoveringRef.current
      const vel = velRef.current

      /* ─── Aurora spotlight (disabled in favor of FluidCursor) ─── */
      /* ─── Fluid glow trail (disabled in favor of FluidCursor) ─── */

      /* ─── Cool-mode confetti particles ─── */
      const confetti = confettiRef.current
      for (let i = 0; i < confetti.length; i++) {
        const c = confetti[i]
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate((c.spin * Math.PI) / 180)
        ctx.globalAlpha = c.life

        if (c.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, c.size * c.life, 0, Math.PI * 2)
          ctx.fillStyle = c.color
          ctx.fill()
          // Glow
          ctx.shadowBlur = 12
          ctx.shadowColor = c.color
          ctx.beginPath()
          ctx.arc(0, 0, c.size * c.life * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = c.color
          ctx.fill()
          ctx.shadowBlur = 0
        } else {
          const s = c.size * c.life
          ctx.fillStyle = c.color
          ctx.shadowBlur = 10
          ctx.shadowColor = c.color
          ctx.fillRect(-s / 2, -s / 2, s, s * 0.6)
          ctx.shadowBlur = 0
        }

        ctx.restore()

        c.x += c.vx
        c.y += c.vy
        c.vy += c.gravity
        c.vx *= 0.98
        c.spin += c.spinSpeed
        c.life -= c.decay
      }
      confettiRef.current = confetti.filter((c) => c.life > 0)

      /* ─── Click ripple rings ─── */
      const now = performance.now()
      clickRipplesRef.current = clickRipplesRef.current.filter((r) => now - r.t < 1200)
      clickRipplesRef.current.forEach((r) => {
        const age = (now - r.t) / 1200
        const radius = 20 + age * 180
        const opacity = (1 - age) * 0.5
        const hue = hueRef.current

        // Double ring
        ctx.beginPath()
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${opacity})`
        ctx.lineWidth = 2 - age * 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(r.x, r.y, radius * 0.6, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${(hue + 90) % 360}, 75%, 60%, ${opacity * 0.6})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(renderEffects)
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', checkHover)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    resizeCanvas()
    renderEffects()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', checkHover)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      cancelAnimationFrame(animationFrameId)
    }
  }, [pointerFine, reducedMotion, targetX, targetY, ringTilt])

  const style = cursorStyles[cursorType] || cursorStyles.default
  const showHoverTag = isHovering && (hoverLabel || cursorType !== 'default')
  const tagText = hoverLabel || TYPE_LABELS[cursorType] || ''

  if (!pointerFine || reducedMotion) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}
      aria-hidden
    >
      {/* Canvas for trail + confetti + spotlight + ripples */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: 'screen' }} />

      {/* Outer rotating orbit ring */}
      <motion.div
        className="absolute top-0 left-0 z-[9996] will-change-transform"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: style.outer.width * 1.44,
          height: style.outer.height * 1.44,
          rotate: 360,
          scale: isHovering ? 1.15 : 1,
        }}
        transition={{
          width: { type: 'spring', stiffness: 380, damping: 28 },
          height: { type: 'spring', stiffness: 380, damping: 28 },
          rotate: { duration: 7, repeat: Infinity, ease: 'linear' },
          scale: { type: 'spring', stiffness: 260, damping: 22 },
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            border: `1px solid rgba(180,100,255,${isHovering ? 0.3 : 0.15})`,
            boxShadow: isHovering ? 'inset 0 0 22px rgba(180,100,255,0.1)' : 'none',
          }}
        />
        {/* Orbit dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            top: -2,
            left: '50%',
            marginLeft: -2,
            background: isHovering ? 'rgba(180,100,255,0.8)' : 'rgba(180,100,255,0.4)',
            boxShadow: '0 0 8px rgba(180,100,255,0.6)',
          }}
        />
      </motion.div>

      {/* Main ring */}
      <motion.div
        ref={ringRef}
        className="absolute top-0 left-0 z-[9997] will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          rotate: ringTilt,
        }}
        animate={{
          width: style.outer.width,
          height: style.outer.height,
          scale: isClicking ? 0.85 : isHovering ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            border: `${style.outer.borderWidth || '1.5px'} solid ${style.outer.borderColor}`,
            borderRadius: style.outer.borderRadius || '50%',
            borderStyle: style.outer.borderStyle || 'solid',
            boxShadow: isHovering
              ? '0 0 38px rgba(0,229,255,0.25), inset 0 0 26px rgba(0,229,255,0.08)'
              : '0 0 18px rgba(0,229,255,0.1), inset 0 0 10px rgba(0,229,255,0.04)',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        />
      </motion.div>

      {/* Inner dot with pulse */}
      <motion.div
        ref={magnetRef}
        className="absolute top-0 left-0 z-[9999] flex items-center justify-center overflow-hidden rounded-full will-change-transform"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: style.inner.width,
          height: style.inner.height,
          scale: isClicking ? 0.6 : isHovering ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 550, damping: 30 }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: style.inner.background,
            boxShadow:
              cursorType !== 'default' && cursorType !== 'text'
                ? '0 0 28px rgba(0,229,255,0.45), 0 0 56px rgba(180,100,255,0.18)'
                : '0 0 10px rgba(255,255,255,0.4)',
          }}
        />
        {/* Breathing pulse */}
        {cursorType !== 'default' && cursorType !== 'text' && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)' }}
          />
        )}
      </motion.div>

      {/* Hover label tag */}
      {showHoverTag && tagText && (
        <motion.div
          className="absolute top-0 left-0 z-[10000] whitespace-nowrap font-mono uppercase will-change-transform"
          style={{ x: dotX, y: dotY, translateX: '16px', translateY: '-120%' }}
          initial={{ opacity: 0, filter: 'blur(6px)', y: 4 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ type: 'spring', stiffness: 460, damping: 26 }}
        >
          <span
            className="rounded-sm border border-white/15 bg-black/60 px-2 py-1 backdrop-blur-md"
            style={{
              fontSize: '0.56rem',
              letterSpacing: '0.13em',
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 0 14px rgba(0,0,0,0.85), 0 0 18px rgba(0,229,255,0.35)',
            }}
          >
            {tagText}
          </span>
        </motion.div>
      )}
    </div>
  )
}
