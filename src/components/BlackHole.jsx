import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

const RAYMARCH_VERT = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const RAYMARCH_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uBHOrigin;

  varying vec3 vWorldPosition;

  float hash11(float n) { return fract(sin(n) * 43758.5453123); }

  float noise3(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise31(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(
      mix(mix(hash11(n + 0.0), hash11(n + 1.0), f.x), mix(hash11(n + 57.0), hash11(n + 58.0), f.x), f.y),
      mix(mix(hash11(n + 113.0), hash11(n + 114.0), f.x), mix(hash11(n + 170.0), hash11(n + 171.0), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.52;
    mat3 m = mat3(0.8, 0.6, 0.0, -0.6, 0.8, 0.0, 0.0, 0.0, 1.0);
    for (int i = 0; i < 4; i++) {
      v += a * noise31(p);
      p = m * p * 2.05;
      a *= 0.5;
    }
    return v;
  }

  float stars(vec3 rd) {
    vec3 q = rd * 380.0;
    vec3 id = floor(q);
    vec3 fr = fract(q) - 0.5;
    float h = hash11(dot(id, vec3(12.9898, 78.233, 45.164)));
    float s = smoothstep(0.72, 0.0, length(fr));
    return step(0.985, h) * s * 0.55;
  }

  float sampleDiskLayer(vec3 p, float thickScale) {
    float r = length(p.xz);
    float h = p.y;
    float thick = 0.16 * thickScale;
    float layer = exp(-(h * h) / (thick * thick));
    if (r < 0.42 || r > 9.4) return 0.0;

    float ang = atan(p.z, p.x);
    float flow = fbm(vec3(p.xz * 0.45, ang * 0.25 + uTime * 0.12));
    float streaks =
      sin(ang * 28.0 + r * 10.0 - uTime * 2.2) * 0.5 +
      sin(ang * 11.0 - r * 6.0 + uTime * 0.9) * 0.35;
    streaks = streaks * 0.5 + 0.5;

    float ring = smoothstep(0.42, 0.58, r) * (1.0 - smoothstep(8.6, 9.5, r));
    float wisps = mix(0.55, 1.15, flow) * (0.55 + 0.45 * streaks);

    return layer * ring * wisps;
  }

  vec3 diskColor(float r, float dens) {
    float t = clamp((r - 0.42) / 8.6, 0.0, 1.0);
    vec3 inner = vec3(1.0, 0.99, 0.94);
    vec3 cream = vec3(1.0, 0.92, 0.72);
    vec3 gold = vec3(1.0, 0.72, 0.28);
    vec3 amber = vec3(0.78, 0.38, 0.06);
    vec3 brown = vec3(0.18, 0.07, 0.02);

    vec3 c = mix(inner, cream, smoothstep(0.0, 0.12, t));
    c = mix(c, gold, smoothstep(0.06, 0.32, t));
    c = mix(c, amber, smoothstep(0.22, 0.58, t));
    c = mix(c, brown, smoothstep(0.45, 1.0, t));

    float innerHot = exp(-t * 9.0) * 2.4 * dens;
    c += vec3(1.0, 0.98, 0.9) * innerHot;
    return c * dens;
  }

  void main() {
    vec3 ro = uCamPos;
    vec3 rd = normalize(vWorldPosition - uCamPos);
    float tMax = length(vWorldPosition - uCamPos) - 0.02;

    vec3 col = vec3(0.002, 0.002, 0.004);
    float trans = 1.0;

    vec3 p = ro - uBHOrigin;
    vec3 rdir = rd;
    float travelled = 0.05;
    float dt = 0.14;

    for (int i = 0; i < 88; i++) {
      if (travelled > tMax || trans < 0.04) break;

      float r = length(p);
      if (r < 0.38) {
        col = mix(col, vec3(0.0), trans * 0.98);
        trans = 0.0;
        break;
      }

      float pr = length(p.xz);
      if (pr > 0.43 && pr < 0.54 && abs(p.y) < 0.095) {
        float ringM = smoothstep(0.43, 0.48, pr) * (1.0 - smoothstep(0.49, 0.54, pr));
        float thin = 1.0 - abs(p.y) / 0.095;
        vec3 phCol = vec3(1.0, 0.94, 0.82) * ringM * thin * 1.8;
        col += trans * phCol * 0.42;
      }

      float d1 = sampleDiskLayer(p, 1.0);
      float d2 = sampleDiskLayer(p * vec3(1.02, 0.85, 1.02), 0.75) * 0.45;
      float dens = d1 + d2;

      if (dens > 0.004) {
        float rr = length(p.xz);
        vec3 dc = diskColor(rr, clamp(dens, 0.0, 2.5));
        float a = clamp(dens * 0.38, 0.0, 0.72);
        col += trans * dc * a;
        trans *= max(0.12, 1.0 - a * 0.35);
      }

      vec3 g = (-p) * (0.46 / (dot(p, p) + 0.1));
      rdir = normalize(rdir + g * dt);
      p += rdir * dt;
      travelled += dt;
    }

    col += stars(rd) * (0.35 + 0.65 * trans);

    gl_FragColor = vec4(col, 1.0);
  }
`

function RaymarchShell() {
  const meshRef = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
      uBHOrigin: { value: new THREE.Vector3(0, -0.35, 0) },
    }),
    [],
  )

  useFrame((s) => {
    if (!meshRef.current) return
    const m = meshRef.current
    m.material.uniforms.uTime.value = s.clock.elapsedTime
    m.material.uniforms.uCamPos.value.copy(s.camera.position)
    m.getWorldPosition(m.material.uniforms.uBHOrigin.value)
  })

  return (
    <mesh ref={meshRef} position={[0, -0.35, 0]} renderOrder={-2}>
      <sphereGeometry args={[55, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={RAYMARCH_VERT}
        fragmentShader={RAYMARCH_FRAG}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest
      />
    </mesh>
  )
}

function ParallaxGroup({ children }) {
  const ref = useRef()
  useFrame((s) => {
    if (!ref.current) return
    const px = s.pointer.x * 0.14
    const py = s.pointer.y * 0.1
    ref.current.rotation.y += (px - ref.current.rotation.y) * 0.035
    ref.current.rotation.x += (py * 0.28 - ref.current.rotation.x) * 0.035
  })
  return <group ref={ref}>{children}</group>
}

export default function BlackHole() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-black">
      <Canvas
        camera={{ position: [0, 1.25, 11.2], fov: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <ParallaxGroup>
          <RaymarchShell />
        </ParallaxGroup>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.82}
            intensity={1.55}
            mipmapBlur
            radius={0.62}
          />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
          <Noise opacity={0.028} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
