import { useRef, useMemo, useEffect, Suspense, useLayoutEffect, useCallback, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { OrbitControls, useTexture, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PLANET_KEYS } from '../context/planetNavConfig'

gsap.registerPlugin(ScrollTrigger)

/** Sun + fill respond slowly when the recruiter easter egg is solved (lightweight intensity lerp). */
function DynamicSceneLights({ eggBoost }) {
  const blend = useRef(0)
  const aRef = useRef(null)
  const sRef = useRef(null)
  const fRef = useRef(null)
  useFrame(() => {
    const target = eggBoost ? 1 : 0
    blend.current += (target - blend.current) * 0.07
    const b = blend.current
    if (aRef.current) aRef.current.intensity = 0.22 + b * 0.12
    if (sRef.current) sRef.current.intensity = 12 + b * 5.5
    if (fRef.current) fRef.current.intensity = 0.45 + b * 0.55
  })
  return (
    <>
      <ambientLight ref={aRef} intensity={0.22} />
      <pointLight ref={sRef} position={[0, 0, 0]} intensity={12} color="#ffe8cc" decay={2} distance={0} />
      <pointLight ref={fRef} position={[28, 18, 12]} intensity={0.45} color="#9ec8ff" decay={2} distance={120} />
    </>
  )
}

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

/** Same scroll + time drift as StarField so planets and stars stay visually locked (no false “zoom away”). */
function ScrollSyncedSceneGroup({ children }) {
  const groupRef = useRef()
  const scrollData = useScrollProgress()
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const p = scrollData.current.progress
    groupRef.current.rotation.y = t * 0.01 + p * Math.PI * 1.15
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.04 + p * 0.35
  })
  return <group ref={groupRef}>{children}</group>
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

  /* Stars are decorative only — raycasting against Points often wins first and steals clicks from planets. */
  useLayoutEffect(() => {
    const pts = ref.current
    if (pts) pts.raycast = () => {}
  }, [])

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

function useSharedPlanetGeometry() {
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 40, 40), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function ClickableOrbitingPlanet({
  planetKey,
  planetIndex,
  map,
  orbitRadius,
  angularSpeed,
  radius,
  selfSpinSpeed,
  geometry,
  planetMeshRefs,
  onPlanetPointerDown,
  navLocked,
}) {
  const meshRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && !navLocked)

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

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      if (navLocked) return
      onPlanetPointerDown?.(planetKey)
    },
    [navLocked, onPlanetPointerDown, planetKey],
  )

  return (
    <mesh
      ref={(node) => {
        meshRef.current = node
        planetMeshRefs.current[planetIndex] = node
      }}
      geometry={geometry}
      matrixAutoUpdate={false}
      onClick={handleClick}
      onPointerOver={() => !navLocked && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        map={map}
        metalness={0.05}
        roughness={0.92}
        emissive={hovered ? '#224466' : '#000000'}
        emissiveIntensity={hovered ? 0.35 : 0}
      />
    </mesh>
  )
}

function PlanetScene({ onTexturesReady, onOrbitLock, exitSignal }) {
  const { camera } = useThree()
  const controlsRef = useRef(null)
  const planetMeshRefs = useRef([])
  const geometry = useSharedPlanetGeometry()
  const gl = useThree((s) => s.gl)

  const [navLocked, setNavLocked] = useState(false)

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
  }, [gl, mercuryMap, earthMap, marsMap, jupiterMap])

  const readyOnce = useRef(false)
  useLayoutEffect(() => {
    if (!readyOnce.current) {
      readyOnce.current = true
      onTexturesReady?.()
    }
  }, [onTexturesReady])

  const planets = useMemo(
    () => [
      { key: PLANET_KEYS[0], map: mercuryMap, orbitRadius: 10, angularSpeed: 0.52, radius: 0.42, selfSpinSpeed: 0.55 },
      { key: PLANET_KEYS[1], map: earthMap, orbitRadius: 18, angularSpeed: 0.26, radius: 1, selfSpinSpeed: 0.85 },
      { key: PLANET_KEYS[2], map: marsMap, orbitRadius: 23, angularSpeed: 0.21, radius: 0.52, selfSpinSpeed: 0.78 },
      { key: PLANET_KEYS[3], map: jupiterMap, orbitRadius: 34, angularSpeed: 0.095, radius: 2.35, selfSpinSpeed: 1.35 },
    ],
    [mercuryMap, earthMap, marsMap, jupiterMap],
  )

  const phaseRef = useRef('idle')
  const targetKeyRef = useRef(null)
  const flyTRef = useRef(0)
  const orbitAngleRef = useRef(0)
  const announcedRef = useRef(false)
  const lastExitRef = useRef(0)
  const orbitRadiusRef = useRef(8)

  const startCam = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endCam = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())
  const planetCenter = useRef(new THREE.Vector3())
  const matRot = useRef(new THREE.Matrix4())
  const offset = useRef(new THREE.Vector3())
  const tmp = useRef(new THREE.Vector3())

  const defaultCam = useMemo(() => new THREE.Vector3(0, 34, 82), [])
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  const flyDur = 2.35

  const beginFlyTo = useCallback(
    (key) => {
      if (phaseRef.current === 'fly_in' || phaseRef.current === 'orbit') return
      const ix = PLANET_KEYS.indexOf(key)
      if (ix < 0) return
      const mesh = planetMeshRefs.current[ix]
      if (!mesh) return

      mesh.updateWorldMatrix(true, true)
      mesh.getWorldPosition(planetCenter.current)

      const pr = planets[ix].radius
      orbitRadiusRef.current = pr * 2.85 + 6.2

      startCam.current.copy(camera.position)
      const ctl = controlsRef.current
      startTarget.current.copy(ctl?.target ?? defaultTarget)

      endTarget.current.copy(planetCenter.current)

      tmp.current.copy(planetCenter.current).normalize()
      tmp.current.multiplyScalar(-(pr + orbitRadiusRef.current * 0.42))
      tmp.current.y += pr * 0.95
      endCam.current.copy(planetCenter.current).add(tmp.current)

      targetKeyRef.current = key
      flyTRef.current = 0
      announcedRef.current = false
      orbitAngleRef.current = Math.atan2(
        camera.position.x - planetCenter.current.x,
        camera.position.z - planetCenter.current.z,
      )
      phaseRef.current = 'fly_in'
      setNavLocked(true)
      if (ctl) {
        ctl.enableRotate = false
        ctl.enablePan = false
        ctl.enableZoom = false
      }
    },
    [camera, defaultTarget, planets],
  )

  const beginFlyOut = useCallback(() => {
    if (phaseRef.current !== 'orbit') return
    startCam.current.copy(camera.position)
    const ctl = controlsRef.current
    startTarget.current.copy(ctl?.target ?? defaultTarget)
    endCam.current.copy(defaultCam)
    endTarget.current.copy(defaultTarget)
    flyTRef.current = 0
    phaseRef.current = 'fly_out'
    announcedRef.current = false
    targetKeyRef.current = null
    setNavLocked(true)
    if (ctl) {
      ctl.enableRotate = false
      ctl.enablePan = false
      ctl.enableZoom = false
    }
  }, [camera, defaultCam, defaultTarget])

  useEffect(() => {
    if (exitSignal > lastExitRef.current) {
      lastExitRef.current = exitSignal
      beginFlyOut()
    }
  }, [exitSignal, beginFlyOut])

  useFrame((_, delta) => {
    const ctl = controlsRef.current
    if (!ctl) return

    if (phaseRef.current === 'fly_in') {
      flyTRef.current += delta / flyDur
      const t = Math.min(1, flyTRef.current)
      const e = smoothstep(t)
      camera.position.lerpVectors(startCam.current, endCam.current, e)
      ctl.target.lerpVectors(startTarget.current, endTarget.current, e)
      ctl.update()
      if (t >= 1) {
        phaseRef.current = 'orbit'
      }
      return
    }

    if (phaseRef.current === 'orbit') {
      const key = targetKeyRef.current
      const ix = PLANET_KEYS.indexOf(key)
      const mesh = ix >= 0 ? planetMeshRefs.current[ix] : null
      if (!mesh) {
        phaseRef.current = 'idle'
        return
      }
      mesh.updateWorldMatrix(true, true)
      mesh.getWorldPosition(planetCenter.current)

      if (!announcedRef.current) {
        announcedRef.current = true
        onOrbitLock?.(key)
      }

      orbitAngleRef.current += delta * 0.22
      const R = orbitRadiusRef.current
      matRot.current.makeRotationY(orbitAngleRef.current)
      offset.current.set(R, planetCenter.current.y * 0.06 + 1.15, 0)
      offset.current.applyMatrix4(matRot.current)

      tmp.current.copy(planetCenter.current).add(offset.current)
      camera.position.lerp(tmp.current, 0.11)
      ctl.target.copy(planetCenter.current)
      ctl.update()
      return
    }

    if (phaseRef.current === 'fly_out') {
      flyTRef.current += delta / flyDur
      const t = Math.min(1, flyTRef.current)
      const e = smoothstep(t)
      camera.position.lerpVectors(startCam.current, endCam.current, e)
      ctl.target.lerpVectors(startTarget.current, endTarget.current, e)
      ctl.update()
      if (t >= 1) {
        phaseRef.current = 'idle'
        setNavLocked(false)
        ctl.enableRotate = true
        ctl.enablePan = true
        ctl.enableZoom = true
      }
    }
  }, 1)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const ctl = controlsRef.current
      if (!ctl) return
      ctl.target.copy(defaultTarget)
      ctl.update()
    })
    return () => cancelAnimationFrame(id)
  }, [defaultTarget])

  return (
    <>
      <ScrollSyncedSceneGroup>
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
        {planets.map((p, i) => (
          <ClickableOrbitingPlanet
            key={p.key}
            planetKey={p.key}
            planetIndex={i}
            map={p.map}
            orbitRadius={p.orbitRadius}
            angularSpeed={p.angularSpeed}
            radius={p.radius}
            selfSpinSpeed={p.selfSpinSpeed}
            geometry={geometry}
            planetMeshRefs={planetMeshRefs}
            onPlanetPointerDown={beginFlyTo}
            navLocked={navLocked}
          />
        ))}
      </ScrollSyncedSceneGroup>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.04}
        minDistance={18}
        maxDistance={140}
        enablePan
        zoomSpeed={0.85}
        rotateSpeed={0.35}
        maxPolarAngle={Math.PI * 0.495}
        minPolarAngle={Math.PI * 0.08}
      />
    </>
  )
}

export default function Background3D({
  onTexturesReady,
  onOrbitLock,
  exitSignal,
  interactionOnTop = false,
  eggSolarLightingBoost = false,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: interactionOnTop ? 72 : 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 34, 82], fov: 52 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ raycaster }) => {
          if (raycaster.params.Points) {
            raycaster.params.Points.threshold = 0.01
          }
        }}
        style={{ width: '100%', height: '100%', touchAction: 'none', pointerEvents: 'auto' }}
      >
        <DynamicSceneLights eggBoost={eggSolarLightingBoost} />

        <Suspense fallback={null}>
          <PlanetScene onTexturesReady={onTexturesReady} onOrbitLock={onOrbitLock} exitSignal={exitSignal} />
        </Suspense>
        <StarField count={6500} />

        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom intensity={0.72} luminanceThreshold={0.12} mipmapBlur radius={0.72} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.28} darkness={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
