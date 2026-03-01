import { useState, useEffect, useRef } from 'react'

// ── Mood definitions ──────────────────────────────────────────────────────────
const MOODS = {
  happy:      { label: 'Happy',       emoji: '☀️', color: '#F9CA24', bg: '#1A1500', text: '#F9CA24', vibe: 'bright and joyful' },
  energetic:  { label: 'Energetic',   emoji: '⚡', color: '#FF6B35', bg: '#1A0800', text: '#FF6B35', vibe: 'high energy and pumped up' },
  melancholic:{ label: 'Melancholic', emoji: '🌧', color: '#5B9BD5', bg: '#060D1A', text: '#7BB3E8', vibe: 'sad, reflective and deep' },
  romantic:   { label: 'Romantic',    emoji: '🌹', color: '#E8758A', bg: '#1A0810', text: '#F0A0B0', vibe: 'warm, loving and intimate' },
  focused:    { label: 'Focused',     emoji: '🎯', color: '#4ECDC4', bg: '#041412', text: '#4ECDC4', vibe: 'calm, concentrated and productive' },
  nostalgic:  { label: 'Nostalgic',   emoji: '🌅', color: '#D4AF37', bg: '#141000', text: '#D4AF37', vibe: 'warm memories and longing' },
  angry:      { label: 'Angry',       emoji: '🔥', color: '#E05050', bg: '#140505', text: '#E07070', vibe: 'intense, raw and powerful' },
  peaceful:   { label: 'Peaceful',    emoji: '🌿', color: '#6AAF7A', bg: '#061009', text: '#80C890', vibe: 'calm, serene and gentle' },
  anxious:    { label: 'Anxious',     emoji: '🌀', color: '#A78BFA', bg: '#0A0614', text: '#BBA8FC', vibe: 'unsettled, searching and tense' },
  heartbroken:{ label: 'Heartbroken', emoji: '💔', color: '#C0607A', bg: '#12060A', text: '#D080A0', vibe: 'raw pain and longing' },
}

const GENRES = [
  { id: 'any',       label: 'Any genre'  },
  { id: 'afrobeats', label: 'Afrobeats'  },
  { id: 'afropop',   label: 'Afropop'    },
  { id: 'hiphop',    label: 'Hip-Hop'    },
  { id: 'rnb',       label: 'R&B / Soul' },
  { id: 'pop',       label: 'Pop'        },
  { id: 'jazz',      label: 'Jazz'       },
  { id: 'ambient',   label: 'Ambient'    },
  { id: 'classical', label: 'Classical'  },
  { id: 'rock',      label: 'Rock'       },
  { id: 'electronic',label: 'Electronic' },
  { id: 'gospel',    label: 'Gospel'     },
]

// ── Claude API ────────────────────────────────────────────────────────────────
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY || ''

async function detectMoodAndGetPlaylist(text, genre) {
  const genreNote = genre !== 'any' ? `The user prefers ${genre} music.` : 'Mix genres naturally based on the mood.'
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a music curator. A user wrote: "${text}"

${genreNote}

Detect their emotional mood and suggest 8 real songs that perfectly match it.

Respond ONLY with valid JSON in this exact format, nothing else:
{
  "mood": "one of: happy, energetic, melancholic, romantic, focused, nostalgic, angry, peaceful, anxious, heartbroken",
  "moodSummary": "one sentence describing what you detected from their words",
  "playlist": [
    {"title": "Song Title", "artist": "Artist Name", "why": "one short sentence why this fits"},
    ...8 songs total
  ]
}

Pick real, well-known songs that genuinely fit the mood. Include African artists where relevant.`,
      }],
    }),
  })
  const data = await res.json()
  const raw = data.content?.[0]?.text || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── YouTube search URL ────────────────────────────────────────────────────────
function ytSearch(title, artist) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} official`)}`
}

function ytEmbed(title, artist) {
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${artist} ${title}`)}`
}

// ── Mood orb visualiser ───────────────────────────────────────────────────────
function MoodOrb({ mood, active }) {
  const m = MOODS[mood]
  if (!m) return null
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', height: '160px', flexShrink: 0 }}>
      {/* Outer pulse */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${m.color}15 0%, transparent 70%)`,
        animation: active ? 'orbPulse 2.5s ease-in-out infinite' : 'none',
      }} />
      {/* Orb */}
      <div style={{
        width: '110px', height: '110px', borderRadius: '50%',
        background: `radial-gradient(circle at 38% 38%, ${m.color}80 0%, ${m.color}20 60%, transparent 100%)`,
        border: `2px solid ${m.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '0.2rem',
        boxShadow: `0 0 40px ${m.color}30, inset 0 0 20px ${m.color}10`,
        animation: active ? 'orbFloat 4s ease-in-out infinite' : 'none',
      }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{m.emoji}</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', fontWeight: 700, color: m.text, letterSpacing: '0.06em' }}>{m.label}</span>
      </div>
    </div>
  )
}

// ── Song card ─────────────────────────────────────────────────────────────────
function SongCard({ song, index, moodColor, moodBg, onPlay, isPlaying }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${moodColor}12` : 'rgba(255,255,255,0.04)',
        border: `2px solid ${hov || isPlaying ? moodColor + '50' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px', padding: '1rem 1.1rem',
        transition: 'all 0.18s ease',
        animation: `fadeUp 0.35s ease ${index * 0.07}s both`,
        cursor: 'pointer',
        boxShadow: isPlaying ? `0 0 20px ${moodColor}20` : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
        {/* Track number */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: isPlaying ? moodColor : 'rgba(255,255,255,0.06)',
          border: `2px solid ${isPlaying ? moodColor : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
          color: isPlaying ? '#0A0A0F' : 'rgba(255,255,255,0.3)',
          fontWeight: 700, transition: 'all 0.15s',
        }}>
          {isPlaying ? '♪' : index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ minWidth: 0 }}>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</h4>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: moodColor, margin: 0, opacity: 0.8 }}>{song.artist}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <a href={ytSearch(song.title, song.artist)} target="_blank" rel="noopener noreferrer"
                onClick={() => onPlay(song)}
                style={{ padding: '0.28rem 0.7rem', background: moodColor, border: `2px solid ${moodColor}`, borderRadius: '6px', color: '#0A0A0F', fontFamily: '"Courier New", monospace', fontSize: '0.58rem', cursor: 'pointer', textDecoration: 'none', fontWeight: 700, transition: 'all 0.13s', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: `0 2px 0 ${moodColor}66` }}>
                ▶ play on YouTube
              </a>
            </div>
          </div>
          {song.why && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '0.35rem 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>{song.why}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── YouTube player ────────────────────────────────────────────────────────────


// ── Saved playlist card ───────────────────────────────────────────────────────
function SavedCard({ pl, onLoad, onDelete, moodColor }) {
  const m = MOODS[pl.mood] || MOODS.happy
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `2px solid ${m.color}30`, borderRadius: '10px', padding: '0.9rem' }}>
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
            <span>{m.emoji}</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: 700, color: m.text }}>{m.label}</span>
          </div>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{pl.songs.length} songs · {pl.genre !== 'any' ? pl.genre : 'mixed'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button onClick={() => onLoad(pl)} style={{ padding: '0.25rem 0.6rem', background: m.color + '20', border: `2px solid ${m.color}40`, borderRadius: '5px', color: m.color, fontFamily: '"Courier New", monospace', fontSize: '0.58rem', cursor: 'pointer', fontWeight: 700 }}>load</button>
          <button onClick={() => onDelete(pl.id)} style={{ padding: '0.25rem 0.4rem', background: 'none', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '5px', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
      </div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>"{pl.input.slice(0, 80)}{pl.input.length > 80 ? '...' : ''}"</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MoodTunes() {
  const [input,       setInput]       = useState('')
  const [genre,       setGenre]       = useState('any')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState('')
  const [playingSong, setPlayingSong] = useState(null) // just tracks which is highlighted
  const [saved,       setSaved]       = useState(() => { try { return JSON.parse(localStorage.getItem('mt_saved') || '[]') } catch { return [] } })
  const [showSaved,   setShowSaved]   = useState(false)
  const [charCount,   setCharCount]   = useState(0)
  const textRef = useRef(null)

  useEffect(() => { try { localStorage.setItem('mt_saved', JSON.stringify(saved)) } catch {} }, [saved])

  const currentMood = result ? MOODS[result.mood] : null
  const bgColor = currentMood ? currentMood.bg : '#0A0A0F'

  const generate = async () => {
    if (!input.trim() || input.trim().length < 5) { setError('Tell me a little more about how you feel...'); return }
    if (!CLAUDE_KEY) { setError('Add VITE_CLAUDE_API_KEY to your .env file to enable AI mood detection.'); return }
    setLoading(true); setError(''); setResult(null); setPlayingSong(null)
    try {
      const data = await detectMoodAndGetPlaylist(input.trim(), genre)
      setResult(data)
    } catch (e) {
      setError('Something went wrong. Check your API key and try again.')
    }
    setLoading(false)
  }

  const savePlaylist = () => {
    if (!result) return
    const pl = { id: Date.now(), mood: result.mood, input, genre, songs: result.playlist, summary: result.moodSummary, savedAt: new Date().toISOString() }
    setSaved(prev => [pl, ...prev.slice(0, 9)])
  }

  const alreadySaved = result && saved.some(s => s.input === input && s.mood === result.mood)

  const loadSaved = (pl) => {
    setResult({ mood: pl.mood, moodSummary: pl.summary, playlist: pl.songs })
    setInput(pl.input)
    setGenre(pl.genre)
    setShowSaved(false)
    setPlayingSong(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor, paddingTop: '80px', transition: 'background 1.2s ease', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow based on mood */}
      {currentMood && (
        <>
          <div style={{ position: 'fixed', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${currentMood.color}08 0%, transparent 70%)`, pointerEvents: 'none', transition: 'all 1.5s ease', zIndex: 0 }} />
          <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, ${currentMood.color}05 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.5rem 8rem', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '24px', height: '2px', background: currentMood ? currentMood.color : '#C2185B' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', color: currentMood ? currentMood.color : '#C2185B' }}>the lab</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 700, color: currentMood ? currentMood.text : '#F0EDE8', margin: 0, letterSpacing: '-0.02em', transition: 'color 1s ease' }}>
              MoodTunes 🎵
            </h1>
            <button onClick={() => setShowSaved(s => !s)}
              style={{ padding: '0.45rem 1rem', background: showSaved ? (currentMood?.color || '#C2185B') + '25' : 'rgba(255,255,255,0.07)', border: `2px solid ${currentMood?.color || '#C2185B'}40`, borderRadius: '8px', color: currentMood?.color || '#C2185B', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
              ♥ saved {saved.length > 0 ? `(${saved.length})` : ''}
            </button>
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'rgba(240,237,232,0.4)', margin: '0.4rem 0 0', fontStyle: 'italic' }}>
            tell me how you feel — I'll find the music
          </p>
        </div>

        {/* ── Saved playlists ── */}
        {showSaved && (
          <div style={{ marginBottom: '2rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.07)', borderRadius: '14px', animation: 'fadeUp 0.2s ease' }}>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.8rem' }}>SAVED PLAYLISTS</p>
            {saved.length === 0 ? (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>no saved playlists yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.7rem' }}>
                {saved.map(pl => (
                  <SavedCard key={pl.id} pl={pl} onLoad={loadSaved} onDelete={id => setSaved(prev => prev.filter(p => p.id !== id))} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Input ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
            <textarea
              ref={textRef}
              value={input}
              onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length) }}
              placeholder="I've been staring at the ceiling since 3am, thinking about everything and nothing at once..."
              rows={4}
              style={{
                width: '100%', padding: '1.1rem 1.2rem', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: `2px solid ${currentMood ? currentMood.color + '40' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '14px', outline: 'none', resize: 'none',
                color: '#F0EDE8', fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: 1.7,
                transition: 'border-color 0.3s',
                boxShadow: currentMood ? `0 0 0 3px ${currentMood.color}10` : 'none',
              }}
              onFocus={e => e.target.style.borderColor = (currentMood?.color || '#C2185B') + '80'}
              onBlur={e => e.target.style.borderColor = (currentMood?.color || '#C2185B') + '40'}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) generate() }}
            />
            <span style={{ position: 'absolute', bottom: '0.6rem', right: '0.8rem', fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>{charCount} · ⌘↵ to generate</span>
          </div>

          {/* Genre + Generate */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={genre} onChange={e => setGenre(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: `2px solid rgba(255,255,255,0.1)`, borderRadius: '8px', color: '#F0EDE8', fontFamily: 'Georgia, serif', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
              {GENRES.map(g => <option key={g.id} value={g.id} style={{ background: '#1A1A2E' }}>{g.label}</option>)}
            </select>
            <button onClick={generate} disabled={loading || !input.trim()}
              style={{
                flex: 1, minWidth: '160px', padding: '0.65rem 1.5rem',
                background: loading ? 'rgba(255,255,255,0.05)' : (currentMood?.color || '#C2185B'),
                border: `2px solid ${currentMood?.color || '#C2185B'}`,
                borderRadius: '8px', color: loading ? 'rgba(255,255,255,0.3)' : '#0A0A0F',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: !input.trim() ? 0.4 : 1,
                transition: 'all 0.2s', boxShadow: !loading && input.trim() ? `0 2px 0px ${currentMood?.color || '#C2185B'}88` : 'none',
              }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> reading your mood...
                </span>
              ) : '✦ find my music'}
            </button>
          </div>
          {error && <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#E05070', margin: '0.5rem 0 0' }}>⚠ {error}</p>}
        </div>

        {/* ── Result ── */}
        {result && currentMood && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Mood display */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: `${currentMood.color}08`, border: `2px solid ${currentMood.color}25`, borderRadius: '16px', flexWrap: 'wrap' }}>
              <MoodOrb mood={result.mood} active={true} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.4rem' }}>DETECTED MOOD</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: currentMood.text, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>{currentMood.label}</h2>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.moodSummary}"</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={savePlaylist} disabled={alreadySaved}
                    style={{ padding: '0.4rem 0.9rem', background: alreadySaved ? currentMood.color + '25' : currentMood.color, border: `2px solid ${currentMood.color}`, borderRadius: '7px', color: alreadySaved ? currentMood.text : '#0A0A0F', fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, cursor: alreadySaved ? 'default' : 'pointer', transition: 'all 0.15s', opacity: alreadySaved ? 0.7 : 1 }}>
                    {alreadySaved ? '✓ saved' : '♥ save playlist'}
                  </button>
                  <button onClick={() => { setResult(null); setInput(''); setPlayingSong(null) }}
                    style={{ padding: '0.4rem 0.9rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: '"Courier New", monospace', fontSize: '0.62rem', cursor: 'pointer' }}>
                    ↺ new mood
                  </button>
                </div>
              </div>
            </div>

            {/* Playlist */}
            <div>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', margin: '0 0 1rem' }}>
                PLAYLIST · {result.playlist.length} TRACKS {genre !== 'any' ? `· ${genre.toUpperCase()}` : ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {result.playlist.map((song, i) => (
                  <SongCard
                    key={i} song={song} index={i}
                    moodColor={currentMood.color}
                    moodBg={currentMood.bg}
                    onPlay={s => setPlayingSong(prev => prev?.title === s.title ? null : s)}
                    isPlaying={playingSong?.title === song.title}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.35 }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎵</div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#F0EDE8', fontStyle: 'italic' }}>your playlist will appear here</p>
          </div>
        )}
      </div>



      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        textarea::placeholder { color: rgba(240,237,232,0.2); }
        select option { background: #12121E; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}