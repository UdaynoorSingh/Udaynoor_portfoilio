import { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Background3D from './Background3D'
import Navbar from './Navbar'
import PlanetNavOverlay from './PlanetNavOverlay'
import SceneLoadOverlay from './SceneLoadOverlay'
import RecruiterTerminalEgg from './RecruiterTerminalEgg'
import { SpaceAmbientProvider } from '../context/SpaceAmbientContext'
import CursorFX from './CursorFX'
import SectionThemeController from './SectionThemeController'
import { AudioFX } from '../utils/AudioFX'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = lazy(() => import('../sections/HeroSection'))
const AboutSection = lazy(() => import('../sections/AboutSection'))
const TechMarqueeSection = lazy(() => import('../sections/TechMarqueeSection'))
const ExperienceSection = lazy(() => import('../sections/ExperienceSection'))
const LearNexusFeaturedSection = lazy(() => import('../sections/LearNexusFeaturedSection'))
const ProjectsSection = lazy(() => import('../sections/ProjectsSection'))
const RatingsSection = lazy(() => import('../sections/RatingsSection'))
const AchievementsSection = lazy(() => import('../sections/AchievementsSection'))
const ContactSection = lazy(() => import('../sections/ContactSection'))

const SectionLoader = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="font-mono" style={{ color: 'rgba(200,216,240,0.2)', fontSize: '0.7rem', letterSpacing: '4px' }}>
      ···
    </span>
  </div>
)

export default function Portfolio() {
  const [sceneTexturesReady, setSceneTexturesReady] = useState(false)
  const onSceneTexturesReady = useCallback(() => {
    setSceneTexturesReady(true)
  }, [])

  const [orbitPlanetKey, setOrbitPlanetKey] = useState(null)
  const [planetExitSignal, setPlanetExitSignal] = useState(0)

  const handleOrbitLock = useCallback((key) => {
    setOrbitPlanetKey(key)
  }, [])

  const handlePlanetNavExit = useCallback(() => {
    setOrbitPlanetKey(null)
    setPlanetExitSignal((n) => n + 1)
  }, [])

  const handlePlanetScrollToSection = useCallback((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOrbitPlanetKey(null)
    setPlanetExitSignal((n) => n + 1)
  }, [])

  /** Full-screen 3D sits above <main> so canvas receives pointer events (planets are clickable). */
  const [solarNavigatorOpen, setSolarNavigatorOpen] = useState(false)

  const [recruiterEggSolved, setRecruiterEggSolved] = useState(false)

  useEffect(() => {
    if (!solarNavigatorOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [solarNavigatorOpen])

  const audioInitialized = useRef(false)

  useEffect(() => {
    fetch('/api/bootstrap/', { credentials: 'same-origin' }).catch(() => {})
  }, [])

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutQuart
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    // Setup Global Audio Events
    const handleFirstInteraction = () => {
      if (!audioInitialized.current) {
        AudioFX.init()
        audioInitialized.current = true
      }
    }
    
    const handleMouseOver = (e) => {
      if (e.target.closest('.interactive, a, button')) {
        AudioFX.playHover()
      }
    }

    const handleClick = (e) => {
      handleFirstInteraction()
      if (e.target.closest('.interactive, a, button')) {
        AudioFX.playClick()
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      ScrollTrigger.getAll().forEach(t => t.kill())
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  return (
    <SpaceAmbientProvider>
      <SceneLoadOverlay ready={sceneTexturesReady} />
      <Background3D
        onTexturesReady={onSceneTexturesReady}
        onOrbitLock={handleOrbitLock}
        exitSignal={planetExitSignal}
        interactionOnTop={solarNavigatorOpen}
        eggSolarLightingBoost={recruiterEggSolved}
      />
      <CursorFX />
      <SectionThemeController />
      <Navbar usePlanetMatrixNav />
      <PlanetNavOverlay
        planetKey={orbitPlanetKey}
        onExit={handlePlanetNavExit}
        onScrollToSection={handlePlanetScrollToSection}
      />

      <RecruiterTerminalEgg onSolved={() => setRecruiterEggSolved(true)} />

      {!solarNavigatorOpen && (
        <button
          type="button"
          onClick={() => setSolarNavigatorOpen(true)}
          className="interactive fixed bottom-6 right-6 z-[60] max-w-[min(92vw,280px)] rounded border border-white/20 bg-[rgba(4,8,22,0.88)] px-4 py-3 text-left font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-[var(--color-accent)]/45 hover:text-[var(--color-accent)]"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
          aria-label="Open solar system view to navigate by planet"
        >
          <span className="block text-[0.5rem] tracking-[0.28em] text-white/50">NAV</span>
          Solar map
        </button>
      )}

      {solarNavigatorOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex max-w-[min(96vw,520px)] flex-col items-center gap-2 px-3">
            <p className="text-center font-mono text-[0.55rem] tracking-[0.2em] text-white/45">
              Drag to orbit · click a planet
            </p>
            <button
              type="button"
              onClick={() => setSolarNavigatorOpen(false)}
              className="interactive pointer-events-auto rounded border border-white/25 bg-[rgba(4,8,22,0.92)] px-5 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/90 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
            >
              Exit solar view
            </button>
          </div>
        </div>
      )}

      <motion.main
        data-portfolio-shell
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Suspense fallback={<SectionLoader />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TechMarqueeSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ExperienceSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LearNexusFeaturedSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ProjectsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <RatingsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <AchievementsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ContactSection />
        </Suspense>
      </motion.main>
    </SpaceAmbientProvider>
  )
}
