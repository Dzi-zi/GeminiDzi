import { useState, useEffect, useRef } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 900
const H = 480
const FLOOR = 380
const GRAVITY = 0.6
const JUMP_VEL = -13

// ── Animal definitions ────────────────────────────────────────────────────────
const ANIMALS = [
  { id: 'cheetah',  name: 'Cheetah',  emoji: '🐆', bodyColor: '#D4AF37', accentColor: '#8B6914', w: 52, h: 38, maxJumps: 1, speedMult: 1.15, jumpMult: 1.0,  desc: 'Fastest. Speed boost lasts longer.' },
  { id: 'gazelle',  name: 'Gazelle',  emoji: '🦌', bodyColor: '#C8A870', accentColor: '#8B6340', w: 44, h: 44, maxJumps: 2, speedMult: 1.0,  jumpMult: 1.25, desc: 'Double jump. Leaps highest.' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', bodyColor: '#9E9E9E', accentColor: '#757575', w: 64, h: 52, maxJumps: 1, speedMult: 0.9,  jumpMult: 0.85, desc: 'Breaks rocks. Shield lasts 2x longer.' },
  { id: 'eagle',    name: 'Eagle',    emoji: '🦅', bodyColor: '#5D4037', accentColor: '#FFEB3B', w: 48, h: 36, maxJumps: 1, speedMult: 1.1,  jumpMult: 1.1,  desc: 'Hold jump to glide. Skips rivers.' },
]

// ── Draw animal ───────────────────────────────────────────────────────────────
function drawAnimal(ctx, animal, x, y, frame, ducking, shielded) {
  const w = animal.w
  const h = ducking ? 24 : animal.h
  const legWave = Math.sin(frame * 0.25) * 4

  ctx.globalAlpha = 1

  // shield ring
  if (shielded) {
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, w * 0.7, 0, Math.PI * 2)
    ctx.strokeStyle = '#4ECDC4'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // body
  ctx.fillStyle = animal.bodyColor
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, y + h * 0.6, w * 0.44, h * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()

  // head
  ctx.fillStyle = animal.bodyColor
  ctx.beginPath()
  ctx.ellipse(x + w * 0.82, y + h * 0.28, 11, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // eye
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(x + w * 0.88, y + h * 0.24, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // accent
  ctx.fillStyle = animal.accentColor
  ctx.beginPath()
  ctx.ellipse(x + w * 0.45, y + h * 0.55, w * 0.2, h * 0.11, 0, 0, Math.PI * 2)
  ctx.fill()

  // legs
  if (!ducking) {
    ctx.strokeStyle = animal.bodyColor
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    const legs = [[0.65, legWave], [0.75, -legWave], [0.3, -legWave], [0.42, legWave]]
    legs.forEach(([lx, off]) => {
      ctx.beginPath()
      ctx.moveTo(x + w * lx, y + h * 0.85)
      ctx.lineTo(x + w * lx + off, y + h + 4)
      ctx.stroke()
    })
  }

  // tail
  ctx.strokeStyle = animal.bodyColor
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.1, y + h * 0.5)
  ctx.quadraticCurveTo(x - 8, y + h * 0.3, x - 2, y + h * 0.1)
  ctx.stroke()

  // eagle wings
  if (animal.id === 'eagle') {
    const wb = ducking ? 0 : Math.sin(frame * 0.2) * 12
    ctx.fillStyle = '#3E2723'
    ctx.beginPath()
    ctx.moveTo(x + w * 0.5, y + h * 0.5)
    ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.2 - wb, x, y + h * 0.6)
    ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.65, x + w * 0.5, y + h * 0.5)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x + w * 0.5, y + h * 0.5)
    ctx.quadraticCurveTo(x + w * 0.9, y + h * 0.2 - wb, x + w, y + h * 0.6)
    ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.65, x + w * 0.5, y + h * 0.5)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

// ── Draw obstacle ─────────────────────────────────────────────────────────────
function drawObstacle(ctx, obs, frame) {
  ctx.globalAlpha = 1
  const { type, x, y, w, h } = obs

  if (type === 'acacia') {
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(x + w * 0.38, y + h * 0.5, w * 0.24, h * 0.5)
    ctx.fillStyle = '#2E7D32'
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.35, w * 0.5, h * 0.3, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#388E3C'
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.2, w * 0.38, h * 0.22, 0, 0, Math.PI * 2); ctx.fill()

  } else if (type === 'rock') {
    ctx.fillStyle = '#455A64'
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.65, w * 0.5, h * 0.42, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#607D8B'
    ctx.beginPath(); ctx.ellipse(x + w * 0.44, y + h * 0.48, w * 0.36, h * 0.34, -0.2, 0, Math.PI * 2); ctx.fill()

  } else if (type === 'termite') {
    ctx.fillStyle = '#795548'
    ctx.beginPath(); ctx.moveTo(x + w * 0.08, y + h); ctx.lineTo(x + w * 0.5, y); ctx.lineTo(x + w * 0.92, y + h); ctx.fill()
    ctx.fillStyle = '#A1887F'
    ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h); ctx.lineTo(x + w * 0.5, y + h * 0.2); ctx.lineTo(x + w * 0.8, y + h); ctx.fill()

  } else if (type === 'river') {
    ctx.fillStyle = '#0288D1'; ctx.fillRect(x, y, w, h)
    const wv = Math.sin(frame * 0.1) * 3
    ctx.fillStyle = '#29B6F6'
    ctx.beginPath(); ctx.ellipse(x + w * 0.25, y + h * 0.5 + wv, 14, 5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + w * 0.65, y + h * 0.5 - wv, 14, 5, 0, 0, Math.PI * 2); ctx.fill()

  } else if (type === 'wildebeest') {
    const bob = Math.sin(frame * 0.2 + (obs.phase || 0)) * 3
    ctx.fillStyle = '#4E342E'
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.58 + bob, w * 0.42, h * 0.3, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + w * 0.78, y + h * 0.38 + bob, 12, 10, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x + w * 0.8, y + h * 0.28 + bob); ctx.lineTo(x + w * 0.76, y - 4 + bob); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + w * 0.72, y + h * 0.28 + bob); ctx.lineTo(x + w * 0.68, y - 3 + bob); ctx.stroke()
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 3
    const ls = Math.sin(frame * 0.28 + (obs.phase || 0)) * 5
    ;[[0.28, -ls], [0.42, ls], [0.58, -ls], [0.7, ls]].forEach(([lx, off]) => {
      ctx.beginPath(); ctx.moveTo(x + w * lx, y + h * 0.82 + bob); ctx.lineTo(x + w * lx + off, y + h + bob); ctx.stroke()
    })

  } else if (type === 'lightning') {
    if (Math.floor(frame / 5) % 2 === 0) {
      ctx.save()
      ctx.shadowColor = '#FFEB3B'; ctx.shadowBlur = 16
      ctx.strokeStyle = '#FFEB3B'; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x + w * 0.5, y)
      ctx.lineTo(x + w * 0.25, y + h * 0.4)
      ctx.lineTo(x + w * 0.65, y + h * 0.4)
      ctx.lineTo(x + w * 0.15, y + h)
      ctx.stroke()
      ctx.restore()
    }
  }
  ctx.globalAlpha = 1
}

// ── Background ────────────────────────────────────────────────────────────────
function drawBG(ctx, scrollX) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR)
  sky.addColorStop(0, '#1A3000')
  sky.addColorStop(0.5, '#4A7C20')
  sky.addColorStop(1, '#6BAD38')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, FLOOR)

  // sun
  ctx.fillStyle = '#FFEB3B'
  ctx.beginPath(); ctx.arc(W * 0.82, 55, 24, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,235,59,0.14)'
  ctx.beginPath(); ctx.arc(W * 0.82, 55, 42, 0, Math.PI * 2); ctx.fill()

  // mountains (20% parallax)
  ctx.fillStyle = '#2D5010'
  for (let i = 0; i < 6; i++) {
    const mx = ((i * 220 - scrollX * 0.2) % (W + 220) + W + 220) % (W + 220) - 110
    ctx.beginPath(); ctx.moveTo(mx, FLOOR - 10); ctx.lineTo(mx + 150, FLOOR - 100); ctx.lineTo(mx + 300, FLOOR - 10); ctx.fill()
  }

  // trees (40% parallax)
  for (let i = 0; i < 8; i++) {
    const tx = ((i * 180 - scrollX * 0.4) % (W + 200) + W + 200) % (W + 200) - 100
    const th = 42 + (i % 3) * 16
    ctx.fillStyle = '#4E342E'; ctx.fillRect(tx + 14, FLOOR - th, 5, th)
    ctx.fillStyle = '#33691E'
    ctx.beginPath(); ctx.ellipse(tx + 16, FLOOR - th - 12, 20, 13, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#558B2F'
    ctx.beginPath(); ctx.ellipse(tx + 16, FLOOR - th - 22, 13, 9, 0, 0, Math.PI * 2); ctx.fill()
  }

  // ground
  ctx.fillStyle = '#8B6914'; ctx.fillRect(0, FLOOR, W, H - FLOOR)
  ctx.fillStyle = '#6BAD38'; ctx.fillRect(0, FLOOR, W, 8)

  // grass tufts (full speed parallax)
  ctx.strokeStyle = '#558B2F'; ctx.lineWidth = 2
  for (let i = 0; i < 24; i++) {
    const gx = ((i * 55 - scrollX) % (W + 60) + W + 60) % (W + 60) - 30
    ctx.beginPath(); ctx.moveTo(gx, FLOOR + 6); ctx.lineTo(gx - 4, FLOOR - 5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(gx + 5, FLOOR + 6); ctx.lineTo(gx + 9, FLOOR - 6); ctx.stroke()
  }
}

// ── Powerup types ─────────────────────────────────────────────────────────────
const PU_TYPES = [
  { id: 'speed',  sym: '⚡', col: '#FF6B35', dur: 280 },
  { id: 'shield', sym: '🛡', col: '#4ECDC4', dur: 220 },
  { id: 'magnet', sym: '🧲', col: '#D4AF37', dur: 340 },
]

// ── Obstacle definitions ──────────────────────────────────────────────────────
const OBS_DEFS = [
  { type: 'acacia',     w: 44, h: 70 },
  { type: 'rock',       w: 52, h: 40 },
  { type: 'termite',    w: 34, h: 58 },
  { type: 'river',      w: 90, h: 22 },
  { type: 'wildebeest', w: 56, h: 46 },
  { type: 'lightning',  w: 18, h: 82 },
]

// ── Scores ────────────────────────────────────────────────────────────────────
function getScores() { try { return JSON.parse(localStorage.getItem('savanna_v3') || '[]') } catch { return [] } }
function saveScore(name, score) {
  const s = getScores(); s.push({ name, score }); s.sort((a, b) => b.score - a.score)
  try { localStorage.setItem('savanna_v3', JSON.stringify(s.slice(0, 10))) } catch {}
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function Menu({ onStart }) {
  const [sel, setSel] = useState(0)
  const [showScores, setShowScores] = useState(false)
  const scores = getScores()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1A3000 0%,#3D2000 50%,#4CAF50 88%,#2E7D32 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', paddingTop: '100px' }}>
      <div style={{ position: 'absolute', top: 110, right: 130, width: 60, height: 60, borderRadius: '50%', background: '#FFEB3B', boxShadow: '0 0 50px rgba(255,235,59,0.5)' }} />
      <div style={{ maxWidth: 600, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: '"Courier New",monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: '#D4AF37', marginBottom: '0.4rem' }}>ENDLESS RUNNER</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,7vw,3.5rem)', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.2rem', textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>Savanna Sprint</h1>
          <p style={{ fontFamily: 'Georgia,serif', fontSize: '0.85rem', color: 'rgba(240,237,232,0.45)', fontStyle: 'italic', margin: 0 }}>outrun the storm</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.65rem', marginBottom: '1.1rem' }}>
          {ANIMALS.map((a, i) => (
            <button key={a.id} onClick={() => setSel(i)} style={{ padding: '0.9rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', background: sel === i ? `${a.bodyColor}22` : 'rgba(0,0,0,0.38)', border: `2px solid ${sel === i ? a.bodyColor : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.14s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{a.emoji}</span>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: '0.88rem', fontWeight: 700, color: '#F0EDE8' }}>{a.name}</span>
              </div>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>{a.desc}</p>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', marginBottom: '0.6rem' }}>
          <button onClick={() => onStart(ANIMALS[sel])} style={{ padding: '0.72rem 2rem', background: '#2E7D32', border: '2px solid #4CAF50', borderRadius: '10px', color: '#F0EDE8', fontFamily: 'Georgia,serif', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #1B5E20' }}>🐾 Sprint!</button>
          <button onClick={() => setShowScores(s => !s)} style={{ padding: '0.72rem 1.1rem', background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(212,175,55,0.4)', borderRadius: '10px', color: '#D4AF37', fontFamily: '"Courier New",monospace', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}>🏆 Scores</button>
        </div>
        {showScores && (
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(212,175,55,0.28)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontFamily: '"Courier New",monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: '#D4AF37', marginBottom: '0.5rem' }}>HIGH SCORES</div>
            {scores.length === 0 && <p style={{ fontFamily: 'Georgia,serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', margin: 0 }}>no scores yet</p>}
            {scores.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New",monospace', fontSize: '0.65rem', color: i === 0 ? '#D4AF37' : 'rgba(255,255,255,0.45)', padding: '0.18rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>{i + 1}. {s.name}</span><span>{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Game ──────────────────────────────────────────────────────────────────────
function Game({ animal, onBack }) {
  const canvasRef = useRef(null)
  const keys = useRef({})
  const prevJump = useRef(false)
  const [phase, setPhase] = useState('play')
  const [deadScore, setDeadScore] = useState(0)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  // All mutable game state in one plain object — never touched by React
  const G = useRef(null)

  function makeState() {
    return {
      px: 100, py: FLOOR - animal.h,
      pvy: 0, ph: animal.h,
      ducking: false, onGround: true, jumps: 0,
      scrollX: 0, speed: 5, frame: 0,
      score: 0, coins: 0,
      nextObs: 220, nextCoin: 120, nextPU: 400,
      obstacles: [], coinObjs: [], puObjs: [], particles: [],
      activePU: null, puTimer: 0,
      stormX: -W * 3,
    }
  }

  useEffect(() => {
    G.current = makeState()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let alive = true
    let rafId

    const onDown = e => {
      keys.current[e.code] = true
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault()
    }
    const onUp = e => { keys.current[e.code] = false }
    window.addEventListener('keydown', onDown, { passive: false })
    window.addEventListener('keyup', onUp)

    function die(score) {
      alive = false
      cancelAnimationFrame(rafId)
      setDeadScore(score)
      setPhase('dead')
    }

    function tick() {
      if (!alive) return
      const g = G.current
      g.frame++
      const fr = g.frame

      // speed
      g.speed = Math.min(5 + g.score / 900, 13) * animal.speedMult

      // jump
      const wantJump = !!(keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW'])
      if (wantJump && !prevJump.current && g.jumps < animal.maxJumps) {
        g.pvy = JUMP_VEL * animal.jumpMult
        g.onGround = false
        g.jumps++
        for (let i = 0; i < 5; i++) g.particles.push({ x: g.px + animal.w / 2, y: FLOOR, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 3 - 1, life: 16, col: '#C8A850' })
      }
      prevJump.current = wantJump

      // eagle glide
      if (animal.id === 'eagle' && wantJump && g.pvy > 0) g.pvy *= 0.88

      // duck
      const wantDuck = !!(keys.current['ArrowDown'] || keys.current['KeyS'])
      g.ducking = wantDuck && g.onGround
      g.ph = g.ducking ? 24 : animal.h

      // gravity
      g.pvy += GRAVITY
      g.py += g.pvy
      if (g.py + g.ph >= FLOOR) {
        g.py = FLOOR - g.ph
        g.pvy = 0
        g.onGround = true
        g.jumps = 0
      } else {
        g.onGround = false
      }

      // storm — starts at -W*3 (~2700px left of player at x=100), inches forward
      g.stormX += 0.22 + g.score / 18000
      const shielded = g.activePU?.id === 'shield'
      if (g.stormX >= g.px - 10 && !shielded) { die(g.score); return }

      // scroll
      g.scrollX += g.speed

      // spawn obstacles
      g.nextObs -= g.speed
      if (g.nextObs <= 0) {
        const pool = OBS_DEFS.filter(o => !(o.type === 'river' && animal.id === 'eagle'))
        const def = pool[Math.floor(Math.random() * pool.length)]
        g.obstacles.push({ ...def, x: W + 20, y: FLOOR - def.h, phase: Math.random() * Math.PI * 2 })
        g.nextObs = 150 + Math.random() * 200
      }

      // spawn coins
      g.nextCoin -= g.speed
      if (g.nextCoin <= 0) {
        const n = 1 + Math.floor(Math.random() * 4)
        for (let i = 0; i < n; i++) g.coinObjs.push({ x: W + 20 + i * 30, y: FLOOR - 55 - Math.random() * 70, picked: false })
        g.nextCoin = 90 + Math.random() * 110
      }

      // spawn powerups
      g.nextPU -= g.speed
      if (g.nextPU <= 0) {
        const pt = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)]
        g.puObjs.push({ ...pt, x: W + 20, y: FLOOR - 90, picked: false })
        g.nextPU = 500 + Math.random() * 400
      }

      // move left
      const spd = g.activePU?.id === 'speed' ? g.speed * 1.5 : g.speed
      g.obstacles.forEach(o => { o.x -= spd; if (o.type === 'wildebeest') o.x -= 1.2 })
      g.obstacles = g.obstacles.filter(o => o.x > -150)
      g.coinObjs.forEach(c => { c.x -= spd }); g.coinObjs = g.coinObjs.filter(c => c.x > -30 && !c.picked)
      g.puObjs.forEach(p => { p.x -= spd }); g.puObjs = g.puObjs.filter(p => p.x > -30 && !p.picked)

      // magnet
      if (g.activePU?.id === 'magnet') {
        g.coinObjs.forEach(c => {
          const dx = (g.px + animal.w / 2) - c.x, dy = (g.py + g.ph / 2) - c.y
          if (Math.sqrt(dx * dx + dy * dy) < 140) { c.x += dx * 0.08; c.y += dy * 0.08 }
        })
      }

      // collect coins
      const pcx = g.px + animal.w / 2, pcy = g.py + g.ph / 2
      g.coinObjs.forEach(c => {
        if (!c.picked && Math.abs(c.x - pcx) < 18 && Math.abs(c.y - pcy) < 22) {
          c.picked = true; g.coins++; g.score += 10
          for (let i = 0; i < 5; i++) g.particles.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4 - 1, life: 16, col: '#D4AF37' })
        }
      })

      // collect powerups
      g.puObjs.forEach(p => {
        if (!p.picked && Math.abs(p.x - pcx) < 22 && Math.abs(p.y - pcy) < 28) {
          p.picked = true
          const dm = (animal.id === 'elephant' && p.id === 'shield') ? 2 : (animal.id === 'cheetah' && p.id === 'speed') ? 1.5 : 1
          g.activePU = p; g.puTimer = Math.round(p.dur * dm)
          for (let i = 0; i < 10; i++) g.particles.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 5 - 2, life: 22, col: p.col })
        }
      })

      // powerup timer
      if (g.puTimer > 0) { g.puTimer--; if (g.puTimer <= 0) g.activePU = null }

      // collision
      if (!shielded) {
        for (const o of g.obstacles) {
          const mg = 9
          const hx = g.px + mg < o.x + o.w - mg && g.px + animal.w - mg > o.x + mg
          const hy = g.py + mg < o.y + o.h - mg && g.py + g.ph - mg > o.y + mg
          if (hx && hy) {
            if (animal.id === 'elephant' && o.type === 'rock') {
              o.x = -500
              for (let i = 0; i < 12; i++) g.particles.push({ x: o.x + o.w / 2, y: o.y + o.h / 2, vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 5, life: 22, col: '#78909C' })
            } else {
              die(g.score); return
            }
          }
        }
      }

      // particles
      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life-- })
      g.particles = g.particles.filter(p => p.life > 0)

      g.score++

      // ════ DRAW ════
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, W, H)

      drawBG(ctx, g.scrollX)

      g.obstacles.forEach(o => drawObstacle(ctx, o, fr))

      // coins
      g.coinObjs.forEach(c => {
        if (c.picked) return
        const bob = Math.sin(fr * 0.12 + c.x * 0.05) * 3
        ctx.globalAlpha = 1
        ctx.fillStyle = '#D4AF37'
        ctx.beginPath(); ctx.arc(c.x, c.y + bob, 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.38)'
        ctx.beginPath(); ctx.arc(c.x - 2, c.y + bob - 2, 3, 0, Math.PI * 2); ctx.fill()
      })

      // powerups
      g.puObjs.forEach(p => {
        if (p.picked) return
        const bob = Math.sin(fr * 0.1 + p.x * 0.04) * 4
        ctx.globalAlpha = 1
        ctx.beginPath(); ctx.arc(p.x, p.y + bob, 16, 0, Math.PI * 2)
        ctx.fillStyle = p.col + '28'; ctx.fill()
        ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'; ctx.fillText(p.sym, p.x, p.y + bob)
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      })

      // particles
      g.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / 22)
        ctx.fillStyle = p.col
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1

      // animal
      drawAnimal(ctx, animal, g.px, g.py, fr, g.ducking, shielded)

      // storm
      const sg = ctx.createLinearGradient(g.stormX - 100, 0, g.stormX, 0)
      sg.addColorStop(0, 'rgba(40,0,80,0)')
      sg.addColorStop(0.5, 'rgba(70,0,140,0.35)')
      sg.addColorStop(1, 'rgba(110,0,190,0.85)')
      ctx.globalAlpha = 1; ctx.fillStyle = sg; ctx.fillRect(g.stormX - 100, 0, 100, H)
      if (fr % 50 < 4) {
        ctx.strokeStyle = '#FFEB3B'; ctx.lineWidth = 2; ctx.globalAlpha = 0.7
        ctx.beginPath(); ctx.moveTo(g.stormX - 8, 0); ctx.lineTo(g.stormX - 20, H * 0.38); ctx.lineTo(g.stormX - 4, H * 0.38); ctx.lineTo(g.stormX - 18, H); ctx.stroke()
        ctx.globalAlpha = 1
      }

      // HUD on canvas
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(8, 8, 180, 28)
      ctx.fillStyle = '#D4AF37'; ctx.font = 'bold 13px "Courier New"'
      ctx.fillText(`${g.score} pts  ● ${g.coins}`, 16, 27)
      if (g.activePU) {
        ctx.fillStyle = g.activePU.col
        ctx.fillText(`${g.activePU.sym} ${Math.ceil(g.puTimer / 60)}s`, 200, 27)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restart = () => {
    G.current = makeState()
    prevJump.current = false
    keys.current = {}
    setSaved(false)
    setName('')
    setPhase('play')
    // re-mount Game by changing key in parent — handled by parent
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A3000', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: W, padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', borderBottom: '2px solid rgba(212,175,55,0.18)' }}>
        <span style={{ fontFamily: '"Courier New",monospace', fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700 }}>{animal.emoji} {animal.name} — Space/↑ jump · ↓ duck</span>
        <button onClick={onBack} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.4)', fontFamily: '"Courier New",monospace', fontSize: '0.6rem', cursor: 'pointer' }}>quit</button>
      </div>

      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', maxWidth: '100vw' }} />

        {phase === 'dead' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🌪</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', color: '#FF8C42', margin: 0 }}>Storm got you!</h2>
            <p style={{ fontFamily: '"Courier New",monospace', color: '#D4AF37', fontSize: '1rem', margin: 0 }}>Score: {deadScore.toLocaleString()}</p>
            {!saved ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="your name" style={{ padding: '0.45rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(212,175,55,0.4)', borderRadius: '7px', color: '#F0EDE8', fontFamily: 'Georgia,serif', fontSize: '0.85rem', outline: 'none', width: 130 }} />
                <button onClick={() => { if (name.trim()) { saveScore(name.trim(), deadScore); setSaved(true) } }} style={{ padding: '0.45rem 0.9rem', background: '#D4AF37', border: 'none', borderRadius: '7px', fontFamily: 'Georgia,serif', fontWeight: 700, cursor: 'pointer', color: '#0A0A0F' }}>Save</button>
              </div>
            ) : (
              <p style={{ fontFamily: '"Courier New",monospace', fontSize: '0.7rem', color: '#6AAF7A' }}>✓ saved!</p>
            )}
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <button onClick={() => onBack(true)} style={{ padding: '0.6rem 1.3rem', background: '#2E7D32', border: '2px solid #4CAF50', borderRadius: '8px', fontFamily: 'Georgia,serif', fontWeight: 700, color: '#F0EDE8', cursor: 'pointer' }}>Try Again</button>
              <button onClick={() => onBack(false)} style={{ padding: '0.6rem 1.1rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Georgia,serif', color: '#F0EDE8', cursor: 'pointer' }}>Menu</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', padding: '0.6rem', justifyContent: 'center' }}>
        <button onPointerDown={() => { keys.current['Space'] = true }} onPointerUp={() => { keys.current['Space'] = false }} onPointerLeave={() => { keys.current['Space'] = false }}
          style={{ padding: '0.65rem 2rem', background: '#2E7D32', border: '2px solid #4CAF50', borderRadius: '10px', color: '#F0EDE8', fontFamily: 'Georgia,serif', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}>
          ↑ Jump
        </button>
        <button onPointerDown={() => { keys.current['ArrowDown'] = true }} onPointerUp={() => { keys.current['ArrowDown'] = false }} onPointerLeave={() => { keys.current['ArrowDown'] = false }}
          style={{ padding: '0.65rem 2rem', background: '#5D4037', border: '2px solid #8D6E63', borderRadius: '10px', color: '#F0EDE8', fontFamily: 'Georgia,serif', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}>
          ↓ Duck
        </button>
      </div>
    </div>
  )

  function makeState() {
    return {
      px: 100, py: FLOOR - animal.h,
      pvy: 0, ph: animal.h,
      ducking: false, onGround: true, jumps: 0,
      scrollX: 0, speed: 5, frame: 0,
      score: 0, coins: 0,
      nextObs: 220, nextCoin: 120, nextPU: 400,
      obstacles: [], coinObjs: [], puObjs: [], particles: [],
      activePU: null, puTimer: 0,
      stormX: -W * 3,
    }
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function SavannaSprint() {
  const [screen, setScreen] = useState('menu')
  const [animal, setAnimal] = useState(null)
  const [gameKey, setGameKey] = useState(0)

  if (screen === 'game' && animal) {
    return (
      <Game
        key={gameKey}
        animal={animal}
        onBack={(retry) => {
          if (retry) {
            setGameKey(k => k + 1)  // remount Game = fresh state
          } else {
            setScreen('menu')
          }
        }}
      />
    )
  }
  return <Menu onStart={a => { setAnimal(a); setScreen('game'); setGameKey(0) }} />
}