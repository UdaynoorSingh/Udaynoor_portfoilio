import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'

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
  button: 0.26,
  field: 0.14,
  link: 0.2,
  external: 0.2,
  card: 0.11,
  text: 0.08,
  media: 0.12,
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

const cursorStyles = {
  default: {
    outer: { width: 52, height: 52, borderColor: 'rgba(0, 229, 255, 0.4)' },
    inner: { width: 12, height: 12, background: 'white' },
  },
  link: {
    outer: { width: 72, height: 72, borderColor: 'rgba(0, 229, 255, 0.75)' },
    inner: {
      width: 40,
      height: 40,
      background: 'radial-gradient(circle, rgba(0,229,255,0.7), rgba(0,229,255,0.15))',
    },
  },
  button: {
    outer: { width: 76, height: 76, borderColor: 'rgba(180, 100, 255, 0.7)', borderWidth: '2.5px' },
    inner: {
      width: 36,
      height: 36,
      background: 'radial-gradient(circle, rgba(180,100,255,0.85), rgba(180,100,255,0.25))',
    },
  },
  text: {
    outer: { width: 96, height: 30, borderColor: 'rgba(255,255,255,0.38)', borderRadius: '15px' },
    inner: { width: 0, height: 0, background: 'transparent' },
  },
  card: {
    outer: { width: 68, height: 68, borderColor: 'rgba(0,229,255,0.6)', borderStyle: 'dashed' },
    inner: { width: 11, height: 11, background: 'rgba(0,229,255,0.95)' },
  },
  external: {
    outer: { width: 80, height: 80, borderColor: 'rgba(0,255,150,0.6)' },
    inner: {
      width: 46,
      height: 46,
      background: 'radial-gradient(circle, rgba(0,255,150,0.65), transparent)',
    },
  },
  media: {
    outer: { width: 88, height: 88, borderColor: 'rgba(255,200,100,0.58)' },
    inner: {
      width: 52,
      height: 52,
      background: 'radial-gradient(circle, rgba(255,200,100,0.55), transparent)',
    },
  },
  field: {
    outer: { width: 66, height: 66, borderColor: 'rgba(255, 190, 120, 0.55)' },
    inner: { width: 7, height: 7, background: 'rgba(255, 210, 150, 0.95)' },
  },
}

export default function CursorFX() {
  const canvasRef = useRef(null)
  const ringRef = useRef(null)
  const magnetRef = useRef(null)
  const clickRipplesRef = useRef([])
  const hoverElRef = useRef(null)
  const wasHoveringRef = useRef(false)
  const isHoveringRef = useRef(false)
  const tiltRef = useRef(0)

  const reducedMotion = useReducedMotion()
  const [pointerFine, setPointerFine] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true,
  )

  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [cursorType, setCursorType] = useState('default')
  const [hoverLabel, setHoverLabel] = useState('')

  const targetX = useMotionValue(-100)
  const targetY = useMotionValue(-100)
  const dotX = useSpring(targetX, { stiffness: 520, damping: 34, mass: 0.85 })
  const dotY = useSpring(targetY, { stiffness: 520, damping: 34, mass: 0.85 })
  const ringX = useSpring(dotX, { stiffness: 90, damping: 20, mass: 0.9 })
  const ringY = useSpring(dotY, { stiffness: 90, damping: 20, mass: 0.9 })
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

    let particles = []
    let animationFrameId
    let mouse = { x: -100, y: -100 }

    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const pushParticle = (x, y, kind = 'trail') => {
      const fast = kind === 'burst'
      const count = fast ? 1 : 1
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (fast ? 7 : 2.8),
          vy: (Math.random() - 0.5) * (fast ? 7 : 2.8),
          size: Math.random() * (fast ? 4.5 : 3) + 1,
          life: 1,
          decay: Math.random() * (fast ? 0.032 : 0.018) + (fast ? 0.018 : 0.01),
          hue: fast ? 200 + Math.random() * 110 : 175 + Math.random() * 85,
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
        for (let i = 0; i < 18; i++) pushParticle(mouse.x, mouse.y, 'burst')
      }
      wasHoveringRef.current = nowHover
      return { interactive, type }
    }

    const moveCursor = (e) => {
      setIsVisible(true)
      mouse = { x: e.clientX, y: e.clientY }

      const { interactive, type } = applyHoverFromTarget(e.target)

      tiltRef.current = tiltRef.current * 0.82 + e.movementX * 0.35
      ringTilt.set(Math.max(-14, Math.min(14, tiltRef.current)))

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

      pushParticle(e.clientX, e.clientY, 'trail')
      if (Math.random() > 0.55) pushParticle(e.clientX, e.clientY, 'trail')
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

    const handleClick = (e) => {
      if (magnetRef.current) {
        gsap.to(magnetRef.current, {
          scale: 1.85,
          duration: 0.12,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        })
      }
      clickRipplesRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      for (let i = 0; i < 14; i++) pushParticle(e.clientX, e.clientY, 'burst')
    }

    const renderEffects = () => {
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const hovering = isHoveringRef.current
        const spotlightR = hovering ? 210 : 160
        const spotlight = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, spotlightR)
        spotlight.addColorStop(0, hovering ? 'rgba(120, 200, 255, 0.18)' : 'rgba(80,220,255,0.14)')
        spotlight.addColorStop(0.55, hovering ? 'rgba(180, 120, 255, 0.07)' : 'rgba(80,220,255,0.05)')
        spotlight.addColorStop(1, 'rgba(80,220,255,0)')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, spotlightR, 0, Math.PI * 2)
        ctx.fillStyle = spotlight
        ctx.fill()

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life * 4)
          grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.life})`)
          grad.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`)

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life * 2, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()

          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.96
          p.vy *= 0.96
          p.life -= p.decay
        }
        particles = particles.filter((p) => p.life > 0)

        const now = performance.now()
        clickRipplesRef.current = clickRipplesRef.current.filter((r) => now - r.t < 1100)
        clickRipplesRef.current.forEach((r) => {
          const age = (now - r.t) / 1100
          const radius = 28 + age * 170
          const opacity = 1 - age

          ctx.beginPath()
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,229,255, ${opacity * 0.52})`
          ctx.lineWidth = 1.8
          ctx.stroke()
        })
      }

      animationFrameId = requestAnimationFrame(renderEffects)
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', checkHover)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleClick)

    resizeCanvas()
    renderEffects()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', checkHover)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleClick)
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
      <canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: 'screen' }} />

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
          scale: isHovering ? 1.06 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            border: `${style.outer.borderWidth || '1.5px'} solid ${style.outer.borderColor}`,
            borderRadius: style.outer.borderRadius || '50%',
            borderStyle: style.outer.borderStyle || 'solid',
            boxShadow: isHovering
              ? '0 0 38px rgba(0,229,255,0.28), inset 0 0 26px rgba(0,229,255,0.1)'
              : '0 0 20px rgba(0,229,255,0.12), inset 0 0 12px rgba(0,229,255,0.05)',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute top-0 left-0 z-[9996] will-change-transform"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: style.outer.width * 1.48,
          height: style.outer.height * 1.48,
          rotate: 360,
          scale: isHovering ? 1.12 : 1,
        }}
        transition={{
          width: { type: 'spring', stiffness: 380, damping: 28 },
          height: { type: 'spring', stiffness: 380, damping: 28 },
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          scale: { type: 'spring', stiffness: 260, damping: 22 },
        }}
      >
        <div
          className="h-full w-full rounded-full border border-[rgba(180,100,255,0.22)]"
          style={{
            boxShadow: isHovering ? 'inset 0 0 22px rgba(180,100,255,0.12)' : 'none',
          }}
        />
      </motion.div>

      <motion.div
        ref={magnetRef}
        className="absolute top-0 left-0 z-[9999] flex items-center justify-center overflow-hidden rounded-full will-change-transform"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: style.inner.width,
          height: style.inner.height,
          scale: isHovering ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: style.inner.background,
            boxShadow:
              cursorType !== 'default' && cursorType !== 'text'
                ? '0 0 32px rgba(0,229,255,0.48), 0 0 64px rgba(180,100,255,0.22)'
                : '0 0 12px rgba(255,255,255,0.45)',
          }}
        />
        {cursorType !== 'default' && cursorType !== 'text' && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 1.35, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.38), transparent 72%)' }}
          />
        )}
      </motion.div>

      {showHoverTag && tagText && (
        <motion.div
          className="absolute top-0 left-0 z-[10000] whitespace-nowrap font-mono uppercase will-change-transform"
          style={{ x: dotX, y: dotY, translateX: '18px', translateY: '-120%' }}
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <span
            className="rounded-sm border border-white/15 bg-black/55 px-2 py-1 backdrop-blur-md"
            style={{
              fontSize: '0.52rem',
              letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.82)',
              textShadow: '0 0 18px rgba(0,229,255,0.45)',
            }}
          >
            {tagText}
          </span>
        </motion.div>
      )}
    </div>
  )
}
