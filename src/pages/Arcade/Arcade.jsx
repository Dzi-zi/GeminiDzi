import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Design tokens — shared across all district pages ──────────────────────────
const C = {
  bg:         '#0A0A14',
  gold:       '#D4AF37',
  rose:       '#C2185B',
  purple:     '#7B2FBE',
  green:      '#2E7D32',
  teal:       '#00BCD4',
  amber:      '#FF8F00',
  text:       '#F5F0E8',
  muted:      'rgba(245,240,232,0.5)',
  faint:      'rgba(245,240,232,0.18)',
  border:     'rgba(245,240,232,0.08)',
  goldBorder: 'rgba(212,175,55,0.18)',
}

// 3 border-radius values — used everywhere, nothing else
const R = { sm: '2px', md: '6px', lg: '14px' }

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Type scale — headings: Orbitron, body: DM Sans
const T = {
  label: { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em',  textTransform: 'uppercase' },
  h1:    { fontFamily: 'Orbitron, sans-serif',   fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.05 },
  h3:    { fontFamily: 'Orbitron, sans-serif',   fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.3 },
  body:  { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.92rem', fontWeight: 400, lineHeight: 1.7 },
  small: { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.6 },
  tiny:  { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.04em' },
}

const DIFF_COLOR = { Easy: C.green, Medium: C.amber, Hard: C.rose }

// ── Game data — no emojis, corrected descriptions ─────────────────────────────
const GAMES = [
  {
    name: 'World Runner',
    description: 'Side-scrolling platformer set across Lagos, Accra, Cairo, and beyond. Jump, dash, and fight through six distinct worlds with a fully custom character.',
    genre: 'Platformer',
    players: '1 Player',
    difficulty: 'Medium',
    color: C.gold,
    status: 'live',
    path: '/arcade/worldrunner',
    tags: ['Action', 'Adventure', 'Afrofuturist'],
  },
  {
    name: 'Ubuntu Quiz',
    description: 'African history, culture, and innovation across 10 categories. Fast-paced trivia that actually tests what you know.',
    genre: 'Trivia',
    players: '1–4 Players',
    difficulty: 'Easy',
    color: C.rose,
    status: 'live',
    path: '/arcade/quiz',
    tags: ['Trivia', 'Educational', 'Multiplayer'],
  },
  {
    name: 'Sankofa Cards',
    description: 'Strategic card game built on West African proverbs and Adinkra symbols. 21 cards, four types, one AI opponent — or pass and play with a friend.',
    genre: 'Card Game',
    players: '2 Players',
    difficulty: 'Hard',
    color: C.purple,
    status: 'live',
    path: '/arcade/sankofacards',
    tags: ['Strategy', 'Cards', 'Multiplayer'],
  },
  {
    name: 'Rhythm of the Drum',
    description: 'Traditional African rhythms turned into a note-hitting game. Build combos, raise the BPM, and unlock new drum patterns.',
    genre: 'Rhythm',
    players: '1 Player',
    difficulty: 'Easy',
    color: C.amber,
    status: 'live',
    path: '/arcade/rhythmbeats',
    tags: ['Music', 'Rhythm', 'Casual'],
  },
  {
    name: 'Savanna Sprint',
    description: 'Endless runner through the African savanna. Four playable animals, six obstacle types, and a storm closing in behind you.',
    genre: 'Endless Runner',
    players: '1 Player',
    difficulty: 'Easy',
    color: C.green,
    status: 'live',
    path: '/arcade/savanasprint',
    tags: ['Runner', 'Casual', 'Arcade'],
  },
  {
    name: 'Void Striker',
    description: 'Space shooter set in orbit above a futuristic Lagos. Wave-based combat with escalating enemy patterns and power-up combos.',
    genre: 'Shooter',
    players: '1 Player',
    difficulty: 'Hard',
    color: C.teal,
    status: 'live',
    path: '/arcade/voidstriker',
    tags: ['Shooter', 'Arcade', 'Afrofuturist'],
  },
  {
    name: 'Griots & Spirits',
    description: 'Narrative RPG powered by AI. You play as a West African griot whose spoken choices rewrite the world. Five chapters, four spirit companions, branching endings.',
    genre: 'RPG',
    players: '1 Player',
    difficulty: 'Medium',
    color: C.purple,
    status: 'live',
    path: '/arcade/griots',
    tags: ['RPG', 'Narrative', 'AI-Powered'],
  },
  {
    name: 'Mami Wata',
    description: 'Puzzle platformer across ten scrolling levels. Shift between the physical world and the spirit world to find the path and collect the offerings.',
    genre: 'Puzzle Platformer',
    players: '1 Player',
    difficulty: 'Medium',
    color: C.teal,
    status: 'live',
    path: '/arcade/mamiwata',
    tags: ['Puzzle', 'Platformer', 'Spiritual'],
  },
  {
    name: 'Kingdoms of Kush',
    description: 'Turn-based strategy set in ancient Nubia. Build armies, forge alliances, and expand your empire across the Nile valley.',
    genre: 'Strategy',
    players: '1–2 Players',
    difficulty: 'Hard',
    color: C.gold,
    status: 'coming',
    path: '/arcade/kush',
    tags: ['Strategy', 'Historical', 'Turn-Based'],
  },
]

const FILTERS = ['All', 'Easy', 'Medium', 'Hard']

// ── Game card ─────────────────────────────────────────────────────────────────
function GameCard({ game, index }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const isLive = game.status === 'live'

  return (
    <div
      role={isLive ? 'button' : undefined}
      tabIndex={isLive ? 0 : undefined}
      onClick={() => isLive && navigate(game.path)}
      onKeyDown={e => e.key === 'Enter' && isLive && navigate(game.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.6rem',
        cursor: isLive ? 'pointer' : 'default',
        opacity: isLive ? 1 : 0.45,
        // Staggered entrance
        animation: `cardIn 0.5s ${EASE} ${index * 55}ms both`,
        // Hover lift — max 4px, no scale
        transform: hovered && isLive ? 'translateY(-4px)' : 'translateY(0)',
        transition: `transform 0.25s ${EASE}, box-shadow 0.25s ${EASE}`,
        boxShadow: hovered && isLive ? '0 10px 32px rgba(0,0,0,0.3)' : 'none',
        // Min height so cards align in the grid
        minHeight: 280,
      }}
    >
      {/* Top row: index + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
        <span style={{ ...T.tiny, color: C.faint }}>{String(index + 1).padStart(2, '0')}</span>
        <span style={{
          ...T.tiny,
          color: isLive ? C.green : C.faint,
          padding: '0.18rem 0.55rem',
          border: `1px solid ${isLive ? C.green + '35' : C.border}`,
          borderRadius: R.sm,
        }}>
          {isLive ? 'Live' : 'Coming'}
        </span>
      </div>

      {/* Accent bar — widens on hover */}
      <div style={{
        width: hovered && isLive ? 36 : 20,
        height: 2,
        background: game.color,
        borderRadius: '1px',
        marginBottom: '0.9rem',
        transition: `width 0.3s ${EASE}`,
      }} />

      {/* Name */}
      <h3 style={{
        ...T.h3,
        color: hovered && isLive ? game.color : C.text,
        margin: '0 0 0.6rem',
        transition: `color 0.2s ease`,
      }}>
        {game.name}
      </h3>

      {/* Description */}
      <p style={{ ...T.small, color: C.muted, margin: '0 0 1.1rem', flexGrow: 1 }}>
        {game.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
        {game.tags.map(tag => (
          <span key={tag} style={{
            ...T.tiny,
            color: C.faint,
            padding: '0.18rem 0.5rem',
            border: `1px solid ${C.border}`,
            borderRadius: R.sm,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ ...T.tiny, color: C.faint }}>{game.genre}</span>
          <span style={{ ...T.tiny, color: C.faint }}>{game.players}</span>
        </div>
        <span style={{
          ...T.tiny,
          color: DIFF_COLOR[game.difficulty],
          padding: '0.15rem 0.5rem',
          border: `1px solid ${DIFF_COLOR[game.difficulty]}30`,
          borderRadius: R.sm,
        }}>
          {game.difficulty}
        </span>
      </div>

      {/* Hover CTA */}
      {hovered && isLive && (
        <div style={{
          ...T.tiny,
          color: game.color,
          marginTop: '0.75rem',
          letterSpacing: '0.12em',
          animation: `fadeIn 0.15s ${EASE}`,
        }}>
          Play now →
        </div>
      )}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '12%', right: '12%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
        opacity: hovered && isLive ? 1 : 0,
        transition: `opacity 0.25s ease`,
      }} />
    </div>
  )
}

// ── Arcade page ───────────────────────────────────────────────────────────────
export default function Arcade() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchVal, setSearchVal]       = useState('')

  const filtered = GAMES.filter(g => {
    const matchesDiff   = activeFilter === 'All' || g.difficulty === activeFilter
    const matchesSearch = !searchVal.trim() ||
      g.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchVal.toLowerCase()))
    return matchesDiff && matchesSearch
  })

  const liveCount   = GAMES.filter(g => g.status === 'live').length
  const comingCount = GAMES.filter(g => g.status === 'coming').length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: '3.5rem' }}>

          {/* Eyebrow */}
          <div style={{
            ...T.label,
            color: C.gold,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.2rem',
          }}>
            <span style={{ display: 'block', width: 24, height: 1, background: C.gold }} />
            District 01
          </div>

          {/* Title */}
          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 1rem' }}>
            The <span style={{ color: C.gold }}>Arcade</span>
          </h1>

          {/* Subtitle — DM Sans body, not Orbitron */}
          <p style={{ ...T.body, color: C.muted, maxWidth: '500px', margin: '0 0 2rem' }}>
            Nine original games built without a game engine. Each one rooted in African culture, history, and mythology.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',       value: GAMES.length, color: C.gold   },
              { label: 'Live now',    value: liveCount,    color: C.green  },
              { label: 'Coming soon', value: comingCount,  color: C.purple },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: '0.65rem 1.4rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${C.border}`,
                // First and last get rounded corners
                borderRadius: i === 0 ? `${R.md} 0 0 ${R.md}` : i === 2 ? `0 ${R.md} ${R.md} 0` : '0',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.55rem',
              }}>
                <span style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color,
                  lineHeight: 1,
                }}>
                  {value}
                </span>
                <span style={{ ...T.tiny, color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Search + filter ── */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}>
              <circle cx="6.5" cy="6.5" r="5" stroke={C.text} strokeWidth="1.6"/>
              <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke={C.text} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search games…"
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.3rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: R.md,
                color: C.text,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: `border-color 0.2s ease`,
              }}
              onFocus={e  => e.target.style.borderColor = C.goldBorder}
              onBlur={e   => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Difficulty filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {FILTERS.map(f => {
              const active = activeFilter === f
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    ...T.tiny,
                    padding: '0.5rem 0.95rem',
                    borderRadius: R.md,
                    border: `1px solid ${active ? C.goldBorder : C.border}`,
                    background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color: active ? C.gold : C.muted,
                    cursor: 'pointer',
                    transition: `all 0.18s ease`,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.goldBorder }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Game grid ── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            border: `1px solid ${C.border}`,
            borderRadius: R.lg,
          }}>
            <p style={{ ...T.body, color: C.faint }}>
              No games match &ldquo;{searchVal}&rdquo;
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            // Hairline grid — cards sit in cells separated by 1px borders
            gap: '0',
            background: C.border,
            border: `1px solid ${C.border}`,
            borderRadius: R.lg,
            overflow: 'hidden',
          }}>
            {filtered.map((game, i) => (
              <div key={game.name} style={{ background: C.bg }}>
                <GameCard game={game} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        <div style={{
          marginTop: '3.5rem',
          padding: '2rem 2.5rem',
          border: `1px solid ${C.goldBorder}`,
          borderRadius: R.lg,
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ ...T.label, color: C.gold, marginBottom: '0.5rem' }}>More in progress</div>
            <p style={{ ...T.small, color: C.muted, maxWidth: '420px', margin: 0 }}>
              New games drop regularly. Every game is built without a game engine — pure React, Canvas, and a lot of patience.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '2rem', fontWeight: 900, color: C.gold, lineHeight: 1 }}>
              {liveCount}
            </div>
            <div style={{ ...T.tiny, color: C.faint, marginTop: '0.25rem' }}>games live</div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(212,175,55,0.25); color: #F5F0E8; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 640px) {
          .arcade-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}