import { useEffect, useState } from 'react'

export default function SceneLoadOverlay({ ready }) {
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    if (ready) setPhase('exiting')
  }, [ready])

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'opacity') return
    if (phase === 'exiting') setPhase('done')
  }

  if (phase === 'done') return null

  return (
    <div
      className={`scene-load-overlay ${phase === 'exiting' ? 'scene-load-overlay--exit' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      aria-live="polite"
      aria-busy={phase !== 'done'}
    >
      <div className="scene-load-overlay__inner">
        <div className="scene-load-overlay__halo">
          <div className="scene-load-overlay__orbit" aria-hidden />
          <span className="scene-load-overlay__planet" aria-hidden />
        </div>
        <p className="scene-load-overlay__label font-mono">LOADING SECTOR</p>
      </div>
    </div>
  )
}
