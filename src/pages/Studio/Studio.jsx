import { useState } from 'react'

const DISCIPLINES = [
  { id: 'all', label: 'everything' },
  { id: 'design', label: 'design' },
  { id: 'code', label: 'code' },
  { id: 'music', label: 'music' },
  { id: 'writing', label: 'writing' },
]

const PROJECTS = [
  {
    id: 1, title: 'GeminiDzi', year: '2025',
    discipline: 'code',
    medium: 'React · Vite · Web',
    desc: 'An Afrofuturist personal universe. Eight districts, each with its own personality, tools and games. Built entirely from scratch.',
    color: '#D4AF37', rotate: -1.2,
    status: 'live',
    tags: ['portfolio', 'afrofuturism', 'react'],
  },
  {
    id: 2, title: 'Brand Identity', year: '2024',
    discipline: 'design',
    medium: 'Figma · Illustrator',
    desc: 'Logo systems, colour palettes, and typography guides for small businesses and personal brands. Each one a story in visual form.',
    color: '#E8758A', rotate: 1.0,
    status: 'ongoing',
    tags: ['branding', 'identity', 'visual'],
  },
  {
    id: 3, title: 'Sonic Studies', year: '2024',
    discipline: 'music',
    medium: 'Ableton · FL Studio',
    desc: 'Instrumental explorations. Afrobeats rhythms layered with ambient textures and electronic production. A diary in sound.',
    color: '#4ECDC4', rotate: -0.8,
    status: 'ongoing',
    tags: ['afrobeats', 'ambient', 'production'],
  },
  {
    id: 4, title: 'UI Experiments', year: '2025',
    discipline: 'design',
    medium: 'CSS · Canvas · SVG',
    desc: 'A collection of interface experiments. Micro-interactions, unusual layouts, and components that behave unexpectedly but feel right.',
    color: '#A78BFA', rotate: 1.5,
    status: 'ongoing',
    tags: ['ui', 'interaction', 'experiments'],
  },
  {
    id: 5, title: 'Field Notes', year: '2024–25',
    discipline: 'writing',
    medium: 'Essays · Observations',
    desc: 'Short-form writing on technology, culture, design thinking and what it means to build things in Africa for the world.',
    color: '#FF8B94', rotate: -1.8,
    status: 'private',
    tags: ['essays', 'tech', 'culture'],
  },
  {
    id: 6, title: 'Motion Archive', year: '2025',
    discipline: 'design',
    medium: 'CSS · After Effects',
    desc: 'Every animation I have ever been proud of. Saved, organised, and presented as a living reference library.',
    color: '#6AAF7A', rotate: 0.9,
    status: 'ongoing',
    tags: ['motion', 'animation', 'archive'],
  },
]

const STATUS_STYLES = {
  live:    { color: '#6AAF7A', label: 'live' },
  ongoing: { color: '#D4AF37', label: 'ongoing' },
  private: { color: '#A78BFA', label: 'private' },
  done:    { color: '#5B9BD5', label: 'complete' },
}

function ProjectCard({ project, index }) {
  const [hov, setHov] = useState(false)
  const st = STATUS_STYLES[project.status]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hov ? project.color + '80' : '#E8DDD0'}`,
        borderRadius: '4px',
        padding: '1.4rem',
        transform: hov ? 'rotate(0deg) translateY(-4px)' : `rotate(${project.rotate}deg)`,
        transition: 'all 0.25s ease',
        cursor: 'default',
        boxShadow: hov
          ? `0 12px 32px rgba(0,0,0,0.12), 0 4px 0px ${project.color}30`
          : '0 2px 12px rgba(0,0,0,0.08)',
        animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
        position: 'relative',
      }}
    >
      {/* Colour strip top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: project.color, borderRadius: '2px 2px 0 0' }} />

      {/* Pin */}
      <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '14px', height: '14px', borderRadius: '50%', background: project.color, boxShadow: `0 2px 6px ${project.color}60`, border: '2px solid #fff' }} />

      <div style={{ marginTop: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#C0A890', letterSpacing: '0.08em' }}>{project.year}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: st.color, background: st.color + '18', padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>{st.label}</span>
        </div>

        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#2A1A00', margin: '0 0 0.2rem' }}>{project.title}</h3>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: project.color, margin: '0 0 0.7rem', letterSpacing: '0.04em' }}>{project.medium}</p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: '#6A5040', margin: '0 0 0.9rem', lineHeight: 1.6 }}>{project.desc}</p>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {project.tags.map(t => (
            <span key={t} style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#A09080', background: '#F5F0EA', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>#{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Studio() {
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.discipline === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', paddingTop: '80px' }}>

      {/* ── Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '2px solid #EEE5DB', padding: '3rem 1.5rem 2.5rem' }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(180,160,130,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,130,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#C0A060' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#C0A060' }}>the district</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, color: '#2A1A00', margin: '0 0 0.5rem', lineHeight: 1, letterSpacing: '-0.03em' }}>
            The Studio
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#9A8070', maxWidth: '460px', lineHeight: 1.6, margin: '0 0 1.8rem', fontStyle: 'italic' }}>
            Where the work lives. Design, code, music and writing, all in one place.
          </p>

          {/* Discipline filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {DISCIPLINES.map(d => (
              <button key={d.id} onClick={() => setFilter(d.id)}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '20px', cursor: 'pointer', border: 'none',
                  background: filter === d.id ? '#2A1A00' : '#fff',
                  color: filter === d.id ? '#F5ECD8' : '#9A8070',
                  fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: filter === d.id ? 700 : 400,
                  boxShadow: filter === d.id ? '0 2px 0px #00000040' : '0 1px 4px rgba(0,0,0,0.06)',
                  border: `2px solid ${filter === d.id ? '#2A1A00' : '#E8DDD0'}`,
                  transition: 'all 0.15s',
                }}>{d.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Projects ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem 1.5rem' }}>
          {visible.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#C0A890', fontStyle: 'italic' }}>nothing here yet in this category</p>
          </div>
        )}

        {/* Studio note */}
        <div style={{ marginTop: '3.5rem', padding: '1.8rem 2rem', background: '#fff', border: '2px solid #EEE5DB', borderRadius: '4px', borderLeft: '4px solid #C0A060', maxWidth: '540px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#6A5040', margin: '0 0 0.3rem', lineHeight: 1.7 }}>
            This studio is a living record. Projects get added as they're made, updated as they grow, and retired when their time is done.
          </p>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#C0A890', margin: 0, letterSpacing: '0.06em' }}>— DZIFA, {new Date().getFullYear()}</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}