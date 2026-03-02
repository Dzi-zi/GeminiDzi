import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
  muted:  'rgba(245,240,232,0.5)',
  border: 'rgba(212,175,55,0.15)',
}
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ── Nav links — each with its district colour ─────────────────────────────────
const NAV_LINKS = [
  { label: 'Arcade',     path: '/arcade',    color: C.gold   },
  { label: 'Glam Room',  path: '/glamroom',  color: C.rose   },
  { label: 'Mind Games', path: '/mindgames', color: C.purple },
  { label: 'Lab',        path: '/lab',       color: C.green  },
  { label: 'Studio',     path: '/studio',    color: C.teal   },
  { label: 'World',      path: '/world',     color: C.amber  },
  { label: 'OS',         path: '/os',        color: C.purple },
  { label: 'Feed',       path: '/feed',      color: C.gold   },
]

// ── Desktop nav link — holographic style, per-colour ─────────────────────────
function NavLink({ label, path, color, isActive }) {
  const [hovered, setHovered] = useState(false)
  const lit = isActive || hovered

  return (
    <Link
      to={path}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0.45rem 0.8rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: lit ? color : C.muted,
        background: lit ? `${color}12` : 'transparent',
        border: `1px solid ${lit ? color + '35' : 'transparent'}`,
        boxShadow: isActive ? `0 0 14px ${color}20, inset 0 0 8px ${color}08` : 'none',
        transition: `all 0.22s ${EASE}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}

      {/* Active glow underline */}
      {isActive && (
        <span style={{
          position: 'absolute',
          bottom: '-1px', left: '20%', right: '20%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: '1px',
          boxShadow: `0 0 6px ${color}`,
        }} />
      )}
    </Link>
  )
}

// ── Mobile drawer link ────────────────────────────────────────────────────────
function DrawerLink({ label, path, color, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  const lit = isActive || hovered

  return (
    <Link
      to={path}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.2rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: lit ? color : C.muted,
        background: lit ? `${color}12` : 'transparent',
        border: `1px solid ${lit ? color + '30' : 'transparent'}`,
        transition: `all 0.2s ${EASE}`,
      }}
    >
      {label}
      {isActive && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }} />
      )}
    </Link>
  )
}

// ── Hamburger ─────────────────────────────────────────────────────────────────
function Hamburger({ open }) {
  return (
    <div style={{ width: 18, height: 13, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'block',
          height: '1.5px',
          background: open ? C.gold : C.muted,
          borderRadius: '1px',
          transformOrigin: 'center',
          transition: `all 0.25s ${EASE}`,
          width: open ? (i === 1 ? '0%' : '100%') : '100%',
          opacity: (open && i === 1) ? 0 : 1,
          transform: open
            ? i === 0 ? 'translateY(5.75px) rotate(45deg)'
            : i === 2 ? 'translateY(-5.75px) rotate(-45deg)'
            : 'none'
            : 'none',
        }} />
      ))}
    </div>
  )
}

// ── Navigation ────────────────────────────────────────────────────────────────
export default function Navigation() {
  const location = useLocation()
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState('')

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSearchVal('')
  }, [location.pathname])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const filtered = NAV_LINKS.filter(l =>
    l.label.toLowerCase().includes(searchVal.toLowerCase())
  )

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: scrolled ? '0.6rem 2rem' : '0.85rem 2rem',
        transition: `all 0.3s ${EASE}`,
        background: scrolled ? 'rgba(8,6,20,0.94)' : 'rgba(10,10,20,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'rgba(212,175,55,0.06)'}`,
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
      }}>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 900,
            fontSize: scrolled ? '0.95rem' : '1.1rem',
            color: C.gold,
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textShadow: '0 0 18px rgba(212,175,55,0.45)',
            flexShrink: 0,
            marginRight: '1.2rem',
            transition: `all 0.3s ${EASE}`,
          }}
            onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 28px rgba(212,175,55,0.85)'}
            onMouseLeave={e => e.currentTarget.style.textShadow = '0 0 18px rgba(212,175,55,0.45)'}
          >
            GeminiDzi
          </Link>

          {/* Desktop links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem',
            flex: 1,
            overflow: 'hidden',
          }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.path} {...link} isActive={isActive(link.path)} />
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>

            {/* Search */}
            <button
              onClick={() => { setSearchOpen(s => !s); setMenuOpen(false) }}
              title="Search (⌘K)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34,
                background: searchOpen ? 'rgba(212,175,55,0.12)' : 'transparent',
                border: `1px solid ${searchOpen ? C.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                color: searchOpen ? C.gold : C.muted,
                transition: `all 0.2s ${EASE}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => {
                if (!searchOpen) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = C.muted }
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Hamburger */}
            <button
              onClick={() => { setMenuOpen(s => !s); setSearchOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34,
                background: menuOpen ? 'rgba(212,175,55,0.1)' : 'transparent',
                border: `1px solid ${menuOpen ? C.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: `all 0.2s ${EASE}`,
              }}
            >
              <Hamburger open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div style={{
            maxWidth: '1300px', margin: '0.6rem auto 0',
            animation: `slideDown 0.2s ${EASE}`,
          }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                <circle cx="6.5" cy="6.5" r="5" stroke={C.text} strokeWidth="1.6"/>
                <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke={C.text} strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search GeminiDzi…"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  color: C.text,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {searchVal && (
              <div style={{
                marginTop: '0.4rem',
                background: 'rgba(10,8,28,0.97)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {filtered.length === 0 ? (
                  <p style={{ padding: '0.9rem 1.2rem', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: C.muted, margin: 0 }}>
                    No results for "{searchVal}"
                  </p>
                ) : filtered.map(link => (
                  <Link
                    key={link.path} to={link.path}
                    onClick={() => { setSearchOpen(false); setSearchVal('') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 1.2rem',
                      textDecoration: 'none',
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${link.color}12`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: link.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: link.color }}>
                      {link.label}
                    </span>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: C.muted }}>
                      dzifaverse{link.path}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 998,
              animation: `fadeIn 0.2s ${EASE}`,
            }}
          />
          <aside style={{
            position: 'fixed',
            top: 0, right: 0, bottom: 0,
            width: 'min(300px, 82vw)',
            background: 'rgba(10,8,24,0.98)',
            borderLeft: `1px solid ${C.border}`,
            backdropFilter: 'blur(28px)',
            zIndex: 999,
            padding: '5rem 1.2rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            overflowY: 'auto',
            animation: `slideLeft 0.28s cubic-bezier(0.34,1.56,0.64,1)`,
            boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{
              position: 'absolute', top: '1.4rem', left: '1.2rem', right: '1.2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.55rem',
                letterSpacing: '0.3em',
                color: 'rgba(212,175,55,0.45)',
              }}>NAVIGATE</span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderRadius: '6px',
                  color: C.muted,
                  width: 26, height: 26,
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: `border-color 0.2s, color 0.2s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.muted; e.currentTarget.style.color = C.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = C.muted }}
              >✕</button>
            </div>

            {/* Home */}
            <DrawerLink label="Home" path="/" color={C.gold}
              isActive={location.pathname === '/'}
              onClick={() => setMenuOpen(false)}
            />
            <div style={{ height: 1, background: 'rgba(212,175,55,0.08)', margin: '0.3rem 0' }} />

            {NAV_LINKS.map(link => (
              <DrawerLink key={link.path} {...link}
                isActive={isActive(link.path)}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.5rem',
                letterSpacing: '0.2em',
                color: 'rgba(212,175,55,0.2)',
              }}>DZIFAVERSE 2025</p>
            </div>
          </aside>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 860px) {
          .desktop-links { display: none !important; }
        }
      `}</style>
    </>
  )
}