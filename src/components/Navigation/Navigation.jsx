import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Arcade',     path: '/arcade',    emoji: '🎮', color: '#D4AF37' },
  { label: 'Glam Room',  path: '/glamroom',  emoji: '💅', color: '#C2185B' },
  { label: 'Mind Games', path: '/mindgames', emoji: '🧠', color: '#7B2FBE' },
  { label: 'Lab',        path: '/lab',       emoji: '🛠', color: '#2E7D32' },
  { label: 'Studio',     path: '/studio',    emoji: '🎨', color: '#00BCD4' },
  { label: 'World',      path: '/world',     emoji: '🌍', color: '#FF8F00' },
  { label: 'OS',         path: '/os',        emoji: '🖥', color: '#7B2FBE' },
  { label: 'Feed',       path: '/feed',      emoji: '📡', color: '#D4AF37' },
]

// ── Single nav link ───────────────────────────────────────────────────────────
function NavLink({ label, path, emoji, color, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={path}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: isActive ? color : hovered ? color : 'rgba(245,240,232,0.65)',
        background: isActive
          ? `${color}18`
          : hovered ? `${color}12` : 'transparent',
        border: isActive
          ? `1px solid ${color}40`
          : hovered ? `1px solid ${color}25` : '1px solid transparent',
        transition: 'all 0.25s ease',
        boxShadow: isActive ? `0 0 16px ${color}25` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        fontSize: '0.85rem',
        filter: (isActive || hovered) ? `drop-shadow(0 0 6px ${color})` : 'none',
        transition: 'filter 0.25s',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        display: 'inline-block',
        transition: 'all 0.25s',
      }}>
        {emoji}
      </span>
      {label}

      {/* Active underline glow */}
      {isActive && (
        <span style={{
          position: 'absolute',
          bottom: '-1px', left: '20%', right: '20%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: '1px',
          boxShadow: `0 0 8px ${color}`,
        }} />
      )}
    </Link>
  )
}

// ── Mobile menu link ──────────────────────────────────────────────────────────
function MobileNavLink({ label, path, emoji, color, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={path}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.9rem 1.2rem',
        borderRadius: '10px',
        textDecoration: 'none',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: isActive ? color : hovered ? color : 'rgba(245,240,232,0.7)',
        background: isActive ? `${color}15` : hovered ? `${color}10` : 'transparent',
        border: `1px solid ${isActive ? color + '40' : 'transparent'}`,
        transition: 'all 0.25s ease',
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
      {label}
      {isActive && (
        <span style={{
          marginLeft: 'auto',
          width: '6px', height: '6px', borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }} />
      )}
    </Link>
  )
}

// ── Main Navigation ───────────────────────────────────────────────────────────
export default function Navigation() {
  const location   = useLocation()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')

  // Shrink nav on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location])

  // Close menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  // Simple search filter
  const filtered = NAV_LINKS.filter(l =>
    l.label.toLowerCase().includes(searchVal.toLowerCase())
  )

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: scrolled ? '0.6rem 2rem' : '0.9rem 2rem',
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(8, 6, 18, 0.92)'
          : 'rgba(10, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(212,175,55,0.2)'
          : '1px solid rgba(212,175,55,0.08)',
        boxShadow: scrolled
          ? '0 4px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(212,175,55,0.1)'
          : 'none',
      }}>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>

          {/* ── Logo ── */}
          <Link
            to="/"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: scrolled ? '1rem' : '1.15rem',
              color: '#D4AF37',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              textShadow: '0 0 20px rgba(212,175,55,0.5)',
              transition: 'all 0.3s',
              flexShrink: 0,
              marginRight: '1rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.textShadow = '0 0 30px rgba(212,175,55,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.textShadow = '0 0 20px rgba(212,175,55,0.5)' }}
          >
            ✦ GeminiDzi
          </Link>

          {/* ── Desktop links ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            flex: 1,
            flexWrap: 'nowrap',
            overflow: 'hidden',
          }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                {...link}
                isActive={isActive(link.path)}
              />
            ))}
          </div>

          {/* ── Right side icons ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                background: searchOpen ? 'rgba(212,175,55,0.15)' : 'transparent',
                border: `1px solid ${searchOpen ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px',
                color: searchOpen ? '#D4AF37' : 'rgba(245,240,232,0.5)',
                width: '36px', height: '36px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}
              title="Search"
            >
              🔍
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: menuOpen ? 'rgba(212,175,55,0.15)' : 'transparent',
                border: `1px solid ${menuOpen ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px',
                color: 'rgba(245,240,232,0.7)',
                width: '36px', height: '36px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.25s',
              }}
              title="Menu"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block',
                  width: menuOpen
                    ? i === 1 ? '0px' : '16px'
                    : '16px',
                  height: '1.5px',
                  background: menuOpen ? '#D4AF37' : 'rgba(245,240,232,0.7)',
                  borderRadius: '1px',
                  transition: 'all 0.25s',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                    : i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                    : 'none'
                    : 'none',
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* ── Search bar dropdown ── */}
        {searchOpen && (
          <div style={{
            maxWidth: '1300px',
            margin: '0.75rem auto 0',
            animation: 'slideDown 0.2s ease',
          }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.9rem', opacity: 0.4,
              }}>🔍</span>
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search GeminiDzi for games, tools, pages..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '10px',
                  color: '#F5F0E8',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 0 20px rgba(212,175,55,0.1)',
                }}
              />
            </div>
            {searchVal && (
              <div style={{
                marginTop: '0.5rem',
                background: 'rgba(10,10,20,0.95)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
              }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '1rem 1.2rem', color: 'rgba(245,240,232,0.4)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                    No results for "{searchVal}"
                  </div>
                ) : filtered.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => { setSearchOpen(false); setSearchVal('') }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.2rem',
                      textDecoration: 'none',
                      color: 'rgba(245,240,232,0.8)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${link.color}15` }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span>{link.emoji}</span>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: link.color }}>
                      {link.label}
                    </span>
                    <span style={{ color: 'rgba(245,240,232,0.3)', fontSize: '0.75rem' }}>
                      dzifaverse{link.path}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Mobile menu overlay ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 998,
              animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed',
            top: 0, right: 0, bottom: 0,
            width: 'min(320px, 85vw)',
            background: 'rgba(10,8,24,0.98)',
            borderLeft: '1px solid rgba(212,175,55,0.2)',
            backdropFilter: 'blur(30px)',
            zIndex: 999,
            padding: '5rem 1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            overflowY: 'auto',
            animation: 'slideLeft 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          }}>
            {/* Drawer header */}
            <div style={{
              position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: 'rgba(212,175,55,0.5)',
              }}>
                NAVIGATE
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'rgba(245,240,232,0.5)',
                  width: '28px', height: '28px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Home link */}
            <MobileNavLink
              label="Home"
              path="/"
              emoji="✦"
              color="#D4AF37"
              isActive={location.pathname === '/'}
              onClick={() => setMenuOpen(false)}
            />

            <div style={{
              height: '1px',
              background: 'rgba(212,175,55,0.1)',
              margin: '0.5rem 0',
            }} />

            {NAV_LINKS.map(link => (
              <MobileNavLink
                key={link.path}
                {...link}
                isActive={isActive(link.path)}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <p style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                color: 'rgba(212,175,55,0.25)',
                textAlign: 'center',
              }}>
                ✦ DZIFAVERSE 2025 ✦
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}