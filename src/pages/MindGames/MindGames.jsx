import { useState } from 'react'

// ── Mind Games District Identity ──────────────────────────────────────────────
// Concept: A detective's case file. Aged paper. Red string. Classified stamps.
// Background: Near-black ink (#0D0B08) — warm dark, not cold cyberpunk
// Cards: Warm parchment surface (#1A1610) against the ink background
// Display font: "Special Elite" — typewriter / detective case file energy
// Body font: DM Mono for that case-file document feel
// Accent: Faded red (#C0392B) like a RED stamp or red string pinboard
// Secondary: Aged gold (#C8A96E) like old paper / evidence tags
// No generic glows — torn-paper corner folds, dashed borders, stamp aesthetics

const C = {
  bg:          '#0D0B08',          // warm ink black
  surface:     '#1A1610',          // aged parchment dark
  surfaceHov:  '#221E16',          // slightly lifted
  surfacePaper:'rgba(255,248,230,0.04)', // faint warm paper tint
  red:         '#C0392B',          // evidence red / red string
  redFaint:    'rgba(192,57,43,0.12)',
  gold:        '#C8A96E',          // aged gold / evidence tags
  goldFaint:   'rgba(200,169,110,0.12)',
  green:       '#4A7C59',          // case closed stamp green
  text:        '#EDE8DC',          // warm aged paper white
  muted:       'rgba(237,232,220,0.5)',
  faint:       'rgba(237,232,220,0.22)',
  border:      'rgba(237,232,220,0.1)',
  borderWarm:  'rgba(200,169,110,0.2)',
  stamp:       'rgba(192,57,43,0.18)',
}

const R = { sm: '2px', md: '4px', lg: '8px' }  // intentionally tighter — documents, not bubbly UI
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Type scale — ALL display text in Special Elite (typewriter)
// Body/labels in DM Mono (document feel)
const T = {
  label:   { fontFamily: '"Special Elite", cursive',  fontSize: '0.7rem',  fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase' },
  h1:      { fontFamily: '"Special Elite", cursive',  fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.0 },
  h2:      { fontFamily: '"Special Elite", cursive',  fontSize: 'clamp(1.4rem, 3vw, 2rem)',   fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.1 },
  h3:      { fontFamily: '"Special Elite", cursive',  fontSize: '1rem',    fontWeight: 400, letterSpacing: '0.03em' },
  body:    { fontFamily: '"DM Mono", monospace',       fontSize: '0.82rem', fontWeight: 400, lineHeight: 1.75 },
  small:   { fontFamily: '"DM Mono", monospace',       fontSize: '0.73rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:    { fontFamily: '"DM Mono", monospace',       fontSize: '0.62rem', fontWeight: 400, letterSpacing: '0.06em' },
  quote:   { fontFamily: '"Special Elite", cursive',  fontSize: '0.85rem', fontWeight: 400, fontStyle: 'normal', lineHeight: 1.6 },
  casenum: { fontFamily: '"DM Mono", monospace',       fontSize: '0.58rem', fontWeight: 400, letterSpacing: '0.14em' },
}

const DIFF_COLOR  = { easy: C.green,  medium: C.gold,   hard: C.red }
const DIFF_LABEL  = { easy: 'LOW',    medium: 'MED',    hard: 'HIGH' }

// ── Data ──────────────────────────────────────────────────────────────────────
const MYSTERY_GAMES = [
  {
    id: 'the-last-guest',
    title: 'The Last Guest',
    subtitle: 'Chapter One',
    desc: 'A dinner party. Six guests. One disappeared before midnight. Read the statements, spot the lie, name the culprit.',
    difficulty: 'medium', tag: 'Mystery', color: C.red, chapters: 3,
    teaser: 'Someone at the table is not who they say they are.',
    classification: 'OPEN',
  },
  {
    id: 'dead-letters',
    title: 'Dead Letters',
    subtitle: 'Postal Inspector',
    desc: 'A series of strange letters, all addressed to people who no longer exist. Read them in order. Find the pattern.',
    difficulty: 'hard', tag: 'Detective', color: C.gold, chapters: 5,
    teaser: 'Every postmark tells a story. Not all stories end well.',
    classification: 'OPEN',
  },
  {
    id: 'village-of-echoes',
    title: 'Village of Echoes',
    subtitle: 'Point and Explore',
    desc: 'A small village. Strange events every night for seven nights. Talk to residents, collect clues, and solve it before the last night.',
    difficulty: 'hard', tag: 'Adventure', color: C.gold, chapters: 7,
    teaser: 'The villagers all remember differently. Someone is lying.',
    classification: 'OPEN',
  },
  {
    id: 'exhibit-b',
    title: 'Exhibit B',
    subtitle: 'Crime Scene Analysis',
    desc: "You are given a crime scene photograph. Study every detail. Answer the detective's questions. Nothing is accidental.",
    difficulty: 'medium', tag: 'Investigation', color: C.red, chapters: 4,
    teaser: 'The answer is already in front of you.',
    classification: 'OPEN',
  },
  {
    id: 'the-cartographer',
    title: 'The Cartographer',
    subtitle: 'Map Mystery',
    desc: 'An old map surfaces at an estate auction. Hidden within it: coordinates, symbols, a trail of breadcrumbs across three centuries.',
    difficulty: 'hard', tag: 'Puzzle', color: C.gold, chapters: 6,
    teaser: 'The map was never meant to be found.',
    classification: 'OPEN',
  },
]

const PUZZLE_GAMES = [
  { id: 'logic-grid', title: 'Logic Grid',    subtitle: 'Deductive Reasoning', desc: 'Solve logic puzzles using a grid of clues. Eliminate the impossible. What remains must be the truth.',               difficulty: 'medium', tag: 'Logic',    color: C.gold   },
  { id: 'sequence',   title: 'Next in Line',  subtitle: 'Pattern Recognition', desc: 'What comes next? Spot the rule hiding inside number, shape, and word sequences before the timer runs out.',            difficulty: 'easy',   tag: 'Patterns', color: C.green  },
  { id: 'cipher',     title: 'Cipher Room',   subtitle: 'Cryptography',        desc: 'Decode encrypted messages using Caesar shifts, substitution ciphers, and frequency analysis.',                          difficulty: 'hard',   tag: 'Crypto',   color: C.red    },
  { id: 'memory',     title: 'Memory Palace', subtitle: 'Spatial Memory',      desc: 'Study a room full of objects. They move. You find what changed. Each round, the changes multiply.',                    difficulty: 'medium', tag: 'Memory',   color: C.gold   },
  { id: 'word',       title: 'Word Weave',    subtitle: 'Linguistics',         desc: 'Connect words by hidden relationships — opposites, homophones, words hidden inside other words. Six connections.',     difficulty: 'easy',   tag: 'Language', color: C.green  },
  { id: 'nonogram',   title: 'Nonogram',      subtitle: 'Grid Deduction',      desc: 'Fill a grid using row and column clues to reveal a hidden picture. Scales from 5x5 up to 20x20.',                     difficulty: 'hard',   tag: 'Visual',   color: C.red    },
]

// ── Dashed stamp border component ─────────────────────────────────────────────
function ClassificationStamp({ label, color }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.18rem 0.55rem',
      border: `1.5px solid ${color}60`,
      borderRadius: R.sm,
      background: `${color}10`,
      transform: 'rotate(-1.5deg)',
    }}>
      <span style={{ ...T.casenum, color, letterSpacing: '0.16em' }}>{label}</span>
    </div>
  )
}

// ── Mystery card — looks like a physical case file ────────────────────────────
function MysteryCard({ game, index }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: hov ? C.surfaceHov : C.surface,
        border: `1px solid ${hov ? C.borderWarm : C.border}`,
        borderRadius: R.lg,
        padding: '1.5rem',
        cursor: 'default',
        transition: `transform 0.25s ${EASE}, border-color 0.2s ease, background 0.2s ease`,
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        animation: `caseIn 0.45s ${EASE} ${index * 70}ms both`,
        // Torn paper effect — very subtle right edge
        borderRight: `1px solid ${hov ? C.borderWarm : 'rgba(237,232,220,0.06)'}`,
      }}
    >
      {/* Case number + classification — top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ ...T.casenum, color: C.faint }}>
          CASE FILE / {String(index + 1).padStart(3, '0')}
        </span>
        <ClassificationStamp label="COMING SOON" color={C.red} />
      </div>

      {/* Title + subtitle */}
      <div style={{ marginBottom: '0.7rem' }}>
        <h3 style={{ ...T.h3, color: hov ? C.gold : C.text, margin: '0 0 0.2rem', transition: `color 0.2s ease` }}>
          {game.title}
        </h3>
        <span style={{ ...T.tiny, color: C.gold, letterSpacing: '0.1em' }}>
          {game.subtitle} &nbsp;·&nbsp; {game.chapters} chapters
        </span>
      </div>

      {/* Description */}
      <p style={{ ...T.small, color: C.muted, margin: '0 0 1rem' }}>{game.desc}</p>

      {/* Red string teaser block */}
      <div style={{
        padding: '0.6rem 0.9rem',
        background: C.redFaint,
        borderLeft: `2px solid ${C.red}70`,
        marginBottom: '1rem',
      }}>
        <p style={{ ...T.quote, color: C.gold, margin: 0, opacity: 0.85 }}>
          &ldquo;{game.teaser}&rdquo;
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ ...T.tiny, color: DIFF_COLOR[game.difficulty], padding: '0.15rem 0.45rem', border: `1px solid ${DIFF_COLOR[game.difficulty]}35`, borderRadius: R.sm }}>
            RISK: {DIFF_LABEL[game.difficulty]}
          </span>
          <span style={{ ...T.tiny, color: C.faint, padding: '0.15rem 0.45rem', border: `1px solid ${C.border}`, borderRadius: R.sm }}>
            {game.tag}
          </span>
        </div>
        {hov && (
          <span style={{ ...T.tiny, color: C.gold, animation: `stampIn 0.15s ${EASE}` }}>
            In development →
          </span>
        )}
      </div>
    </div>
  )
}

// ── Puzzle card — looks like a physical evidence tag ──────────────────────────
function PuzzleCard({ game, index }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: hov ? C.surfaceHov : C.surface,
        border: `1px solid ${hov ? C.borderWarm : C.border}`,
        borderRadius: R.lg,
        padding: '1.3rem',
        cursor: 'default',
        transition: `transform 0.25s ${EASE}, border-color 0.2s ease, background 0.2s ease`,
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        animation: `caseIn 0.45s ${EASE} ${index * 55}ms both`,
      }}
    >
      {/* Corner fold — top right, like a dog-eared page */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 20px 20px 0`,
        borderColor: `transparent ${C.bg} transparent transparent`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 20, height: 20,
        background: `${game.color}25`,
        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        pointerEvents: 'none',
      }} />

      {/* Sequence number */}
      <div style={{ ...T.casenum, color: C.faint, marginBottom: '0.7rem' }}>
        EXHIBIT {String(index + 1).padStart(2, '0')}
      </div>

      {/* Title */}
      <h3 style={{ ...T.h3, color: hov ? game.color : C.text, margin: '0 0 0.22rem', transition: `color 0.2s ease` }}>
        {game.title}
      </h3>
      <span style={{ ...T.tiny, color: game.color, display: 'block', marginBottom: '0.7rem' }}>
        {game.subtitle}
      </span>

      {/* Description */}
      <p style={{ ...T.small, color: C.muted, margin: '0 0 1rem' }}>{game.desc}</p>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <span style={{ ...T.tiny, color: DIFF_COLOR[game.difficulty], padding: '0.15rem 0.45rem', border: `1px solid ${DIFF_COLOR[game.difficulty]}35`, borderRadius: R.sm }}>
            {DIFF_LABEL[game.difficulty]}
          </span>
          <span style={{ ...T.tiny, color: C.faint, padding: '0.15rem 0.45rem', border: `1px solid ${C.border}`, borderRadius: R.sm }}>
            {game.tag}
          </span>
        </div>
        <span style={{ ...T.tiny, color: C.faint }}>Coming soon</span>
      </div>
    </div>
  )
}

// ── Tab — typewriter aesthetic ─────────────────────────────────────────────────
function FileTab({ id, label, count, active, onClick, activeColor }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.55rem 1.2rem',
        borderRadius: R.md,
        border: `1px solid ${active ? activeColor + '55' : C.border}`,
        background: active ? `${activeColor}12` : hov ? C.surfaceHov : 'transparent',
        color: active ? activeColor : hov ? C.text : C.muted,
        fontFamily: '"Special Elite", cursive',
        fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.08em',
        cursor: 'pointer',
        transition: `all 0.2s ${EASE}`,
      }}
    >
      {label}
      <span style={{
        ...T.tiny,
        color: active ? activeColor : C.faint,
        padding: '0.1rem 0.38rem',
        background: active ? `${activeColor}18` : 'rgba(255,255,255,0.05)',
        borderRadius: R.sm,
      }}>{count}</span>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MindGames() {
  const [wing, setWing] = useState('mystery')
  const isMystery = wing === 'mystery'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'relative', overflow: 'hidden',
        padding: '3.5rem 2rem 2.5rem',
        borderBottom: `1px solid ${C.border}`,
        // Subtle paper grain texture via repeating gradient
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(237,232,220,0.008) 2px,
          rgba(237,232,220,0.008) 3px
        )`,
      }}>
        {/* Warm corner glow — like a desk lamp in a dark room */}
        <div aria-hidden style={{ position: 'absolute', top: 0, left: '-5%', width: 400, height: 400, background: `radial-gradient(circle at top left, rgba(200,169,110,0.045) 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>

          {/* Eyebrow — looks like a file stamp */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.4rem',
          }}>
            <span style={{ display: 'block', width: 20, height: 1, background: C.gold }} />
            <span style={{ ...T.label, color: C.gold }}>District 03 / Case Files</span>
          </div>

          {/* Title */}
          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 0.9rem' }}>
            Mind <span style={{ color: C.red }}>Games</span>
          </h1>

          {/* Subtitle */}
          <p style={{ ...T.body, color: C.muted, maxWidth: 500, margin: '0 0 2rem' }}>
            Puzzles that make you think. Mysteries that make you feel.
            Challenges that refuse to let go.
          </p>

          {/* Stats — like evidence count tags */}
          <div style={{ display: 'flex', gap: '1px', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Open Cases',   value: MYSTERY_GAMES.length, color: C.red  },
              { label: 'Puzzle Types', value: PUZZLE_GAMES.length,  color: C.gold },
              { label: 'Status',       value: 'All In Dev',         color: C.green },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: '0.6rem 1.2rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: i === 0 ? `${R.md} 0 0 ${R.md}` : i === 2 ? `0 ${R.md} ${R.md} 0` : '0',
                display: 'flex', alignItems: 'baseline', gap: '0.5rem',
              }}>
                <span style={{ fontFamily: '"Special Elite", cursive', fontSize: '1.3rem', color, lineHeight: 1 }}>{value}</span>
                <span style={{ ...T.tiny, color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>

          {/* File tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <FileTab id="mystery" label="Mystery Files"  count={MYSTERY_GAMES.length} active={isMystery}  onClick={setWing} activeColor={C.red}  />
            <FileTab id="puzzle"  label="Puzzle Room"    count={PUZZLE_GAMES.length}  active={!isMystery} onClick={setWing} activeColor={C.gold} />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ ...T.h2, color: C.text, margin: '0 0 0.35rem' }}>
            {isMystery ? 'The Mystery Files' : 'The Puzzle Room'}
          </h2>
          <p style={{ ...T.tiny, color: C.faint, margin: 0, letterSpacing: '0.08em' }}>
            {isMystery
              ? 'story-driven · detective · investigate · solve'
              : 'logic · patterns · language · memory · deduction'}
          </p>
        </div>

        {isMystery ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {MYSTERY_GAMES.map((g, i) => <MysteryCard key={g.id} game={g} index={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: '1rem' }}>
            {PUZZLE_GAMES.map((g, i) => <PuzzleCard key={g.id} game={g} index={i} />)}
          </div>
        )}

        {/* Dossier footer */}
        <div style={{
          marginTop: '3rem',
          padding: '1.6rem 2rem',
          border: `1px dashed ${C.border}`,
          borderRadius: R.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: C.surface,
        }}>
          <div>
            <p style={{ ...T.body, color: C.muted, margin: '0 0 0.3rem', fontStyle: 'italic' }}>
              "The game is afoot."
            </p>
            <p style={{ ...T.tiny, color: C.faint, margin: 0, letterSpacing: '0.1em' }}>
              All cases in development. Check back often.
            </p>
          </div>
          <ClassificationStamp label="IN DEVELOPMENT" color={C.gold} />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(192,57,43,0.25); color: #EDE8DC; }

        @keyframes caseIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}