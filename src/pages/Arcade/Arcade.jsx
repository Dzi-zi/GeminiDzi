import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GAMES = [
  {
    emoji: '🌍',
    name: 'Platformer',
    description: 'A side-scrolling platformer set across places all over the world. Jump, dash, and fight through worlds.',
    genre: 'Platformer',
    players: '1 Player',
    difficulty: 'Medium',
    color: '#D4AF37',
    status: 'coming',
    path: '/arcade/platformer',
    tags: ['Action', 'Adventure', 'Futurist'],
  },
  {
    emoji: '🧠',
    name: 'Quiz',
    description: 'How much do you know about African history, culture, and innovation? Test your knowledge across 10 categories in this fast-paced trivia game.',
    genre: 'Trivia',
    players: '1-4 Players',
    difficulty: 'Easy',
    color: '#C2185B',
    status: 'live',
    path: '/arcade/quiz',
    tags: ['Trivia', 'Educational', 'Multiplayer'],
  },
  {
    emoji: '🃏',
    name: 'Sankofa Cards',
    description: 'A strategic card game inspired by West African proverbs and symbols. Build your hand, outthink your opponent, and claim victory.',
    genre: 'Card Game',
    players: '2 Players',
    difficulty: 'Hard',
    color: '#7B2FBE',
    status: 'coming',
    path: '/arcade/sankofacards',
    tags: ['Strategy', 'Cards', 'Multiplayer'],
  },
  {
    emoji: '🎵',
    name: 'Rhythm of the Drum',
    description: 'Follow the beat of traditional African rhythms in this addictive music game. Hit the notes, build combos, and unlock new drum patterns.',
    genre: 'Rhythm',
    players: '1 Player',
    difficulty: 'Easy',
    color: '#FF8F00',
    status: 'live',
    path: '/arcade/rhythmbeats',
    tags: ['Music', 'Rhythm', 'Casual'],
  },
  {
    emoji: '🐆',
    name: 'Savanna Sprint',
    description: 'An endless runner through the African savanna. Dodge obstacles, collect power-ups, and outrun the storm across stunning procedural landscapes.',
    genre: 'Endless Runner',
    players: '1 Player',
    difficulty: 'Easy',
    color: '#2E7D32',
    status: 'coming',
    path: '/arcade/savanasprint',
    tags: ['Runner', 'Casual', 'Arcade'],
  },
  {
    emoji: '🏙',
    name: 'Void Striker',
    description: 'A city-building strategy game set in a futuristic Lagos. Manage resources, build districts, and lead your megacity into the next century.',
    genre: 'Strategy',
    players: '1 Player',
    difficulty: 'Hard',
    color: '#00BCD4',
    status: 'live',
    path: '/arcade/voidstriker',
    tags: ['Strategy', 'City Builder', 'Afrofuturist'],
  },
  {
    emoji: '🔮',
    name: 'Griots & Spirits',
    description: 'A narrative RPG where you play as a griot — a West African storyteller — whose words literally shape reality. Every choice rewrites the world.',
    genre: 'RPG',
    players: '1 Player',
    difficulty: 'Medium',
    color: '#7B2FBE',
    status: 'coming',
    path: '/arcade/griots',
    tags: ['RPG', 'Narrative', 'Fantasy'],
  },
  {
    emoji: '⚔️',
    name: 'Kingdoms of Kush',
    description: 'Turn-based strategy inspired by the ancient Kingdom of Kush. Build armies, forge alliances, and expand your empire across the Nile.',
    genre: 'Turn-Based Strategy',
    players: '1-2 Players',
    difficulty: 'Hard',
    color: '#D4AF37',
    status: 'coming',
    path: '/arcade/kush',
    tags: ['Strategy', 'Historical', 'Turn-Based'],
  },
  {
    emoji: '🌊',
    name: 'Mami Wata',
    description: 'A puzzle platformer inspired by the water spirit Mami Wata. Navigate between the spirit world and the physical world to solve each level.',
    genre: 'Puzzle Platformer',
    players: '1 Player',
    difficulty: 'Medium',
    color: '#00BCD4',
    status: 'coming',
    path: '/arcade/mamiwata',
    tags: ['Puzzle', 'Platformer', 'Spiritual'],
  },
]

const GENRES = ['All', 'Platformer', 'Trivia', 'Card Game', 'Rhythm', 'Endless Runner', 'Strategy', 'RPG', 'Puzzle Platformer']

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, index }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const isLive = game.status === 'live'

  const difficultyColor = {
    Easy: '#2E7D32',
    Medium: '#FF8F00',
    Hard: '#C2185B',
  }[game.difficulty]

  return (
    <div
      onClick={() => isLive && navigate(game.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '1.8rem',
        borderRadius: '18px',
        border: `1px solid ${hovered ? game.color + '50' : 'rgba(255,255,255,0.07)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${game.color}12, ${game.color}05, rgba(10,10,20,0.9))`
          : 'rgba(255,255,255,0.03)',
        cursor: isLive ? 'pointer' : 'default',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 50px ${game.color}20, 0 0 0 1px ${game.color}20` : 'none',
        animation: `fadeSlideIn 0.5s ease ${index * 0.07}s both`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontSize: '2.8rem',
          filter: hovered ? `drop-shadow(0 0 16px ${game.color})` : 'none',
          transition: 'filter 0.3s',
          transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1)',
          display: 'inline-block',
          transition: 'all 0.3s',
        }}>
          {game.emoji}
        </div>

        {/* Status badge */}
        <div style={{
          padding: '0.25rem 0.7rem',
          borderRadius: '20px',
          background: isLive ? 'rgba(46,125,50,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isLive ? 'rgba(46,125,50,0.5)' : 'rgba(255,255,255,0.1)'}`,
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.55rem',
          letterSpacing: '0.1em',
          color: isLive ? '#4CAF50' : 'rgba(245,240,232,0.3)',
          whiteSpace: 'nowrap',
        }}>
          {isLive ? '● LIVE' : 'COMING SOON'}
        </div>
      </div>

      {/* Game name */}
      <h3 style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: hovered ? game.color : '#F5F0E8',
        letterSpacing: '0.03em',
        margin: 0,
        lineHeight: 1.3,
        transition: 'color 0.3s',
      }}>
        {game.name}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.82rem',
        color: 'rgba(245,240,232,0.5)',
        lineHeight: 1.6,
        margin: 0,
        flex: 1,
      }}>
        {game.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {game.tags.map(tag => (
          <span key={tag} style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '12px',
            background: `${game.color}15`,
            border: `1px solid ${game.color}25`,
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.68rem',
            color: 'rgba(245,240,232,0.5)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom meta row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.6rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.35)' }}>
            🎮 {game.genre}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.35)' }}>
            👥 {game.players}
          </span>
        </div>
        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: difficultyColor,
          padding: '0.15rem 0.5rem',
          borderRadius: '10px',
          background: `${difficultyColor}18`,
          border: `1px solid ${difficultyColor}30`,
        }}>
          {game.difficulty}
        </span>
      </div>

      {/* Hover CTA */}
      {hovered && isLive && (
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color: game.color,
          animation: 'fadeIn 0.2s ease',
        }}>
          PLAY NOW →
        </div>
      )}

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', right: '15%',
        height: '1px',
        background: hovered
          ? `linear-gradient(90deg, transparent, ${game.color}, transparent)`
          : 'transparent',
        transition: 'background 0.3s',
      }} />
    </div>
  )
}

// ── Main Arcade Page ──────────────────────────────────────────────────────────
export default function Arcade() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [searchVal, setSearchVal]     = useState('')

  const filtered = GAMES.filter(g => {
    const matchesGenre  = activeGenre === 'All' || g.genre === activeGenre
    const matchesSearch = g.name.toLowerCase().includes(searchVal.toLowerCase()) ||
                          g.description.toLowerCase().includes(searchVal.toLowerCase())
    return matchesGenre && matchesSearch
  })

  const liveCount    = GAMES.filter(g => g.status === 'live').length
  const comingCount  = GAMES.filter(g => g.status === 'coming').length

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0A14 0%, #0D0820 50%, #0A0A14 100%)',
      paddingTop: '80px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.5em', color: 'rgba(212,175,55,0.5)', marginBottom: '0.75rem' }}>
            ✦ DISTRICT ✦
          </p>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#D4AF37',
            textShadow: '0 0 40px rgba(212,175,55,0.4)',
            margin: '0 0 0.5rem',
          }}>
            🎮 The Arcade
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(245,240,232,0.5)',
            maxWidth: '540px',
            lineHeight: 1.7,
          }}>
            Afrofuturist games built from scratch. Each game celebrates African culture, history, and imagination through interactive storytelling and gameplay.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Games', value: GAMES.length, color: '#D4AF37' },
              { label: 'Live Now',    value: liveCount,    color: '#4CAF50' },
              { label: 'Coming Soon', value: comingCount,  color: '#7B2FBE' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '0.6rem 1.2rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}25`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.2rem', fontWeight: 900, color }}>
                  {value}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search & Filter ── */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.4 }}>🔍</span>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search games..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '10px',
                color: '#F5F0E8',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)' }}
            />
          </div>

          {/* Genre filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveGenre(filter)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: `1px solid ${activeGenre === filter ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background: activeGenre === filter ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: activeGenre === filter ? '#D4AF37' : 'rgba(245,240,232,0.45)',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '0.62rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* ── Games Grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(245,240,232,0.3)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            No games found for "{searchVal}"
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filtered.map((game, i) => (
              <GameCard key={game.name} game={game} index={i} />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div style={{
          marginTop: '4rem',
          padding: '2.5rem',
          background: 'rgba(212,175,55,0.05)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(212,175,55,0.5)', marginBottom: '0.75rem' }}>
            ✦ MORE COMING ✦
          </p>
          <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.2rem', color: '#D4AF37', marginBottom: '0.75rem' }}>
            The Arcade is growing
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(245,240,232,0.45)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            New games drop regularly. Every game is built from scratch — no game engines, just pure code, creativity, and culture.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}