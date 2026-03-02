import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Lab District Identity — Blueprint / Architect ─────────────────────────────
// Concept: Technical drawing office. Architect's blueprint.
// Every element feels like it belongs on drafting paper.
// Background: #0D1B2E — deep navy blueprint paper
// Surface:    #0F2035 — slightly lighter navy for cards
// Grid:       faint crosshatch at 20px — blueprint grid lines
// Accent:     #5B9BD5 — technical blue, the colour of blueprint ink
// Secondary:  #D4AF37 — gold for live/active tools (warm against navy)
// Text:       #E8F4FF — clean blueprint white
// Font:       Rajdhani — geometric, technical, legible. Slightly wide letters.
// Body:       DM Sans — clean and readable at small sizes

const C = {
  bg:          '#0D1B2E',
  surface:     '#0F2035',
  surfaceHov:  '#132640',
  blue:        '#5B9BD5',
  blueFaint:   'rgba(91,155,213,0.1)',
  blueBright:  '#7AB8E8',
  gold:        '#D4AF37',
  goldFaint:   'rgba(212,175,55,0.1)',
  green:       '#4CAF50',
  text:        '#E8F4FF',
  muted:       'rgba(232,244,255,0.55)',
  faint:       'rgba(232,244,255,0.25)',
  border:      'rgba(91,155,213,0.2)',
  borderSub:   'rgba(91,155,213,0.1)',
  gridLine:    'rgba(91,155,213,0.055)',
}

const R = { sm: '2px', md: '4px', lg: '8px' }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const T = {
  label: { fontFamily: '"Rajdhani", sans-serif',  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase' },
  h1:    { fontFamily: '"Rajdhani", sans-serif',  fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.0 },
  h2:    { fontFamily: '"Rajdhani", sans-serif',  fontSize: 'clamp(1.3rem, 2.8vw, 1.8rem)', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.1 },
  h3:    { fontFamily: '"Rajdhani", sans-serif',  fontSize: '1rem',    fontWeight: 700, letterSpacing: '0.05em' },
  body:  { fontFamily: '"DM Sans", sans-serif',   fontSize: '0.88rem', fontWeight: 400, lineHeight: 1.72 },
  small: { fontFamily: '"DM Sans", sans-serif',   fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:  { fontFamily: '"Rajdhani", sans-serif',  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' },
}

// ── Tool data ─────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'docuchat',
    name: 'DocuChat',
    ref: 'LAB-001',
    description: 'Upload any PDF and run a full AI conversation with it. Ask questions, pull summaries, extract specific data points.',
    path: '/lab/docuchat',
    color: C.gold,
    status: 'live',
    tag: 'AI / NLP',
  },
  {
    id: 'moodtunes',
    name: 'MoodTunes',
    ref: 'LAB-002',
    description: 'Reads the emotion in your text input and generates a matching playlist in real time.',
    path: '/lab/moodtunes',
    color: C.blue,
    status: 'live',
    tag: 'AI / Music',
  },
  {
    id: 'animationstudio',
    name: 'AnimationStudio',
    ref: 'LAB-003',
    description: 'Visual CSS animation builder. Design keyframe animations with a live preview and export clean production CSS.',
    path: '/lab/animationstudio',
    color: C.gold,
    status: 'live',
    tag: 'CSS / Dev',
  },
  {
    id: 'splitease',
    name: 'SplitEase',
    ref: 'LAB-004',
    description: 'Bill splitter for groups. Add expenses, split by percentage or equal share, get a clean settlement summary.',
    path: '/lab/splitease',
    color: C.blue,
    status: 'live',
    tag: 'Finance',
  },
  {
    id: 'gradecalc',
    name: 'GradeCalc',
    ref: 'LAB-005',
    description: 'Weighted grade calculator for students. Track assignments, see your current standing, calculate what you need on finals.',
    path: '/lab/gradecalc',
    color: C.blue,
    status: 'live',
    tag: 'Education',
  },
  {
    id: 'healthpulse',
    name: 'HealthPulse',
    ref: 'LAB-006',
    description: 'Personal health dashboard. Log workouts, meals, and sleep. Weekly AI-generated insights based on your data.',
    path: '/lab/healthpulse',
    color: C.gold,
    status: 'live',
    tag: 'Health / AI',
  },
  {
    id: 'newsroom',
    name: 'NewsRoom',
    ref: 'LAB-007',
    description: 'Personalised news aggregator. Learns your topic preferences over time and summarises articles with AI.',
    path: '/lab/newsroom',
    color: C.blue,
    status: 'live',
    tag: 'AI / Media',
  },
]

// ── Corner mark — blueprint corner bracket ────────────────────────────────────
function CornerMark({ size = 10, color, pos }) {
  const s = { position: 'absolute', ...pos, width: size, height: size, pointerEvents: 'none' }
  const t = `1.5px solid ${color}`
  return (
    <div style={{
      ...s,
      borderTop:    pos.top    !== undefined ? t : 'none',
      borderBottom: pos.bottom !== undefined ? t : 'none',
      borderLeft:   pos.left   !== undefined ? t : 'none',
      borderRight:  pos.right  !== undefined ? t : 'none',
    }} />
  )
}

// ── Tool card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool, index }) {
  const [hov, setHov] = useState(false)
  const navigate = useNavigate()
  const isLive = tool.status === 'live'

  return (
    <div
      role={isLive ? 'button' : undefined}
      tabIndex={isLive ? 0 : undefined}
      onClick={() => isLive && navigate(tool.path)}
      onKeyDown={e => e.key === 'Enter' && isLive && navigate(tool.path)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        // Blueprint grid texture on each card
        backgroundImage: `
          linear-gradient(${C.gridLine} 1px, transparent 1px),
          linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundColor: hov && isLive ? C.surfaceHov : C.surface,
        border: `1px solid ${hov && isLive ? C.blue + '55' : C.borderSub}`,
        cursor: isLive ? 'pointer' : 'default',
        transition: `background-color 0.2s ease, border-color 0.2s ease, transform 0.25s ${EASE}, box-shadow 0.25s ${EASE}`,
        transform: hov && isLive ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov && isLive ? `0 12px 32px rgba(13,27,46,0.6)` : 'none',
        animation: `labIn 0.45s ${EASE} ${index * 55}ms both`,
        minHeight: 220,
        opacity: isLive ? 1 : 0.45,
      }}
    >
      {/* Blueprint corner marks */}
      <CornerMark size={8} color={hov && isLive ? C.blue : C.borderSub} pos={{ top: 6, left: 6 }} />
      <CornerMark size={8} color={hov && isLive ? C.blue : C.borderSub} pos={{ top: 6, right: 6 }} />
      <CornerMark size={8} color={hov && isLive ? C.blue : C.borderSub} pos={{ bottom: 6, left: 6 }} />
      <CornerMark size={8} color={hov && isLive ? C.blue : C.borderSub} pos={{ bottom: 6, right: 6 }} />

      {/* Reference number + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ ...T.tiny, color: C.faint }}>{tool.ref}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            display: 'block', width: 6, height: 6, borderRadius: '50%',
            background: isLive ? C.green : C.faint,
            flexShrink: 0,
          }} />
          <span style={{ ...T.tiny, color: isLive ? C.green : C.faint }}>
            {isLive ? 'Live' : 'Soon'}
          </span>
        </div>
      </div>

      {/* Accent rule — widens on hover */}
      <div style={{
        width: hov && isLive ? 36 : 20,
        height: 2,
        background: tool.color,
        marginBottom: '0.85rem',
        transition: `width 0.3s ${EASE}`,
      }} />

      {/* Name */}
      <h3 style={{
        ...T.h3,
        color: hov && isLive ? tool.color : C.text,
        margin: '0 0 0.55rem',
        transition: `color 0.2s ease`,
      }}>
        {tool.name}
      </h3>

      {/* Description */}
      <p style={{ ...T.small, color: C.muted, margin: '0 0 1.1rem', flexGrow: 1 }}>
        {tool.description}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${C.borderSub}`,
      }}>
        <span style={{
          ...T.tiny, color: C.blue,
          padding: '0.15rem 0.5rem',
          border: `1px solid ${C.blue}30`,
          borderRadius: R.sm,
        }}>
          {tool.tag}
        </span>
        {hov && isLive && (
          <span style={{ ...T.tiny, color: tool.color, animation: `labFadeIn 0.15s ${EASE}` }}>
            Open →
          </span>
        )}
      </div>
    </div>
  )
}

// ── Lab page ──────────────────────────────────────────────────────────────────
export default function Lab() {
  const liveCount = TOOLS.filter(t => t.status === 'live').length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* Full-page blueprint grid */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(${C.gridLine} 1px, transparent 1px),
          linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: '3.5rem' }}>

          {/* Eyebrow */}
          <div style={{
            ...T.label, color: C.blue,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.2rem',
          }}>
            <span style={{ display: 'block', width: 24, height: 1, background: C.blue }} />
            District 04 / Tool Registry
          </div>

          {/* Title */}
          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 0.9rem' }}>
            The <span style={{ color: C.blue }}>Lab</span>
          </h1>

          {/* Subtitle */}
          <p style={{ ...T.body, color: C.muted, maxWidth: 520, margin: '0 0 2rem' }}>
            Seven tools built from scratch. AI, utilities, dashboards, and dev tools.
            All fully functional and deployable.
          </p>

          {/* Stat strip — blueprint title block style */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            border: `1px solid ${C.border}`,
            background: C.surface,
            backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}>
            {[
              { label: 'Total Tools', value: TOOLS.length, color: C.text },
              { label: 'Live Now',    value: liveCount,    color: C.gold },
              { label: 'District',    value: '04',         color: C.blue },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: '0.7rem 1.5rem',
                borderRight: i < 2 ? `1px solid ${C.borderSub}` : 'none',
                display: 'flex', alignItems: 'baseline', gap: '0.5rem',
                flex: '1 1 auto',
              }}>
                <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>
                  {value}
                </span>
                <span style={{ ...T.tiny, color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Section label ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ ...T.h2, color: C.text, margin: '0 0 0.3rem' }}>Tool Index</h2>
          <p style={{ ...T.small, color: C.faint, margin: 0 }}>
            All tools listed below are live and accessible.
          </p>
        </div>

        {/* ── Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1px',
          background: C.borderSub,
          border: `1px solid ${C.borderSub}`,
        }}>
          {TOOLS.map((tool, i) => (
            <div key={tool.id} style={{ background: C.bg }}>
              <ToolCard tool={tool} index={i} />
            </div>
          ))}
        </div>

        {/* ── Footer note — blueprint title block ── */}
        <div style={{
          marginTop: '3rem',
          padding: '1.6rem 2rem',
          background: C.surface,
          border: `1px solid ${C.border}`,
          backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{ ...T.label, color: C.blue, marginBottom: '0.4rem' }}>More in progress</div>
            <p style={{ ...T.small, color: C.muted, maxWidth: 420, margin: 0 }}>
              New tools are added regularly. Every tool is built without third-party UI libraries — pure React and browser APIs.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: '2rem', fontWeight: 700, color: C.blue, lineHeight: 1 }}>
              {liveCount}
            </div>
            <div style={{ ...T.tiny, color: C.faint, marginTop: '0.2rem' }}>tools live</div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(91,155,213,0.25); color: #E8F4FF; }

        @keyframes labIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes labFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}