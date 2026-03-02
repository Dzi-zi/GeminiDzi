import { useState } from 'react'

// ── Studio District Identity — Artist's Atelier ───────────────────────────────
// Concept: A warm creative studio at golden hour. Heavy cream paper, pinned
// work, handwritten notes, a shelf of well-read books.
//
// Background: #FAF6EF — warm heavy paper / cream
// Cards:      #FFFFFF — bright card stock
// Dark accent: #1E1408 — deep warm ink
// Gold:        #B8882A — aged gold, like a gilded book spine
// Text:        #2A1800 — warm near-black
// Muted:       #7A6050 — aged ink, slightly faded
// Font:        Playfair Display — editorial serif, confident and human
// Body:        DM Sans — clean contrast to the serif
// Detail:      DM Mono — typewriter-stamp detail text

const C = {
  bg:          '#FAF6EF',
  bgAlt:       '#F2EBE0',
  surface:     '#FFFFFF',
  ink:         '#1E1408',
  gold:        '#B8882A',
  goldSoft:    'rgba(184,136,42,0.12)',
  rose:        '#C2185B',
  green:       '#3A6B44',
  purple:      '#6B4FA0',
  teal:        '#2A7B7B',
  text:        '#2A1800',
  muted:       '#7A6050',
  faint:       'rgba(42,24,0,0.28)',
  border:      '#E0D4C0',
  borderSoft:  '#EDE5D8',
}

const STATUS = {
  live:    { color: '#3A6B44', label: 'Live'     },
  ongoing: { color: '#B8882A', label: 'Ongoing'  },
  private: { color: '#6B4FA0', label: 'Private'  },
  done:    { color: '#2A7B7B', label: 'Complete' },
}

const R = { sm: '2px', md: '6px', lg: '12px' }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const T = {
  label:  { fontFamily: '"DM Sans", sans-serif',     fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em',  textTransform: 'uppercase' },
  h1:     { fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.0 },
  h2:     { fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)',   fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 },
  h3:     { fontFamily: '"Playfair Display", serif', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 },
  body:   { fontFamily: '"DM Sans", sans-serif',     fontSize: '0.9rem',  fontWeight: 400, lineHeight: 1.72 },
  small:  { fontFamily: '"DM Sans", sans-serif',     fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:   { fontFamily: '"DM Sans", sans-serif',     fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em' },
  mono:   { fontFamily: '"DM Mono", monospace',      fontSize: '0.62rem', fontWeight: 400, letterSpacing: '0.05em' },
  quote:  { fontFamily: '"Playfair Display", serif', fontSize: '0.88rem', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.7 },
}

// ── Disciplines ───────────────────────────────────────────────────────────────
const DISCIPLINES = [
  { id: 'all',     label: 'Everything' },
  { id: 'code',    label: 'Code'       },
  { id: 'design',  label: 'Design'     },
  { id: 'music',   label: 'Music'      },
  { id: 'writing', label: 'Writing'    },
  { id: 'poetry',  label: 'Poetry'     },
]

// ── Projects — poetry + books added ──────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    title: 'GeminiDzi',
    year: '2025',
    discipline: 'code',
    medium: 'React · Vite · Web',
    desc: 'An Afrofuturist personal universe. Eight districts, each with its own personality, tools and games. Built entirely from scratch.',
    color: '#B8882A', rotate: -1.2, status: 'live',
    tags: ['portfolio', 'afrofuturism', 'react'],
  },
  {
    id: 2,
    title: 'Brand Identity Work',
    year: '2024',
    discipline: 'design',
    medium: 'Figma · Illustrator',
    desc: 'Logo systems, colour palettes, and typography guides for small businesses and personal brands. Each one a visual story.',
    color: '#C2185B', rotate: 1.0, status: 'ongoing',
    tags: ['branding', 'identity', 'visual'],
  },
  {
    id: 3,
    title: 'Sonic Studies',
    year: '2024',
    discipline: 'music',
    medium: 'Ableton · FL Studio',
    desc: 'Instrumental explorations. Afrobeats rhythms layered with ambient textures and electronic production. A diary in sound.',
    color: '#2A7B7B', rotate: -0.8, status: 'ongoing',
    tags: ['afrobeats', 'ambient', 'production'],
  },
  {
    id: 4,
    title: 'UI Experiments',
    year: '2025',
    discipline: 'design',
    medium: 'CSS · Canvas · SVG',
    desc: 'A collection of interface experiments. Micro-interactions, unusual layouts, and components that behave unexpectedly but feel exactly right.',
    color: '#6B4FA0', rotate: 1.5, status: 'ongoing',
    tags: ['ui', 'interaction', 'experiments'],
  },
  {
    id: 5,
    title: 'Field Notes',
    year: '2024–25',
    discipline: 'writing',
    medium: 'Essays · Observations',
    desc: 'Short-form writing on technology, culture, design thinking, and what it means to build things in Africa for the world.',
    color: '#C2185B', rotate: -1.8, status: 'private',
    tags: ['essays', 'tech', 'culture'],
  },
  {
    id: 6,
    title: 'Motion Archive',
    year: '2025',
    discipline: 'design',
    medium: 'CSS · After Effects',
    desc: 'Every animation worth keeping. Saved, organised, and presented as a living reference library.',
    color: '#3A6B44', rotate: 0.9, status: 'ongoing',
    tags: ['motion', 'animation', 'archive'],
  },
  {
    id: 7,
    title: 'Small Hours',
    year: '2024–25',
    discipline: 'poetry',
    medium: 'Poetry · Verse',
    desc: 'A private collection of poems written between midnight and 4am. About home, distance, becoming, and the things that stay.',
    color: '#B8882A', rotate: -1.0, status: 'private',
    tags: ['poetry', 'personal', 'verse'],
  },
  {
    id: 8,
    title: 'The Reading List',
    year: 'Ongoing',
    discipline: 'writing',
    medium: 'Books · Annotations',
    desc: 'A curated record of every book that changed something. Favourite lines, annotations, and the reason each one mattered.',
    color: '#3A6B44', rotate: 1.2, status: 'ongoing',
    tags: ['books', 'reading', 'notes'],
  },
]

// ── Pushpin ───────────────────────────────────────────────────────────────────
function Pin({ color }) {
  return (
    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: color,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: `0 1px 5px rgba(0,0,0,0.22), 0 0 0 1px ${color}35`,
        margin: '0 auto',
      }} />
      <div style={{
        width: 2, height: 7,
        background: `linear-gradient(to bottom, ${color}bb, rgba(0,0,0,0.25))`,
        margin: '0 auto',
        borderRadius: '0 0 2px 2px',
      }} />
    </div>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const [hov, setHov] = useState(false)
  const st = STATUS[project.status]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: C.surface,
        border: `1px solid ${hov ? project.color + '50' : C.border}`,
        borderRadius: R.sm,
        padding: '1.5rem 1.4rem 1.3rem',
        paddingTop: '1.7rem',
        transform: hov ? `rotate(0deg) translateY(-4px)` : `rotate(${project.rotate}deg)`,
        transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}, border-color 0.2s ease`,
        cursor: 'default',
        boxShadow: hov
          ? `0 16px 40px rgba(30,20,8,0.14)`
          : `0 2px 10px rgba(30,20,8,0.07)`,
        animation: `studioIn 0.5s ${EASE} ${index * 60}ms both`,
      }}
    >
      {/* Top colour strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: project.color,
        borderRadius: `${R.sm} ${R.sm} 0 0`,
      }} />

      <Pin color={project.color} />

      {/* Year + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ ...T.mono, color: C.muted }}>{project.year}</span>
        <span style={{
          ...T.tiny,
          color: st.color,
          background: st.color + '16',
          padding: '0.15rem 0.5rem',
          borderRadius: '20px',
          border: `1px solid ${st.color}25`,
        }}>{st.label}</span>
      </div>

      {/* Title */}
      <h3 style={{ ...T.h3, color: C.text, margin: '0 0 0.2rem' }}>
        {project.title}
      </h3>

      {/* Medium */}
      <p style={{ ...T.mono, color: project.color, margin: '0 0 0.7rem', letterSpacing: '0.04em' }}>
        {project.medium}
      </p>

      {/* Description */}
      <p style={{ ...T.small, color: C.muted, margin: '0 0 0.9rem', lineHeight: 1.65 }}>
        {project.desc}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            ...T.mono, color: C.faint,
            background: C.bgAlt,
            padding: '0.15rem 0.5rem',
            borderRadius: R.sm,
            border: `1px solid ${C.borderSoft}`,
          }}>#{tag}</span>
        ))}
      </div>
    </div>
  )
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...T.tiny,
        padding: '0.45rem 1rem',
        borderRadius: '20px',
        cursor: 'pointer',
        border: `1px solid ${active ? C.ink : hov ? C.muted : C.border}`,
        background: active ? C.ink : C.surface,
        color: active ? C.bgAlt : hov ? C.text : C.muted,
        transition: `all 0.18s ease`,
        fontFamily: '"DM Sans", sans-serif',
      }}
    >{label}</button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Studio() {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.discipline === filter)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'relative', overflow: 'hidden',
        borderBottom: `1px solid ${C.border}`,
        padding: '3.5rem 2rem 2.5rem',
        background: C.bgAlt,
      }}>
        {/* Linen texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(180,160,130,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,160,130,0.055) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>

          <div style={{ ...T.label, color: C.gold, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <span style={{ display: 'block', width: 24, height: 1, background: C.gold }} />
            District 05
          </div>

          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 0.9rem' }}>
            The <span style={{ color: C.gold }}>Studio</span>
          </h1>

          <p style={{ ...T.body, color: C.muted, maxWidth: 500, margin: '0 0 0.5rem', fontStyle: 'italic' }}>
            Where the work lives. Design, code, music, writing, and poetry — all in one place.
          </p>
          <p style={{ ...T.small, color: C.muted, maxWidth: 480, margin: '0 0 2rem' }}>
            A living record. Projects get added as they are made, updated as they grow, and retired when their time is done.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
              { label: 'Projects',    value: PROJECTS.length,                                      color: C.text  },
              { label: 'Live',        value: PROJECTS.filter(p => p.status === 'live').length,    color: C.green },
              { label: 'In progress', value: PROJECTS.filter(p => p.status === 'ongoing').length, color: C.gold  },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: '0.6rem 1.3rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: i === 0 ? `${R.md} 0 0 ${R.md}` : i === 2 ? `0 ${R.md} ${R.md} 0` : '0',
                display: 'flex', alignItems: 'baseline', gap: '0.5rem',
              }}>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>
                  {value}
                </span>
                <span style={{ ...T.tiny, color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {DISCIPLINES.map(d => (
              <FilterBtn key={d.id} label={d.label} active={filter === d.id} onClick={() => setFilter(d.id)} />
            ))}
          </div>
        </div>
      </header>

      {/* ── Projects ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 2rem 5rem' }}>

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ ...T.quote, color: C.muted }}>Nothing here in this category yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '3.5rem 1.5rem',  // extra vertical — cards need room to tilt
          }}>
            {visible.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}

        {/* Closing note */}
        <div style={{
          marginTop: '4rem',
          padding: '1.8rem 2rem',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: R.md,
          borderLeft: `3px solid ${C.gold}`,
          maxWidth: 540,
        }}>
          <p style={{ ...T.quote, color: C.muted, margin: '0 0 0.6rem' }}>
            This studio is a living record. Projects get added as they are made,
            updated as they grow, and retired when their time is done.
          </p>
          <p style={{ ...T.mono, color: C.faint, margin: 0 }}>
            Dzifa, {new Date().getFullYear()}
          </p>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(184,136,42,0.2); color: #2A1800; }

        @keyframes studioIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}