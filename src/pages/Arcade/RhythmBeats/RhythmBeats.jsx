import { useState, useEffect, useRef, useCallback } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const LANE_COLORS  = ['#E8A040', '#E85870', '#5EC8A0', '#9B78E8']
const LANE_KEYS    = ['D', 'F', 'J', 'K']
const LANE_LABELS  = ['djembe', 'konga', 'hi-hat', 'talking']
const LANE_EMOJIS  = ['🥁', '🪘', '🎵', '📯']
const HIT_ZONE_Y   = 0.82   // fraction of canvas height
const NOTE_SPEED   = { easy: 220, medium: 320, hard: 440 }
const NOTE_RADIUS  = 22
const HIT_WINDOW   = 80     // ms window for perfect/good
const GOOD_WINDOW  = 140

// ── Rhythm patterns — beats as time offsets in ms ─────────────────────────────
const PATTERNS = {
  djembe: {
    name: 'Djembe Pulse',
    origin: 'West Africa',
    bpm: 100,
    notes: [
      // lane, time(ms)
      [0,0],[1,300],[2,600],[3,900],
      [0,1200],[0,1500],[1,1800],[2,2100],
      [3,2400],[1,2700],[0,3000],[2,3300],
      [1,3600],[3,3900],[0,4200],[1,4500],
      [2,4800],[0,5100],[3,5400],[1,5700],
      [2,6000],[0,6300],[1,6600],[3,6900],
      [0,7200],[2,7500],[1,7800],[0,8100],
    ],
  },
  konga: {
    name: 'Konga Flow',
    origin: 'Cuba / West Africa',
    bpm: 110,
    notes: [
      [0,0],[2,200],[1,400],[3,600],
      [0,800],[1,1000],[2,1200],[0,1400],
      [3,1600],[1,1800],[0,2000],[2,2200],
      [1,2400],[0,2600],[3,2800],[2,3000],
      [0,3200],[1,3400],[0,3600],[2,3800],
      [3,4000],[0,4200],[1,4400],[2,4600],
      [0,4800],[3,5000],[1,5200],[0,5400],
      [2,5600],[1,5800],[3,6000],[0,6200],
    ],
  },
  afrobeats: {
    name: 'Afrobeats Hi-Hat',
    origin: 'Nigeria / Ghana',
    bpm: 95,
    notes: [
      [2,0],[2,200],[0,400],[2,600],
      [2,800],[1,1000],[2,1200],[3,1400],
      [2,1600],[2,1800],[0,2000],[2,2200],
      [1,2400],[2,2600],[3,2800],[2,3000],
      [0,3200],[2,3400],[2,3600],[1,3800],
      [2,4000],[3,4200],[2,4400],[0,4600],
      [2,4800],[1,5000],[2,5200],[2,5400],
      [3,5600],[0,5800],[2,6000],[1,6200],
    ],
  },
  talking: {
    name: 'Talking Drum',
    origin: 'Yoruba, Nigeria',
    bpm: 120,
    notes: [
      [3,0],[0,250],[3,500],[1,750],
      [3,1000],[2,1250],[3,1500],[0,1750],
      [1,2000],[3,2250],[2,2500],[3,2750],
      [0,3000],[3,3250],[1,3500],[3,3750],
      [2,4000],[0,4250],[3,4500],[3,4750],
      [1,5000],[2,5250],[3,5500],[0,5750],
      [3,6000],[1,6250],[2,6500],[3,6750],
    ],
  },
  world: {
    name: 'World Fusion',
    origin: 'Global',
    bpm: 105,
    notes: [
      [0,0],[1,200],[2,400],[3,600],
      [0,700],[2,800],[1,1000],[3,1200],
      [0,1300],[1,1500],[0,1700],[2,1900],
      [3,2000],[1,2200],[2,2400],[0,2600],
      [3,2700],[0,2900],[1,3100],[2,3200],
      [3,3400],[0,3600],[1,3700],[3,3900],
      [2,4100],[0,4200],[3,4400],[1,4600],
      [0,4700],[2,4900],[1,5100],[3,5200],
      [0,5400],[2,5500],[3,5700],[1,5900],
    ],
  },
}

const PATTERN_LIST = Object.entries(PATTERNS).map(([id, p]) => ({ id, ...p }))

// ── Tiny feedback flash ───────────────────────────────────────────────────────
function Flash({ flashes }) {
  return (
    <>
      {flashes.map(f => (
        <div key={f.id} style={{
          position: 'absolute',
          left: `${f.x}px`, top: `${f.y}px`,
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Georgia, serif',
          fontSize: f.type === 'PERFECT' ? '1.1rem' : '0.9rem',
          fontWeight: 700,
          color: f.type === 'PERFECT' ? '#FFD700' : f.type === 'GOOD' ? '#5EC8A0' : '#E85870',
          pointerEvents: 'none',
          animation: 'flashUp 0.6s ease forwards',
          whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
          {f.type === 'PERFECT' ? '✦ perfect' : f.type === 'GOOD' ? 'good' : 'miss'}
        </div>
      ))}
    </>
  )
}

// ── Menu screen ───────────────────────────────────────────────────────────────
function MenuScreen({ onStart }) {
  const [pattern,    setPattern]    = useState('djembe')
  const [difficulty, setDifficulty] = useState('easy')
  const [hov,        setHov]        = useState(null)

  const diffColors = { easy: '#5EC8A0', medium: '#E8A040', hard: '#E85870' }

  return (
    <div style={{
      maxWidth: '600px', margin: '0 auto',
      padding: '3rem 1.5rem 4rem',
      animation: 'fadeUp 0.35s ease',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{ width: '28px', height: '2px', background: '#E8A040' }} />
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#E8A040' }}>the arcade</span>
        </div>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: 700, color: '#F5ECD8',
          margin: '0 0 0.3rem', lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}>Rhythm of the Drum</h1>
        <p style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.78rem', color: 'rgba(245,236,216,0.4)',
          letterSpacing: '0.04em',
        }}>4 lanes · hit the notes · feel the beat</p>
      </div>

      {/* Controls reminder */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap',
      }}>
        {LANE_KEYS.map((k, i) => (
          <div key={k} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.9rem',
            background: 'rgba(255,255,255,0.04)',
            border: `2px solid ${LANE_COLORS[i]}40`,
            borderRadius: '8px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: LANE_COLORS[i] + '20',
              border: `2px solid ${LANE_COLORS[i]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.8rem', fontWeight: 700,
              color: LANE_COLORS[i],
            }}>{k}</div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: '#F5ECD8', fontWeight: 700 }}>{LANE_EMOJIS[i]}</div>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(245,236,216,0.35)', letterSpacing: '0.05em' }}>{LANE_LABELS[i]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern select */}
      <div style={{ marginBottom: '1.8rem' }}>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(245,236,216,0.4)', margin: '0 0 0.7rem' }}>
          CHOOSE A RHYTHM
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {PATTERN_LIST.map((p, i) => (
            <button key={p.id}
              onClick={() => setPattern(p.id)}
              onMouseEnter={() => setHov(p.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.8rem 1.1rem',
                background: pattern === p.id ? 'rgba(232,160,64,0.12)' : hov === p.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `2px solid ${pattern === p.id ? '#E8A040' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.13s',
                boxShadow: pattern === p.id ? '0 2px 0px #A06010' : 'none',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700,
                  color: pattern === p.id ? '#E8A040' : '#F5ECD8',
                  transition: 'color 0.13s',
                }}>{p.name}</div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: 'rgba(245,236,216,0.35)', marginTop: '0.1rem' }}>
                  {p.origin} · {p.bpm} bpm
                </div>
              </div>
              {pattern === p.id && (
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#E8A040' }}>selected ✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(245,236,216,0.4)', margin: '0 0 0.7rem' }}>
          DIFFICULTY
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {['easy', 'medium', 'hard'].map(d => (
            <button key={d}
              onClick={() => setDifficulty(d)}
              style={{
                flex: 1, padding: '0.65rem',
                background: difficulty === d ? diffColors[d] + '20' : 'transparent',
                border: `2px solid ${difficulty === d ? diffColors[d] : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: difficulty === d ? 700 : 400,
                color: difficulty === d ? diffColors[d] : 'rgba(245,236,216,0.45)',
                transition: 'all 0.13s',
                boxShadow: difficulty === d ? `0 2px 0px ${diffColors[d]}80` : 'none',
              }}
            >{d}</button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(pattern, difficulty)}
        style={{
          width: '100%', padding: '1rem',
          background: '#E8A040', border: 'none', borderRadius: '8px',
          color: '#1A0E00', fontFamily: 'Georgia, serif',
          fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 0px #A06010',
          transition: 'all 0.13s',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { e.target.style.background = '#D09030'; e.target.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.target.style.background = '#E8A040'; e.target.style.transform = 'none' }}
      >
        start playing →
      </button>
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({ score, perfect, good, miss, total, pattern, difficulty, onReplay, onMenu }) {
  const pct      = total > 0 ? Math.round(((perfect + good) / total) * 100) : 0
  const grade    = pct >= 95 ? 'S' : pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 55 ? 'C' : pct >= 40 ? 'D' : 'F'
  const gradeCol = { S: '#FFD700', A: '#E8A040', B: '#5EC8A0', C: '#9B78E8', D: '#E8A040', F: '#E85870' }[grade]
  const msg      = pct >= 95 ? 'flawless rhythm.' : pct >= 85 ? 'you felt that.' : pct >= 70 ? 'getting there.' : pct >= 55 ? 'keep practising.' : 'the drums will teach you.'

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 1.5rem 4rem', animation: 'fadeUp 0.4s ease', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '100px', height: '100px',
        border: `4px solid ${gradeCol}`,
        borderRadius: '14px', background: gradeCol + '18',
        transform: 'rotate(-2deg)', marginBottom: '1.3rem',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '4rem', fontWeight: 700, color: gradeCol, lineHeight: 1 }}>{grade}</span>
      </div>

      <p style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)', fontWeight: 700, color: '#F5ECD8', margin: '0 0 0.3rem' }}>
        {score.toLocaleString()} pts
      </p>
      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: 'rgba(245,236,216,0.38)', margin: '0 0 2rem', letterSpacing: '0.04em' }}>
        {msg}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem', marginBottom: '2rem' }}>
        {[
          { label: 'perfect', value: perfect, color: '#FFD700' },
          { label: 'good',    value: good,    color: '#5EC8A0' },
          { label: 'miss',    value: miss,    color: '#E85870' },
          { label: 'accuracy', value: `${pct}%`, color: gradeCol },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '0.8rem 0.3rem',
            background: 'rgba(255,255,255,0.04)',
            border: `2px solid ${color}25`, borderRadius: '10px',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(245,236,216,0.3)', marginTop: '0.15rem', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <button onClick={onReplay}
          style={{
            padding: '0.9rem', background: '#E8A040', border: 'none', borderRadius: '8px',
            color: '#1A0E00', fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 3px 0px #A06010', transition: 'all 0.13s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >play again</button>
        <button onClick={onMenu}
          style={{
            padding: '0.9rem', background: 'transparent',
            border: '2px solid rgba(255,255,255,0.12)', borderRadius: '8px',
            color: 'rgba(245,236,216,0.5)', fontFamily: 'Georgia, serif',
            fontSize: '0.92rem', cursor: 'pointer', transition: 'all 0.13s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8A040'; e.currentTarget.style.color = '#E8A040' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(245,236,216,0.5)' }}
        >← back to menu</button>
      </div>
    </div>
  )
}

// ── Main game ─────────────────────────────────────────────────────────────────
export default function RhythmDrum() {
  const [screen,     setScreen]     = useState('menu')
  const [patternId,  setPatternId]  = useState('djembe')
  const [difficulty, setDifficulty] = useState('easy')
  const [score,      setScore]      = useState(0)
  const [combo,      setCombo]      = useState(0)
  const [results,    setResults]    = useState(null)
  const [flashes,    setFlashes]    = useState([])

  const canvasRef    = useRef(null)
  const gameRef      = useRef({})
  const rafRef       = useRef(null)
  const keysRef      = useRef(new Set())
  const flashIdRef   = useRef(0)

  const CANVAS_W = 520
  const CANVAS_H = 560

  const addFlash = useCallback((lane, type) => {
    const id = flashIdRef.current++
    const x  = (lane + 0.5) * (CANVAS_W / 4)
    const y  = HIT_ZONE_Y * CANVAS_H - 30
    setFlashes(prev => [...prev, { id, x, y, type }])
    setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 620)
  }, [])

  const startGame = useCallback((pid, diff) => {
    const pattern = PATTERNS[pid]
    const speed   = NOTE_SPEED[diff]

    // Build note queue — extend pattern by looping
    const baseNotes = pattern.notes
    const loopMs    = (baseNotes[baseNotes.length - 1][1] || 0) + 1200
    const allNotes  = []
    for (let loop = 0; loop < 3; loop++) {
      baseNotes.forEach(([lane, t]) => {
        allNotes.push({ lane, time: t + loop * loopMs, hit: false, missed: false, y: -NOTE_RADIUS })
      })
    }
    allNotes.sort((a, b) => a.time - b.time)

    gameRef.current = {
      notes:      allNotes,
      startTime:  performance.now(),
      speed,
      score:      0,
      combo:      0,
      perfect:    0,
      good:       0,
      miss:       0,
      total:      allNotes.length,
      lanePress:  [0, 0, 0, 0],
      active:     true,
    }

    setScore(0)
    setCombo(0)
    setScreen('game')
  }, [])

  // ── Game loop ──
  useEffect(() => {
    if (screen !== 'game') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g   = gameRef.current

    const LANE_W = CANVAS_W / 4
    const HIT_Y  = HIT_ZONE_Y * CANVAS_H

    const draw = (now) => {
      if (!g.active) return
      const elapsed = now - g.startTime

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // Background
      ctx.fillStyle = '#0E0A06'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      // Lane backgrounds + subtle vertical lines
      for (let i = 0; i < 4; i++) {
        const x = i * LANE_W
        const col = LANE_COLORS[i]

        // Lane bg
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.1)'
        ctx.fillRect(x, 0, LANE_W, CANVAS_H)

        // Lane dividers
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.07)'
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke()
        }

        // Hit zone
        const pressing = g.lanePress[i] > 0
        ctx.fillStyle = pressing ? col + '35' : col + '12'
        ctx.fillRect(x + 4, HIT_Y - NOTE_RADIUS - 4, LANE_W - 8, NOTE_RADIUS * 2 + 8)

        // Hit zone line
        ctx.strokeStyle = pressing ? col : col + '60'
        ctx.lineWidth = pressing ? 3 : 2
        ctx.beginPath(); ctx.moveTo(x + 4, HIT_Y); ctx.lineTo(x + LANE_W - 4, HIT_Y); ctx.stroke()

        // Key label
        ctx.fillStyle = pressing ? col : col + '80'
        ctx.font = `bold 13px "Courier New"`
        ctx.textAlign = 'center'
        ctx.fillText(LANE_KEYS[i], x + LANE_W / 2, HIT_Y + NOTE_RADIUS + 18)

        // Lane emoji
        ctx.font = '16px serif'
        ctx.fillText(LANE_EMOJIS[i], x + LANE_W / 2, HIT_Y + NOTE_RADIUS + 36)
      }

      // Top gradient fade
      const topGrad = ctx.createLinearGradient(0, 0, 0, 60)
      topGrad.addColorStop(0, '#0E0A06')
      topGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, CANVAS_W, 60)

      // Notes
      g.notes.forEach(note => {
        if (note.hit || note.missed) return
        const travelTime = (CANVAS_H * HIT_ZONE_Y + NOTE_RADIUS) / g.speed * 1000
        const noteTime   = note.time - elapsed
        const y          = HIT_Y - (noteTime / travelTime) * (CANVAS_H * HIT_ZONE_Y + NOTE_RADIUS)

        if (y < -NOTE_RADIUS * 2 || y > CANVAS_H + NOTE_RADIUS) return

        const x   = note.lane * LANE_W + LANE_W / 2
        const col = LANE_COLORS[note.lane]

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, NOTE_RADIUS * 2.2)
        grd.addColorStop(0, col + '50')
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.fillRect(x - NOTE_RADIUS * 2.2, y - NOTE_RADIUS * 2.2, NOTE_RADIUS * 4.4, NOTE_RADIUS * 4.4)

        // Note circle
        ctx.beginPath()
        ctx.arc(x, y, NOTE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()

        // Inner shine
        ctx.beginPath()
        ctx.arc(x - 5, y - 5, NOTE_RADIUS * 0.38, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fill()

        // Check miss
        if (y > CANVAS_H - 10 && !note.missed) {
          note.missed = true
          g.miss++
          g.combo = 0
          setCombo(0)
        }
      })

      // Score/combo overlay
      ctx.fillStyle = 'rgba(245,236,216,0.7)'
      ctx.font = `bold 20px Georgia`
      ctx.textAlign = 'right'
      ctx.fillText(g.score.toLocaleString(), CANVAS_W - 12, 30)

      if (g.combo >= 3) {
        ctx.fillStyle = '#E8A040'
        ctx.font = `bold 14px "Courier New"`
        ctx.textAlign = 'right'
        ctx.fillText(`${g.combo}x combo`, CANVAS_W - 12, 50)
      }

      // Check if done
      const allDone = g.notes.every(n => n.hit || n.missed)
      if (allDone) {
        g.active = false
        setResults({
          score:   g.score,
          perfect: g.perfect,
          good:    g.good,
          miss:    g.miss,
          total:   g.total,
        })
        setScreen('results')
        return
      }

      // Decay press glow
      g.lanePress = g.lanePress.map(v => Math.max(0, v - 0.08))

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [screen])

  // ── Key handling ──
  useEffect(() => {
    if (screen !== 'game') return
    const g = gameRef.current

    const onKey = (e) => {
      if (e.repeat) return
      const key  = e.key.toUpperCase()
      const lane = LANE_KEYS.indexOf(key)
      if (lane === -1) return

      g.lanePress[lane] = 1

      // Find closest unhit note in this lane
      const elapsed = performance.now() - g.startTime
      let best = null, bestDiff = Infinity

      g.notes.forEach(note => {
        if (note.hit || note.missed || note.lane !== lane) return
        const diff = Math.abs(note.time - elapsed)
        if (diff < bestDiff) { bestDiff = diff; best = note }
      })

      if (!best) return

      if (bestDiff <= HIT_WINDOW) {
        best.hit = true
        g.combo++
        g.perfect++
        const pts = 100 * Math.min(g.combo, 8)
        g.score += pts
        setScore(g.score)
        setCombo(g.combo)
        addFlash(lane, 'PERFECT')
      } else if (bestDiff <= GOOD_WINDOW) {
        best.hit = true
        g.combo++
        g.good++
        const pts = 50 * Math.min(g.combo, 8)
        g.score += pts
        setScore(g.score)
        setCombo(g.combo)
        addFlash(lane, 'GOOD')
      } else {
        g.combo = 0
        g.miss++
        setCombo(0)
        addFlash(lane, 'MISS')
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, addFlash])

  // Mobile touch handler
  const handleTouch = (lane) => {
    if (screen !== 'game') return
    const fakeEvent = { key: LANE_KEYS[lane].toLowerCase(), repeat: false }
    const onKey = window._rhythmKeyHandler
    if (onKey) onKey(fakeEvent)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0E0A06 0%, #120C08 100%)',
      paddingTop: '80px',
    }}>
      {screen === 'menu' && (
        <MenuScreen onStart={(pid, diff) => {
          setPatternId(pid); setDifficulty(diff)
          startGame(pid, diff)
        }} />
      )}

      {screen === 'game' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem 2rem' }}>
          {/* Info bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', maxWidth: `${CANVAS_W}px`,
            marginBottom: '0.8rem',
          }}>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: '#F5ECD8', margin: 0 }}>
                {PATTERNS[patternId].name}
              </p>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(245,236,216,0.35)', margin: 0, letterSpacing: '0.06em' }}>
                {difficulty} · {PATTERNS[patternId].origin}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#E8A040', margin: 0 }}>
                {score.toLocaleString()}
              </p>
              {combo >= 3 && (
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#E8A040', margin: 0, letterSpacing: '0.06em' }}>
                  {combo}x combo
                </p>
              )}
            </div>
          </div>

          {/* Canvas wrapper */}
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(232,160,64,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display: 'block', maxWidth: '100%' }}
            />
            <Flash flashes={flashes} />
          </div>

          {/* Mobile touch buttons */}
          <div style={{
            display: 'flex', gap: '0.4rem', marginTop: '0.8rem', width: '100%', maxWidth: `${CANVAS_W}px`,
          }}>
            {LANE_KEYS.map((k, i) => (
              <button key={k}
                onPointerDown={() => handleTouch(i)}
                style={{
                  flex: 1, padding: '1.1rem 0',
                  background: LANE_COLORS[i] + '18',
                  border: `2px solid ${LANE_COLORS[i]}50`,
                  borderRadius: '10px',
                  color: LANE_COLORS[i],
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >{LANE_EMOJIS[i]}<br /><span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{k}</span></button>
            ))}
          </div>

          <button
            onClick={() => { gameRef.current.active = false; setScreen('menu') }}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.2rem',
              background: 'transparent', border: '2px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'rgba(245,236,216,0.35)',
              fontFamily: '"Courier New", monospace', fontSize: '0.7rem',
              cursor: 'pointer', transition: 'all 0.13s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85870'; e.currentTarget.style.color = '#E85870' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,236,216,0.35)' }}
          >quit game</button>
        </div>
      )}

      {screen === 'results' && results && (
        <ResultsScreen
          {...results}
          pattern={patternId}
          difficulty={difficulty}
          onReplay={() => startGame(patternId, difficulty)}
          onMenu={() => setScreen('menu')}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flashUp {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          60%  { opacity: 1; transform: translate(-50%,-80%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%,-110%) scale(0.9); }
        }
      `}</style>
    </div>
  )
}