import { useState, useEffect, useRef } from 'react'

// ── Animated section wrapper ──────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ label, title, color = '#D4AF37' }) {
  return (
    <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.65rem',
        letterSpacing: '0.5em',
        color: 'rgba(212,175,55,0.5)',
        marginBottom: '0.75rem',
      }}>
        ✦ {label} ✦
      </p>
      <h2 style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
        fontWeight: 900,
        color,
        textShadow: `0 0 40px ${color}60`,
        letterSpacing: '0.05em',
        margin: 0,
      }}>
        {title}
      </h2>
      <div style={{
        width: '80px', height: '2px', margin: '1.2rem auto 0',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
    </div>
  )
}

// ── Skill bar ─────────────────────────────────────────────────────────────────
function SkillBar({ name, level, color, icon, delay }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setTimeout(() => setAnimated(true), delay * 1000) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{icon}</span> {name}
        </span>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color }}>{level}%</span>
      </div>
      <div style={{
        height: '6px', borderRadius: '3px',
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: animated ? `${level}%` : '0%',
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          boxShadow: `0 0 10px ${color}80`,
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}

// ── Skill card (for categories) ───────────────────────────────────────────────
function SkillCard({ emoji, title, skills, color, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${color}18, ${color}08)`
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? color + '60' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '16px',
          padding: '1.8rem',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? `0 12px 40px ${color}25` : 'none',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{emoji}</div>
        <h3 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.8rem',
          fontWeight: 700,
          color,
          letterSpacing: '0.1em',
          marginBottom: '1rem',
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {skills.map(skill => (
            <span key={skill} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '20px',
              background: `${color}18`,
              border: `1px solid ${color}30`,
              color: 'rgba(245,240,232,0.8)',
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

// ── Timeline item ─────────────────────────────────────────────────────────────
function TimelineItem({ year, title, description, color, isLast }) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
      {/* Line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%',
          background: color,
          boxShadow: `0 0 15px ${color}`,
          border: `2px solid ${color}`,
          flexShrink: 0,
          marginTop: '4px',
        }} />
        {!isLast && (
          <div style={{
            width: '2px', flex: 1, marginTop: '6px',
            background: 'linear-gradient(180deg, rgba(212,175,55,0.3), transparent)',
            minHeight: '60px',
          }} />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '2.5rem' }}>
        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: color,
          opacity: 0.8,
        }}>
          {year}
        </span>
        <h4 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#F5F0E8',
          margin: '0.3rem 0 0.5rem',
        }}>
          {title}
        </h4>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.88rem',
          color: 'rgba(245,240,232,0.55)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {description}
        </p>
      </div>
    </div>
  )
}

// ── Contact form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus]   = useState(null) // null | 'sending' | 'sent' | 'error'
  const [focused, setFocused] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus('error')
      return
    }
    setStatus('sending')

    // EmailJS — you'll add your Service ID, Template ID, and Public Key
    // For now opens mailto as a reliable fallback
    const subject = encodeURIComponent(form.subject || 'Message from DzifaVerse')
    const body    = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.open(`mailto:matrevidzifa@gmail.com?subject=${subject}&body=${body}`)
    setStatus('sent')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0.9rem 1.1rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === field ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: '10px',
    color: '#F5F0E8',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxShadow: focused === field ? '0 0 20px rgba(212,175,55,0.15)' : 'none',
    boxSizing: 'border-box',
  })

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(212,175,55,0.15)',
      borderRadius: '20px',
      padding: '2.5rem',
    }}>
      {status === 'sent' ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{ fontFamily: 'Orbitron, sans-serif', color: '#D4AF37', marginBottom: '0.5rem' }}>
            Message Sent!
          </h3>
          <p style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter, sans-serif' }}>
            Thank you for reaching out. Dzifa will get back to you soon.
          </p>
          <button
            onClick={() => setStatus(null)}
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '8px',
              color: '#D4AF37',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.75rem',
              cursor: 'pointer',
              letterSpacing: '0.1em',
            }}
          >
            SEND ANOTHER
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.6)', display: 'block', marginBottom: '0.5rem' }}>
                YOUR NAME
              </label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Your name"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                style={inputStyle('name')}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.6)', display: 'block', marginBottom: '0.5rem' }}>
                YOUR EMAIL
              </label>
              <input
                name="email" value={form.email} onChange={handleChange}
                placeholder="your@email.com"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={inputStyle('email')}
              />
            </div>
          </div>

          <div>
            <label style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.6)', display: 'block', marginBottom: '0.5rem' }}>
              SUBJECT
            </label>
            <input
              name="subject" value={form.subject} onChange={handleChange}
              placeholder="What is this about?"
              onFocus={() => setFocused('subject')}
              onBlur={() => setFocused(null)}
              style={inputStyle('subject')}
            />
          </div>

          <div>
            <label style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.6)', display: 'block', marginBottom: '0.5rem' }}>
              MESSAGE
            </label>
            <textarea
              name="message" value={form.message} onChange={handleChange}
              placeholder="Tell me about your project, opportunity, or just say hello..."
              rows={5}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused(null)}
              style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '130px' }}
            />
          </div>

          {status === 'error' && (
            <p style={{ color: '#C2185B', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
              Please fill in your name, email, and message before sending.
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'sending'}
            style={{
              padding: '1rem 2rem',
              background: status === 'sending'
                ? 'rgba(212,175,55,0.3)'
                : 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))',
              border: '1px solid rgba(212,175,55,0.5)',
              borderRadius: '10px',
              color: '#D4AF37',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => {
              if (status !== 'sending') {
                e.target.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))'
                e.target.style.boxShadow = '0 0 30px rgba(212,175,55,0.3)'
              }
            }}
            onMouseLeave={e => {
              e.target.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))'
              e.target.style.boxShadow = 'none'
            }}
          >
            {status === 'sending' ? 'SENDING...' : '✦ SEND MESSAGE'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ number, label, color, emoji }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  const target = parseInt(number)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let current = 0
    const step  = Math.ceil(target / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 40)
    return () => clearInterval(timer)
  }, [started, target])

  return (
    <div ref={ref} style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}30`,
      borderRadius: '16px',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 900,
        color,
        textShadow: `0 0 20px ${color}60`,
      }}>
        {count}+
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.8rem',
        color: 'rgba(245,240,232,0.45)',
        letterSpacing: '0.05em',
        marginTop: '0.3rem',
      }}>
        {label}
      </div>
    </div>
  )
}

// ── Main World Page ───────────────────────────────────────────────────────────
export default function World() {
  const sectionStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '6rem 2rem',
  }

  const dividerStyle = {
    width: '100%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)',
    margin: '0',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0A14 0%, #0D0820 50%, #0A0A14 100%)',
      paddingTop: '80px',
    }}>

      {/* ── HERO / ABOUT ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Avatar circle */}
          <FadeIn delay={0}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(123,47,190,0.3))',
                border: '2px solid rgba(212,175,55,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '5rem',
                boxShadow: '0 0 60px rgba(212,175,55,0.2), 0 0 120px rgba(123,47,190,0.1)',
                position: 'relative',
                zIndex: 1,
              }}>
                🌍
              </div>
              {/* Orbiting ring */}
              <div style={{
                position: 'absolute', inset: '-12px', borderRadius: '50%',
                border: '1px solid rgba(212,175,55,0.2)',
                animation: 'spin 12s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: '-24px', borderRadius: '50%',
                border: '1px dashed rgba(123,47,190,0.15)',
                animation: 'spin 20s linear infinite reverse',
              }} />
            </div>
          </FadeIn>

          {/* Bio */}
          <FadeIn delay={0.2}>
            <div>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', letterSpacing: '0.5em', color: 'rgba(212,175,55,0.5)', marginBottom: '0.75rem' }}>
                ✦ ABOUT ME ✦
              </p>
              <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                color: '#D4AF37',
                textShadow: '0 0 40px rgba(212,175,55,0.5)',
                margin: '0 0 0.3rem',
                lineHeight: 1.1,
              }}>
                Hi, I'm Dzifa
              </h1>
              <p style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                color: '#7B2FBE',
                letterSpacing: '0.15em',
                marginBottom: '1.5rem',
              }}>
                Developer · Game Creator · World Builder
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(245,240,232,0.7)',
                lineHeight: 1.8,
                maxWidth: '560px',
                marginBottom: '1rem',
              }}>
                I'm a passionate developer and creative technologist building GeminiDzi:
                a living digital universe that blends Afrofuturism, game development,
                AI, and beautiful design into one immersive experience.
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(245,240,232,0.7)',
                lineHeight: 1.8,
                maxWidth: '560px',
                marginBottom: '2rem',
              }}>
                Currently levelling up across React, full-stack development, game engines,
                and AI integration with a mission to build technology that celebrates
                African culture and tells our stories in new ways.
              </p>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="mailto:matrevidzifa@gmail.com"
                  style={{
                    padding: '0.8rem 1.8rem',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
                    border: '1px solid rgba(212,175,55,0.5)',
                    borderRadius: '10px',
                    color: '#D4AF37',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.target.style.boxShadow = '0 0 25px rgba(212,175,55,0.3)'; e.target.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}
                >
                  ✉ HIRE ME
                </a>
                <a
                  href="#contact"
                  style={{
                    padding: '0.8rem 1.8rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: 'rgba(245,240,232,0.7)',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'rgba(212,175,55,0.3)'; e.target.style.color = '#D4AF37' }}
                  onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(245,240,232,0.7)' }}
                >
                  ↓ GET IN TOUCH
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div style={dividerStyle} />

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, padding: '5rem 2rem' }}>
        <FadeIn>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.5rem',
          }}>
            <StatCard number="31"  label="Projects Planned"  color="#D4AF37" emoji="🚀" />
            <StatCard number="16"  label="Games in Universe"  color="#C2185B" emoji="🎮" />
            <StatCard number="11"  label="Apps & Tools"       color="#7B2FBE" emoji="🛠" />
            <StatCard number="8"   label="Districts Built"    color="#2E7D32" emoji="🌍" />
          </div>
        </FadeIn>
      </section>

      <div style={dividerStyle} />

      {/* ── SKILLS ────────────────────────────────────────────────── */}
      <section style={sectionStyle} id="skills">
        <FadeIn>
          <SectionHeading label="WHAT I KNOW" title="Skills & Tools" color="#D4AF37" />
        </FadeIn>

        {/* Skill bars */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem',
          marginBottom: '3rem',
        }}>
          <FadeIn delay={0.1}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: 'rgba(212,175,55,0.6)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
                DEVELOPMENT
              </h3>
              <SkillBar name="React / JavaScript" level={72} color="#D4AF37"  icon="⚛️" delay={0.1} />
              <SkillBar name="HTML & CSS"          level={85} color="#C2185B"  icon="🎨" delay={0.2} />
              <SkillBar name="Python"              level={60} color="#7B2FBE"  icon="🐍" delay={0.3} />
              <SkillBar name="Node.js / Express"   level={50} color="#2E7D32"  icon="🟢" delay={0.4} />
              <SkillBar name="Databases (MongoDB)" level={45} color="#00BCD4"  icon="🗄️" delay={0.5} />
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: 'rgba(212,175,55,0.6)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
                CREATIVE & TOOLS
              </h3>
              <SkillBar name="UI / UX Design"      level={75} color="#C2185B"  icon="✨" delay={0.1} />
              <SkillBar name="Figma"               level={68} color="#FF8F00"  icon="🖌️" delay={0.2} />
              <SkillBar name="Game Dev (Unity)"    level={40} color="#D4AF37"  icon="🎮" delay={0.3} />
              <SkillBar name="AI Integration"      level={45} color="#7B2FBE"  icon="🤖" delay={0.4} />
              <SkillBar name="Three.js / 3D Web"   level={35} color="#00BCD4"  icon="🌐" delay={0.5} />
            </div>
          </FadeIn>
        </div>

        {/* Skill category cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.2rem',
        }}>
          <SkillCard
            emoji="⚛️" title="FRONTEND" color="#D4AF37" delay={0}
            skills={['React', 'Vite', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind', 'Framer Motion', 'Three.js']}
          />
          <SkillCard
            emoji="🛠" title="BACKEND" color="#2E7D32" delay={0.1}
            skills={['Node.js', 'Express', 'MongoDB', 'Firebase', 'REST APIs', 'JWT Auth']}
          />
          <SkillCard
            emoji="🎮" title="GAME DEV" color="#C2185B" delay={0.2}
            skills={['Unity', 'Godot', 'Phaser.js', 'Canvas API', 'Ren\'Py', 'Matter.js']}
          />
          <SkillCard
            emoji="🤖" title="AI & DATA" color="#7B2FBE" delay={0.3}
            skills={['Claude API', 'TensorFlow.js', 'Python', 'Data Viz', 'D3.js', 'ML Concepts']}
          />
          <SkillCard
            emoji="🎨" title="DESIGN" color="#FF8F00" delay={0.4}
            skills={['Figma', 'UI/UX', 'Prototyping', 'Afrofuturism', 'Typography', 'Colour Theory']}
          />
          <SkillCard
            emoji="🚀" title="TOOLS & DEPLOY" color="#00BCD4" delay={0.5}
            skills={['Git', 'GitHub', 'Vercel', 'VS Code', 'npm', 'Postman']}
          />
        </div>
      </section>

      <div style={dividerStyle} />

      {/* ── JOURNEY / TIMELINE ────────────────────────────────────── */}
      <section style={sectionStyle} id="journey">
        <FadeIn>
          <SectionHeading label="MY PATH" title="The Journey" color="#7B2FBE" />
        </FadeIn>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <FadeIn delay={0.1}>
            <TimelineItem
              year="BEGINNING"
              title="Discovered the World of Code"
              description="Started exploring web development — HTML, CSS, and the excitement of seeing something appear on a screen for the first time. The spark was lit."
              color="#D4AF37"
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <TimelineItem
              year="LEARNING"
              title="Levelling Up with React"
              description="Dived into React, JavaScript, and modern frontend development. Started building real projects and understanding how the web actually works under the hood."
              color="#C2185B"
            />
          </FadeIn>
          <FadeIn delay={0.3}>
            <TimelineItem
              year="EXPANDING"
              title="Full Stack & Beyond"
              description="Began exploring backend development with Node.js and databases. Discovered game development, AI integration, and the power of combining multiple technologies."
              color="#7B2FBE"
            />
          </FadeIn>
          <FadeIn delay={0.4}>
            <TimelineItem
              year="NOW — 2025"
              title="Building GeminiDzi"
              description="Creating a full creative universe full of games, tools, apps, and an Afrofuturist portfolio that represents both technical skill and cultural identity. Applying for roles in May 2025."
              color="#2E7D32"
            />
          </FadeIn>
          <FadeIn delay={0.5}>
            <TimelineItem
              year="NEXT"
              title="The Universe Expands"
              description="More games. More tools. More AI. More collaboration. More impact. The DzifaVerse is just getting started."
              color="#D4AF37"
              isLast
            />
          </FadeIn>
        </div>
      </section>

      <div style={dividerStyle} />

      {/* ── CONTACT ───────────────────────────────────────────────── */}
      <section style={sectionStyle} id="contact">
        <FadeIn>
          <SectionHeading label="LET'S CONNECT" title="Get In Touch" color="#C2185B" />
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>

          {/* Contact info */}
          <FadeIn delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(245,240,232,0.65)',
                lineHeight: 1.8,
              }}>
                Whether you have a job opportunity, a project idea, a collaboration,
                or just want to say hello — I would love to hear from you.
              </p>

              {/* Contact details */}
              {[
                { icon: '✉️', label: 'EMAIL', value: 'matrevidzifa@gmail.com', href: 'mailto:matrevidzifa@gmail.com' },
                { icon: '📍', label: 'LOCATION', value: 'Available Worldwide', href: null },
                { icon: '💼', label: 'STATUS', value: 'Open to Opportunities', href: null },
              ].map(({ icon, label, value, href }) => (
                <div key={label} style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  padding: '1rem 1.2rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(212,175,55,0.1)',
                  borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '1.3rem', marginTop: '2px' }}>{icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', margin: '0 0 0.2rem' }}>
                      {label}
                    </p>
                    {href ? (
                      <a href={href} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#D4AF37', textDecoration: 'none' }}>
                        {value}
                      </a>
                    ) : (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(245,240,232,0.8)', margin: 0 }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Social links placeholder */}
              <div>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.4)', marginBottom: '0.8rem' }}>
                  FIND ME ONLINE
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { label: 'GitHub',   emoji: '🐙', href: 'https://github.com' },
                    { label: 'LinkedIn', emoji: '💼', href: 'https://linkedin.com' },
                  ].map(({ label, emoji, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: '0.6rem 1rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'rgba(245,240,232,0.7)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.color = '#D4AF37' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,240,232,0.7)' }}
                    >
                      {emoji} {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Contact form */}
          <FadeIn delay={0.2}>
            <ContactForm />
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(212,175,55,0.1)',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          color: 'rgba(212,175,55,0.4)',
        }}>
          ✦ GEMINIDZI · BUILT WITH ♥ BY DZIFA · 2025 ✦
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .world-hero { grid-template-columns: 1fr !important; text-align: center; }
          .world-skills { grid-template-columns: 1fr !important; }
          .world-contact { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}