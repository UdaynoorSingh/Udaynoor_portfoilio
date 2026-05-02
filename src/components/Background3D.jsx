import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
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

function OrbitalRings() {
  const group = useRef()
  const scrollData = useScrollProgress()

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    const p = scrollData.current.progress
    group.current.rotation.z = t * 0.03
    group.current.rotation.y = t * 0.08 + p * 1.4
    group.current.position.y = Math.sin(t * 0.2) * 3.5
  })

  return (
    <group ref={group} position={[28, 10, -65]}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[12, 0.05, 24, 320]} />
        <meshBasicMaterial color="#4dd9ff" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2.7, 0.4, 0.6]}>
        <torusGeometry args={[18, 0.04, 24, 320]} />
        <meshBasicMaterial color="#a068ff" transparent opacity={0.26} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[2.1, 2]} />
        <meshStandardMaterial color="#d8f2ff" emissive="#38d2ff" emissiveIntensity={0.6} metalness={0.35} roughness={0.2} wireframe />
      </mesh>
    </group>
  )
}

function NebulaBlob({ position, color, speed = 1, scale = 1 }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed
    ref.current.position.y = position[1] + Math.sin(t * 0.35) * 2
    ref.current.rotation.z = t * 0.08
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[9, 42, 42]} />
      <meshBasicMaterial color={color} transparent opacity={0.085} />
    </mesh>
  )
}

function CameraRig({ children }) {
  const rig = useRef()
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 1.5
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 1.5
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame(() => {
    if (!rig.current) return
    rig.current.rotation.y += (target.current.x * 0.08 - rig.current.rotation.y) * 0.04
    rig.current.rotation.x += (target.current.y * 0.08 - rig.current.rotation.x) * 0.04
  })

  return <group ref={rig}>{children}</group>
}

export default function Background3D() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 60], fov: 52 }} dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={1.1} color="#54d8ff" />
        <pointLight position={[-18, -16, -4]} intensity={0.9} color="#8b5cff" />

        <CameraRig>
          <StarField />
          <OrbitalRings />
          <NebulaBlob position={[-36, -18, -95]} color="#2acbff" speed={0.9} scale={1.7} />
          <NebulaBlob position={[44, 26, -118]} color="#9d63ff" speed={0.7} scale={2.1} />
        </CameraRig>

        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom intensity={0.95} luminanceThreshold={0.08} mipmapBlur radius={0.85} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.28} darkness={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
