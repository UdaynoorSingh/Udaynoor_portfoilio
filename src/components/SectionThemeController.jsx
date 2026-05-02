import { useEffect } from 'react'

const SECTION_THEME = [
  { id: 'hero', accent: '#d4a843', glow: '#00cfff' },
  { id: 'about', accent: '#00cfff', glow: '#c8d8f0' },
  { id: 'experience', accent: '#d4a843', glow: '#00cfff' },
  { id: 'projects', accent: '#00cfff', glow: '#d4a843' },
  { id: 'ratings', accent: '#c8d8f0', glow: '#00cfff' },
  { id: 'achievements', accent: '#d4a843', glow: '#c8d8f0' },
  { id: 'contact', accent: '#00cfff', glow: '#d4a843' },
]

export default function SectionThemeController() {
  useEffect(() => {
    const root = document.documentElement

    const apply = (accent, glow) => {
      root.style.setProperty('--color-accent', accent)
      root.style.setProperty('--color-glow', glow)
    }

    const initial = SECTION_THEME[0]
    apply(initial.accent, initial.glow)

    const targets = SECTION_THEME
      .map((t) => ({ ...t, el: document.getElementById(t.id) }))
      .filter((t) => t.el)

    if (targets.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]

        if (!visible) return
        const found = targets.find((t) => t.el === visible.target)
        if (!found) return
        apply(found.accent, found.glow)
      },
      {
        root: null,
        threshold: [0.25, 0.4, 0.55],
        rootMargin: '-30% 0px -50% 0px',
      }
    )

    targets.forEach((t) => io.observe(t.el))
    return () => io.disconnect()
  }, [])

  return null
}

