import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

const mercuryVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;

  // Simple noise
  float noise(vec3 p) {
    return sin(p.x * 2.0 + uTime) * cos(p.y * 2.0 + uTime * 0.7) * sin(p.z * 2.0 + uTime * 0.3);
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    pos += normal * noise(position * 0.5) * 0.15;
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const mercuryFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    vec3 silver = vec3(0.9, 0.9, 1.0);
    vec3 deepViolet = vec3(0.48, 0.17, 0.75); // #7b2cbf
    vec3 electricCyan = vec3(0.0, 0.9, 1.0);  // #00e5ff

    float t = sin(uTime * 0.3 + vUv.x * 3.0) * 0.5 + 0.5;
    vec3 baseColor = mix(silver, mix(deepViolet, electricCyan, t), fresnel);

    float rim = fresnel * 0.8;
    vec3 finalColor = baseColor + rim * electricCyan * 0.5;

    gl_FragColor = vec4(finalColor, 0.95);
  }
`

function MercuryKnot() {
  const ref = useRef()
  const groupRef = useRef()
  const matRef = useRef()
  const mouseTarget = useRef({ x: 0, y: 0 })

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useEffect(() => {
    const handler = (e) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 0.3
      mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.3
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) matRef.current.uniforms.uTime.value = t
    if (ref.current) {
      ref.current.rotation.y = t * 0.28
      ref.current.rotation.x = Math.sin(t * 0.1) * 0.1
    }
    if (groupRef.current) {
      groupRef.current.rotation.x += (mouseTarget.current.y - groupRef.current.rotation.x) * 0.02
      groupRef.current.rotation.y += (mouseTarget.current.x - groupRef.current.rotation.y) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[2.5, 0.8, 200, 32]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={mercuryVertexShader}
          fragmentShader={mercuryFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      {/* Orbiting spheres */}
      {[0, 1, 2].map((i) => (
        <OrbitingSphere key={i} index={i} />
      ))}
    </group>
  )
}

function OrbitingSphere({ index }) {
  const ref = useRef()
  const offset = (index / 3) * Math.PI * 2
  const colors = ['#7b2cbf', '#00e5ff', '#ffffff']

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * (0.3 + index * 0.1) + offset
    const rx = 4.5 + index * 0.8
    const ry = 3 + index * 0.5
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t) * rx,
        Math.sin(t * 1.3) * ry * 0.4,
        Math.sin(t) * ry
      )
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2 + index * 0.05, 16, 16]} />
      <meshBasicMaterial color={colors[index]} toneMapped={false} />
    </mesh>
  )
}

const HeroMercury = function HeroMercury() {
  return (
    <Canvas
      camera={{ position: [0, 0, 16], fov: 45 }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
      style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="var(--color-accent)" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="var(--color-accent-secondary)" />
      <MercuryKnot />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.35} darkness={0.35} />
      </EffectComposer>
    </Canvas>
  )
}

export default HeroMercury
