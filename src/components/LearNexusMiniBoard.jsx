import { useMemo, useId, useState } from 'react'

const COLLEGE_POSTS = [
  {
    id: 'c1',
    author: 'CS Club · IIITA',
    badge: 'Campus',
    title: 'Hackathon build slots released — Nexus syncs with academic calendar',
    meta: 'Visible to enrolled students & faculty',
  },
  {
    id: 'c2',
    author: 'Timetable service',
    badge: 'Internal',
    title: 'Section B lab rotation updated; board emits versioned diff only',
    meta: 'Isolated college graph · audit trail on',
  },
  {
    id: 'c3',
    author: 'Placement cell',
    badge: 'Restricted',
    title: 'Mock interview queue: role-aware slots without leaking cohort data',
    meta: 'Scoped to program + year',
  },
]

const GLOBAL_POSTS = [
  {
    id: 'g1',
    author: '@open_dev',
    badge: 'Public',
    title: 'Shipping feature flags with optimistic UI — patterns from production OSS',
    meta: 'Global discovery · rank by engagement',
  },
  {
    id: 'g2',
    author: '@campus_bridge',
    badge: 'Public',
    title: 'Cross-institution mentor office hours — public posts, DM opt-in',
    meta: 'Public graph · moderation queue',
  },
  {
    id: 'g3',
    author: '@learn_nexus',
    badge: 'Verified',
    title: 'LearNexus changelog: public posts API frozen at v2 contract',
    meta: 'Feed projection = denormalized read model',
  },
]

export default function LearNexusMiniBoard() {
  const [scope, setScope] = useState('college')
  const posts = useMemo(() => (scope === 'college' ? COLLEGE_POSTS : GLOBAL_POSTS), [scope])
  const headingId = useId()

  return (
    <div className="ln-mini-board interactive" aria-labelledby={headingId}>
      <div className="ln-mini-board__head">
        <div className="ln-mini-board__titles">
          <h4 id={headingId} className="ln-mini-board__title">
            Nexus board · live scope
          </h4>
          <p className="ln-mini-board__hint">
            Toggle feed projection: isolated college environment vs global public posts (mock data).
          </p>
        </div>

        <div className="ln-mini-board__toggle" role="group" aria-label="Feed scope">
          <button
            type="button"
            className={`ln-mini-board__segment interactive ${scope === 'college' ? 'ln-mini-board__segment--on' : ''}`}
            aria-pressed={scope === 'college'}
            onClick={() => setScope('college')}
          >
            Isolated college
          </button>
          <button
            type="button"
            className={`ln-mini-board__segment interactive ${scope === 'global' ? 'ln-mini-board__segment--on' : ''}`}
            aria-pressed={scope === 'global'}
            onClick={() => setScope('global')}
          >
            Global public
          </button>
        </div>
      </div>

      <div className="ln-mini-board__viewport">
        <div className="ln-mini-board__rail" aria-hidden />
        <ul key={scope} className="ln-mini-board__list">
          {posts.map((p) => (
            <li key={p.id} className="ln-mini-board__card">
              <div className="ln-mini-board__card-top">
                <span className="ln-mini-board__author">{p.author}</span>
                <span className="ln-mini-board__badge" data-tone={scope}>
                  {p.badge}
                </span>
              </div>
              <p className="ln-mini-board__card-title">{p.title}</p>
              <p className="ln-mini-board__card-meta">{p.meta}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="ln-mini-board__footer font-mono" aria-hidden="false">
        State: <strong className="ln-mini-board__state-key">{scope === 'college' ? 'COLLEGE_SCOPE' : 'GLOBAL_PUBLIC'}</strong>
        {' · '}
        {scope === 'college'
          ? 'UI reads from isolated projection + campus ACL'
          : 'UI reads from public projection + global ranker'}
      </p>
    </div>
  )
}
