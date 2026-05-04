import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, useProgress, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// Textures
function createCircleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64; canvas.height = 64
  const ctx = canvas.getContext('2d')

  // Create a softer, more realistic particle texture
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.1, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.4, 'rgba(255,200,100,0.4)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}
const circleTexture = createCircleTexture()

function hashRand(seed) {
  const s = Math.sin(seed * 999.1337) * 43758.5453123
  return s - Math.floor(s)
}

/* ──────────────────────────────────────
   LOADING SCREEN
   ────────────────────────────────────── */
function IntroLoader() {
  return null
}

/**
 * Marks assets ready for the intro UI.
 * `useProgress()` only moves when LoadingManager sees loads; this intro is mostly sync,
 * so progress can stay 0 forever — we must fall back or the site appears frozen on black.
 */
function AssetReadySignal({ onReady }) {
  const { progress } = useProgress()
  const doneRef = useRef(false)

  const fire = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onReady()
  }, [onReady])

  useEffect(() => {
    if (progress >= 99) fire()
  }, [progress, fire])

  useEffect(() => {
    const t = window.setTimeout(fire, 400)
    return () => window.clearTimeout(t)
  }, [fire])

  return null
}

/* ──────────────────────────────────────
   INFO CARD (Ethereal Memory)
   ────────────────────────────────────── */
function InfoCard({ cardRef, position, title, subtitle }) {
  const containerRef = useRef()
  useFrame(() => {
    if (containerRef.current && cardRef.current) {
      containerRef.current.style.opacity = cardRef.current.opacity
      // Drifting and scaling effect for memory realism
      const scale = 1 + (50 - cardRef.current.y) * 0.003
      containerRef.current.style.transform = `translate3d(-50%, calc(-50% + ${cardRef.current.y}px), 0) scale(${scale})`

      // Soft blur that clears as opacity increases
      const blurAmount = (1 - cardRef.current.opacity) * 12
      containerRef.current.style.filter = `blur(${blurAmount}px)`
    }
  })
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div ref={containerRef} className="pointer-events-none flex flex-col items-center justify-center text-center" style={{
        opacity: 0,
        width: '500px',
        padding: '24px',
      }}>
        <h3 className="font-playfair italic tracking-[0.22em] text-4xl text-white/95 mb-4" style={{ textShadow: '0 0 30px rgba(200, 216, 240, 0.9), 0 0 10px rgba(255, 255, 255, 0.5)' }}>{title}</h3>
        <p className="font-dm font-normal text-[0.9rem] text-cyan-50/85 leading-relaxed tracking-[0.12em]" style={{ textShadow: '0 0 15px rgba(0, 207, 255, 0.5)' }}>{subtitle}</p>
      </div>
    </Html>
  )
}

const SOFT_SEED_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SOFT_SEED_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash12(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    /* Tight Airy-like core + softer shell (reads as a point source, not a flat disc) */
    float core = exp(-r * r * 48.0);
    float inner = exp(-r * r * 120.0);
    float corona = exp(-r * r * 7.5) * 0.38;
    float wide = exp(-r * r * 2.4) * 0.1;
    /* Keep center stable; shimmer mostly in the shell */
    float flickShell = 0.88 + 0.12 * sin(uTime * 52.0 + hash12(floor(p * 95.0 + uTime * 2.4)) * 6.2831853);
    float flickCore = 0.97 + 0.03 * sin(uTime * 31.0);
    float breathe = 0.93 + 0.07 * sin(uTime * 2.6);
    vec3 col = vec3(1.0, 0.995, 0.98) * (core * 1.15 + inner * 2.1);
    col += vec3(0.32, 0.9, 1.0) * corona;
    col += vec3(1.0, 0.72, 0.38) * smoothstep(0.18, 0.0, r) * 0.45;
    col += vec3(0.5, 0.38, 1.0) * wide;
    float rim = pow(smoothstep(0.52, 0.06, r), 1.35) * 0.22;
    col += vec3(0.88, 0.94, 1.0) * rim;
    float a = uIntensity * breathe;
    a *= flickCore * (core * 1.08 + inner * 1.4) + flickShell * (corona + wide * 2.2);
    a *= 1.0 - smoothstep(0.94, 1.0, r);
    if (a < 0.005) discard;
    gl_FragColor = vec4(col, a);
  }
`

/* Soft camera-facing “physical” seed — additive glow + micro-flicker */
function SoftSeedBillboard({ burstProgress, sparkOpacity }) {
  const matRef = useRef()
  const meshRef = useRef()
  const glintRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    [],
  )

  useFrame((state) => {
    const bp = burstProgress.current
    const sp = sparkOpacity.current
    const t = state.clock.elapsedTime
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      if (bp >= 0.998) {
        const breathe = 1 + Math.sin(t * 3.1) * 0.06
        matRef.current.uniforms.uIntensity.value = sp * 1.25 * breathe
      } else {
        const burst = 1 - bp
        matRef.current.uniforms.uIntensity.value = sp * Math.max(0, 1 - burst * 4.5) * 0.2
      }
    }
    if (meshRef.current && bp >= 0.998) {
      const s = 1 + Math.sin(t * 3.4) * 0.035
      /* Smaller plane so the eye resolves a point-like source + sphere */
      meshRef.current.scale.setScalar(4.25 * s)
    }
    if (glintRef.current) {
      const gsp = bp >= 0.998 ? sp : 0
      glintRef.current.scale.setScalar(0.55 + gsp * 0.35 + Math.sin(t * 11) * 0.03 * gsp)
      if (glintRef.current.material) glintRef.current.material.opacity = gsp * 0.95
    }
  })

  return (
    <Billboard follow>
      <mesh ref={meshRef} renderOrder={6}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={SOFT_SEED_VERT}
          fragmentShader={SOFT_SEED_FRAG}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={glintRef} renderOrder={7} position={[0.02, 0.03, 0.001]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial
          map={circleTexture}
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  )
}

/* ──────────────────────────────────────
   SPARK CORE & SHOCKWAVE (Physics Visuals)
   ────────────────────────────────────── */
function SparkCore({ burstProgress, sparkOpacity }) {
  const coreRef = useRef()
  const emberRef = useRef()
  const seedLightRef = useRef()
  const shockwave1Ref = useRef()
  const shockwave2Ref = useRef()
  const haloRef = useRef()

  useFrame(() => {
    const bp = burstProgress.current
    const sp = sparkOpacity.current

    if (seedLightRef.current) {
      seedLightRef.current.intensity = sp * (bp === 1 ? 14 : 4 + (1 - bp) * 22)
    }

    if (emberRef.current) {
      if (bp === 1) {
        const pulse = 1 + Math.sin(Date.now() * 0.0042) * 0.06
        emberRef.current.scale.setScalar(0.042 * pulse)
        emberRef.current.material.opacity = Math.min(1, sp * 0.95)
      } else {
        const burstSize = 1 - bp
        emberRef.current.scale.setScalar(0.042 + Math.pow(burstSize, 0.32) * 280)
        emberRef.current.material.opacity = Math.pow(bp, 2.2) * 0.85
      }
    }

    if (coreRef.current) {
      if (bp === 1) {
        const breathe = 1 + Math.sin(Date.now() * 0.0035) * 0.1
        coreRef.current.scale.setScalar(0.18 * breathe)
        coreRef.current.material.opacity = sp * 0.52
        if (coreRef.current.material.emissiveIntensity !== undefined) {
          coreRef.current.material.emissiveIntensity = 1.8 + sp * 5.5
        }
      } else {
        const burstSize = 1 - bp
        coreRef.current.scale.setScalar(0.18 + Math.pow(burstSize, 0.28) * 320)
        coreRef.current.material.opacity = Math.pow(bp, 2.4) * 0.45
        if (coreRef.current.material.emissiveIntensity !== undefined) {
          coreRef.current.material.emissiveIntensity = 2 + (1 - burstSize) * 8
        }
      }
    }

    if (haloRef.current) {
      if (bp === 1) {
        haloRef.current.scale.setScalar(1.55 + sp * 6.2)
        haloRef.current.material.opacity = sp * 0.26
      } else {
        const burstSize = 1 - bp
        haloRef.current.scale.setScalar(2 + Math.pow(burstSize, 0.35) * 400)
        haloRef.current.material.opacity = Math.max(0, 0.4 - burstSize * 1.1)
      }
    }

    if (shockwave1Ref.current && shockwave2Ref.current) {
      if (bp === 1) {
        shockwave1Ref.current.scale.setScalar(0.01)
        shockwave2Ref.current.scale.setScalar(0.01)
        shockwave1Ref.current.material.opacity = 0
        shockwave2Ref.current.material.opacity = 0
      } else {
        const burstSize = 1 - bp
        const scale = 0.01 + Math.pow(burstSize, 0.38) * 920
        shockwave1Ref.current.scale.setScalar(scale)
        shockwave2Ref.current.scale.setScalar(scale * 1.06)

        const opacity = Math.max(0, 0.92 - burstSize * 1.45)
        shockwave1Ref.current.material.opacity = opacity
        shockwave2Ref.current.material.opacity = opacity * 0.85
      }
    }
  })

  return (
    <group position={[0, 0, -100]}>
      <pointLight
        ref={seedLightRef}
        position={[0, 0, 4]}
        color="#fff4e8"
        distance={120}
        decay={2}
        intensity={0}
      />
      <SoftSeedBillboard burstProgress={burstProgress} sparkOpacity={sparkOpacity} />

      <mesh ref={haloRef}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sub-pixel solid emitter — reads as physical matter before the burst */}
      <mesh ref={emberRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dense super-hot nucleus (supports burst expansion) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 40, 40]} />
        <meshStandardMaterial
          color="#1a1410"
          emissive="#ffecd4"
          emissiveIntensity={0}
          metalness={0.12}
          roughness={0.38}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Horizontal Shockwave Ring */}
      <mesh ref={shockwave1Ref} rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 128]} />
        <meshBasicMaterial
          color="#00cfff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical Angled Shockwave Ring */}
      <mesh ref={shockwave2Ref} rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <ringGeometry args={[0.95, 1, 128]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* ──────────────────────────────────────
   BIG BANG PARTICLES (Physics Integration)
   ────────────────────────────────────── */
function BigBangParticles({ burstProgress, flightSpeed, morphProgress }) {
  const meshRef = useRef()
  const count = 15000

  const [initialVelocities, textPos, colors, sizes] = useMemo(() => {
    const rand = (seed) => {
      const s = Math.sin(seed * 999.1337) * 43758.5453123
      return s - Math.floor(s)
    }

    const vels = new Float32Array(count * 3)
    const tp = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const szs = new Float32Array(count)

    // Name Text Setup
    const canvas = document.createElement('canvas')
    canvas.width = 1024; canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 110px "Arial", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('UDAYNOOR SINGH', 512, 128)
    const data = ctx.getImageData(0, 0, 1024, 256).data
    const textPixels = []

    // Scan canvas for text pixels
    for (let y = 0; y < 256; y += 3) {
      for (let x = 0; x < 1024; x += 3) {
        if (data[(y * 1024 + x) * 4 + 3] > 128) {
          // Reduced scale to 0.085 to perfectly fit on screen without clipping
          textPixels.push([(x - 512) * 0.085, (128 - y) * 0.085, 0])
        }
      }
    }

    // Realistic explosion color palette
    const colorPalette = [
      new THREE.Color('#ffffff'), // Superhot white
      new THREE.Color('#ffcc55'), // Yellow
      new THREE.Color('#ff5500'), // Orange
      new THREE.Color('#00cfff'), // Shockwave Cyan
      new THREE.Color('#224488')  // Cool space blue
    ]

    const toCamBias = 0.68

    for (let i = 0; i < count; i++) {
      const theta = rand(i * 11 + 1) * Math.PI * 2
      const phi = Math.acos(2 * rand(i * 11 + 2) - 1)
      let dx = Math.sin(phi) * Math.cos(theta)
      let dy = Math.sin(phi) * Math.sin(theta)
      let dz = Math.cos(phi)
      dx = dx * (1 - toCamBias)
      dy = dy * (1 - toCamBias)
      dz = dz * (1 - toCamBias) + toCamBias
      const invLen = 1 / Math.max(0.0001, Math.hypot(dx, dy, dz))
      dx *= invLen
      dy *= invLen
      dz *= invLen

      const force = 140 + Math.pow(rand(i * 11 + 3), 2.15) * 7200

      vels[i * 3] = dx * force
      vels[i * 3 + 1] = dy * force
      vels[i * 3 + 2] = dz * force

      // Text Morph Targets
      const p = textPixels[i % textPixels.length] || [0, 0, 0]
      tp[i * 3] = p[0]
      tp[i * 3 + 1] = p[1]
      tp[i * 3 + 2] = p[2] + (rand(i * 11 + 4) - 0.5) * 4 // Slight 3D volume

      // Colors based on speed (fast = blue/cyan, slow = yellow/white core)
      let c;
      if (force > 4800) c = colorPalette[3]
      else if (force > 2800) c = colorPalette[4]
      else if (force > 900) c = colorPalette[2]
      else if (force > 280) c = colorPalette[1]
      else c = colorPalette[0]

      // Add some random variation
      if (rand(i * 11 + 5) > 0.8) c = colorPalette[Math.floor(rand(i * 11 + 6) * colorPalette.length)]

      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b

      // Sizes: faster particles are smaller
      szs[i] = (1 - (force / 7500)) * 1.45 + rand(i * 11 + 7) * 0.95
    }

    return [vels, tp, cols, szs]
  }, [])

  const currentPos = useRef(new Float32Array(count * 3))
  const currentVels = useRef(new Float32Array(count * 3))
  const initialized = useRef(false)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const posAttr = meshRef.current.geometry.attributes.position
    const bp = burstProgress.current
    const mp = morphProgress.current
    const fs = flightSpeed.current

    // Explosion center
    const sx = 0, sy = 0, sz = -100

    // Initialize physics state on first frame or reset
    if (!initialized.current) {
      for (let i = 0; i < count * 3; i++) {
        currentVels.current[i] = initialVelocities[i]
      }
      initialized.current = true
    }

    // Air resistance/drag factor (frame-rate independent approximation)
    // Decreases velocity significantly over time
    const drag = Math.pow(0.01, delta)

    for (let i = 0; i < count; i++) {
      let ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
      let tx, ty, tz

      if (bp === 1) {
        const jitter = 0.035
        const r1 = hashRand(i * 19 + 1)
        const r2 = hashRand(i * 19 + 3)
        const r3 = hashRand(i * 19 + 5)
        tx = sx + (r1 - 0.5) * jitter
        ty = sy + (r2 - 0.5) * jitter
        tz = sz + (r3 - 0.5) * jitter

        currentPos.current[ix] = tx
        currentPos.current[iy] = ty
        currentPos.current[iz] = tz
      } else if (mp === 0) {
        // Phase 2: True Physics Explosion & Flight

        // Apply Drag
        currentVels.current[ix] *= drag
        currentVels.current[iy] *= drag
        currentVels.current[iz] *= drag

        // Apply Velocity (Explosion + Forward Flight)
        currentPos.current[ix] += currentVels.current[ix] * delta
        currentPos.current[iy] += currentVels.current[iy] * delta
        currentPos.current[iz] += (currentVels.current[iz] + fs) * delta

        // Wrap particles back to horizon if they fly past camera
        // to simulate an infinite nebula space flight
        if (currentPos.current[iz] > 100) {
          currentPos.current[iz] -= 1200
          // Distribute new incoming particles in a galaxy-like spread
          const angle = Math.random() * Math.PI * 2
          const rad = 20 + Math.pow(Math.random(), 2) * 800
          currentPos.current[ix] = Math.cos(angle) * rad
          currentPos.current[iy] = Math.sin(angle) * rad * 0.4 // Squashed Y for disc shape
        }

        tx = currentPos.current[ix]
        ty = currentPos.current[iy]
        tz = currentPos.current[iz]
      } else {
        // Phase 3: Convergence (Morph to Name)
        // Keep flying forward slightly while morphing
        if (mp < 1) {
          currentPos.current[iz] += fs * delta * (1 - mp)
        }

        // Ease from current physics position into precise text position
        const ease = 1 - Math.pow(1 - mp, 3) // Cubic ease out
        tx = currentPos.current[ix] * (1 - ease) + textPos[ix] * ease
        ty = currentPos.current[iy] * (1 - ease) + textPos[iy] * ease
        tz = currentPos.current[iz] * (1 - ease) + textPos[iz] * ease
      }

      posAttr.array[ix] = tx
      posAttr.array[iy] = ty
      posAttr.array[iz] = tz
    }

    posAttr.needsUpdate = true
    // Hide particles completely until burst begins so SparkCore takes focus
    meshRef.current.material.opacity = bp === 1 ? 0 : 0.85
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={new Float32Array(count * 3)} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={1.0}
        vertexColors
        map={circleTexture}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={true}
      />
    </points>
  )
}

/* ──────────────────────────────────────
   INTRO SCENE & TIMELINE
   ────────────────────────────────────── */
function IntroScene({ onComplete, setChapterLabel, setGlobalProgress, hasStarted }) {
  const burstProgress = useRef(1) // 1 = Spark, 0 = Exploded
  const flightSpeed = useRef(0)
  const morphProgress = useRef(0)
  const sparkOpacity = useRef(0)

  const card1 = useRef({ opacity: 0, y: 50 })
  const card2 = useRef({ opacity: 0, y: 50 })
  const card3 = useRef({ opacity: 0, y: 50 })

  const tlRef = useRef(null)

  useEffect(() => {
    if (!hasStarted) return

    setGlobalProgress(0)
    burstProgress.current = 1
    morphProgress.current = 0
    flightSpeed.current = 0
    sparkOpacity.current = 0

    const tl = gsap.timeline({
      onUpdate: () => setGlobalProgress(tl.progress() * 100),
      onComplete: () => setTimeout(onComplete, 900),
    })
    tlRef.current = tl

    tl.call(() => { setChapterLabel('I · SEED') }, [], 0)
    tl.to(sparkOpacity, { current: 0.16, duration: 0.65, ease: 'power1.inOut' }, 0.3)
    tl.to(sparkOpacity, { current: 1, duration: 1.25, ease: 'power2.inOut' }, 0.85)

    tl.call(() => { setChapterLabel('II · BURST') }, [], 2.0)
    tl.to(burstProgress, { current: 0, duration: 1.4, ease: 'power4.out' }, 2.0)
    tl.to(flightSpeed, { current: 640, duration: 0.3, ease: 'power1.in' }, 2.0)

    tl.call(() => { setChapterLabel('III · SIGNAL') }, [], 3.25)
    tl.to(flightSpeed, { current: 125, duration: 3.6, ease: 'power2.out' }, 2.45)

    tl.to(card1.current, { opacity: 1, y: 18, duration: 2.1, ease: 'power2.out' }, 4.4)
    tl.to(card1.current, { opacity: 0, y: -18, duration: 1.9, ease: 'power2.in' }, 7.3)

    tl.to(card2.current, { opacity: 1, y: 18, duration: 2.1, ease: 'power2.out' }, 7.8)
    tl.to(card2.current, { opacity: 0, y: -18, duration: 1.9, ease: 'power2.in' }, 10.7)

    tl.to(card3.current, { opacity: 1, y: 18, duration: 2.1, ease: 'power2.out' }, 11.2)
    tl.to(card3.current, { opacity: 0, y: -18, duration: 1.9, ease: 'power2.in' }, 14.1)

    tl.call(() => { setChapterLabel('IV · NAME') }, [], 15.2)
    tl.to(flightSpeed, { current: 0, duration: 2.0, ease: 'power2.inOut' }, 15.2)
    tl.to(morphProgress, { current: 1, duration: 3.6, ease: 'power3.inOut' }, 15.45)

    tl.to({}, { duration: 1.9 }, 19.05)

    return () => tl.kill()
  }, [hasStarted, onComplete, setGlobalProgress, setChapterLabel])

  return (
    <>
      <fog attach="fog" args={['#000000', 50, 400]} />
      <ambientLight intensity={1.5} />

      <SparkCore
        burstProgress={burstProgress}
        sparkOpacity={sparkOpacity}
      />

      <BigBangParticles
        burstProgress={burstProgress}
        flightSpeed={flightSpeed}
        morphProgress={morphProgress}
      />

      <InfoCard
        cardRef={card1}
        position={[-22, 5, 0]}
        title="Lead Engineer"
        subtitle="Architecting systems from the void"
      />
      <InfoCard
        cardRef={card2}
        position={[22, -5, 0]}
        title="Full Stack Developer"
        subtitle="Bridging aesthetics with robust logic"
      />
      <InfoCard
        cardRef={card3}
        position={[0, -12, 20]}
        title="Creative Technologist"
        subtitle="Breathing life into the browser"
      />
    </>
  )
}

/* ──────────────────────────────────────
   PROGRESS BAR COMPONENT
   ────────────────────────────────────── */
function IntroProgressIndicator({ progress, chapterLabel }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none" style={{ padding: '0 0 40px 0' }}>
      <div className="max-w-4xl mx-auto px-8 relative">
        <div className="flex justify-between items-end mb-3">
          <div className="font-mono text-xs tracking-[0.3em] text-[#00cfff] glow-text-cyan flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00cfff] animate-pulse"></span>
            {chapterLabel}
          </div>
          <div className="font-mono text-[0.65rem] tracking-widest text-[rgba(200,216,240,0.5)]">
            SYSTEM // {Math.round(progress)}%
          </div>
        </div>

        <div className="w-full h-[2px] bg-[rgba(200,220,255,0.05)] relative overflow-hidden rounded-full">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#d4a843] to-[#00cfff]"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          >
            <div className="absolute right-0 top-0 h-full w-[20px] bg-white blur-[4px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PRE-SEQUENCE (pitch black + seed prompt)
   ────────────────────────────────────── */
function SeedParticleCanvas2D() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const css = 220
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(css * dpr)
    canvas.height = Math.floor(css * dpr)
    canvas.style.width = `${css}px`
    canvas.style.height = `${css}px`

    let raf = 0
    let alive = true
    const paint = (t) => {
      if (!alive) return
      const T = t * 0.001
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cx = css / 2
      const cy = css / 2
      const breathe = 0.9 + Math.sin(T * 2.35) * 0.09
      const flick = 0.88 + Math.sin(T * 41 + Math.sin(T * 2.7) * 2.2) * 0.11

      /* Outer response glow — faint so the core reads as a real point */
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 72 * breathe)
      g1.addColorStop(0, `rgba(255,250,240,${0.42 * flick})`)
      g1.addColorStop(0.12, `rgba(255,245,220,${0.22 * flick})`)
      g1.addColorStop(0.35, `rgba(120,230,255,${0.12 * flick})`)
      g1.addColorStop(0.65, `rgba(255,140,80,${0.04 * flick})`)
      g1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, css, css)

      ctx.globalCompositeOperation = 'lighter'
      /* Main ember body — bright center (no “hole”) */
      const g2 = ctx.createRadialGradient(cx - 0.35, cy - 0.28, 0, cx, cy, 7.2 * breathe)
      g2.addColorStop(0, `rgba(255,255,255,${0.99 * flick})`)
      g2.addColorStop(0.08, `rgba(255,248,230,${0.82 * flick})`)
      g2.addColorStop(0.28, `rgba(255,210,150,${0.35 * flick})`)
      g2.addColorStop(0.55, `rgba(255,120,70,${0.12 * flick})`)
      g2.addColorStop(1, 'rgba(40,20,10,0)')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(cx, cy, 7.2 * breathe, 0, Math.PI * 2)
      ctx.fill()

      const g3 = ctx.createRadialGradient(cx + 0.45, cy + 0.35, 0, cx, cy, 1.35 * breathe)
      g3.addColorStop(0, `rgba(255,255,255,${0.92 * flick})`)
      g3.addColorStop(0.55, `rgba(200,245,255,${0.25 * flick})`)
      g3.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g3
      ctx.beginPath()
      ctx.arc(cx, cy, 1.15 * breathe, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={ref} className="block" aria-hidden />
}

function PreSequenceOverlay({ onBegin }) {
  return (
    <div
      className="absolute inset-0 z-[115] cursor-pointer bg-black outline-none"
      onClick={onBegin}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onBegin()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Begin intro sequence"
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-14">
        <div className="relative flex h-52 w-52 items-center justify-center">
          <div
            className="absolute rounded-full bg-[rgba(0,229,255,0.08)] blur-3xl"
            style={{ width: 160, height: 160 }}
          />
          <SeedParticleCanvas2D />
        </div>
        <p className="mt-12 font-mono text-[0.62rem] tracking-[0.28em] text-white/58">TAP ANYWHERE TO BEGIN</p>
        <p className="mt-3 max-w-[300px] px-4 text-center font-mono text-[0.55rem] leading-relaxed tracking-[0.16em] text-white/42">
          or wait — sequence starts automatically
        </p>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   MAIN EXPORT
   ────────────────────────────────────── */
export default function IntroSequence({ onComplete }) {
  const [globalProgress, setGlobalProgress] = useState(0)
  const [chapterLabel, setChapterLabel] = useState('…')
  const [assetsReady, setAssetsReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const handleAssetsReady = useCallback(() => {
    setAssetsReady(true)
  }, [])

  useEffect(() => {
    if (!assetsReady || hasStarted) return
    const t = window.setTimeout(() => setHasStarted(true), 3200)
    return () => clearTimeout(t)
  }, [assetsReady, hasStarted])

  const skipIntro = useCallback(() => {
    gsap.killTweensOf('*')
    onComplete()
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 0, 80], fov: 45 }} dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25)}>
        <Suspense fallback={<IntroLoader />}>
          <AssetReadySignal onReady={handleAssetsReady} />
          <IntroScene
            onComplete={onComplete}
            setChapterLabel={setChapterLabel}
            setGlobalProgress={setGlobalProgress}
            hasStarted={hasStarted}
          />
        </Suspense>
      </Canvas>

      {assetsReady && !hasStarted && (
        <PreSequenceOverlay onBegin={() => setHasStarted(true)} />
      )}

      {hasStarted && (
        <IntroProgressIndicator progress={globalProgress} chapterLabel={chapterLabel} />
      )}

      {hasStarted && (
        <button
          type="button"
          onClick={skipIntro}
          className="absolute bottom-8 right-8 z-[120] font-mono text-[10px] tracking-[3px] text-white/50 transition-colors hover:text-white interactive"
        >
          SKIP INTRO &rarr;
        </button>
      )}
    </div>
  )
}
