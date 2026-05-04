import { createContext, useContext, useRef, useCallback, useEffect, useMemo, useState } from 'react'

const SpaceAmbientContext = createContext(null)

const AUDIO_SRC = '/audio/space_drone.wav'

export function SpaceAmbientProvider({ children }) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.loop = true
    el.volume = 0.32
    el.muted = true
    el.setAttribute('playsinline', '')
    const playWhenReady = () => {
      el.play().catch(() => {})
    }
    playWhenReady()
    el.addEventListener('canplaythrough', playWhenReady, { once: true })
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.muted = muted
    if (!muted) {
      const p = el.play()
      if (p !== undefined) p.catch(() => {})
    }
  }, [muted])

  const toggleMuted = useCallback(() => {
    setMuted((m) => !m)
  }, [])

  const value = useMemo(
    () => ({ muted, toggleMuted }),
    [muted, toggleMuted],
  )

  return (
    <SpaceAmbientContext.Provider value={value}>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" hidden aria-hidden />
      {children}
    </SpaceAmbientContext.Provider>
  )
}

export function useSpaceAmbient() {
  const ctx = useContext(SpaceAmbientContext)
  if (!ctx) throw new Error('useSpaceAmbient must be used within SpaceAmbientProvider')
  return ctx
}
