import { useState, useCallback, Suspense, lazy } from 'react'
import IntroSequence from './intro/IntroSequence'

const Portfolio = lazy(() => import('./components/Portfolio'))

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  return (
    <>
      {!introComplete && (
        <IntroSequence onComplete={handleIntroComplete} />
      )}
      {introComplete && (
        <Suspense fallback={
          <div style={{
            position: 'fixed', inset: 0,
            background: '#00000a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Mono', monospace",
            color: '#c8d8f0', fontSize: '0.8rem', letterSpacing: '4px'
          }}>
            LOADING...
          </div>
        }>
          <Portfolio />
        </Suspense>
      )}
    </>
  )
}
