import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Particle system ──────────────────────────────────────────────────────────
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

    // Gold + purple dust particles
    const COLORS = [
      'rgba(212,175,55,',   // gold
      'rgba(123,47,190,',   // purple
      'rgba(194,24,91,',    // pink
      'rgba(212,175,55,',   // gold (more frequent)
      'rgba(212,175,55,',
    ]

    const particles = Array.from({ length: 120 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 2.5 + 0.3,
      dx:    (Math.random() - 0.5) * 0.4,
      dy:    -(Math.random() * 0.5 + 0.1),
      alpha: Math.random() * 0.7 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.pulse += 0.02
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + a + ')'
        ctx.fill()

        // Tiny glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (a * 0.15) + ')'
        ctx.fill()

        p.x += p.dx
        p.y += p.dy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// ── Kente geometric background pattern ───────────────────────────────────────
function KentePattern() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: `
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 40px,
          rgba(212,175,55,0.03) 40px,
          rgba(212,175,55,0.03) 42px
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 40px,
          rgba(212,175,55,0.03) 40px,
          rgba(212,175,55,0.03) 42px
        ),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(123,47,190,0.02) 20px,
          rgba(123,47,190,0.02) 21px
        )
      `,
    }} />
  )
}

// ── Animated title letters ────────────────────────────────────────────────────
function AnimatedTitle() {
  const [visibleCount, setVisibleCount] = useState(0)
  const title = 'GEMINIDZI'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= title.length) clearInterval(interval)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <h1 style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 'clamp(2.5rem, 8vw, 7rem)',
      fontWeight: 900,
      letterSpacing: '0.15em',
      margin: 0,
      display: 'flex',
      position: 'relative',
    }}>
      {title.split('').map((letter, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            color: i < visibleCount ? '#D4AF37' : 'transparent',
            textShadow: i < visibleCount
              ? '0 0 30px rgba(212,175,55,0.9), 0 0 60px rgba(212,175,55,0.4), 0 0 100px rgba(212,175,55,0.2)'
              : 'none',
            transform: i < visibleCount ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            transitionDelay: `${i * 0.05}s`,
          }}
        >
          {letter}
        </span>
      ))}
    </h1>
  )
}

// ── Typewriter subtitle ───────────────────────────────────────────────────────
function TypewriterText({ text, delay = 1500 }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted]     = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <p style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
      letterSpacing: '0.4em',
      color: 'rgba(245,240,232,0.6)',
      margin: '1.2rem 0 0',
      minHeight: '1.5em',
    }}>
      {displayed}
      <span style={{
        display: 'inline-block',
        width: '2px', height: '1em',
        background: '#D4AF37',
        marginLeft: '3px',
        verticalAlign: 'middle',
        animation: 'blink 1s step-end infinite',
      }} />
    </p>
  )
}

// ── Portal door card ──────────────────────────────────────────────────────────
function PortalDoor({ emoji, label, path, color, delay, description }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: '1.8rem 1.2rem',
        borderRadius: '16px',
        border: `1px solid ${hovered ? color : 'rgba(212,175,55,0.2)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${color}22, ${color}08)`
          : 'rgba(10,10,20,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        transform: visible
          ? hovered ? 'translateY(-10px) scale(1.04)' : 'translateY(0) scale(1)'
          : 'translateY(40px) scale(0.9)',
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? '0s' : `${delay}ms`,
        boxShadow: hovered
          ? `0 20px 60px ${color}40, 0 0 30px ${color}20, inset 0 1px 0 ${color}30`
          : '0 4px 20px rgba(0,0,0,0.4)',
        minWidth: '120px',
      }}
    >
      {/* Glow ring on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: -1, borderRadius: '16px',
          background: `linear-gradient(135deg, ${color}40, transparent, ${color}20)`,
          zIndex: -1,
        }} />
      )}

      <span style={{
        fontSize: '2.2rem',
        filter: hovered ? `drop-shadow(0 0 12px ${color})` : 'none',
        transition: 'filter 0.3s',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        display: 'inline-block',
        transition: 'all 0.3s',
      }}>
        {emoji}
      </span>

      <span style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: hovered ? color : 'rgba(245,240,232,0.8)',
        transition: 'color 0.3s',
        textAlign: 'center',
      }}>
        {label}
      </span>

      {hovered && (
        <span style={{
          fontSize: '0.65rem',
          color: 'rgba(245,240,232,0.5)',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.05em',
          lineHeight: 1.4,
          maxWidth: '100px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {description}
        </span>
      )}

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '20%', right: '20%',
        height: '1px',
        background: hovered
          ? `linear-gradient(90deg, transparent, ${color}, transparent)`
          : 'transparent',
        transition: 'background 0.3s',
      }} />
    </div>
  )
}

// ── Scroll indicator ─────────────────────────────────────────────────────────
function ScrollHint() {
  return (
    <div style={{
      position: 'absolute', bottom: '2rem', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      animation: 'float 2s ease-in-out infinite',
      opacity: 0.4,
    }}>
      <span style={{ fontFamily: 'Orbitron', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#D4AF37' }}>
        EXPLORE
      </span>
      <div style={{
        width: '20px', height: '32px', border: '1px solid rgba(212,175,55,0.5)',
        borderRadius: '10px', display: 'flex', justifyContent: 'center', paddingTop: '6px',
      }}>
        <div style={{
          width: '3px', height: '8px', background: '#D4AF37', borderRadius: '2px',
          animation: 'scrollDot 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
const PORTALS = [
  { emoji: '🎮', label: 'ARCADE',    path: '/arcade',    color: '#D4AF37', description: 'Play games',       delay: 1800 },
  { emoji: '💅', label: 'GLAM ROOM',     path: '/glamroom',  color: '#C2185B', description: 'Fashion & style',  delay: 1950 },
  { emoji: '🧠', label: 'MIND GAMES',    path: '/mindgames', color: '#7B2FBE', description: 'Puzzles & trivia', delay: 2100 },
  { emoji: '🛠', label: 'MY LAB',       path: '/lab',       color: '#2E7D32', description: 'Tools & apps',     delay: 2250 },
  { emoji: '🎨', label: 'MY STUDIO',    path: '/studio',    color: '#00BCD4', description: 'Creative work',    delay: 2400 },
  { emoji: '🌍', label: 'MY WORLD',     path: '/world',     color: '#FF8F00', description: 'About Me',      delay: 2550 },
  { emoji: '🖥', label: 'MY OS',        path: '/os',        color: '#7B2FBE', description: 'My Portfolio OS',     delay: 2700 },
  { emoji: '📡', label: 'MY FEED',      path: '/feed',      color: '#D4AF37', description: 'Devlog & blog',    delay: 2850 },
]

export default function Landing() {
  const [showPortals, setShowPortals] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPortals(true), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0A14 0%, #0D0820 50%, #0A0A14 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px',
    }}>

      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,47,190,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '8%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'pulse 6s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '20%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(194,24,91,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'pulse 5s ease-in-out infinite 1s',
      }} />

      <KentePattern />
      <Particles />

      {/* Hero content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '0 2rem',
      }}>

        {/* Top label */}
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.6em',
          color: 'rgba(212,175,55,0.5)',
          marginBottom: '1.5rem',
          animation: 'fadeIn 1s ease 0.3s both',
        }}>
          ✦ WELCOME TO ✦
        </div>

        <AnimatedTitle />
        <TypewriterText text="ENTER MY UNIVERSE" delay={1400} />

        {/* Divider line */}
        <div style={{
          width: '200px', height: '1px', margin: '2.5rem auto',
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
          animation: 'expandWidth 1s ease 1.2s both',
        }} />

        {/* Portal doors */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          maxWidth: '900px',
          marginTop: '0.5rem',
        }}>
          {PORTALS.map(p => (
            <PortalDoor key={p.path} {...p} />
          ))}
        </div>

        {/* Bottom tagline */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(245,240,232,0.25)',
          marginTop: '3rem',
          letterSpacing: '0.1em',
          animation: 'fadeIn 1s ease 3.5s both',
        }}>
          Built by Dzifa · Developer · Game Creator · World Builder
        </p>
      </div>

      <ScrollHint />

      {/* Global keyframe styles */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes expandWidth {
          from { width: 0; opacity: 0; }
          to   { width: 200px; opacity: 1; }
        }
      `}</style>
    </div>
  )
}