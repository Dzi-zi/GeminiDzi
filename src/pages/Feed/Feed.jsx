import { useState } from 'react'

const FEED_ITEMS = [
  // Books
  { id: 1, type: 'book', title: 'Kindred', creator: 'Octavia E. Butler', year: '1979', note: 'The most unsettling, beautiful book I\'ve read in years. Time travel as a lens for understanding trauma and power.', tag: 'fiction', status: 'reading', color: '#E8758A' },
  { id: 2, type: 'book', title: 'The Design of Everyday Things', creator: 'Don Norman', year: '1988', note: 'Every designer\'s bible. Changed the way I look at door handles, light switches, and every interface I build.', tag: 'design', status: 'done', color: '#5B9BD5' },
  { id: 3, type: 'book', title: 'Things Fall Apart', creator: 'Chinua Achebe', year: '1958', note: 'I come back to this every few years. Something new surfaces each time. The prose is quiet and devastating.', tag: 'fiction', status: 'done', color: '#D4AF37' },
  { id: 4, type: 'book', title: 'Algorithms to Live By', creator: 'Brian Christian', year: '2016', note: 'Computer science as philosophy. The 37% rule for decision making still lives in my head rent-free.', tag: 'non-fiction', status: 'done', color: '#6AAF7A' },

  // Music
  { id: 5, type: 'music', title: 'Fountain Baby', creator: 'Amaarae', year: '2023', note: 'She is doing something no one else is doing. Every track sounds like a different world. Obsessed.', tag: 'afropop', status: 'on repeat', color: '#FF8B94' },
  { id: 6, type: 'music', title: 'Promises', creator: 'Floating Points, Pharoah Sanders', year: '2021', note: 'Nine movements. One saxophone. A string orchestra. Pure feeling. I put this on when I need to think.', tag: 'jazz', status: 'favourite', color: '#A78BFA' },
  { id: 7, type: 'music', title: 'Legacy+ Legacy', creator: 'Femi & Made Kuti', year: '2021', note: 'Father and son, side by side. Afrobeats as inheritance. The rhythms are coded in the blood.', tag: 'afrobeat', status: 'done', color: '#FF6B35' },

  // Films & shows
  { id: 8, type: 'film', title: 'Everything Everywhere All at Once', creator: 'Daniels', year: '2022', note: 'I left this film overwhelmed and then went back three more times. The chaos is the point.', tag: 'film', status: 'favourite', color: '#4ECDC4' },
  { id: 9, type: 'film', title: 'Skins (UK)', creator: 'Bryan Elsley', year: '2007', note: 'Watched it years ago. Think about it still. The writing in the first two series is genuinely brilliant.', tag: 'series', status: 'done', color: '#E8758A' },
  { id: 10, type: 'film', title: 'Black Panther: Wakanda Forever', creator: 'Ryan Coogler', year: '2022', note: 'The grief is real. They made something that shouldn\'t have worked and it absolutely works.', tag: 'film', status: 'done', color: '#5B9BD5' },

  // Articles / internet
  { id: 11, type: 'article', title: 'The Website Obesity Crisis', creator: 'Maciej Cegłowski', year: '2015', note: 'Still true. More true now. Why do we build things that weigh 10MB when they could weigh 10KB?', tag: 'web', status: 'saved', color: '#D4AF37', url: '#' },
  { id: 12, type: 'article', title: 'We Need a Radical Rethinking of Design', creator: 'Kat Holmes', year: '2018', note: 'On inclusive design and the idea that designing for the margins makes the centre better too.', tag: 'design', status: 'saved', color: '#6AAF7A', url: '#' },
  { id: 13, type: 'article', title: 'The Expanding Dark Forest and Generative AI', creator: 'Maggie Appleton', year: '2023', note: 'One of the most thoughtful pieces on AI and the web I have ever read. She thinks better than most.', tag: 'ai', status: 'saved', color: '#A78BFA', url: '#' },

  // People/creators
  { id: 14, type: 'creator', title: 'Maggie Appleton', creator: 'Design Engineer', year: 'ongoing', note: 'Her digital garden is a model for how to share thinking on the internet. Every piece is meticulous.', tag: 'web', status: 'following', color: '#FF8B94' },
  { id: 15, type: 'creator', title: 'Ọlọ́tunfẹ̀ Ànímáshaun', creator: 'Filmmaker', year: 'ongoing', note: 'Making films that centre African stories without the Western gaze. Watch everything she makes.', tag: 'film', status: 'following', color: '#4ECDC4' },
]

const TYPE_META = {
  book:    { label: 'Books',    icon: '📚', color: '#D4AF37' },
  music:   { label: 'Music',   icon: '🎵', color: '#A78BFA' },
  film:    { label: 'Screen',  icon: '🎬', color: '#4ECDC4' },
  article: { label: 'Articles',icon: '📰', color: '#6AAF7A' },
  creator: { label: 'People',  icon: '✦',  color: '#FF8B94' },
}

const FILTERS = [{ id: 'all', label: 'everything' }, ...Object.entries(TYPE_META).map(([id, m]) => ({ id, label: m.label.toLowerCase() }))]

const STATUS_STYLES = {
  'reading':   '#D4AF37',
  'on repeat': '#A78BFA',
  'favourite': '#E8758A',
  'done':      '#6AAF7A',
  'saved':     '#5B9BD5',
  'following': '#4ECDC4',
}

function FeedCard({ item, index }) {
  const [hov, setHov] = useState(false)
  const meta = TYPE_META[item.type]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hov ? item.color + '60' : '#EEE5DB'}`,
        borderRadius: '12px', padding: '1.3rem',
        transition: 'all 0.18s ease',
        boxShadow: hov ? `0 6px 20px rgba(0,0,0,0.07)` : '0 1px 6px rgba(0,0,0,0.04)',
        animation: `fadeUp 0.35s ease ${index * 0.05}s both`,
        position: 'relative',
      }}
    >
      {/* Type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem' }}>{meta.icon}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, color: meta.color, letterSpacing: '0.08em' }}>{item.type}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: STATUS_STYLES[item.status], background: STATUS_STYLES[item.status] + '18', padding: '0.12rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>{item.status}</span>
        </div>
      </div>

      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#2A1A00', margin: '0 0 0.15rem', lineHeight: 1.3 }}>{item.title}</h3>
      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#B0A090', margin: '0 0 0.65rem', letterSpacing: '0.04em' }}>{item.creator} · {item.year}</p>

      {/* Colour left bar on hover */}
      <div style={{ borderLeft: `3px solid ${hov ? item.color : '#F0E8DF'}`, paddingLeft: '0.7rem', transition: 'border-color 0.2s' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: '#6A5040', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>"{item.note}"</p>
      </div>

      <div style={{ marginTop: '0.8rem' }}>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#C0A890', background: '#F5F0EA', padding: '0.12rem 0.5rem', borderRadius: '4px' }}>#{item.tag}</span>
      </div>
    </div>
  )
}

export default function Feed() {
  const [filter, setFilter] = useState('all')
  const [layout, setLayout] = useState('grid') // grid | list

  const visible = filter === 'all' ? FEED_ITEMS : FEED_ITEMS.filter(i => i.type === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', paddingTop: '80px' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '2px solid #EEE5DB', padding: '3rem 1.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(180,160,130,0.05) 1px, transparent 1px)', backgroundSize: '100% 40px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#E8758A' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#E8758A' }}>the district</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, color: '#2A1A00', margin: '0 0 0.5rem', lineHeight: 1, letterSpacing: '-0.03em' }}>
            The Feed
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#9A8070', maxWidth: '460px', lineHeight: 1.6, margin: '0 0 1.8rem', fontStyle: 'italic' }}>
            Books I'm reading. Music I'm hearing. Films I'm thinking about. People worth following.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '20px', cursor: 'pointer',
                    background: filter === f.id ? '#2A1A00' : '#fff',
                    color: filter === f.id ? '#F5ECD8' : '#9A8070',
                    fontFamily: 'Georgia, serif', fontSize: '0.8rem',
                    fontWeight: filter === f.id ? 700 : 400,
                    border: `2px solid ${filter === f.id ? '#2A1A00' : '#E8DDD0'}`,
                    boxShadow: filter === f.id ? '0 2px 0px #00000040' : 'none',
                    transition: 'all 0.15s',
                  }}>{f.label}</button>
              ))}
            </div>

            {/* Layout toggle */}
            <div style={{ display: 'flex', gap: '0.3rem', background: '#fff', border: '2px solid #E8DDD0', borderRadius: '8px', padding: '2px' }}>
              {[['grid', '⊞'], ['list', '☰']].map(([id, icon]) => (
                <button key={id} onClick={() => setLayout(id)}
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: '5px', cursor: 'pointer', border: 'none',
                    background: layout === id ? '#2A1A00' : 'transparent',
                    color: layout === id ? '#F5ECD8' : '#C0A890',
                    fontSize: '0.85rem', transition: 'all 0.13s',
                  }}>{icon}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Feed ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = FEED_ITEMS.filter(i => i.type === type).length
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setFilter(type)}>
                <span style={{ fontSize: '0.85rem' }}>{meta.icon}</span>
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#B0A090' }}>{count} {meta.label.toLowerCase()}</span>
              </div>
            )
          })}
        </div>

        {layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {visible.map((item, i) => <FeedCard key={item.id} item={item} index={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {visible.map((item, i) => {
              const meta = TYPE_META[item.type]
              return (
                <div key={item.id} style={{ background: '#fff', border: '2px solid #EEE5DB', borderRadius: '10px', padding: '1rem 1.2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700, color: '#2A1A00' }}>{item.title}</span>
                        <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', marginLeft: '0.6rem' }}>{item.creator}</span>
                      </div>
                      <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: STATUS_STYLES[item.status], background: STATUS_STYLES[item.status] + '18', padding: '0.12rem 0.5rem', borderRadius: '20px', fontWeight: 700, flexShrink: 0 }}>{item.status}</span>
                    </div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#8A7060', margin: '0.25rem 0 0', lineHeight: 1.55, fontStyle: 'italic' }}>"{item.note}"</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: '3.5rem', borderTop: '2px solid #EEE5DB', paddingTop: '1.5rem' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#C0A890', margin: 0, fontStyle: 'italic' }}>
            This feed is a living document. Updated as I consume, think, and discover.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}