import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import FairyCompanion from '../components/FairyCompanion/FairyCompanion'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     '#0A0A14',
  gold:   '#D4AF37',
  rose:   '#C2185B',
  purple: '#7B2FBE',
  green:  '#2E7D32',
  teal:   '#00BCD4',
  amber:  '#FF8F00',
  text:   '#F5F0E8',
  muted:  'rgba(245,240,232,0.45)',
}
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ── Particle sparkles — faithful to original ──────────────────────────────────
function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = [
      'rgba(212,175,55,',   // gold
      'rgba(123,47,190,',   // purple
      'rgba(194,24,91,',    // rose
      'rgba(212,175,55,',   // gold (weighted)
      'rgba(212,175,55,',
    ]

    const particles = Array.from({ length: 120 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 2.2 + 0.3,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    -(Math.random() * 0.45 + 0.08),
      alpha: Math.random() * 0.7 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.pulse += 0.018
        const a = p.alpha * (0.55 + 0.45 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + a + ')'
        ctx.fill()
        // soft glow halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (a * 0.12) + ')'
        ctx.fill()

        p.x += p.dx
        p.y += p.dy
        if (p.y < -10)               { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10)               p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

// ── Subtle grid — exactly like the screenshot ─────────────────────────────────
function Grid() {
  return (
    <div aria-hidden style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }} />
  )
}

// ── District definitions — each card carries its own world ────────────────────
// Font, bg, accent, texture, tagline — all unique per district
const PORTALS = [
  {
    label: 'Arcade',
    sub: 'Afrofuturist games',
    path: '/arcade',
    delay: 1800,
    // Identity: Orbitron, dark #0A0A14, gold accent, circuit dot grid
    font: 'Orbitron, sans-serif',
    color: '#D4AF37',
    bg: '#0D0B14',
    tagColor: 'rgba(212,175,55,0.35)',
    texture: `radial-gradient(rgba(212,175,55,0.055) 1px, transparent 1px)`,
    textureSize: '18px 18px',
  },
  {
    label: 'Glam Room',
    sub: 'Girly game hub',
    path: '/glamroom',
    delay: 1920,
    // Identity: Dancing Script cursive, blush pink, hot pink accent
    font: '"Dancing Script", cursive',
    color: '#FF1493',
    bg: '#FFF5F8',
    tagColor: 'rgba(255,20,147,0.2)',
    texture: `radial-gradient(rgba(255,182,193,0.35) 1px, transparent 1px)`,
    textureSize: '16px 16px',
    lightBg: true,
  },
  {
    label: 'Mind Games',
    sub: 'Cases & puzzles',
    path: '/mindgames',
    delay: 2040,
    // Identity: Special Elite typewriter, warm ink dark, evidence red
    font: '"Special Elite", cursive',
    color: '#C0392B',
    bg: '#0D0B08',
    tagColor: 'rgba(192,57,43,0.25)',
    texture: `repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(237,232,220,0.025) 18px, rgba(237,232,220,0.025) 19px)`,
    textureSize: 'auto',
  },
  {
    label: 'The Lab',
    sub: 'Tools & utilities',
    path: '/lab',
    delay: 2160,
    // Identity: Rajdhani, deep navy, blueprint blue, crosshatch grid
    font: '"Rajdhani", sans-serif',
    color: '#5B9BD5',
    bg: '#0D1B2E',
    tagColor: 'rgba(91,155,213,0.2)',
    texture: `linear-gradient(rgba(91,155,213,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(91,155,213,0.06) 1px, transparent 1px)`,
    textureSize: '16px 16px',
  },
  {
    label: 'The Studio',
    sub: 'Design & poetry',
    path: '/studio',
    delay: 2280,
    // Identity: Playfair Display, warm cream, antique gold — light bg
    font: '"Playfair Display", serif',
    color: '#B8882A',
    bg: '#F5ECD8',
    tagColor: 'rgba(184,136,42,0.2)',
    texture: `linear-gradient(rgba(180,160,130,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,130,0.07) 1px, transparent 1px)`,
    textureSize: '24px 24px',
    lightBg: true,
  },
  {
    label: 'My World',
    sub: 'About me',
    path: '/world',
    delay: 2400,
    // Identity: Cinzel serif, warm charcoal, gold — personal
    font: 'Cinzel, serif',
    color: '#D4AF37',
    bg: '#1C1916',
    tagColor: 'rgba(212,175,55,0.2)',
    texture: `radial-gradient(rgba(212,175,55,0.04) 1px, transparent 1px)`,
    textureSize: '20px 20px',
  },
  {
    label: 'The OS',
    sub: 'Personal README',
    path: '/os',
    delay: 2520,
    // Identity: JetBrains Mono, near-black green, phosphor green
    font: '"JetBrains Mono", monospace',
    color: '#33FF66',
    bg: '#060D06',
    tagColor: 'rgba(51,255,102,0.15)',
    texture: `radial-gradient(rgba(51,255,102,0.06) 1px, transparent 1px)`,
    textureSize: '18px 18px',
  },
  {
    label: 'The Feed',
    sub: 'Books, music, film',
    path: '/feed',
    delay: 2640,
    // Identity: Libre Baskerville, warm cream, editorial rose — light bg
    font: '"Libre Baskerville", serif',
    color: '#C2185B',
    bg: '#F7F3EC',
    tagColor: 'rgba(194,24,91,0.12)',
    texture: `linear-gradient(rgba(42,24,0,0.05) 1px, transparent 1px)`,
    textureSize: '100% 32px',
    lightBg: true,
  },
]

// ── District portal card — each one is a window into its world ────────────────
function PortalCard({ label, sub, path, color, bg, font, tagColor, texture, textureSize, lightBg, delay, visible }) {
  const [hov, setHov] = useState(false)
  const navigate = useNavigate()

  const inkColor = lightBg ? 'rgba(30,16,4,0.75)' : 'rgba(245,240,232,0.5)'
  const inkHov   = lightBg ? 'rgba(30,16,4,0.95)' : 'rgba(245,240,232,0.95)'
  const borderBase   = lightBg ? 'rgba(30,16,4,0.12)' : 'rgba(245,240,232,0.1)'

  return (
    <button
      onClick={() => navigate(path)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        width: '160px',
        minHeight: '140px',
        padding: '1.5rem 1.1rem 1.3rem',
        borderRadius: '10px',
        border: `1px solid ${hov ? color + '70' : borderBase}`,
        background: bg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.7rem',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hov ? 'translateY(-4px)' : 'translateY(0)'
          : 'translateY(28px)',
        transition: `
          opacity 0.55s ${EASE} ${delay}ms,
          transform 0.55s ${EASE} ${delay}ms,
          border-color 0.2s ease,
          box-shadow 0.25s ${EASE}
        `,
        boxShadow: hov
          ? `0 14px 36px rgba(0,0,0,0.35)`
          : '0 3px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* District texture — unique per card */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: texture,
        backgroundSize: textureSize,
        opacity: hov ? 1 : 0.6,
        transition: `opacity 0.2s ease`,
      }} />

      {/* Colour accent bar — top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: hov ? 3 : 2,
        background: color,
        transition: `height 0.2s ease`,
      }} />

      {/* District number — top left */}
      <div style={{
        position: 'absolute', top: '0.6rem', left: '0.7rem',
        fontFamily: '"DM Mono", monospace',
        fontSize: '0.48rem',
        color: hov ? color : (lightBg ? 'rgba(30,16,4,0.25)' : 'rgba(245,240,232,0.18)'),
        letterSpacing: '0.1em',
        transition: `color 0.2s ease`,
        lineHeight: 1,
      }}>
        {String(PORTALS.findIndex(p => p.path === path) + 1).padStart(2, '0')}
      </div>

      {/* District name — in its own display font */}
      <span style={{
        fontFamily: font,
        fontSize: font.includes('JetBrains') ? '0.7rem'
          : font.includes('Dancing')         ? '1.15rem'
          : font.includes('Special Elite')   ? '0.82rem'
          : font.includes('Rajdhani')        ? '0.95rem'
          : font.includes('Playfair') || font.includes('Baskerville') ? '0.88rem'
          : font.includes('Cinzel')          ? '0.78rem'
          : '0.65rem',
        fontWeight: font.includes('Orbitron') || font.includes('Rajdhani') ? 700 : 400,
        letterSpacing: font.includes('Orbitron')     ? '0.12em'
          : font.includes('JetBrains')               ? '0.04em'
          : font.includes('Cinzel')                  ? '0.08em'
          : font.includes('Rajdhani')                ? '0.1em'
          : '0.01em',
        color: hov ? color : inkHov,
        transition: `color 0.2s ease`,
        textAlign: 'center',
        lineHeight: 1.2,
        position: 'relative',
        zIndex: 1,
      }}>
        {label}
      </span>

      {/* Sub-label — what lives here */}
      <span style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '0.58rem',
        fontWeight: 400,
        letterSpacing: '0.06em',
        color: hov ? inkHov : inkColor,
        textAlign: 'center',
        lineHeight: 1.35,
        position: 'relative',
        zIndex: 1,
        transition: `color 0.2s ease`,
        padding: '0.2rem 0.5rem',
        background: hov ? tagColor : 'transparent',
        borderRadius: '3px',
      }}>
        {sub}
      </span>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', right: '15%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: hov ? 1 : 0,
        transition: `opacity 0.2s ease`,
      }} />
    </button>
  )
}

// ── Animated title — letter-by-letter like original ───────────────────────────
function AnimatedTitle() {
  const [count, setCount] = useState(0)
  const title = 'GEMINIDZI'

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      i++; setCount(i)
      if (i >= title.length) clearInterval(iv)
    }, 110)
    return () => clearInterval(iv)
  }, [])

  return (
    <h1 style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 'clamp(3rem, 9vw, 7.5rem)',
      fontWeight: 900,
      letterSpacing: '0.1em',
      margin: 0,
      display: 'flex',
      lineHeight: 1,
    }}>
      {title.split('').map((ch, i) => (
        <span key={i} style={{
          display: 'inline-block',
          color: i < count ? C.gold : 'transparent',
          textShadow: i < count
            ? `0 0 24px rgba(212,175,55,0.85), 0 0 60px rgba(212,175,55,0.35)`
            : 'none',
          transform: i < count ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.85)',
          transition: 'all 0.38s cubic-bezier(0.34,1.56,0.64,1)',
          transitionDelay: `${i * 0.04}s`,
        }}>{ch}</span>
      ))}
    </h1>
  )
}

// ── "ENTER MY UNIVERSE" — Orbitron, spaced, no sparkles ──────────────────────
function Subtitle({ visible }) {
  return (
    <p style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 'clamp(0.65rem, 1.5vw, 0.82rem)',
      fontWeight: 400,
      letterSpacing: '0.45em',
      color: C.muted,
      margin: '1.4rem 0 0',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
    }}>
      ENTER MY UNIVERSE
    </p>
  )
}

// ── Thin divider line — like the screenshot ───────────────────────────────────
function Divider({ visible }) {
  return (
    <div style={{
      width: visible ? '180px' : '0px',
      height: '1px',
      margin: '2.2rem auto',
      background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)`,
      transition: `width 0.9s ${EASE}`,
    }} />
  )
}

// ── Scroll hint — scroll indicator at bottom ──────────────────────────────────
function ScrollHint() {
  return (
    <div style={{
      position: 'absolute', bottom: '2rem', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      animation: 'floatHint 2s ease-in-out infinite',
      opacity: 0.35, pointerEvents: 'none',
    }}>
      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', letterSpacing: '0.3em', color: C.gold }}>
        EXPLORE
      </span>
      <div style={{
        width: '18px', height: '30px',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '9px',
        display: 'flex', justifyContent: 'center', paddingTop: '5px',
      }}>
        <div style={{
          width: '2px', height: '7px',
          background: C.gold, borderRadius: '1px',
          animation: 'scrollDot 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

// ── Landing ───────────────────────────────────────────────────────────────────
export default function Landing() {
  const [phase, setPhase] = useState(0)
 // const [musicEnabled, setMusic] = useState(false)
  // 0→nothing  1→subtitle  2→divider  3→cards

  

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 1300),
      setTimeout(() => setPhase(2), 1700),
      setTimeout(() => setPhase(3), 2000),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px',
      paddingBottom: '6rem',
    }}>
      <Grid />
      <Particles />

      {/* ── Hero ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 2rem' }}>

        {/* "WELCOME TO" eyebrow — matches screenshot exactly */}
        <p style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.5em',
          color: 'rgba(212,175,55,0.45)',
          margin: '0 0 1.4rem',
          animation: `fadeUp 0.8s ${EASE} 0.2s both`,
        }}>
          WELCOME TO
        </p>

        <AnimatedTitle />
        <Subtitle visible={phase >= 1} />
        <Divider  visible={phase >= 2} />

        {/* Portal cards */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          maxWidth: '960px',
        }}>
          {PORTALS.map(p => (
            <PortalCard key={p.path} {...p} visible={phase >= 3} />
          ))}
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(245,240,232,0.2)',
          marginTop: '3rem',
          letterSpacing: '0.12em',
          animation: `fadeUp 1s ${EASE} 3.2s both`,
        }}>
          Built by Dzifa · Developer · Game Creator · World Creator
        </p>
      </div>

      <ScrollHint /> 
      
       {/* <FairyCompanion
        musicEnabled={musicEnabled}
        onMusicToggle={() => setMusic(m => !m)}
      /> */}
      
      

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&family=Dancing+Script:wght@400;700&family=Special+Elite&family=Rajdhani:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(212,175,55,0.25); color: #F5F0E8; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatHint {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-7px); }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}