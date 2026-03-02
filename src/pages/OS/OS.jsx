import { useState, useEffect, useRef } from 'react'

// ── OS District Identity — Personal README ────────────────────────────────────
// Concept: A real terminal. Not a UI that looks like a terminal.
// An actual green-phosphor CRT experience. Personal, honest, direct.
//
// Background: #060D06  — near-black with a green tint, like a powered-off CRT
// Surface:    #0A110A  — terminal window background
// Chrome:     #0F160F  — terminal title bar
// Green:      #33FF66  — phosphor green, the primary accent
// GreenDim:   #1A8A35  — darker green for secondary text
// Gold:       #D4AF37  — used sparingly for "currently" section warmth
// Text:       #B8E8B8  — aged phosphor white-green
// Font:       JetBrains Mono — the best terminal font, extremely legible
// All text is monospace. This is a terminal district. No exceptions.

const C = {
  bg:         '#060D06',
  surface:    '#0A110A',
  chrome:     '#0D140D',
  green:      '#33FF66',
  greenMid:   '#22CC50',
  greenDim:   'rgba(51,255,102,0.5)',
  greenFaint: 'rgba(51,255,102,0.08)',
  gold:       '#D4AF37',
  goldFaint:  'rgba(212,175,55,0.15)',
  teal:       '#4ECDC4',
  purple:     '#A78BFA',
  rose:       '#FF8B94',
  amber:      '#FFB347',
  text:       '#B8E8B8',
  muted:      'rgba(184,232,184,0.5)',
  faint:      'rgba(184,232,184,0.22)',
  border:     'rgba(51,255,102,0.15)',
  borderSub:  'rgba(51,255,102,0.07)',
}

const R = { sm: '0px', md: '4px', lg: '8px' }   // terminals are boxy
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// EVERY piece of text uses JetBrains Mono — this is the district's rule
const T = {
  label:  { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', fontWeight: 400, letterSpacing: '0.15em', textTransform: 'uppercase' },
  h1:     { fontFamily: '"JetBrains Mono", monospace', fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.0 },
  h2:     { fontFamily: '"JetBrains Mono", monospace', fontSize: 'clamp(1rem, 2.2vw, 1.4rem)', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.1 },
  cmd:    { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.02em' },
  body:   { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.75 },
  small:  { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.68rem', fontWeight: 400, lineHeight: 1.7 },
  tiny:   { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem',  fontWeight: 400, letterSpacing: '0.08em' },
  label2: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.1em' },
}

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'principles',
    cmd: 'cat principles.txt',
    title: 'How I Think',
    color: C.teal,
    content: [
      { label: 'first_principles',      text: 'Break things down to their roots before building them back up. If I cannot explain why something works, I do not use it.' },
      { label: 'make_it_then_refine',   text: 'A finished ugly thing beats a beautiful unfinished one. Ship first. Refine forever.' },
      { label: 'curiosity_over_certainty', text: 'The most interesting question is always the one I have not thought to ask yet.' },
      { label: 'context_is_everything', text: 'The right answer in one situation is the wrong answer in another. I resist universal rules.' },
      { label: 'rest_is_work',          text: 'Downtime is not lost time. The brain keeps working. I have learned to trust the pause.' },
    ],
  },
  {
    id: 'stack',
    cmd: 'ls -la tools/',
    title: 'My Stack',
    color: C.gold,
    content: [
      { label: 'languages',   text: 'JavaScript · Python · HTML/CSS · a little Rust when feeling brave' },
      { label: 'frontend',    text: 'React · Vite · Tailwind · Framer Motion · raw Canvas' },
      { label: 'design',      text: 'Figma · Illustrator · pen and paper (still the best tool)' },
      { label: 'music',       text: 'Ableton Live · FL Studio · a MIDI keyboard that deserves better' },
      { label: 'thinking',    text: 'Notion · physical notebooks · long walks · shower thoughts' },
      { label: 'ai',          text: 'Claude · used as a thinking partner, never a replacement' },
    ],
  },
  {
    id: 'process',
    cmd: 'open process.md',
    title: 'How I Work',
    color: C.purple,
    content: [
      { label: '01_understand', text: 'Spend more time on the problem than the solution. Most bad solutions are good answers to the wrong question.' },
      { label: '02_sketch',     text: 'Always analogue first. Paper, pencil, bad drawings only I can understand. The screen comes later.' },
      { label: '03_build_rough', text: 'Make it work before making it pretty. Ugly prototypes that do the right thing beat beautiful ones that do not.' },
      { label: '04_sit_with_it', text: 'Leave work alone for at least a day before calling it done. Fresh eyes catch what familiar eyes miss.' },
      { label: '05_ship_learn',  text: 'Real feedback from real people beats assumptions every time. Ship to learn, not to finish.' },
    ],
  },
  {
    id: 'values',
    cmd: 'grep -r values .',
    title: 'What I Value',
    color: C.rose,
    content: [
      { label: 'craft',     text: 'The details no one notices when right and everyone notices when wrong. I care about those.' },
      { label: 'honesty',   text: 'In work and in people. A hard truth now beats a comfortable lie later.' },
      { label: 'depth',     text: 'I would rather understand one thing fully than know a little about many things.' },
      { label: 'community', text: 'Building things that lift others, not just myself. The rising tide. I take it seriously.' },
      { label: 'joy',       text: 'If something does not feel worth making, I do not make it. Life is too short for joyless work.' },
    ],
  },
  {
    id: 'now',
    cmd: 'tail -f now.log',
    title: 'Right Now',
    color: C.amber,
    content: [
      { label: 'building',        text: 'GeminiDzi — this very thing you are exploring. District by district.' },
      { label: 'learning',        text: 'Three.js, Rust fundamentals, and the history of African architecture.' },
      { label: 'reading',         text: 'Kindred by Octavia Butler · The Design of Everyday Things · old Wired from 1998.' },
      { label: 'listening',       text: 'Amaarae · Femi Kuti · Floating Points · whatever feels right at 2am.' },
      { label: 'thinking_about',  text: 'What Afrofuturism means for the web. What African design looks like in digital spaces.' },
    ],
  },
]

// ── Blinking cursor ───────────────────────────────────────────────────────────
function Cursor({ color = C.green }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '0.55em', height: '1em',
      background: color,
      verticalAlign: 'text-bottom',
      marginLeft: '1px',
      animation: 'osBlink 1s step-end infinite',
    }} />
  )
}

// ── Terminal window ───────────────────────────────────────────────────────────
function TerminalWindow({ section, isActive, onActivate, compact }) {
  const [typed, setTyped] = useState('')
  const [done, setDone]   = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isActive) { setTyped(''); setDone(false); setVisible(false); return }
    let i = 0
    setTyped(''); setDone(false); setVisible(false)
    const iv = setInterval(() => {
      i++
      setTyped(section.cmd.slice(0, i))
      if (i >= section.cmd.length) {
        clearInterval(iv)
        setTimeout(() => { setDone(true); setTimeout(() => setVisible(true), 80) }, 260)
      }
    }, 32)
    return () => clearInterval(iv)
  }, [isActive, section.cmd])

  return (
    <div
      onClick={!isActive ? onActivate : undefined}
      style={{
        background: C.surface,
        border: `1px solid ${isActive ? section.color + '60' : C.borderSub}`,
        borderRadius: R.lg,
        overflow: 'hidden',
        cursor: !isActive ? 'pointer' : 'default',
        transition: `border-color 0.2s ease, transform 0.2s ${EASE}`,
        transform: !isActive && 'none',
        animation: `osIn 0.4s ${EASE} both`,
      }}
    >
      {/* ── Title bar ── */}
      <div style={{
        background: C.chrome,
        padding: '0.5rem 0.9rem',
        borderBottom: `1px solid ${C.borderSub}`,
        display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        {/* Traffic lights — colour only when active */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['#E85870', '#D4AF37', '#33FF66'].map((c, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: isActive ? c : C.borderSub,
              transition: 'background 0.2s ease',
            }} />
          ))}
        </div>
        <span style={{ ...T.tiny, color: isActive ? section.color : C.faint, flex: 1 }}>
          dzifa@os: ~/{section.id}
        </span>
        {!isActive && (
          <span style={{ ...T.tiny, color: C.faint }}>click to open</span>
        )}
      </div>

      {/* ── Prompt line ── */}
      <div style={{ padding: compact ? '0.6rem 1rem' : '0.75rem 1rem', borderBottom: `1px solid ${C.borderSub}` }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ ...T.cmd, color: section.color, flexShrink: 0 }}>$</span>
          <span style={{ ...T.cmd, color: C.text }}>
            {isActive ? typed : section.cmd}
            {isActive && !done && <Cursor color={section.color} />}
          </span>
        </div>
      </div>

      {/* ── Output ── */}
      <div style={{ padding: compact ? '0.7rem 1rem 0.8rem' : '0.9rem 1rem 1.2rem', minHeight: compact ? 80 : 160 }}>
        {/* Section title comment */}
        <div style={{ ...T.tiny, color: section.color, marginBottom: compact ? '0.5rem' : '0.8rem', opacity: isActive ? 1 : 0.5 }}>
          # {section.title}
        </div>

        {/* Content lines */}
        {(visible || !isActive) && section.content.map((item, i) => (
          compact && i > 1 ? null : (
            <div key={i} style={{
              marginBottom: compact ? '0.4rem' : '0.8rem',
              opacity: isActive ? 1 : 0.4,
              animation: visible ? `osIn 0.3s ${EASE} ${i * 45}ms both` : 'none',
            }}>
              <span style={{ ...T.label2, color: section.color, display: 'block', marginBottom: '0.15rem' }}>
                {item.label}:
              </span>
              <span style={{ ...T.small, color: C.muted, display: 'block' }}>
                {compact ? item.text.slice(0, 55) + (item.text.length > 55 ? '...' : '') : item.text}
              </span>
            </div>
          )
        ))}

        {/* Loading state */}
        {isActive && !visible && done && (
          <span style={{ ...T.tiny, color: C.faint }}>loading output...</span>
        )}

        {/* Compact "more" hint */}
        {compact && !isActive && (
          <div style={{ ...T.tiny, color: C.faint, marginTop: '0.3rem' }}>
            +{section.content.length - 2} more entries
          </div>
        )}
      </div>
    </div>
  )
}

// ── Boot sequence ─────────────────────────────────────────────────────────────
function BootSequence({ onDone }) {
  const [lines, setLines] = useState([])

  const BOOT_LINES = [
    { text: 'GeminiOS v2.0 — booting...', color: C.green },
    { text: 'loading core/principles.txt ... OK', color: C.teal },
    { text: 'mounting tools/ ... OK', color: C.gold },
    { text: 'syncing process.md ... OK', color: C.purple },
    { text: 'reading values/ ... OK', color: C.rose },
    { text: 'checking now.log ... OK', color: C.amber },
    { text: 'all modules loaded. system ready.', color: C.green },
  ]

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      setLines(BOOT_LINES.slice(0, i + 1))
      i++
      if (i >= BOOT_LINES.length) {
        clearInterval(iv)
        setTimeout(onDone, 600)
      }
    }, 210)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{
      padding: '1.2rem 1.4rem',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: R.lg,
      maxWidth: 420,
      animation: `osIn 0.3s ${EASE}`,
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{
          ...T.small, color: line.color,
          marginBottom: '0.2rem',
          opacity: i === lines.length - 1 ? 1 : 0.55,
          animation: `osIn 0.2s ${EASE}`,
        }}>
          {line.text}
          {i === lines.length - 1 && <Cursor color={line.color} />}
        </div>
      ))}
    </div>
  )
}

// ── OS page ───────────────────────────────────────────────────────────────────
export default function OS() {
  const [active, setActive]       = useState('principles')
  const [bootDone, setBootDone]   = useState(false)

  const activeSection   = SECTIONS.find(s => s.id === active)
  const inactiveSections = SECTIONS.filter(s => s.id !== active)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* Full-page dot grid — phosphor scanline texture */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${C.borderSub} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <header style={{
          padding: '3.5rem 2rem 2.5rem',
          borderBottom: `1px solid ${C.borderSub}`,
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Eyebrow */}
            <div style={{ ...T.label, color: C.green, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
              <span style={{ display: 'block', width: 20, height: 1, background: C.green }} />
              District 07 / Personal README
            </div>

            <h1 style={{ ...T.h1, color: C.text, margin: '0 0 0.8rem' }}>
              The <span style={{ color: C.green }}>OS</span>
              {bootDone && <Cursor color={C.green} />}
            </h1>

            <p style={{ ...T.body, color: C.muted, maxWidth: 500, margin: '0 0 1.8rem' }}>
              How I think, work, build, and live. A personal README.
            </p>

            {!bootDone && <BootSequence onDone={() => setBootDone(true)} />}
          </div>
        </header>

        {/* ── Main content ── */}
        {bootDone && (
          <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem 5rem', animation: `osIn 0.4s ${EASE}` }}>

            {/* Tab nav */}
            <nav style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', marginBottom: '2rem', background: C.borderSub, border: `1px solid ${C.borderSub}`, borderRadius: R.lg, overflow: 'hidden' }}>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{
                    ...T.tiny,
                    flex: '1 1 auto',
                    padding: '0.65rem 1rem',
                    background: active === s.id ? `${s.color}12` : C.surface,
                    border: 'none',
                    borderBottom: active === s.id ? `2px solid ${s.color}` : `2px solid transparent`,
                    color: active === s.id ? s.color : C.faint,
                    cursor: 'pointer',
                    transition: `all 0.18s ease`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.id}
                </button>
              ))}
            </nav>

            {/* Active terminal — full size */}
            <div style={{ marginBottom: '1.5rem' }}>
              <TerminalWindow
                key={active}
                section={activeSection}
                isActive
                onActivate={() => {}}
                compact={false}
              />
            </div>

            {/* Inactive terminals — compact grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {inactiveSections.map(s => (
                <TerminalWindow
                  key={s.id}
                  section={s}
                  isActive={false}
                  onActivate={() => setActive(s.id)}
                  compact
                />
              ))}
            </div>

            {/* System info strip */}
            <div style={{
              marginTop: '3rem',
              padding: '1rem 1.4rem',
              background: C.surface,
              border: `1px solid ${C.borderSub}`,
              borderRadius: R.lg,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <span style={{ ...T.tiny, color: C.faint }}>GeminiOS v2.0 · 5 modules loaded · uptime: ongoing</span>
              <span style={{ ...T.tiny, color: C.greenDim }}>status: running<Cursor color={C.green} /></span>
            </div>
          </main>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(51,255,102,0.2); color: #B8E8B8; }

        @keyframes osIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes osBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}