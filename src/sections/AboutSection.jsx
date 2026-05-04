import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const skills = [
  { name: 'React', x: 0, y: 2.5 },
  { name: 'Node.js', x: 3.2, y: 0.8 },
  { name: 'MongoDB', x: -2.8, y: -1.8 },
  { name: 'Express', x: 1.8, y: -2.2 },
  { name: 'C++', x: -3.2, y: 1.8 },
  { name: 'Python', x: 2.8, y: 2.8 },
  { name: 'JavaScript', x: -1.2, y: 3.2 },
  { name: 'TypeScript', x: 4, y: -1.2 },
  { name: 'Git', x: -4, y: 0 },
  { name: 'Docker', x: 0, y: -3.2 },
  { name: 'JWT', x: 3.8, y: 3 },
  { name: 'REST APIs', x: -3.5, y: -3 },
  { name: 'WebSockets', x: -1.5, y: 0.5 },
  { name: 'TailwindCSS', x: 2.2, y: -3.5 },
  { name: 'React Native', x: -2, y: 3.5 },
]

const edges = [
  [0, 1], [0, 6], [1, 3], [1, 7], [2, 3], [2, 11],
  [4, 8], [5, 7], [6, 0], [6, 14], [7, 13], [8, 4],
  [9, 2], [10, 1], [11, 9], [12, 1], [13, 0], [14, 6],
]

function SkillNode({ name, baseX, baseY }) {
  const ref = useRef()
  const [hovered, setHovered] = React.useState(false)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.x = baseX + Math.sin(t * 0.5 + baseX) * 0.25
    ref.current.position.y = baseY + Math.cos(t * 0.4 + baseY) * 0.25
  })

  return (
    <group ref={ref} position={[baseX, baseY, 0]}
      onPointerOver={() => {
        setHovered(true)
        if (!document.documentElement.classList.contains('cursor-enabled')) {
          document.body.style.cursor = 'crosshair'
        }
      }}
      onPointerOut={() => {
        setHovered(false)
        if (!document.documentElement.classList.contains('cursor-enabled')) {
          document.body.style.cursor = 'auto'
        }
      }}
    >
      <mesh scale={hovered ? 1.8 : 1.1}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={hovered ? '#7b2cbf' : '#00e5ff'} toneMapped={false} />
      </mesh>
      {/* Glow ring */}
      <mesh scale={hovered ? 2.8 : 1.5}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color={hovered ? '#7b2cbf' : '#00e5ff'} transparent opacity={hovered ? 0.6 : 0.15} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.24} color={hovered ? '#ffffff' : 'rgba(255,255,255,0.5)'}
        anchorX="center" anchorY="top" outlineWidth={hovered ? 0.02 : 0} outlineColor="#7b2cbf"
      >
        {name}
      </Text>
    </group>
  )
}

function SkillEdge({ from, to, skills: sk }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const f = sk[from], tgt = sk[to]
    const fx = f.x + Math.sin(t * 0.5 + f.x) * 0.25
    const fy = f.y + Math.cos(t * 0.4 + f.y) * 0.25
    const tx = tgt.x + Math.sin(t * 0.5 + tgt.x) * 0.25
    const ty = tgt.y + Math.cos(t * 0.4 + tgt.y) * 0.25
    ref.current.geometry.setFromPoints([new THREE.Vector3(fx, fy, 0), new THREE.Vector3(tx, ty, 0)])
  })
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </line>
  )
}

function SkillConstellation() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ alpha: true, antialias: true }} style={{ width: '100%', height: '100%' }}>
      {edges.map(([f, t], i) => <SkillEdge key={i} from={f} to={t} skills={skills} />)}
      {skills.map((s, i) => <SkillNode key={i} name={s.name} baseX={s.x} baseY={s.y} />)}
    </Canvas>
  )
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
}

export default function AboutSection() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="section-padding relative" style={{ zIndex: 1 }} ref={ref}>
      <div className="content-max">
        
        <div className="flex flex-col xl:flex-row gap-20 items-center">
          {/* Left — Text */}
          <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="xl:w-1/2">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[1px] bg-[var(--color-accent)] block"></span>
              <span className="font-mono text-[0.68rem] tracking-[0.22em] text-[var(--color-accent)]">
                01 — IDENTIFIER
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="font-bebas text-stroke hover:text-white transition-all duration-500" style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', lineHeight: 0.85 }}>
              WHO I AM
            </motion.h2>
            
            <div className="section-divider mt-8 mb-10" />
            
            <motion.div variants={fadeUp} className="glass-card p-8 sm:p-10 space-y-6 font-dm" style={{ color: 'var(--color-text-muted)', fontWeight: 400, lineHeight: 1.85, fontSize: '1.02rem' }}>
              <p>
                I'm a B.Tech Information Technology student at <span className="text-white font-medium">IIIT Allahabad</span> with a CGPA of <span className="text-[var(--color-accent)] font-mono">9.40</span>.
                I engineer immersive digital experiences that blur the line between highly performant full-stack applications and interactive art.
              </p>
              <p>
                Specializing in the modern ecosystem (<span className="text-white">React, Node.js, Three.js</span>), I possess a robust competitive programming background (Codeforces Expert, 1847 on LeetCode),
                allowing me to optimize complex 3D logic and backend architectures with rigorous efficiency.
              </p>
              <p>
                Selected for the <span style={{ color: 'var(--color-accent-secondary)', fontWeight: 500 }}>Sakura Science Program (Japan)</span> and
                the <span style={{ color: 'var(--color-accent-secondary)', fontWeight: 500 }}>INSPIRE Award MANAK (Top 60 in India)</span>,
                I bring a global perspective and relentless curiosity to every project I touch.
              </p>
            </motion.div>
          </motion.div>

          {/* Right — Skill Constellation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="xl:w-1/2 w-full h-[500px] xl:h-[700px] glass-card flex items-center justify-center relative overflow-hidden"
          >
            {/* Background glow for constellation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
            <SkillConstellation />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
