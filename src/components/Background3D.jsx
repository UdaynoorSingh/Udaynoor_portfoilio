import { useRef, useMemo, useEffect, Suspense, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function createCircleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.25, 'rgba(195,240,255,0.95)')
  gradient.addColorStop(0.65, 'rgba(0,229,255,0.22)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function useScrollProgress() {
  const data = useRef({ progress: 0 })

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to(data.current, { progress: self.progress, duration: 0.9, ease: 'power2.out' })
      },
    })

    return () => st.kill()
  }, [])

  return data
}

function StarField({ count = 9000 }) {
  const ref = useRef()
  const circleTexture = useMemo(() => createCircleTexture(), [])
  const scrollData = useScrollProgress()
  const seeded = useMemo(() => {
    return (seed) => {
      const x = Math.sin(seed * 127.1) * 43758.5453123
      return x - Math.floor(x)
    }
  }, [])

  const [positions] = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 55 + seeded(i + 1) * 170
      const theta = seeded(i + 101) * Math.PI * 2
      const phi = Math.acos(2 * seeded(i + 1001) - 1)
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      p[i * 3 + 2] = radius * Math.cos(phi)
    }
    return [p]
  }, [count, seeded])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const p = scrollData.current.progress
    ref.current.rotation.y = t * 0.01 + p * Math.PI * 1.15
    ref.current.rotation.x = Math.sin(t * 0.08) * 0.04 + p * 0.35
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.62}
        map={circleTexture}
        color="#e9f7ff"
        transparent
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Shared unit sphere; scaled per planet. Disposed on teardown. */
function useSharedPlanetGeometry() {
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 40, 40), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function OrbitingPlanet({ map, orbitRadius, angularSpeed, radius, selfSpinSpeed, geometry }) {
  const meshRef = useRef(null)
  const mOrbit = useRef(new THREE.Matrix4())
  const mTrans = useRef(new THREE.Matrix4())
  const mSpin = useRef(new THREE.Matrix4())
  const mScale = useRef(new THREE.Matrix4())
  const mCompose = useRef(new THREE.Matrix4())

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()
    const orbitAngle = t * angularSpeed
    const spinAngle = t * selfSpinSpeed
    mOrbit.current.makeRotationY(orbitAngle)
    mTrans.current.makeTranslation(orbitRadius, 0, 0)
    mSpin.current.makeRotationY(spinAngle)
    mScale.current.makeScale(radius, radius, radius)
    mCompose.current
      .copy(mOrbit.current)
      .multiply(mTrans.current)
      .multiply(mSpin.current)
      .multiply(mScale.current)
    mesh.matrix.copy(mCompose.current)
    mesh.matrixWorldNeedsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry} matrixAutoUpdate={false}>
      <meshStandardMaterial
        map={map}
        metalness={0.05}
        roughness={0.92}
      />
    </mesh>
  )
}

function SolarSystemInner({ onTexturesReady }) {
  const readyOnce = useRef(false)
  const geometry = useSharedPlanetGeometry()
  const gl = useThree((s) => s.gl)
  const [mercuryMap, earthMap, marsMap, jupiterMap] = useTexture([
    '/textures/mercury.jpg',
    '/textures/earth.jpg',
    '/textures/mars.jpg',
    '/textures/jupiter.jpg',
  ])

  useLayoutEffect(() => {
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    for (const tex of [mercuryMap, earthMap, marsMap, jupiterMap]) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = maxAniso
      tex.needsUpdate = true
    }
    if (!readyOnce.current) {
      readyOnce.current = true
      onTexturesReady?.()
    }
  }, [gl, mercuryMap, earthMap, marsMap, jupiterMap, onTexturesReady])

  const planets = useMemo(
    () => [
      { map: mercuryMap, orbitRadius: 10, angularSpeed: 0.52, radius: 0.42, selfSpinSpeed: 0.55 },
      { map: earthMap, orbitRadius: 18, angularSpeed: 0.26, radius: 1, selfSpinSpeed: 0.85 },
      { map: marsMap, orbitRadius: 23, angularSpeed: 0.21, radius: 0.52, selfSpinSpeed: 0.78 },
      { map: jupiterMap, orbitRadius: 34, angularSpeed: 0.095, radius: 2.35, selfSpinSpeed: 1.35 },
    ],
    [mercuryMap, earthMap, marsMap, jupiterMap],
  )

  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.6, 48, 48]} />
        <meshStandardMaterial
          color="#ffcc88"
          emissive="#ff9944"
          emissiveIntensity={1.35}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {planets.map((p) => (
        <OrbitingPlanet key={p.orbitRadius} {...p} geometry={geometry} />
      ))}
    </group>
  )
}

function SolarSystem({ onTexturesReady }) {
  return (
    <Suspense fallback={null}>
      <SolarSystemInner onTexturesReady={onTexturesReady} />
    </Suspense>
  )
}

export default function Background3D({ onTexturesReady }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 34, 82], fov: 52 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', touchAction: 'none', pointerEvents: 'auto' }}
      >
        <ambientLight intensity={0.22} />
        <pointLight position={[0, 0, 0]} intensity={12} color="#ffe8cc" decay={2} distance={0} />
        <pointLight position={[28, 18, 12]} intensity={0.45} color="#9ec8ff" decay={2} distance={120} />

        <SolarSystem onTexturesReady={onTexturesReady} />
        <StarField count={6500} />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={18}
          maxDistance={140}
          enablePan
          zoomSpeed={0.85}
          rotateSpeed={0.35}
          maxPolarAngle={Math.PI * 0.495}
          minPolarAngle={Math.PI * 0.08}
        />

        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom intensity={0.72} luminanceThreshold={0.12} mipmapBlur radius={0.72} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.28} darkness={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
