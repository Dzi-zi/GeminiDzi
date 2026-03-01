import { useState } from 'react'
import { Link } from 'react-router-dom'

const PUZZLE_GAMES = [
  {
    id: 'logic-grid',
    title: 'Logic Grid',
    subtitle: 'deductive reasoning',
    desc: 'Solve classic logic puzzles using a grid of clues. Who owns the fish? Who drinks the water?',
    icon: '⬛',
    difficulty: 'medium',
    tag: 'logic',
    status: 'coming',
    color: '#5B9BD5',
  },
  {
    id: 'sequence',
    title: 'Next in Line',
    subtitle: 'pattern recognition',
    desc: 'What comes next? Spot the rule hiding inside number, shape and word sequences.',
    icon: '🔢',
    difficulty: 'easy',
    tag: 'patterns',
    status: 'coming',
    color: '#6AAF7A',
  },
  {
    id: 'cipher',
    title: 'Cipher Room',
    subtitle: 'cryptography',
    desc: 'Decode encrypted messages using Caesar shifts, substitution ciphers and frequency analysis.',
    icon: '🔐',
    difficulty: 'hard',
    tag: 'crypto',
    status: 'coming',
    color: '#D4AF37',
  },
  {
    id: 'memory',
    title: 'Memory Palace',
    subtitle: 'spatial memory',
    desc: 'Study a room full of objects. They move. You find what changed. Against the clock.',
    icon: '🏛',
    difficulty: 'medium',
    tag: 'memory',
    status: 'coming',
    color: '#A78BFA',
  },
  {
    id: 'word',
    title: 'Word Weave',
    subtitle: 'linguistics',
    desc: 'Connect words by hidden relationships — opposites, homophones, hidden words inside words.',
    icon: '📖',
    difficulty: 'easy',
    tag: 'language',
    status: 'coming',
    color: '#FF8B94',
  },
  {
    id: 'nonogram',
    title: 'Nonogram',
    subtitle: 'grid deduction',
    desc: 'Fill a grid using row and column clues to reveal a hidden picture. Satisfying and addictive.',
    icon: '🖼',
    difficulty: 'hard',
    tag: 'visual',
    status: 'coming',
    color: '#4ECDC4',
  },
]

const MYSTERY_GAMES = [
  {
    id: 'the-last-guest',
    title: 'The Last Guest',
    subtitle: 'chapter one',
    desc: 'A dinner party. Six guests. One disappeared before midnight. Read the statements, spot the lie, name the culprit.',
    icon: '🕯',
    difficulty: 'medium',
    tag: 'mystery',
    status: 'coming',
    color: '#E8758A',
    chapters: 3,
    teaser: 'Someone at the table is not who they say they are.',
  },
  {
    id: 'dead-letters',
    title: 'Dead Letters',
    subtitle: 'postal inspector',
    desc: 'A series of strange letters, all addressed to people who no longer exist. Read them in order. Find the pattern.',
    icon: '✉️',
    difficulty: 'hard',
    tag: 'detective',
    status: 'coming',
    color: '#D4AF37',
    chapters: 5,
    teaser: 'Every postmark tells a story. Not all stories end well.',
  },
  {
    id: 'village-of-echoes',
    title: 'Village of Echoes',
    subtitle: 'point and explore',
    desc: 'A small village. Strange events every night for seven nights. Talk to residents, collect clues, solve the mystery.',
    icon: '🌲',
    difficulty: 'hard',
    tag: 'adventure',
    status: 'coming',
    color: '#6AAF7A',
    chapters: 7,
    teaser: 'The villagers all remember differently. Someone is lying.',
  },
  {
    id: 'exhibit-b',
    title: 'Exhibit B',
    subtitle: 'crime scene analysis',
    desc: 'You are given a crime scene photograph. Study every detail. Answer the detective\'s questions. Nothing is accidental.',
    icon: '🔍',
    difficulty: 'medium',
    tag: 'investigation',
    status: 'coming',
    color: '#FF6B35',
    chapters: 4,
    teaser: 'The answer is already in front of you.',
  },
  {
    id: 'the-cartographer',
    title: 'The Cartographer',
    subtitle: 'map mystery',
    desc: 'An old map surfaces at an estate auction. Hidden within it: coordinates, symbols, a trail of breadcrumbs across three centuries.',
    icon: '🗺',
    difficulty: 'hard',
    tag: 'puzzle',
    status: 'coming',
    color: '#A78BFA',
    chapters: 6,
    teaser: 'The map was never meant to be found.',
  },
]

const DIFF_COLORS = { easy: '#6AAF7A', medium: '#D4AF37', hard: '#E8758A' }

function PuzzleCard({ game, index }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `rgba(${game.color === '#5B9BD5' ? '91,155,213' : game.color === '#6AAF7A' ? '106,175,122' : game.color === '#D4AF37' ? '212,175,55' : game.color === '#A78BFA' ? '167,139,250' : game.color === '#FF8B94' ? '255,139,148' : '78,205,196'},0.08)` : 'rgba(255,255,255,0.03)',
        border: `2px solid ${hov ? game.color + '50' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '14px', padding: '1.3rem',
        cursor: 'default', transition: 'all 0.2s ease',
        animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Corner fold */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '28px', height: '28px', background: `linear-gradient(225deg, ${game.color}30 50%, transparent 50%)` }} />

      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{game.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>{game.title}</h3>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', fontWeight: 700, color: DIFF_COLORS[game.difficulty], background: DIFF_COLORS[game.difficulty] + '18', padding: '0.15rem 0.5rem', borderRadius: '20px', flexShrink: 0, marginLeft: '0.5rem' }}>{game.difficulty}</span>
          </div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: game.color, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{game.tag}</div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: 'rgba(240,237,232,0.55)', margin: '0 0 0.8rem', lineHeight: 1.55 }}>{game.desc}</p>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>coming soon</span>
        </div>
      </div>
    </div>
  )
}

function MysteryCard({ game, index }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `2px solid ${hov ? game.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '14px', padding: '1.4rem',
        cursor: 'default', transition: 'all 0.2s ease',
        animation: `fadeUp 0.4s ease ${index * 0.08}s both`,
        position: 'relative',
      }}
    >
      {/* Case number */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
        CASE #{String(index + 1).padStart(3, '0')}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.7rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{game.icon}</span>
        <div>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>{game.title}</h3>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: game.color, letterSpacing: '0.06em' }}>{game.subtitle} · {game.chapters} chapters</span>
        </div>
      </div>

      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: 'rgba(240,237,232,0.55)', margin: '0 0 0.9rem', lineHeight: 1.6 }}>{game.desc}</p>

      {/* Teaser quote */}
      <div style={{ padding: '0.6rem 0.9rem', background: game.color + '10', borderLeft: `3px solid ${game.color}`, borderRadius: '0 8px 8px 0', marginBottom: '0.9rem' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: game.color, margin: 0, fontStyle: 'italic' }}>"{game.teaser}"</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: DIFF_COLORS[game.difficulty], background: DIFF_COLORS[game.difficulty] + '18', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{game.difficulty}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{game.tag}</span>
        </div>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>coming soon</span>
      </div>
    </div>
  )
}

export default function MindGames() {
  const [wing, setWing] = useState('mystery')

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', paddingTop: '80px' }}>

      {/* ── Atmospheric header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '3rem 1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Background texture dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        {/* Corner accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle at top right, rgba(232,117,138,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#E8758A' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#E8758A' }}>the district</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.5rem', lineHeight: 1, letterSpacing: '-0.03em' }}>
            Mind Games
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'rgba(240,237,232,0.45)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 1.8rem', fontStyle: 'italic' }}>
            Puzzles that make you think. Mysteries that make you feel. Challenges that refuse to let go.
          </p>

          {/* Wing tabs */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px', width: 'fit-content', border: '2px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'mystery', label: '🕵️ Mystery Files', count: MYSTERY_GAMES.length },
              { id: 'puzzle',  label: '🧩 Puzzle Room',   count: PUZZLE_GAMES.length  },
            ].map(tab => (
              <button key={tab.id} onClick={() => setWing(tab.id)}
                style={{
                  padding: '0.55rem 1.2rem', borderRadius: '7px', cursor: 'pointer', border: 'none',
                  background: wing === tab.id ? (tab.id === 'mystery' ? '#E8758A' : '#5B9BD5') : 'transparent',
                  color: wing === tab.id ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: wing === tab.id ? 700 : 400,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                {tab.label}
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', background: wing === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

        {wing === 'mystery' && (
          <>
            <div style={{ marginBottom: '1.8rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.3rem' }}>The Mystery Files</h2>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: 'rgba(240,237,232,0.3)', margin: 0, letterSpacing: '0.04em' }}>story-driven · detective · investigate · solve</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
              {MYSTERY_GAMES.map((g, i) => <MysteryCard key={g.id} game={g} index={i} />)}
            </div>
          </>
        )}

        {wing === 'puzzle' && (
          <>
            <div style={{ marginBottom: '1.8rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.3rem' }}>The Puzzle Room</h2>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: 'rgba(240,237,232,0.3)', margin: 0, letterSpacing: '0.04em' }}>logic · patterns · language · memory · deduction</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {PUZZLE_GAMES.map((g, i) => <PuzzleCard key={g.id} game={g} index={i} />)}
            </div>
          </>
        )}

        {/* Bottom teaser */}
        <div style={{ marginTop: '3rem', padding: '1.8rem', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '14px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'rgba(240,237,232,0.3)', margin: '0 0 0.4rem', fontStyle: 'italic' }}>
            "The game is afoot."
          </p>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: 'rgba(240,237,232,0.18)', margin: 0, letterSpacing: '0.1em' }}>
            GAMES COMING SOON · CHECK BACK OFTEN
          </p>
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