import { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Background3D from './Background3D'
import Navbar from './Navbar'
import SceneLoadOverlay from './SceneLoadOverlay'
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
      <Background3D onTexturesReady={onSceneTexturesReady} />
      <CursorFX />
      <SectionThemeController />
      <Navbar />
      <motion.main
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
