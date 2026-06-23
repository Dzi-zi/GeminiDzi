import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:        '#0C0B08',
  surface:   '#131108',
  surfaceHov:'#1a1710',
  amber:     '#E8A838',
  amberDim:  'rgba(232,168,56,0.1)',
  amberMid:  'rgba(232,168,56,0.25)',
  green:     '#4ade80',
  text:      '#F0EDE6',
  muted:     'rgba(240,237,230,0.55)',
  faint:     'rgba(240,237,230,0.22)',
  border:    'rgba(232,168,56,0.12)',
  borderHov: 'rgba(232,168,56,0.35)',
  gridLine:  'rgba(232,168,56,0.035)',
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const T = {
  label: { fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' },
  h1:    { fontFamily: '"DM Sans", sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 },
  h2:    { fontFamily: '"DM Sans", sans-serif', fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em' },
  body:  { fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', fontWeight: 400, lineHeight: 1.75 },
  mono:  { fontFamily: '"DM Mono", monospace',  fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.03em' },
  tiny:  { fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' },
}

const PROJECTS = [
  {
    id: 'contribution-tracker',
    ref: 'PRJ-001',
    name: 'Contribution Tracker',
    tagline: 'Full-stack charitable contribution tracker with dashboard analytics and PDF export.',
    description: 'Built with React, Vercel Serverless Functions, and a Neon PostgreSQL database. Features four Recharts dashboard views, a sortable transaction ledger with date-picker input, consolidated validation, and PDF export — all monetary formatting done without third-party money libraries.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Vercel', 'Neon', 'Recharts', 'jsPDF'],
    live: 'https://contribution-tracker-lake.vercel.app',
    repo: 'https://github.com/Dzi-zi/contribution-tracker',
    year: '2026',
  },
  {
    id: 'cinevault',
    ref: 'PRJ-002',
    name: 'CineVault',
    tagline: 'Full-stack movie and TV streaming platform with global playback, watchlists, and reviews.',
    description: 'Search any title and watch it via embedded global stream sources with automatic fallback switching. Built with a secure Node.js/Express backend proxying the TMDB API, MongoDB Atlas for user data, and JWT authentication. Features user accounts, personal watchlists, and a 5-star review system — deployed as a serverless app on Vercel.',
    stack: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'JWT', 'TMDB API', 'Vercel'],
    live: 'https://cinevault-five-omega.vercel.app',
    repo: 'https://github.com/Dzi-zi/cinevault',
    year: '2026',
  },
  {
    id: 'myllm',
    ref: 'PRJ-003',
    name: 'MyLLM',
    tagline: 'GPT-2 transformer built from scratch in PyTorch — 163M parameters, fine-tuned end-to-end.',
    description: 'Implemented the full GPT-2 architecture including multi-head attention, positional embeddings, layer normalization, and feed-forward blocks. Trained across three stages: text generation pretraining, spam classification fine-tuning (90.6% test accuracy), and instruction tuning using real GPT-2 weights and the Alpaca dataset via HuggingFace safetensors.',
    stack: ['Python', 'PyTorch', 'HuggingFace', 'tiktoken', 'safetensors'],
    live: null,
    repo: 'https://github.com/Dzi-zi/MyLLM',
    year: '2025',
  },
]

function ProjectCard({ project, index }) {
  const [hov, setHov] = useState(false)

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: hov ? C.surfaceHov : C.surface,
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        transition: `background 200ms ${EASE}, border-color 200ms ${EASE}, transform 250ms ${EASE}`,
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        animation: `projIn 0.5s ${EASE} ${index * 80}ms both`,
        backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: hov ? 3 : 2, background: C.amber, transition: 'height 0.2s ease' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ ...T.mono, color: C.faint }}>{project.ref}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
              <span style={{ ...T.tiny, color: C.green }}>Live</span>
            </div>
            <span style={{ ...T.mono, color: C.faint }}>{project.year}</span>
          </div>
          <h2 style={{ ...T.h2, color: hov ? C.amber : C.text, margin: 0, transition: 'color 0.2s ease' }}>
            {project.name}
          </h2>
        </div>
      </div>

      <p style={{ ...T.body, color: C.muted, margin: 0, fontWeight: 500 }}>{project.tagline}</p>
      <p style={{ ...T.body, color: C.faint, margin: 0, fontSize: '0.83rem' }}>{project.description}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {project.stack.map(tag => (
          <span key={tag} style={{ ...T.tiny, color: C.amber, padding: '0.2rem 0.55rem', border: '1px solid rgba(232,168,56,0.2)', borderRadius: '3px', fontSize: '0.63rem' }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}` }}>
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" style={{ ...T.tiny, color: C.amber, textDecoration: 'none', padding: '0.35rem 0.9rem', border: `1px solid ${C.amberMid}`, borderRadius: '3px', background: hov ? C.amberDim : 'transparent', transition: 'background 0.15s ease' }}>
            View Live
          </a>
        )}
        <a href={project.repo} target="_blank" rel="noopener noreferrer" style={{ ...T.tiny, color: C.muted, textDecoration: 'none', padding: '0.35rem 0.9rem', border: '1px solid rgba(240,237,230,0.1)', borderRadius: '3px', transition: 'color 0.15s ease, border-color 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(240,237,230,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = 'rgba(240,237,230,0.1)' }}
        >
          GitHub
        </a>
      </div>
    </article>
  )
}

export default function Projects() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

        <header style={{ marginBottom: '3.5rem', animation: `projIn 0.5s ${EASE} both` }}>
          <div style={{ ...T.label, color: C.amber, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <span style={{ display: 'block', width: 24, height: 1, background: C.amber }} />
            Featured Work
          </div>
          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 1rem' }}>Main Projects</h1>
          <p style={{ ...T.body, color: C.muted, maxWidth: 500, margin: '0 0 2rem' }}>
            Three complete builds with source code and live deployments available for each.
          </p>
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, background: C.surface, width: 'fit-content' }}>
            {[
              { label: 'Projects', value: PROJECTS.length },
              { label: 'Live', value: PROJECTS.filter(p => p.live).length },
              { label: 'On GitHub', value: PROJECTS.length },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{ padding: '0.6rem 1.4rem', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '1.4rem', fontWeight: 700, color: C.amber, lineHeight: 1 }}>{value}</span>
                <span style={{ ...T.tiny, color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => navigate('/')} style={{ ...T.tiny, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = C.muted}
            onMouseLeave={e => e.currentTarget.style.color = C.faint}
          >
            ← Back to GeminiDzi
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(232,168,56,0.2); color: #F0EDE6; }
        @keyframes projIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}