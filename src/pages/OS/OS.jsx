import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    id: 'principles',
    cmd: 'cat principles.txt',
    title: 'How I Think',
    icon: '🧠',
    color: '#4ECDC4',
    content: [
      { label: 'First principles', text: 'I break things down to their roots before I build them back up. If I can\'t explain why something works, I don\'t use it.' },
      { label: 'Make it, then make it good', text: 'A finished ugly thing beats a beautiful unfinished one. Ship first. Refine forever.' },
      { label: 'Curiosity over certainty', text: 'The most interesting question is always the one I haven\'t thought to ask yet.' },
      { label: 'Context is everything', text: 'The right answer in one situation is the wrong answer in another. I resist universal rules.' },
      { label: 'Rest is part of the work', text: 'Downtime is not lost time. The brain keeps working. I\'ve learned to trust the pause.' },
    ],
  },
  {
    id: 'stack',
    cmd: 'ls tools/',
    title: 'My Stack',
    icon: '🛠',
    color: '#D4AF37',
    content: [
      { label: 'Languages', text: 'JavaScript · Python · HTML/CSS · a little Rust when I\'m feeling brave' },
      { label: 'Frontend', text: 'React · Vite · Tailwind · Framer Motion · raw Canvas' },
      { label: 'Design', text: 'Figma · Illustrator · pen and paper (still the best tool)' },
      { label: 'Music', text: 'Ableton Live · FL Studio · a MIDI keyboard that deserves better' },
      { label: 'Thinking', text: 'Notion · physical notebooks · long walks · shower thoughts' },
      { label: 'AI', text: 'Claude · ChatGPT · used as a thinking partner, never a replacement' },
    ],
  },
  {
    id: 'process',
    cmd: 'open process.md',
    title: 'How I Work',
    icon: '⚙️',
    color: '#A78BFA',
    content: [
      { label: '01 — Understand', text: 'I spend more time on the problem than on the solution. Most bad solutions come from good answers to the wrong question.' },
      { label: '02 — Sketch', text: 'Always analogue first. Paper, pencil, bad drawings that only I understand. The screen comes later.' },
      { label: '03 — Build rough', text: 'I make it work before I make it pretty. Ugly prototypes that do the right thing beat beautiful ones that don\'t.' },
      { label: '04 — Sit with it', text: 'I leave work alone for at least a day before I call it done. Fresh eyes catch what familiar eyes miss.' },
      { label: '05 — Ship and learn', text: 'Real feedback from real people beats my own assumptions every single time. I ship to learn, not to finish.' },
    ],
  },
  {
    id: 'values',
    cmd: 'grep -r values .',
    title: 'What I Value',
    icon: '✦',
    color: '#FF8B94',
    content: [
      { label: 'Craft', text: 'The details that no one notices when they\'re right and everyone notices when they\'re wrong. I care about those.' },
      { label: 'Honesty', text: 'In work and in people. I\'d rather hear a hard truth now than a comfortable lie later.' },
      { label: 'Depth', text: 'I\'d rather understand one thing fully than know a little about many things. Surface-level fluency bores me.' },
      { label: 'Community', text: 'I believe in building things that lift others, not just myself. The rising tide idea. I take it seriously.' },
      { label: 'Joy', text: 'If something doesn\'t feel worth making, I don\'t make it. Life is too short for joyless work.' },
    ],
  },
  {
    id: 'currently',
    cmd: 'tail -f now.log',
    title: 'Right Now',
    icon: '📍',
    color: '#6AAF7A',
    content: [
      { label: 'Building', text: 'DzifaVerse — this very thing you\'re exploring right now. District by district.' },
      { label: 'Learning', text: 'Three.js, Rust fundamentals, and the history of African architecture.' },
      { label: 'Reading', text: 'Kindred by Octavia Butler · The Design of Everyday Things · old Wired magazines from 1998.' },
      { label: 'Listening', text: 'Amaarae · Femi Kuti · Floating Points · whatever I feel at 2am.' },
      { label: 'Thinking about', text: 'What Afrofuturism means for the web. What African design sensibility looks like in digital spaces.' },
    ],
  },
]

function Terminal({ section, isActive, onActivate }) {
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isActive) { setTyped(''); setDone(false); setVisible(false); return }
    let i = 0
    setTyped('')
    setDone(false)
    setVisible(false)
    const interval = setInterval(() => {
      i++
      setTyped(section.cmd.slice(0, i))
      if (i >= section.cmd.length) { clearInterval(interval); setTimeout(() => { setDone(true); setTimeout(() => setVisible(true), 100) }, 300) }
    }, 38)
    return () => clearInterval(interval)
  }, [isActive, section.cmd])

  return (
    <div style={{
      background: '#0A0F0A', border: `2px solid ${isActive ? section.color : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '12px', overflow: 'hidden',
      boxShadow: isActive ? `0 8px 32px ${section.color}18` : '0 2px 8px rgba(0,0,0,0.3)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      animation: 'fadeUp 0.35s ease both',
    }}>
      {/* Terminal chrome */}
      <div style={{ background: '#111811', padding: '0.6rem 0.9rem', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        onClick={onActivate}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['#E85870', '#D4AF37', '#6AAF7A'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c + (isActive ? '' : '50') }} />)}
        </div>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginLeft: '0.4rem', flex: 1 }}>dzifa@universe: ~</span>
        <span style={{ fontSize: '0.9rem' }}>{section.icon}</span>
      </div>

      {/* Command line */}
      <div style={{ padding: '0.9rem 1rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: section.color, flexShrink: 0 }}>❯</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#A8D8A8' }}>
            {isActive ? typed : section.cmd}
            {isActive && !done && <span style={{ animation: 'blink 0.9s step-end infinite', borderRight: `2px solid ${section.color}` }}>&nbsp;</span>}
          </span>
        </div>
      </div>

      {/* Output */}
      <div style={{ padding: '0.8rem 1rem 1rem', minHeight: '120px' }}>
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: section.color, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
          // {section.title}
        </div>
        {(visible || !isActive) && section.content.map((item, i) => (
          <div key={i} style={{ marginBottom: '0.75rem', animation: visible ? `fadeUp 0.25s ease ${i * 0.05}s both` : 'none', opacity: !isActive ? 0.5 : 1 }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: section.color, display: 'block', marginBottom: '0.15rem' }}>{item.label}</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: '#A8C8A8', lineHeight: 1.6, display: 'block' }}>{item.text}</span>
          </div>
        ))}
        {isActive && !visible && done && (
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: 'rgba(168,216,168,0.4)' }}>loading...</div>
        )}
        {!isActive && (
          <div style={{ marginTop: '0.5rem', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', cursor: 'pointer' }} onClick={onActivate}>
            click to run ↵
          </div>
        )}
      </div>
    </div>
  )
}

export default function OS() {
  const [active, setActive] = useState('principles')
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState([])

  const BOOT = [
    'initialising DzifaOS v2.0...',
    'loading core modules... ✓',
    'mounting values/ ... ✓',
    'attaching tools/ ... ✓',
    'syncing now.log ... ✓',
    'system ready.',
  ]

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      setBootLines(BOOT.slice(0, i + 1))
      i++
      if (i >= BOOT.length) { clearInterval(iv); setTimeout(() => setBootDone(true), 500) }
    }, 220)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#060D06', paddingTop: '80px' }}>

      {/* ── Header ── */}
      <div style={{ padding: '3rem 1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(78,205,196,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#4ECDC4' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#4ECDC4' }}>the district</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, color: '#A8D8A8', margin: '0 0 0.5rem', lineHeight: 1, letterSpacing: '-0.03em' }}>
            The OS
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'rgba(168,216,168,0.45)', maxWidth: '460px', lineHeight: 1.6, margin: '0 0 1.5rem', fontStyle: 'italic' }}>
            How I think, work, build and live. A personal README.
          </p>

          {/* Boot sequence */}
          {!bootDone && (
            <div style={{ padding: '1rem', background: '#0A0F0A', border: '1px solid rgba(78,205,196,0.2)', borderRadius: '8px', maxWidth: '360px' }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: i === bootLines.length - 1 ? '#4ECDC4' : 'rgba(168,216,168,0.5)', marginBottom: '0.15rem' }}>{line}</div>
              ))}
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: '#4ECDC4', animation: 'blink 0.9s step-end infinite', borderRight: '2px solid #4ECDC4' }}>&nbsp;</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Terminal grid ── */}
      {bootDone && (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
          {/* Section nav */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer',
                  background: active === s.id ? s.color + '20' : 'transparent',
                  border: `2px solid ${active === s.id ? s.color : 'rgba(255,255,255,0.08)'}`,
                  color: active === s.id ? s.color : 'rgba(255,255,255,0.3)',
                  fontFamily: '"Courier New", monospace', fontSize: '0.68rem',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                <span>{s.icon}</span> {s.id}
              </button>
            ))}
          </div>

          {/* Active terminal big */}
          <div style={{ marginBottom: '1.5rem' }}>
            {SECTIONS.filter(s => s.id === active).map(s => (
              <Terminal key={s.id} section={s} isActive={true} onActivate={() => {}} />
            ))}
          </div>

          {/* Other terminals small */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem' }}>
            {SECTIONS.filter(s => s.id !== active).map(s => (
              <Terminal key={s.id} section={s} isActive={false} onActivate={() => setActive(s.id)} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}