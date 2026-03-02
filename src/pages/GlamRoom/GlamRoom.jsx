import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Palette — restored from original screenshot ───────────────────────────────
const C = {
  bg:         '#FFF5F8',           // original blush background
  surface:    '#FFFFFF',           // white cards
  surfaceAlt: '#FFF0F5',           // very soft pink for alternating sections
  hotPink:    '#FF1493',           // original headline hot pink
  midPink:    '#FF69B4',           // original mid pink
  rose:       '#C2185B',           // rose accent
  border:     '#FFB6C1',           // original pink border
  borderHov:  '#FF69B4',           // hover border
  purple:     '#7B2FBE',           // magical girl purple
  gold:       '#D4AF37',
  text:       '#2A0A1A',           // original dark rose-black
  muted:      '#8a5a6a',           // original muted pink-brown
  faint:      'rgba(42,10,26,0.3)',
}

const R = { sm: '4px', md: '12px', lg: '18px' }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Type scale
// "Glam Room" title: Dancing Script (elegant cursive, not bubbly)
// Section headings: Georgia (original serif feel)
// Labels/tags: DM Sans (clean, modern)
// Body: DM Sans
const T = {
  label: { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' },
  h1:    { fontFamily: '"Dancing Script", cursive',    fontSize: 'clamp(3rem, 8vw, 6rem)',   fontWeight: 700, lineHeight: 1.0 },
  h2:    { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' },
  h3:    { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '1rem',   fontWeight: 700, lineHeight: 1.3 },
  body:  { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.9rem',  fontWeight: 400, lineHeight: 1.7 },
  small: { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:  { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em' },
  mono:  { fontFamily: '"DM Mono", monospace',         fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.06em' },
}

// ── Scroll fade-in ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Now Playing marquee ───────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Dress-Up Dzi', 'Starlight Academy', 'Romance Academy',
  'Enchanted Wardrobe', 'Fairy Wings', 'Glam Makeover Studio',
  'Style Showdown', 'Makeover Quest', 'Magical Girl RPG',
]

function NowPlayingMarquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      padding: '0.55rem 0',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(90deg, ${C.surface} 0%, transparent 8%, transparent 92%, ${C.surface} 100%)`,
      }} />
      <div style={{
        display: 'flex',
        animation: 'glamMarquee 28s linear infinite',
        width: 'max-content',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.8rem', whiteSpace: 'nowrap' }}>
            <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: i % 2 === 0 ? C.hotPink : C.purple, flexShrink: 0 }} />
            <span style={{ ...T.tiny, color: C.muted }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vibe filters ──────────────────────────────────────────────────────────────
const VIBES = [
  { id: 'all',      label: 'All Vibes',    color: C.hotPink },
  { id: 'dressup',  label: 'Dress-Up',     color: C.rose    },
  { id: 'magical',  label: 'Magical Girl', color: C.purple  },
  { id: 'romance',  label: 'Romance',      color: C.midPink },
  { id: 'makeover', label: 'Makeover',     color: C.rose    },
]

// ── Game data ─────────────────────────────────────────────────────────────────
const GAMES = [
  {
    id: 'dressup-dzi',
    name: 'Dress-Up Dzi',
    vibe: 'dressup', vibeLabel: 'Dress-Up',
    color: C.rose,
    status: 'coming', path: '/glamroom/dressupdzi',
    desc: 'Build outfits from a wardrobe of African prints, Y2K pieces, and haute couture. Mix eras, unlock new items, and style your character for every occasion.',
    tags: ['Casual', 'Creative', 'Afrofashion'], players: '1 Player',
  },
  {
    id: 'enchanted-wardrobe',
    name: 'Enchanted Wardrobe',
    vibe: 'dressup', vibeLabel: 'Dress-Up',
    color: C.purple,
    status: 'coming', path: '/glamroom/enchanted',
    desc: 'A magical wardrobe appears in your room. Each outfit you pick grants a different power. Collect all 50 looks to unlock the final transformation.',
    tags: ['Magical', 'Collectible', 'Fashion'], players: '1 Player',
  },
  {
    id: 'starlight-academy',
    name: 'Starlight Academy',
    vibe: 'magical', vibeLabel: 'Magical Girl',
    color: C.purple,
    status: 'coming', path: '/glamroom/starlight',
    desc: 'You have been accepted to a school for magical girls. Attend classes, unlock transformations, and battle shadow creatures threatening the academy.',
    tags: ['RPG', 'Adventure', 'Magical Girl'], players: '1 Player',
  },
  {
    id: 'fairy-wings',
    name: 'Fairy Wings',
    vibe: 'magical', vibeLabel: 'Magical Girl',
    color: C.midPink,
    status: 'coming', path: '/glamroom/fairywings',
    desc: 'Side-scrolling platformer with Winx Club energy. Fly through five realms, collect power crystals, and earn your ultimate fairy form.',
    tags: ['Platformer', 'Fantasy', 'Collectible'], players: '1 Player',
  },
  {
    id: 'romance-academy',
    name: 'Romance Academy',
    vibe: 'romance', vibeLabel: 'Romance',
    color: C.hotPink,
    status: 'coming', path: '/glamroom/romanceacademy',
    desc: 'Visual novel set at an arts boarding school. Four characters, branching storylines, and 12 different endings depending on your choices.',
    tags: ['Visual Novel', 'Story', 'Choice-Based'], players: '1 Player',
  },
  {
    id: 'glam-makeover',
    name: 'Glam Makeover Studio',
    vibe: 'makeover', vibeLabel: 'Makeover',
    color: C.rose,
    status: 'coming', path: '/glamroom/glamstudio',
    desc: 'Full makeover simulator. Skincare routine, foundation matching, eyeshadow blending, lip colours built for melanin. No grey undertones here.',
    tags: ['Simulation', 'Beauty', 'Creative'], players: '1 Player',
  },
  {
    id: 'style-showdown',
    name: 'Style Showdown',
    vibe: 'dressup', vibeLabel: 'Dress-Up',
    color: C.gold,
    status: 'coming', path: '/glamroom/styleshowdown',
    desc: 'Head-to-head fashion battle. Both players get the same brief — theme, colour, mood — and 90 seconds to build their look. The crowd decides.',
    tags: ['Multiplayer', 'Competitive', 'Fashion'], players: '2 Players',
  },
  {
    id: 'makeover-quest',
    name: 'Makeover Quest',
    vibe: 'makeover', vibeLabel: 'Makeover',
    color: C.rose,
    status: 'coming', path: '/glamroom/makeoverquest',
    desc: 'RPG where your weapons are beauty tools. Level up your skills, complete client quests, and build the most iconic salon in the kingdom.',
    tags: ['RPG', 'Simulation', 'Adventure'], players: '1 Player',
  },
]

// ── Featured spotlight ────────────────────────────────────────────────────────
const FEATURED = GAMES[2]

function FeaturedSpotlight() {
  const [hovered, setHovered] = useState(false)
  return (
    <FadeIn delay={0.1}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          background: C.surface,
          border: `2px solid ${hovered ? C.purple + '60' : C.border}`,
          borderRadius: R.lg,
          overflow: 'hidden',
          padding: '2.5rem',
          transition: `box-shadow 0.25s ${EASE}, border-color 0.2s ease`,
          boxShadow: hovered ? `0 12px 40px rgba(123,47,190,0.12)` : '0 2px 16px rgba(255,105,180,0.08)',
        }}
      >
        {/* Decorative arcs — top right */}
        <div aria-hidden style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', border: `1px solid rgba(123,47,190,0.1)`, pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: `1px solid rgba(123,47,190,0.12)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            {/* Label */}
            <div style={{ ...T.label, color: C.hotPink, marginBottom: '0.85rem' }}>
              Featured Game
            </div>

            {/* Vibe tag */}
            <span style={{
              ...T.tiny, color: C.purple,
              padding: '0.2rem 0.65rem',
              border: `1px solid ${C.purple}35`,
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '0.9rem',
              background: `rgba(123,47,190,0.06)`,
            }}>
              {FEATURED.vibeLabel}
            </span>

            <h2 style={{ ...T.h2, color: C.text, margin: '0 0 0.75rem' }}>{FEATURED.name}</h2>
            <p style={{ ...T.body, color: C.muted, margin: '0 0 1.4rem', maxWidth: 420 }}>{FEATURED.desc}</p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
              {FEATURED.tags.map(tag => (
                <span key={tag} style={{
                  ...T.tiny, color: C.muted,
                  padding: '0.2rem 0.55rem',
                  border: `1px solid ${C.border}`,
                  borderRadius: '20px',
                }}>{tag}</span>
              ))}
            </div>

            <div style={{ ...T.tiny, color: C.purple }}>In development →</div>
          </div>

          {/* Stat block */}
          <div style={{
            flexShrink: 0,
            padding: '1.3rem 1.6rem',
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: R.md,
            display: 'flex', flexDirection: 'column', gap: '1rem',
            minWidth: 150,
          }}>
            {[
              { label: 'Genre',   value: 'Magical Girl RPG' },
              { label: 'Players', value: FEATURED.players   },
              { label: 'Status',  value: 'Coming Soon'      },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ ...T.small, color: C.text, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

// ── Game card — white with pink borders, original aesthetic ───────────────────
function GameCard({ game, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.6rem',
        background: hovered ? `${game.color}08` : C.surface,
        border: `2px solid ${hovered ? game.color : C.border}`,
        borderRadius: R.lg,
        transition: `transform 0.25s ${EASE}, border-color 0.2s ease, background 0.2s ease, box-shadow 0.25s ${EASE}`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 32px ${game.color}20`
          : '0 2px 12px rgba(255,105,180,0.07)',
        animation: `glamCardIn 0.5s ${EASE} ${index * 55}ms both`,
        minHeight: 240,
        cursor: 'default',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
        <span style={{
          ...T.tiny, color: game.color,
          padding: '0.2rem 0.6rem',
          background: `${game.color}12`,
          border: `1px solid ${game.color}30`,
          borderRadius: '20px',
        }}>{game.vibeLabel}</span>
        <span style={{ ...T.tiny, color: C.faint }}>Coming Soon</span>
      </div>

      <h3 style={{
        ...T.h3,
        color: hovered ? game.color : C.text,
        margin: '0 0 0.6rem',
        transition: `color 0.2s ease`,
      }}>
        {game.name}
      </h3>

      <p style={{ ...T.small, color: C.muted, margin: '0 0 1rem', flexGrow: 1 }}>
        {game.desc}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
        {game.tags.map(tag => (
          <span key={tag} style={{
            ...T.tiny, color: C.muted,
            padding: '0.18rem 0.5rem',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
          }}>{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ ...T.tiny, color: C.faint }}>{game.players}</span>
        {hovered && (
          <span style={{ ...T.tiny, color: game.color, animation: `glamFadeIn 0.15s ${EASE}` }}>
            In development →
          </span>
        )}
      </div>

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: `opacity 0.25s ease`,
        borderRadius: '1px',
      }} />
    </div>
  )
}

// ── Main GlamRoom ─────────────────────────────────────────────────────────────
export default function GlamRoom() {
  const [activeVibe, setActiveVibe] = useState('all')
  const [searchVal, setSearchVal]   = useState('')

  const filtered = GAMES.filter(g => {
    const matchesVibe   = activeVibe === 'all' || g.vibe === activeVibe
    const matchesSearch = !searchVal.trim() ||
      g.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchVal.toLowerCase()))
    return matchesVibe && matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>

      {/* Soft background blobs — kept from original, toned down */}
      <div aria-hidden style={{ position: 'fixed', top: '-8%', right: '-4%', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,182,193,0.2), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden style={{ position: 'fixed', bottom: '12%', left: '-4%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,105,180,0.09), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 2rem' }}>

          {/* District badge — matches screenshot style */}
          <FadeIn>
            <div style={{
              display: 'inline-block',
              background: C.hotPink,
              color: '#fff',
              ...T.label,
              padding: '0.3rem 0.9rem',
              borderRadius: R.sm,
              marginBottom: '1.3rem',
            }}>
              District 02
            </div>
          </FadeIn>

          {/* Title — Dancing Script cursive */}
          <FadeIn delay={0.08}>
            <h1 style={{ ...T.h1, color: C.hotPink, margin: '0 0 0.5rem' }}>
              The Glam Room
            </h1>
          </FadeIn>

          <FadeIn delay={0.14}>
            <p style={{ ...T.mono, color: C.muted, margin: '0 0 2rem', letterSpacing: '0.06em' }}>
              dress-up · magical girl · romance · makeover · style
            </p>
          </FadeIn>

          {/* Intro card — white with pink border, matches original */}
          <FadeIn delay={0.2}>
            <div style={{
              background: C.surface,
              border: `2px solid ${C.border}`,
              borderRadius: R.lg,
              padding: '1.8rem 2rem',
              maxWidth: 600,
              boxShadow: '0 4px 20px rgba(255,105,180,0.08)',
              marginBottom: '0',
            }}>
              <p style={{ ...T.body, color: C.text, margin: 0, lineHeight: 1.8 }}>
                Dress-up games, magical girl adventures, romance stories, and makeover sims.
                Built for the girls, fairies, and anyone who wanted more pink on the internet.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{ marginTop: '2.5rem' }}>
          <NowPlayingMarquee />
        </div>

        {/* ── FEATURED ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 1.5rem' }}>
          <FadeIn>
            <h2 style={{ ...T.h2, color: C.hotPink, margin: '0 0 1.5rem' }}>
              Featured Game
            </h2>
          </FadeIn>
          <FeaturedSpotlight />
        </section>

        {/* ── ALL GAMES ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>
          <FadeIn>
            <h2 style={{ ...T.h2, color: C.hotPink, margin: '0 0 0.4rem' }}>
              All Games
            </h2>
            <p style={{ ...T.small, color: C.muted, margin: '0 0 1.8rem' }}>
              {GAMES.length} games planned across four categories — all in development.
            </p>
          </FadeIn>

          {/* Vibe filters + search */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
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
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: '20px',
                  color: C.text,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: `border-color 0.2s ease`,
                }}
                onFocus={e => e.target.style.borderColor = C.midPink}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {VIBES.map(v => {
                const active = activeVibe === v.id
                return (
                  <button key={v.id} onClick={() => setActiveVibe(v.id)} style={{
                    ...T.tiny,
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: `1px solid ${active ? v.color : C.border}`,
                    background: active ? `${v.color}15` : C.surface,
                    color: active ? v.color : C.muted,
                    cursor: 'pointer',
                    transition: `all 0.18s ease`,
                    boxShadow: active ? `0 2px 8px ${v.color}20` : 'none',
                  }}>
                    {v.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `2px solid ${C.border}`, borderRadius: R.lg, background: C.surface }}>
              <p style={{ ...T.body, color: C.muted }}>No games match &ldquo;{searchVal}&rdquo;</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem' }}>
              {filtered.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER NOTE ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
          <FadeIn>
            <div style={{
              padding: '2rem 2.5rem',
              background: C.surface,
              border: `2px solid ${C.border}`,
              borderRadius: R.lg,
              display: 'flex', gap: '2rem', alignItems: 'center',
              flexWrap: 'wrap', justifyContent: 'space-between',
              boxShadow: '0 2px 16px rgba(255,105,180,0.07)',
            }}>
              <div>
                <div style={{ ...T.label, color: C.hotPink, marginBottom: '0.5rem' }}>All in development</div>
                <p style={{ ...T.small, color: C.muted, maxWidth: 400, margin: 0 }}>
                  Every Glam Room game is built from scratch. No engines, pure code, pink energy, and a lot of creative ambition.
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: C.hotPink, lineHeight: 1 }}>
                  {GAMES.length}
                </div>
                <div style={{ ...T.tiny, color: C.muted, marginTop: '0.25rem' }}>games planned</div>
              </div>
            </div>
          </FadeIn>
        </section>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(255,20,147,0.15); color: #2A0A1A; }

        @keyframes glamCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glamFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glamMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}