import { useState } from 'react'

// ── Feed District Identity — Cultural Diary / Editorial Magazine ──────────────
// Concept: A beautifully typeset personal magazine. Warm cream pages,
// ink-dark text, editorial serif headings, carefully considered layout.
// Every card feels like a review clipping or an annotated bookmark.
//
// Background: #F7F3EC  warm cream newsprint
// Cards:      #FFFFFF  clean page stock
// Ink:        #1A1208  deep warm ink
// Rose:       #C2185B  editorial accent — the magazine's house colour
// Gold:       #B8882A  secondary warmth
// Font:       Libre Baskerville — classic editorial serif
// Body:       DM Sans — clean contrast
// Detail:     DM Mono — year stamps and status tags

const C = {
  bg:         '#F7F3EC',
  bgAlt:      '#EFE9DF',
  surface:    '#FFFFFF',
  ink:        '#1A1208',
  rose:       '#C2185B',
  gold:       '#B8882A',
  purple:     '#6B4FA0',
  teal:       '#2A7B7B',
  green:      '#3A6B44',
  blue:       '#2A5B8B',
  text:       '#2A1800',
  muted:      '#7A6050',
  faint:      'rgba(42,24,0,0.28)',
  border:     '#E0D4C0',
  borderSoft: '#EDE5D8',
}

const STATUS_COLOR = {
  'reading':   '#C2185B',
  'on repeat': '#6B4FA0',
  'favourite': '#C2185B',
  'done':      '#3A6B44',
  'saved':     '#2A5B8B',
  'following': '#2A7B7B',
}

const R = { sm: '2px', md: '4px', lg: '10px' }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const T = {
  label:  { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em',  textTransform: 'uppercase' },
  h1:     { fontFamily: '"Libre Baskerville", serif',   fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.0 },
  h2:     { fontFamily: '"Libre Baskerville", serif',   fontSize: 'clamp(1.3rem, 2.8vw, 1.8rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 },
  h3:     { fontFamily: '"Libre Baskerville", serif',   fontSize: '1rem',    fontWeight: 700, lineHeight: 1.25 },
  body:   { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.9rem',  fontWeight: 400, lineHeight: 1.72 },
  small:  { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:   { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em' },
  mono:   { fontFamily: '"DM Mono", monospace',         fontSize: '0.62rem', fontWeight: 400, letterSpacing: '0.05em' },
  quote:  { fontFamily: '"Libre Baskerville", serif',   fontSize: '0.83rem', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.7 },
  kicker: { fontFamily: '"DM Sans", sans-serif',        fontSize: '0.6rem',  fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' },
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEED_ITEMS = [
  { id: 1,  type: 'book',    title: 'Kindred',                                    creator: 'Octavia E. Butler',             year: '1979',    note: 'The most unsettling, beautiful book I have read in years. Time travel as a lens for understanding trauma and power.',             tag: 'fiction',     status: 'reading',   color: '#C2185B' },
  { id: 2,  type: 'book',    title: 'The Design of Everyday Things',              creator: 'Don Norman',                    year: '1988',    note: 'Every designer\'s bible. Changed how I look at door handles, light switches, and every interface I build.',                     tag: 'design',      status: 'done',      color: '#2A5B8B' },
  { id: 3,  type: 'book',    title: 'Things Fall Apart',                          creator: 'Chinua Achebe',                 year: '1958',    note: 'I come back to this every few years. Something new surfaces each time. The prose is quiet and devastating.',                   tag: 'fiction',     status: 'done',      color: '#B8882A' },
  { id: 4,  type: 'book',    title: 'Algorithms to Live By',                      creator: 'Brian Christian',               year: '2016',    note: 'Computer science as philosophy. The 37% rule for decision-making still lives in my head rent-free.',                            tag: 'non-fiction', status: 'done',      color: '#3A6B44' },
  { id: 5,  type: 'music',   title: 'Fountain Baby',                              creator: 'Amaarae',                       year: '2023',    note: 'She is doing something no one else is doing. Every track sounds like a different world. Completely obsessed.',                  tag: 'afropop',     status: 'on repeat', color: '#C2185B' },
  { id: 6,  type: 'music',   title: 'Promises',                                   creator: 'Floating Points, Pharoah Sanders', year: '2021', note: 'Nine movements. One saxophone. A string orchestra. Pure feeling. I put this on when I need to think clearly.',                tag: 'jazz',        status: 'favourite', color: '#6B4FA0' },
  { id: 7,  type: 'music',   title: 'Legacy+ Legacy',                             creator: 'Femi & Made Kuti',              year: '2021',    note: 'Father and son, side by side. Afrobeats as inheritance. The rhythms are coded in the blood.',                                  tag: 'afrobeat',    status: 'done',      color: '#B8882A' },
  { id: 8,  type: 'film',    title: 'Everything Everywhere All at Once',          creator: 'Daniels',                       year: '2022',    note: 'I left overwhelmed and went back three more times. The chaos is the point. The love is the point.',                            tag: 'film',        status: 'favourite', color: '#2A7B7B' },
  { id: 9,  type: 'film',    title: 'Skins (UK)',                                 creator: 'Bryan Elsley',                  year: '2007',    note: 'Watched it years ago. Think about it still. The writing in the first two series is genuinely brilliant.',                      tag: 'series',      status: 'done',      color: '#C2185B' },
  { id: 10, type: 'film',    title: 'Black Panther: Wakanda Forever',             creator: 'Ryan Coogler',                  year: '2022',    note: 'The grief is real. They made something that should not have worked and it absolutely works.',                                   tag: 'film',        status: 'done',      color: '#2A5B8B' },
  { id: 11, type: 'article', title: 'The Website Obesity Crisis',                 creator: 'Maciej Cegłowski',              year: '2015',    note: 'Still true. More true now. Why do we build things that weigh 10MB when they could weigh 10KB?',                               tag: 'web',         status: 'saved',     color: '#B8882A', url: '#' },
  { id: 12, type: 'article', title: 'We Need a Radical Rethinking of Design',     creator: 'Kat Holmes',                    year: '2018',    note: 'On inclusive design: designing for the margins makes the centre better too.',                                                  tag: 'design',      status: 'saved',     color: '#3A6B44', url: '#' },
  { id: 13, type: 'article', title: 'The Expanding Dark Forest and Generative AI', creator: 'Maggie Appleton',              year: '2023',    note: 'One of the most thoughtful pieces on AI and the web I have read. She thinks better than most.',                                tag: 'ai',          status: 'saved',     color: '#6B4FA0', url: '#' },
  { id: 14, type: 'creator', title: 'Maggie Appleton',                            creator: 'Design Engineer',               year: 'ongoing', note: 'Her digital garden is a model for how to share thinking on the internet. Every piece is meticulous.',                          tag: 'web',         status: 'following', color: '#C2185B' },
  { id: 15, type: 'creator', title: 'Ọlọ́tunfẹ̀ Ànímáshaun',                     creator: 'Filmmaker',                     year: 'ongoing', note: 'Making films that centre African stories without the Western gaze. Watch everything she makes.',                                 tag: 'film',        status: 'following', color: '#2A7B7B' },
]

const TYPE_META = {
  book:    { label: 'Books',    color: C.gold   },
  music:   { label: 'Music',   color: C.purple },
  film:    { label: 'Screen',  color: C.teal   },
  article: { label: 'Articles',color: C.green  },
  creator: { label: 'People',  color: C.rose   },
}

const FILTERS = [
  { id: 'all', label: 'Everything' },
  ...Object.entries(TYPE_META).map(([id, m]) => ({ id, label: m.label }))
]

// ── Feed card — grid view ─────────────────────────────────────────────────────
function FeedCard({ item, index }) {
  const [hov, setHov] = useState(false)
  const meta = TYPE_META[item.type]
  const statusColor = STATUS_COLOR[item.status] || C.muted

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? item.color + '45' : C.border}`,
        borderRadius: R.md,
        padding: '1.3rem',
        position: 'relative', overflow: 'hidden',
        transition: `border-color 0.2s ease, transform 0.25s ${EASE}, box-shadow 0.25s ${EASE}`,
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? `0 10px 28px rgba(30,18,8,0.1)` : `0 1px 4px rgba(30,18,8,0.05)`,
        animation: `feedIn 0.45s ${EASE} ${index * 50}ms both`,
      }}
    >
      {/* Top colour reveal on hover */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: item.color, opacity: hov ? 1 : 0, transition: `opacity 0.2s ease` }} />

      {/* Type + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <span style={{ ...T.kicker, color: meta.color }}>{item.type}</span>
        <span style={{ ...T.tiny, color: statusColor, padding: '0.12rem 0.5rem', border: `1px solid ${statusColor}30`, borderRadius: '20px' }}>
          {item.status}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ ...T.h3, color: hov ? item.color : C.text, margin: '0 0 0.2rem', transition: `color 0.2s ease` }}>
        {item.title}
      </h3>

      {/* Creator + year */}
      <p style={{ ...T.mono, color: C.muted, margin: '0 0 0.85rem' }}>
        {item.creator} · {item.year}
      </p>

      {/* Quote block */}
      <div style={{ borderLeft: `2px solid ${hov ? item.color : C.borderSoft}`, paddingLeft: '0.8rem', marginBottom: '0.9rem', transition: `border-color 0.2s ease` }}>
        <p style={{ ...T.quote, color: C.muted, margin: 0 }}>&ldquo;{item.note}&rdquo;</p>
      </div>

      {/* Tag */}
      <span style={{ ...T.tiny, color: C.faint, padding: '0.12rem 0.5rem', background: C.bgAlt, border: `1px solid ${C.borderSoft}`, borderRadius: R.sm }}>
        #{item.tag}
      </span>
    </div>
  )
}

// ── Feed row — list view ──────────────────────────────────────────────────────
function FeedRow({ item, index }) {
  const [hov, setHov] = useState(false)
  const meta = TYPE_META[item.type]
  const statusColor = STATUS_COLOR[item.status] || C.muted

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? item.color + '40' : C.border}`,
        borderLeft: `3px solid ${hov ? item.color : C.borderSoft}`,
        borderRadius: R.md,
        padding: '0.95rem 1.2rem',
        display: 'flex', gap: '1.2rem', alignItems: 'flex-start',
        transition: `border-color 0.2s ease, transform 0.2s ${EASE}`,
        transform: hov ? 'translateX(3px)' : 'translateX(0)',
        animation: `feedIn 0.4s ${EASE} ${index * 40}ms both`,
      }}
    >
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <span style={{ ...T.kicker, color: meta.color }}>{item.type}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
          <h3 style={{ ...T.h3, color: hov ? item.color : C.text, margin: 0, fontSize: '0.92rem', transition: `color 0.2s ease` }}>
            {item.title}
          </h3>
          <span style={{ ...T.tiny, color: statusColor, padding: '0.1rem 0.5rem', border: `1px solid ${statusColor}30`, borderRadius: '20px', flexShrink: 0 }}>
            {item.status}
          </span>
        </div>
        <p style={{ ...T.mono, color: C.muted, margin: '0 0 0.35rem' }}>{item.creator} · {item.year}</p>
        <p style={{ ...T.quote, color: C.muted, margin: 0, fontSize: '0.78rem' }}>&ldquo;{item.note}&rdquo;</p>
      </div>
    </div>
  )
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        ...T.tiny, padding: '0.42rem 0.9rem', borderRadius: '20px', cursor: 'pointer',
        border: `1px solid ${active ? C.ink : hov ? C.muted : C.border}`,
        background: active ? C.ink : C.surface,
        color: active ? C.bgAlt : hov ? C.text : C.muted,
        transition: `all 0.16s ease`,
        fontFamily: '"DM Sans", sans-serif',
      }}
    >{label}</button>
  )
}

// ── Layout toggle ─────────────────────────────────────────────────────────────
function LayoutToggle({ layout, setLayout }) {
  return (
    <div style={{ display: 'flex', gap: '1px', background: C.border, borderRadius: R.md, overflow: 'hidden' }}>
      {[
        { id: 'grid', el: <><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></> },
        { id: 'list', el: <><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="6" width="14" height="2" rx="1"/><rect x="0" y="11" width="14" height="2" rx="1"/></> },
      ].map(({ id, el }) => (
        <button key={id} onClick={() => setLayout(id)} style={{
          padding: '0.42rem 0.65rem', background: layout === id ? C.ink : C.surface,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: `background 0.15s ease`,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={layout === id ? C.bgAlt : C.muted}>{el}</svg>
        </button>
      ))}
    </div>
  )
}

// ── Feed page ─────────────────────────────────────────────────────────────────
export default function Feed() {
  const [filter, setFilter] = useState('all')
  const [layout, setLayout] = useState('grid')

  const visible = filter === 'all' ? FEED_ITEMS : FEED_ITEMS.filter(i => i.type === filter)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* ── Header ── */}
      <header style={{ position: 'relative', overflow: 'hidden', background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '3.5rem 2rem 2.5rem' }}>
        {/* Horizontal rule lines — newspaper baseline grid */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(42,24,0,0.04) 1px, transparent 1px)`, backgroundSize: '100% 40px' }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>

          <div style={{ ...T.label, color: C.rose, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <span style={{ display: 'block', width: 24, height: 1, background: C.rose }} />
            District 08
          </div>

          <h1 style={{ ...T.h1, color: C.text, margin: '0 0 0.8rem' }}>
            The <span style={{ color: C.rose }}>Feed</span>
          </h1>

          <p style={{ ...T.body, color: C.muted, maxWidth: 500, margin: '0 0 0.5rem', fontStyle: 'italic' }}>
            Books I am reading. Music I am hearing. Films I am thinking about. People worth following.
          </p>
          <p style={{ ...T.small, color: C.muted, maxWidth: 460, margin: '0 0 2rem' }}>
            A living cultural diary, updated as I consume, discover, and return to things.
          </p>

          {/* Clickable stat strip */}
          <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', marginBottom: '1.8rem', background: C.border, border: `1px solid ${C.border}`, borderRadius: R.md, overflow: 'hidden' }}>
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = FEED_ITEMS.filter(f => f.type === type).length
              const isActive = filter === type
              return (
                <button key={type} onClick={() => setFilter(isActive ? 'all' : type)} style={{
                  flex: '1 1 auto', padding: '0.6rem 1rem',
                  background: isActive ? C.ink : C.surface,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'baseline', gap: '0.45rem',
                  transition: `background 0.18s ease`,
                }}>
                  <span style={{ fontFamily: '"Libre Baskerville", serif', fontSize: '1.35rem', fontWeight: 700, color: isActive ? C.bgAlt : meta.color, lineHeight: 1 }}>{count}</span>
                  <span style={{ ...T.tiny, color: isActive ? 'rgba(245,236,216,0.6)' : C.faint }}>{meta.label}</span>
                </button>
              )
            })}
          </div>

          {/* Filter + layout row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => <FilterBtn key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />)}
            </div>
            <LayoutToggle layout={layout} setLayout={setLayout} />
          </div>
        </div>
      </header>

      {/* ── Feed ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>

        {layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(278px, 1fr))', gap: '1rem' }}>
            {visible.map((item, i) => <FeedCard key={item.id} item={item} index={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {visible.map((item, i) => <FeedRow key={item.id} item={item} index={i} />)}
          </div>
        )}

        <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.border}` }}>
          <p style={{ ...T.quote, color: C.muted, margin: 0, fontSize: '0.82rem' }}>
            This feed is a living document. Updated as I consume, think, and discover.
          </p>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(194,24,91,0.15); color: #2A1800; }

        @keyframes feedIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}