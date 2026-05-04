import { useCallback, useEffect, useId, useRef, useState } from 'react'

/** Puzzle: indices i with 0 < i < n-1 where arr[i] > max(prefix) && arr[i] < min(suffix). */
const PUZZLE_ARRAY = [2, 7, 8, 10]
const EXPECTED_COUNT = computePrefixSuffixValidCount(PUZZLE_ARRAY)

function computePrefixSuffixValidCount(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return 0
  let count = 0
  for (let i = 1; i < arr.length - 1; i++) {
    let prefixMax = arr[0]
    for (let j = 1; j < i; j++) if (arr[j] > prefixMax) prefixMax = arr[j]
    let suffixMin = arr[i + 1]
    for (let j = i + 2; j < arr.length; j++) if (arr[j] < suffixMin) suffixMin = arr[j]
    if (arr[i] > prefixMax && arr[i] < suffixMin) count++
  }
  return count
}

function parseAnswer(raw) {
  const s = String(raw ?? '').trim()
  if (!s.length) return NaN
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : NaN
}

export default function RecruiterTerminalEgg({ onSolved }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [solved, setSolved] = useState(false)
  const inputRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const t = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const submit = useCallback(() => {
    if (solved) return
    const n = parseAnswer(input)
    if (Number.isNaN(n)) {
      setStatus('bad')
      return
    }
    if (n === EXPECTED_COUNT) {
      setStatus('ok')
      setSolved(true)
      onSolved?.()
    } else {
      setStatus('bad')
    }
  }, [input, onSolved, solved])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <>
      <button
        type="button"
        className="egg-terminal-trigger interactive"
        onClick={() => setOpen(true)}
        aria-label="Open recruiter terminal puzzle"
        aria-expanded={open}
        aria-controls={panelId}
        title=""
      >
        <span className="egg-terminal-trigger__glow" aria-hidden />
        <svg
          className="egg-terminal-trigger__svg"
          viewBox="0 0 32 32"
          width="22"
          height="22"
          aria-hidden
        >
          <rect x="4" y="5" width="24" height="19" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 10h8M7 14h5M7 18h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="4" y="24" width="24" height="3" rx="0.5" fill="currentColor" opacity="0.35" />
        </svg>
      </button>

      {open && (
        <div
          className="egg-terminal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          id={panelId}
          className={`egg-terminal-panel ${status === 'ok' ? 'egg-terminal-panel--success' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${panelId}-title`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="egg-terminal-panel__chrome">
            <span className="egg-terminal-panel__dots" aria-hidden>
              <i /> <i /> <i />
            </span>
            <span id={`${panelId}-title`} className="egg-terminal-panel__title font-mono">
              recruiter@portfolio:~
            </span>
            <button
              type="button"
              className="egg-terminal-panel__close interactive font-mono"
              onClick={() => setOpen(false)}
              aria-label="Close terminal"
            >
              ×
            </button>
          </div>

          <div className="egg-terminal-panel__body font-mono">
            <p className="egg-terminal-panel__line egg-terminal-panel__line--accent">
              {'// Easter egg — prefix / suffix maximums'}
            </p>
            <p className="egg-terminal-panel__line">
              Array: [{PUZZLE_ARRAY.join(', ')}]
            </p>
            <p className="egg-terminal-panel__line">
              Count indices i where 0 &lt; i &lt; n−1 and:
            </p>
            <p className="egg-terminal-panel__line egg-terminal-panel__line--indent">
              arr[i] &gt; max(arr[0..i−1]) <span className="egg-terminal-dim"> AND </span>
              arr[i] &lt; min(arr[i+1..n−1])
            </p>
            <p className="egg-terminal-panel__line egg-terminal-panel__prompt">
              <span className="egg-terminal-prompt">{'> '}</span>
              Enter count (integer):
            </p>

            <div className="egg-terminal-input-row">
              <span className="egg-terminal-prompt" aria-hidden>
                {'> '}
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="egg-terminal-input interactive"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (status !== 'idle') setStatus('idle')
                }}
                onKeyDown={handleKeyDown}
                disabled={solved}
                aria-label="Your answer"
              />
              <button
                type="button"
                className="egg-terminal-submit interactive font-mono"
                onClick={submit}
                disabled={solved}
              >
                run
              </button>
            </div>

            {status === 'bad' && (
              <p className="egg-terminal-msg egg-terminal-msg--err" role="status">
                Wrong answer — try again.
              </p>
            )}

            {solved && (
              <div className="egg-terminal-success-block">
                <p className="egg-terminal-msg egg-terminal-msg--ok" role="status">
                  Access granted. Lighting adjusted; resume unlocked below.
                </p>
                <a
                  href="/resume.pdf"
                  download
                  className="egg-terminal-resume interactive font-mono"
                >
                  Download resume (resume.pdf)
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
