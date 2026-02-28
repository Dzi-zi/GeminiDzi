import { useEffect, useRef, useState, useCallback } from 'react'

// ── Audio ─────────────────────────────────────────────────────────────────────
let _actx = null
const actx = () => {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)()
  if (_actx.state === 'suspended') _actx.resume()
  return _actx
}

const sfx = {
  shoot() {
    const c = actx(), t = c.currentTime
    const o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'square'
    o.frequency.setValueAtTime(880, t)
    o.frequency.exponentialRampToValueAtTime(220, t + 0.08)
    g.gain.setValueAtTime(0.15, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
    o.start(t); o.stop(t + 0.1)
  },
  enemyHit() {
    const c = actx(), t = c.currentTime
    const o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(300, t)
    o.frequency.exponentialRampToValueAtTime(80, t + 0.12)
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
    o.start(t); o.stop(t + 0.14)
  },
  explosion(big = false) {
    const c = actx(), t = c.currentTime
    const len = big ? 0.9 : 0.35
    const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, big ? 0.5 : 1)
    const src = c.createBufferSource(), g = c.createGain()
    const f = c.createBiquadFilter()
    src.buffer = buf; f.type = 'lowpass'; f.frequency.value = big ? 600 : 400
    src.connect(f); f.connect(g); g.connect(c.destination)
    g.gain.setValueAtTime(big ? 0.8 : 0.4, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + len)
    src.start(t); src.stop(t + len)
  },
  playerHit() {
    const c = actx(), t = c.currentTime
    ;[200, 150, 100].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.frequency.value = f
      g.gain.setValueAtTime(0.25, t + i * 0.06)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.1)
      o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.12)
    })
  },
  bossAlert() {
    const c = actx(), t = c.currentTime
    ;[110, 146, 110, 98].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'sawtooth'; o.frequency.value = f
      g.gain.setValueAtTime(0.18, t + i * 0.18)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.16)
      o.start(t + i * 0.18); o.stop(t + i * 0.18 + 0.18)
    })
  },
  levelUp() {
    const c = actx(), t = c.currentTime
    ;[523, 659, 784, 1047].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0.12, t + i * 0.1)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.18)
      o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.2)
    })
  },
}

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 540, H = 680
const PLAYER_SPEED = 4.5
const BULLET_SPEED = 10
const SHOOT_COOLDOWN = 180  // ms
const BOSS_EVERY = 3        // boss appears every N waves

// Enemy types
const ENEMY_TYPES = {
  scout:   { w: 28, h: 28, hp: 1,  speed: 1.2, pts: 10,  color: '#5EC8FF', shootRate: 0 },
  fighter: { w: 34, h: 34, hp: 2,  speed: 0.9, pts: 25,  color: '#FF7850', shootRate: 0.004 },
  heavy:   { w: 42, h: 42, hp: 4,  speed: 0.6, pts: 50,  color: '#B878FF', shootRate: 0.006 },
  boss:    { w: 90, h: 80, hp: 40, speed: 0.5, pts: 500, color: '#FF3860', shootRate: 0.012, isBoss: true },
}

// ── Star field ────────────────────────────────────────────────────────────────
function makeStars() {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.8 + 0.3,
    speed: Math.random() * 0.8 + 0.2,
    opacity: Math.random() * 0.7 + 0.3,
  }))
}

// ── Wave definitions ──────────────────────────────────────────────────────────
function getWave(wave) {
  const isBoss = wave % BOSS_EVERY === 0
  if (isBoss) {
    return [{ type: 'boss', x: W / 2, y: -60 }]
  }
  const enemies = []
  const count = Math.min(4 + wave * 2, 20)
  const types = wave < 3 ? ['scout'] : wave < 6 ? ['scout', 'fighter'] : ['scout', 'fighter', 'heavy']
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    enemies.push({
      type,
      x: 60 + (i % 5) * ((W - 120) / 4) + Math.random() * 20 - 10,
      y: -50 - Math.floor(i / 5) * 60,
    })
  }
  return enemies
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function drawPlayer(ctx, x, y, invincible, t) {
  ctx.save()
  ctx.translate(x, y)
  if (invincible && Math.floor(t / 80) % 2 === 0) { ctx.restore(); return }

  // Engine glow
  const eg = ctx.createRadialGradient(0, 14, 0, 0, 14, 20)
  eg.addColorStop(0, 'rgba(100,200,255,0.6)')
  eg.addColorStop(1, 'transparent')
  ctx.fillStyle = eg
  ctx.beginPath(); ctx.arc(0, 14, 20, 0, Math.PI * 2); ctx.fill()

  // Ship body — sleek angular
  ctx.fillStyle = '#E8F4FF'
  ctx.beginPath()
  ctx.moveTo(0, -22)
  ctx.lineTo(14, 10)
  ctx.lineTo(8, 6)
  ctx.lineTo(0, 14)
  ctx.lineTo(-8, 6)
  ctx.lineTo(-14, 10)
  ctx.closePath()
  ctx.fill()

  // Wing detail
  ctx.fillStyle = '#5EC8FF'
  ctx.beginPath()
  ctx.moveTo(-14, 10); ctx.lineTo(-22, 18); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(14, 10); ctx.lineTo(22, 18); ctx.lineTo(10, 10); ctx.closePath(); ctx.fill()

  // Cockpit
  ctx.fillStyle = '#00E8FF'
  ctx.beginPath(); ctx.ellipse(0, -8, 5, 8, 0, 0, Math.PI * 2); ctx.fill()

  ctx.restore()
}

function drawEnemy(ctx, e, t) {
  const def = ENEMY_TYPES[e.type]
  ctx.save()
  ctx.translate(e.x, e.y)

  if (e.type === 'boss') {
    // Boss — large intimidating shape
    const pulse = 0.95 + Math.sin(t * 0.004) * 0.05
    ctx.scale(pulse, pulse)

    // Outer glow
    const bg = ctx.createRadialGradient(0, 0, 10, 0, 0, 60)
    bg.addColorStop(0, 'rgba(255,56,96,0.3)')
    bg.addColorStop(1, 'transparent')
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill()

    // Main body
    ctx.fillStyle = '#FF3860'
    ctx.beginPath()
    ctx.moveTo(0, -38); ctx.lineTo(44, -10); ctx.lineTo(44, 20)
    ctx.lineTo(30, 38); ctx.lineTo(-30, 38); ctx.lineTo(-44, 20)
    ctx.lineTo(-44, -10); ctx.closePath(); ctx.fill()

    // Core
    ctx.fillStyle = '#FF8090'
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 16, 0, 0, Math.PI * 2); ctx.fill()

    // Eye
    ctx.fillStyle = '#FFE0E8'
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FF0030'
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill()

    // HP bar
    const bw = 80, bh = 8
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(-bw / 2, -52, bw, bh)
    ctx.fillStyle = `hsl(${(e.hp / def.hp) * 120}, 100%, 50%)`
    ctx.fillRect(-bw / 2, -52, bw * (e.hp / def.hp), bh)

  } else {
    const hw = def.w / 2, hh = def.h / 2

    // Glow
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, def.w)
    g.addColorStop(0, def.color + '60')
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(0, 0, def.w, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = def.color
    if (e.type === 'scout') {
      ctx.beginPath()
      ctx.moveTo(0, hh); ctx.lineTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.closePath(); ctx.fill()
    } else if (e.type === 'fighter') {
      ctx.beginPath()
      ctx.moveTo(0, hh); ctx.lineTo(-hw, -hh + 8); ctx.lineTo(0, -hh)
      ctx.lineTo(hw, -hh + 8); ctx.closePath(); ctx.fill()
      ctx.fillStyle = def.color + 'AA'
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(0, hh); ctx.lineTo(-hw, 0); ctx.lineTo(-hw + 8, -hh)
      ctx.lineTo(hw - 8, -hh); ctx.lineTo(hw, 0); ctx.closePath(); ctx.fill()
      ctx.fillStyle = def.color + '80'
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Flash white on hit
  if (e.hitFlash > 0) {
    ctx.globalAlpha = e.hitFlash
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(0, 0, def.w / 2 + 4, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function drawBullet(ctx, b) {
  ctx.save()
  ctx.translate(b.x, b.y)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 8)
  g.addColorStop(0, b.player ? '#ffffff' : '#FF6040')
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = b.player ? '#C8F0FF' : '#FF8060'
  ctx.beginPath(); ctx.ellipse(0, 0, b.player ? 3 : 4, b.player ? 8 : 6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawParticle(ctx, p) {
  ctx.save()
  ctx.globalAlpha = p.life / p.maxLife
  ctx.fillStyle = p.color
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function spawnParticles(particles, x, y, color, count = 12, big = false) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = (Math.random() * 3 + 1) * (big ? 2 : 1)
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * (big ? 6 : 4) + 2,
      color,
      life: big ? 60 : 40,
      maxLife: big ? 60 : 40,
    })
  }
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function Menu({ onStart, highScore }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', padding: '3rem 1.5rem 4rem', animation: 'fadeUp 0.35s ease' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{ width: '28px', height: '2px', background: '#5EC8FF' }} />
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#5EC8FF' }}>the arcade</span>
        </div>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(2.2rem, 7vw, 3.8rem)',
          fontWeight: 700, color: '#E8F4FF',
          margin: '0 0 0.3rem', lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}>Void Striker</h1>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: 'rgba(232,244,255,0.38)', letterSpacing: '0.04em' }}>
          survive the void · boss every 3 waves
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(94,200,255,0.2)', borderRadius: '12px', padding: '1.2rem 1.4rem', marginBottom: '2rem' }}>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(232,244,255,0.35)', margin: '0 0 0.8rem' }}>CONTROLS</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[['WASD / ↑↓←→', 'move ship'], ['Spacebar', 'fire'], ['Survive', 'each wave'], ['Boss', 'every 3 waves']].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', fontWeight: 700, color: '#5EC8FF', background: 'rgba(94,200,255,0.1)', border: '1px solid rgba(94,200,255,0.3)', padding: '0.2rem 0.5rem', borderRadius: '5px', whiteSpace: 'nowrap' }}>{key}</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: 'rgba(232,244,255,0.5)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enemy guide */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem', marginBottom: '2rem' }}>
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(232,244,255,0.35)', margin: '0 0 0.8rem' }}>ENEMIES</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { color: '#5EC8FF', name: 'Scout',   pts: '10 pts',  desc: 'fast, fragile' },
            { color: '#FF7850', name: 'Fighter', pts: '25 pts',  desc: 'shoots back' },
            { color: '#B878FF', name: 'Heavy',   pts: '50 pts',  desc: 'tanky, dangerous' },
            { color: '#FF3860', name: 'BOSS',    pts: '500 pts', desc: 'appears every 3 waves' },
          ].map(e => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.color, boxShadow: `0 0 6px ${e.color}`, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, color: e.color, width: '60px' }}>{e.name}</span>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: 'rgba(232,244,255,0.4)', flex: 1 }}>{e.desc}</span>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: 'rgba(232,244,255,0.35)' }}>{e.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {highScore > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: 'rgba(232,244,255,0.3)', letterSpacing: '0.1em' }}>
            best: <span style={{ color: '#E8A040', fontWeight: 700 }}>{highScore.toLocaleString()}</span>
          </span>
        </div>
      )}

      <button onClick={onStart}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: '100%', padding: '1rem',
          background: hov ? '#3AAAE0' : '#5EC8FF',
          border: 'none', borderRadius: '8px',
          color: '#050A12', fontFamily: 'Georgia, serif',
          fontSize: '1rem', fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 3px 0px #2A7090',
          transition: 'all 0.13s',
          transform: hov ? 'translateY(-1px)' : 'none',
          letterSpacing: '0.02em',
        }}>launch →</button>
    </div>
  )
}

// ── Game Over / Victory ───────────────────────────────────────────────────────
function GameOver({ score, wave, highScore, onRestart, onMenu }) {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem 4rem', textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 700, color: '#E8F4FF', margin: '0 0 0.3rem' }}>
        ship destroyed
      </h2>
      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: 'rgba(232,244,255,0.38)', margin: '0 0 2rem', letterSpacing: '0.04em' }}>
        you reached wave {wave}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '2rem' }}>
        {[
          { label: 'score',      value: score.toLocaleString(),     color: '#5EC8FF' },
          { label: 'best',       value: highScore.toLocaleString(), color: '#E8A040' },
          { label: 'wave',       value: wave,                       color: '#B878FF' },
          { label: 'grade',      value: score > 2000 ? 'A' : score > 800 ? 'B' : score > 300 ? 'C' : 'D', color: '#FF7850' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', border: `2px solid ${color}25`, borderRadius: '10px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(232,244,255,0.3)', marginTop: '0.15rem', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <button onClick={onRestart} style={{
          padding: '0.9rem', background: '#5EC8FF', border: 'none', borderRadius: '8px',
          color: '#050A12', fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 3px 0px #2A7090', transition: 'opacity 0.13s',
        }}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >try again</button>
        <button onClick={onMenu} style={{
          padding: '0.9rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '8px',
          color: 'rgba(232,244,255,0.45)', fontFamily: 'Georgia, serif', fontSize: '0.92rem',
          cursor: 'pointer', transition: 'all 0.13s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#5EC8FF'; e.currentTarget.style.color = '#5EC8FF' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,244,255,0.45)' }}
        >← menu</button>
      </div>
    </div>
  )
}

// ── Main game component ───────────────────────────────────────────────────────
export default function VoidStriker() {
  const [screen,    setScreen]    = useState('menu')
  const [score,     setScore]     = useState(0)
  const [wave,      setWave]      = useState(1)
  const [lives,     setLives]     = useState(3)
  const [highScore, setHighScore] = useState(0)
  const [gameOverData, setGameOverData] = useState(null)

  const canvasRef = useRef(null)
  const stateRef  = useRef({})
  const rafRef    = useRef(null)

  const initGame = useCallback(() => {
    const stars = makeStars()
    stateRef.current = {
      player:    { x: W / 2, y: H - 80, w: 30, h: 30, invincible: 0 },
      bullets:   [],
      enemies:   [],
      particles: [],
      stars,
      keys:      {},
      score:     0,
      wave:      1,
      lives:     3,
      lastShot:  0,
      waveState: 'spawning', // spawning | fighting | cleared | bossAlert
      waveTimer: 0,
      bossAlerted: false,
      active:    true,
      t:         0,
    }
    spawnWave(1)
  }, [])

  function spawnWave(w) {
    const g = stateRef.current
    const defs = getWave(w)
    const isBoss = w % BOSS_EVERY === 0
    if (isBoss && !g.bossAlerted) {
      g.waveState = 'bossAlert'
      g.waveTimer = 120
      g.bossAlerted = true
      sfx.bossAlert()
    }
    defs.forEach(d => {
      const def = ENEMY_TYPES[d.type]
      g.enemies.push({
        ...d,
        hp: def.hp, maxHp: def.hp,
        vx: d.type === 'boss' ? 0.8 : (Math.random() - 0.5) * 0.5,
        vy: def.speed,
        hitFlash: 0,
        shootTimer: Math.random() * 60,
      })
    })
  }

  // ── Game loop ──
  useEffect(() => {
    if (screen !== 'game') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g   = stateRef.current

    const loop = (ts) => {
      if (!g.active) return
      g.t = ts

      // ── Update stars ──
      g.stars.forEach(s => {
        s.y += s.speed
        if (s.y > H) { s.y = -2; s.x = Math.random() * W }
      })

      // ── Player movement ──
      const { player, keys } = g
      if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 20)  player.x -= PLAYER_SPEED
      if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < W - 20) player.x += PLAYER_SPEED
      if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.y > 20)    player.y -= PLAYER_SPEED
      if ((keys['ArrowDown'] || keys['s'] || keys['S']) && player.y < H - 20) player.y += PLAYER_SPEED
      if (player.invincible > 0) player.invincible--

      // ── Shooting ──
      if (keys[' '] && ts - g.lastShot > SHOOT_COOLDOWN) {
        g.bullets.push({ x: player.x, y: player.y - 20, vy: -BULLET_SPEED, player: true })
        g.lastShot = ts
        sfx.shoot()
      }

      // ── Boss alert countdown ──
      if (g.waveState === 'bossAlert') {
        g.waveTimer--
        if (g.waveTimer <= 0) {
          g.waveState = 'fighting'
          spawnWave(g.wave)
        }
      }

      // ── Move bullets ──
      g.bullets = g.bullets.filter(b => b.y > -20 && b.y < H + 20)
      g.bullets.forEach(b => { b.y += b.vy; if (b.vx) b.x += b.vx })

      // ── Move enemies ──
      g.enemies.forEach(e => {
        const def = ENEMY_TYPES[e.type]
        e.y += e.vy
        e.x += e.vx
        if (e.type === 'boss') {
          // Boss bounces side to side
          if (e.x < 60 || e.x > W - 60) e.vx *= -1
          if (e.y > 120) e.vy = 0  // stay in upper portion
        } else {
          if (e.x < 20 || e.x > W - 20) e.vx *= -1
          if (e.y > H + 60) { e.y = -60; e.x = 40 + Math.random() * (W - 80) }
        }
        if (e.hitFlash > 0) e.hitFlash -= 0.08

        // Enemy shooting
        if (def.shootRate > 0) {
          e.shootTimer--
          if (e.shootTimer <= 0) {
            const spread = e.type === 'boss' ? 3 : 1
            for (let s = 0; s < spread; s++) {
              const angle = (Math.PI / 2) + (s - (spread - 1) / 2) * 0.3
              g.bullets.push({
                x: e.x, y: e.y + 20,
                vy: Math.sin(angle) * 4,
                vx: Math.cos(angle) * 4 - 4 * Math.cos(angle / 2),
                player: false,
              })
            }
            e.shootTimer = Math.floor(60 / def.shootRate / 60) + Math.random() * 40
          }
        }
      })

      // ── Bullet vs enemy collisions ──
      g.bullets = g.bullets.filter(b => {
        if (!b.player) return true
        let hit = false
        g.enemies = g.enemies.filter(e => {
          const def = ENEMY_TYPES[e.type]
          const hw = def.w / 2, hh = def.h / 2
          if (Math.abs(b.x - e.x) < hw && Math.abs(b.y - e.y) < hh) {
            e.hp--; e.hitFlash = 1; hit = true
            sfx.enemyHit()
            if (e.hp <= 0) {
              const isBoss = def.isBoss
              spawnParticles(g.particles, e.x, e.y, def.color, isBoss ? 30 : 14, isBoss)
              sfx.explosion(isBoss)
              g.score += def.pts
              setScore(g.score)
              return false
            }
          }
          return true
        })
        return !hit
      })

      // ── Enemy bullet vs player ──
      if (player.invincible === 0) {
        const hit = g.bullets.some(b => !b.player &&
          Math.abs(b.x - player.x) < 16 && Math.abs(b.y - player.y) < 18)
        // Also check enemy body collision
        const bodyHit = g.enemies.some(e => {
          const def = ENEMY_TYPES[e.type]
          return Math.abs(e.x - player.x) < def.w / 2 + 14 &&
                 Math.abs(e.y - player.y) < def.h / 2 + 14
        })

        if (hit || bodyHit) {
          g.bullets = g.bullets.filter(b => b.player || !(Math.abs(b.x - player.x) < 16 && Math.abs(b.y - player.y) < 18))
          g.lives--
          setLives(g.lives)
          player.invincible = 120
          spawnParticles(g.particles, player.x, player.y, '#5EC8FF', 16)
          sfx.playerHit()
          if (g.lives <= 0) {
            g.active = false
            const hs = Math.max(g.score, highScore)
            setHighScore(hs)
            setGameOverData({ score: g.score, wave: g.wave })
            setScreen('gameover')
            return
          }
        }
      }

      // ── Particles ──
      g.particles = g.particles.filter(p => p.life > 0)
      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life-- })

      // ── Wave cleared? ──
      if (g.waveState === 'fighting' && g.enemies.length === 0) {
        g.wave++
        setWave(g.wave)
        sfx.levelUp()
        g.waveState = 'spawning'
        g.bossAlerted = false
        setTimeout(() => {
          if (g.active) {
            const isBoss = g.wave % BOSS_EVERY === 0
            if (isBoss) {
              g.waveState = 'bossAlert'
              g.waveTimer = 150
              sfx.bossAlert()
            } else {
              g.waveState = 'fighting'
              spawnWave(g.wave)
            }
          }
        }, 1200)
      }

      // ── Draw ──
      ctx.fillStyle = '#050A12'
      ctx.fillRect(0, 0, W, H)

      // Stars
      g.stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,220,255,${s.opacity})`
        ctx.fill()
      })

      // Nebula blobs (static, atmospheric)
      ;[[W * 0.2, H * 0.3, '#1A0A3A'], [W * 0.75, H * 0.6, '#0A1A30'], [W * 0.5, H * 0.15, '#0A2010']].forEach(([nx, ny, nc]) => {
        const nb = ctx.createRadialGradient(nx, ny, 10, nx, ny, 120)
        nb.addColorStop(0, nc + 'AA')
        nb.addColorStop(1, 'transparent')
        ctx.fillStyle = nb
        ctx.beginPath(); ctx.arc(nx, ny, 120, 0, Math.PI * 2); ctx.fill()
      })

      // Boss alert overlay
      if (g.waveState === 'bossAlert') {
        ctx.fillStyle = `rgba(255,20,60,${0.08 + Math.sin(ts * 0.01) * 0.04})`
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#FF3860'
        ctx.font = 'bold 28px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText('⚠  BOSS INCOMING  ⚠', W / 2, H / 2 - 10)
        ctx.font = '14px "Courier New"'
        ctx.fillStyle = 'rgba(255,56,96,0.7)'
        ctx.fillText(`wave ${g.wave}`, W / 2, H / 2 + 20)
      }

      // Wave cleared banner
      if (g.waveState === 'spawning' && g.wave > 1) {
        ctx.fillStyle = 'rgba(94,200,255,0.8)'
        ctx.font = 'bold 22px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText(`wave ${g.wave - 1} cleared`, W / 2, H / 2)
      }

      // Particles
      g.particles.forEach(p => drawParticle(ctx, p))

      // Enemies
      g.enemies.forEach(e => drawEnemy(ctx, e, ts))

      // Bullets
      g.bullets.forEach(b => drawBullet(ctx, b))

      // Player
      drawPlayer(ctx, player.x, player.y, player.invincible > 0, ts)

      // HUD
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(232,244,255,0.5)'
      ctx.font = '12px "Courier New"'
      ctx.fillText(`wave ${g.wave}`, 12, 22)

      // Lives hearts
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < g.lives ? '#FF3860' : 'rgba(255,56,96,0.2)'
        ctx.font = '16px serif'
        ctx.fillText('♥', W - 80 + i * 24, 24)
      }

      // Score
      ctx.fillStyle = 'rgba(232,244,255,0.8)'
      ctx.font = 'bold 18px Georgia'
      ctx.textAlign = 'right'
      ctx.fillText(g.score.toLocaleString(), W - 12, 24)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [screen, highScore])

  // ── Keys ──
  useEffect(() => {
    if (screen !== 'game') return
    const g = stateRef.current
    const down = (e) => {
      if (_actx && _actx.state === 'suspended') _actx.resume()
      g.keys[e.key] = true
      if (e.key === ' ') e.preventDefault()
    }
    const up = (e) => { g.keys[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [screen])

  const startGame = () => {
    initGame()
    setScore(0); setWave(1); setLives(3)
    setScreen('game')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A12', paddingTop: '80px' }}>
      {screen === 'menu' && <Menu onStart={startGame} highScore={highScore} />}

      {screen === 'game' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: `${W}px`, display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: '#E8F4FF' }}>Wave {wave}</span>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: 'rgba(232,244,255,0.3)', marginLeft: '0.6rem' }}>
                {wave % BOSS_EVERY === 0 ? '⚠ boss wave' : `boss in ${BOSS_EVERY - (wave % BOSS_EVERY)} wave${BOSS_EVERY - (wave % BOSS_EVERY) !== 1 ? 's' : ''}`}
              </span>
            </div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#5EC8FF' }}>{score.toLocaleString()}</span>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(94,200,255,0.15)', boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>
            <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', maxWidth: '100%' }} />
          </div>
          <button
            onClick={() => { stateRef.current.active = false; setScreen('menu') }}
            style={{
              marginTop: '1rem', padding: '0.45rem 1.1rem',
              background: 'transparent', border: '2px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', color: 'rgba(232,244,255,0.3)',
              fontFamily: '"Courier New", monospace', fontSize: '0.7rem',
              cursor: 'pointer', transition: 'all 0.13s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF3860'; e.currentTarget.style.color = '#FF3860' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(232,244,255,0.3)' }}
          >quit</button>
        </div>
      )}

      {screen === 'gameover' && gameOverData && (
        <GameOver
          score={gameOverData.score}
          wave={gameOverData.wave}
          highScore={highScore}
          onRestart={startGame}
          onMenu={() => setScreen('menu')}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}