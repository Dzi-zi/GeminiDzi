import { useState, useEffect, useRef } from 'react'

// ── World District Identity ───────────────────────────────────────────────────
// Concept: The most personal district. Warm, confident, grounded.
// A person who builds things, writes poetry, loves books, thinks in worlds.
//
// Background: #141210  warm charcoal — a room with low light and good taste
// Surface:    #1C1916  slightly lifted warm dark
// Gold:       #D4AF37  the site's primary gold, owns this page
// Amber:      #E8A020  warmer personal amber for accents
// Text:       #F0EAE0  very warm white
// Font:       Cinzel — classical, dignified, Afrocentric royalty
//             Used for name, section headings, year stamps
// Body:       DM Sans — clean and warm alongside the serif display

const C = {
  bg:         '#141210',
  surface:    '#1C1916',
  surfaceHov: '#231F1A',
  gold:       '#D4AF37',
  goldFaint:  'rgba(212,175,55,0.1)',
  goldBright: 'rgba(212,175,55,0.2)',
  amber:      '#E8A020',
  rose:       '#C2185B',
  purple:     '#7B2FBE',
  green:      '#2E7D32',
  teal:       '#00BCD4',
  text:       '#F0EAE0',
  muted:      'rgba(240,234,224,0.55)',
  faint:      'rgba(240,234,224,0.22)',
  border:     'rgba(212,175,55,0.16)',
  borderSub:  'rgba(240,234,224,0.08)',
}

const R = { sm: '2px', md: '6px', lg: '14px' }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const T = {
  label:  { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' },
  name:   { fontFamily: 'Cinzel, serif',          fontSize: 'clamp(2.6rem, 6vw, 5rem)', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.0 },
  h2:     { fontFamily: 'Cinzel, serif',          fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.1 },
  h3:     { fontFamily: 'Cinzel, serif',          fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.06em' },
  body:   { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.78 },
  small:  { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.82rem', fontWeight: 400, lineHeight: 1.65 },
  tiny:   { fontFamily: '"DM Sans", sans-serif',  fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.08em' },
  mono:   { fontFamily: '"DM Mono", monospace',   fontSize: '0.65rem', fontWeight: 400, letterSpacing: '0.06em' },
}

// ── Intersection fade-in ──────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s`,
    }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />
}

function SectionHeading({ eyebrow, title, color = C.gold }) {
  return (
    <FadeIn>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ ...T.label, color, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
          <span style={{ display: 'block', width: 24, height: 1, background: color }} />
          {eyebrow}
        </div>
        <h2 style={{ ...T.h2, color: C.text, margin: 0 }}>{title}</h2>
      </div>
    </FadeIn>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, color }) {
  const [n, setN] = useState(0)
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!go) return
    let c = 0
    const step = Math.ceil(target / 40)
    const t = setInterval(() => {
      c += step
      if (c >= target) { setN(target); clearInterval(t) } else setN(c)
    }, 40)
    return () => clearInterval(t)
  }, [go, target])
  return <span ref={ref} style={{ fontFamily: 'Cinzel, serif', fontSize: '2.4rem', fontWeight: 700, color, lineHeight: 1 }}>{n}</span>
}

function StatCard({ value, suffix = '+', label, color }) {
  const isNum = !isNaN(parseInt(value))
  return (
    <div style={{ padding: '1.6rem', background: C.surface, border: `1px solid ${C.borderSub}`, borderTop: `2px solid ${color}`, textAlign: 'center' }}>
      <div style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
        {isNum
          ? <><Counter target={parseInt(value)} color={color} /><span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', fontWeight: 700, color }}>{suffix}</span></>
          : <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', fontWeight: 700, color }}>{value}</span>
        }
      </div>
      <div style={{ ...T.tiny, color: C.faint }}>{label}</div>
    </div>
  )
}

// ── Skill bar ─────────────────────────────────────────────────────────────────
function SkillBar({ name, level, color, delay = 0 }) {
  const [anim, setAnim] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setTimeout(() => setAnim(true), delay * 100) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ ...T.small, color: C.text }}>{name}</span>
        <span style={{ ...T.mono, color }}>{level}%</span>
      </div>
      <div style={{ height: 3, background: C.borderSub, borderRadius: R.sm, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: anim ? `${level}%` : '0%',
          background: color,
          borderRadius: R.sm,
          transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${delay * 0.05}s`,
        }} />
      </div>
    </div>
  )
}

// ── Skill group ───────────────────────────────────────────────────────────────
function SkillGroup({ title, skills, color, delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ padding: '1.4rem', background: C.surface, border: `1px solid ${C.borderSub}`, borderLeft: `2px solid ${color}`, borderRadius: R.md }}>
        <div style={{ ...T.tiny, color, marginBottom: '0.85rem' }}>{title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {skills.map(s => (
            <span key={s} style={{ ...T.small, color: C.muted, padding: '0.2rem 0.55rem', border: `1px solid ${C.borderSub}`, borderRadius: R.sm, background: 'rgba(255,255,255,0.02)' }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function TimelineItem({ year, title, desc, color, isLast }) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: color, border: `2px solid ${C.bg}`, outline: `2px solid ${color}`, flexShrink: 0, marginTop: 4 }} />
        {!isLast && <div style={{ width: 1, flex: 1, marginTop: 6, background: `linear-gradient(180deg, ${color}50, transparent)`, minHeight: 50 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : '2.5rem', flex: 1 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.18em', color, marginBottom: '0.3rem' }}>{year}</div>
        <h4 style={{ ...T.h3, color: C.text, margin: '0 0 0.4rem', fontSize: '0.85rem' }}>{title}</h4>
        <p style={{ ...T.small, color: C.muted, margin: 0 }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Contact form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [focused, setFocused] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { setStatus('error'); return }
    setStatus('sending')
    try {
      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.send('service_cfm3ayu', 'template_wfi4ojp', {
        from_name: form.name, from_email: form.email,
        subject: form.subject || 'Message from GeminiDzi',
        message: form.message, to_email: 'matrevidzifa@gmail.com',
      }, 'tfWqE9uV_3Iov7Lbi')
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch { setStatus('error') }
  }

  const inputBase = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '0.85rem 1rem',
    background: focused === name ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${focused === name ? C.border : C.borderSub}`,
    borderRadius: R.md,
    color: C.text,
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.88rem', lineHeight: 1.6,
    outline: 'none',
    transition: `border-color 0.2s ease, background 0.2s ease`,
  })

  if (status === 'sent') return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: C.gold, marginBottom: '0.75rem' }}>Message Sent</div>
      <p style={{ ...T.small, color: C.muted, marginBottom: '1.5rem' }}>Thank you for reaching out. I will get back to you soon.</p>
      <button onClick={() => setStatus(null)} style={{ ...T.tiny, padding: '0.55rem 1.2rem', border: `1px solid ${C.border}`, borderRadius: R.md, background: 'transparent', color: C.gold, cursor: 'pointer' }}>
        Send another
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[['name','Your name'], ['email','your@email.com']].map(([n, ph]) => (
          <div key={n}>
            <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.4rem' }}>{n}</div>
            <input name={n} value={form[n]} placeholder={ph} onChange={handleChange}
              onFocus={() => setFocused(n)} onBlur={() => setFocused(null)}
              style={inputBase(n)} />
          </div>
        ))}
      </div>
      <div>
        <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.4rem' }}>Subject</div>
        <input name="subject" value={form.subject} placeholder="What is this about?" onChange={handleChange}
          onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)} style={inputBase('subject')} />
      </div>
      <div>
        <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.4rem' }}>Message</div>
        <textarea name="message" value={form.message} rows={5}
          placeholder="Tell me about the opportunity, project, or just say hello."
          onChange={handleChange}
          onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
          style={{ ...inputBase('message'), resize: 'vertical', minHeight: '120px' }} />
      </div>
      {status === 'error' && <p style={{ ...T.small, color: C.rose, margin: 0 }}>Please fill in your name, email, and message.</p>}
      <button onClick={handleSubmit} disabled={status === 'sending'}
        style={{
          ...T.tiny, padding: '0.9rem 2rem', alignSelf: 'flex-start',
          background: C.goldFaint, border: `1px solid ${C.border}`, borderRadius: R.md,
          color: C.gold, cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          transition: `all 0.2s ease`, opacity: status === 'sending' ? 0.6 : 1,
        }}
        onMouseEnter={e => { if (status !== 'sending') { e.currentTarget.style.background = C.goldBright; e.currentTarget.style.transform = 'translateY(-2px)' } }}
        onMouseLeave={e => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  )
}

// ── World page ────────────────────────────────────────────────────────────────
export default function World() {
  const wrap = { maxWidth: '1000px', margin: '0 auto', padding: '5rem 2rem' }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '80px' }}>

      {/* ── HERO ── */}
      <section style={wrap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4rem', alignItems: 'center' }}>

          {/* Avatar */}
          <FadeIn delay={0}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {/* Slow outer ring */}
              <div style={{
                position: 'absolute', inset: -18, borderRadius: '50%',
                border: `1px solid ${C.border}`,
                animation: `worldSpin 22s linear infinite`,
                pointerEvents: 'none',
              }} />
              {/* Inner dashed ring */}
              <div style={{
                position: 'absolute', inset: -9, borderRadius: '50%',
                border: `1px dashed rgba(212,175,55,0.1)`,
                animation: `worldSpin 35s linear infinite reverse`,
                pointerEvents: 'none',
              }} />
              {/* Monogram circle */}
              <div style={{
                width: 180, height: 180, borderRadius: '50%',
                background: `radial-gradient(circle at 40% 40%, rgba(212,175,55,0.12), rgba(123,47,190,0.06))`,
                border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
              }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '3.8rem', fontWeight: 700, color: C.gold, lineHeight: 1, userSelect: 'none' }}>
                  D
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Bio text */}
          <FadeIn delay={0.12}>
            <div>
              <div style={{ ...T.label, color: C.gold, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <span style={{ display: 'block', width: 24, height: 1, background: C.gold }} />
                District 06
              </div>

              <h1 style={{ ...T.name, color: C.text, margin: '0 0 0.4rem' }}>
                Hi, I'm <span style={{ color: C.gold }}>Dzifa</span>
              </h1>

              <p style={{ ...T.mono, color: C.faint, letterSpacing: '0.14em', margin: '0 0 1.5rem' }}>
                Developer · Game Creator · World Builder
              </p>

              <p style={{ ...T.body, color: C.muted, maxWidth: 540, margin: '0 0 1rem' }}>
                I build GeminiDzi: a living digital universe that blends Afrofuturism, game development, AI, and design into one immersive experience. Eight districts, each with its own personality.
              </p>
              <p style={{ ...T.body, color: C.muted, maxWidth: 540, margin: '0 0 2rem' }}>
                Currently levelling up across React, full-stack development, and AI integration. The mission is to build technology that celebrates African culture and tells our stories in new ways.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Hire me',      href: 'mailto:matrevidzifa@gmail.com', primary: true },
                  { label: 'Get in touch', href: '#contact',                      primary: false },
                ].map(({ label, href, primary }) => (
                  <a key={label} href={href}
                    style={{
                      ...T.tiny,
                      padding: '0.75rem 1.6rem',
                      background: primary ? C.goldFaint : 'transparent',
                      border: `1px solid ${primary ? C.border : C.borderSub}`,
                      borderRadius: R.md,
                      color: primary ? C.gold : C.muted,
                      textDecoration: 'none',
                      transition: `all 0.2s ${EASE}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = C.goldBright; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.border }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = primary ? C.goldFaint : 'transparent'; e.currentTarget.style.color = primary ? C.gold : C.muted; e.currentTarget.style.borderColor = primary ? C.border : C.borderSub }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── STATS ── */}
      <section style={{ ...wrap, padding: '4rem 2rem' }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: C.borderSub, border: `1px solid ${C.borderSub}`, borderRadius: R.lg, overflow: 'hidden' }}>
            <StatCard value="31" label="Projects Planned"  color={C.gold}   />
            <StatCard value="16" label="Games in Universe" color={C.rose}   />
            <StatCard value="11" label="Apps and Tools"    color={C.purple} />
            <StatCard value="8"  suffix="" label="Districts Built" color={C.green}  />
          </div>
        </FadeIn>
      </section>

      <Divider />

      {/* ── SKILLS ── */}
      <section style={wrap} id="skills">
        <SectionHeading eyebrow="What I Know" title="Skills and Tools" color={C.gold} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
          <FadeIn delay={0.05}>
            <div>
              <div style={{ ...T.tiny, color: C.faint, marginBottom: '1.2rem' }}>Development</div>
              <SkillBar name="React / JavaScript" level={72} color={C.gold}   delay={1} />
              <SkillBar name="HTML and CSS"        level={85} color={C.rose}   delay={2} />
              <SkillBar name="Python"              level={60} color={C.purple} delay={3} />
              <SkillBar name="Node.js / Express"   level={50} color={C.green}  delay={4} />
              <SkillBar name="MongoDB"             level={45} color={C.teal}   delay={5} />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div>
              <div style={{ ...T.tiny, color: C.faint, marginBottom: '1.2rem' }}>Creative and Tools</div>
              <SkillBar name="UI / UX Design"  level={75} color={C.rose}   delay={1} />
              <SkillBar name="Figma"           level={68} color={C.amber}  delay={2} />
              <SkillBar name="Game Dev"        level={40} color={C.gold}   delay={3} />
              <SkillBar name="AI Integration"  level={45} color={C.purple} delay={4} />
              <SkillBar name="Three.js / 3D"   level={35} color={C.teal}   delay={5} />
            </div>
          </FadeIn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          <SkillGroup delay={0}    title="Frontend"     color={C.gold}   skills={['React', 'Vite', 'JavaScript', 'HTML5', 'CSS3', 'Three.js']} />
          <SkillGroup delay={0.06} title="Backend"      color={C.green}  skills={['Node.js', 'Express', 'MongoDB', 'Firebase', 'REST APIs']} />
          <SkillGroup delay={0.12} title="Game Dev"     color={C.rose}   skills={['Unity', 'Canvas API', "Ren'Py", 'Matter.js', 'Phaser.js']} />
          <SkillGroup delay={0.18} title="AI and Data"  color={C.purple} skills={['Claude API', 'TensorFlow.js', 'Python', 'D3.js']} />
          <SkillGroup delay={0.24} title="Design"       color={C.amber}  skills={['Figma', 'UI/UX', 'Afrofuturism', 'Typography']} />
          <SkillGroup delay={0.30} title="Deploy"       color={C.teal}   skills={['Git', 'GitHub', 'Vercel', 'npm', 'Postman']} />
        </div>
      </section>

      <Divider />

      {/* ── JOURNEY ── */}
      <section style={wrap} id="journey">
        <SectionHeading eyebrow="My Path" title="The Journey" color={C.amber} />
        <div style={{ maxWidth: 560 }}>
          {[
            { year: 'Beginning', title: 'Discovered Code',             color: C.gold,   desc: 'Started with HTML and CSS. Saw something appear on a screen for the first time and never looked back.' },
            { year: 'Learning',  title: 'Levelled Up with React',       color: C.rose,   desc: 'Dived into React and JavaScript. Started building real projects and understanding how the web works under the hood.' },
            { year: 'Expanding', title: 'Full Stack and Beyond',        color: C.purple, desc: 'Began exploring backend development with Node.js, databases, game development, and AI integration.' },
            { year: 'Now',       title: 'Building GeminiDzi',           color: C.green,  desc: 'Creating a full creative universe of games, tools, and an Afrofuturist portfolio. Applying for roles from May 2025.' },
            { year: 'Next',      title: 'The Universe Expands',         color: C.gold,   desc: 'More games. More tools. More AI. More impact. GeminiDzi is just getting started.', isLast: true },
          ].map((item, i) => (
            <FadeIn key={item.year} delay={i * 0.08}>
              <TimelineItem {...item} />
            </FadeIn>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── CONTACT ── */}
      <section style={wrap} id="contact">
        <SectionHeading eyebrow="Let's Connect" title="Get In Touch" color={C.rose} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>

          <FadeIn delay={0.05}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <p style={{ ...T.body, color: C.muted, margin: 0 }}>
                Open to job opportunities, project collaborations, and interesting conversations.
              </p>

              {[
                { label: 'Email',    value: 'matrevidzifa@gmail.com',  href: 'mailto:matrevidzifa@gmail.com', color: C.gold  },
                { label: 'Location', value: 'Available Worldwide',     href: null,                            color: C.faint },
                { label: 'Status',   value: 'Open to Opportunities',   href: null,                            color: C.green },
              ].map(({ label, value, href, color }) => (
                <div key={label} style={{ padding: '0.9rem 1.2rem', background: C.surface, border: `1px solid ${C.borderSub}`, borderRadius: R.md }}>
                  <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.2rem' }}>{label}</div>
                  {href
                    ? <a href={href} style={{ ...T.small, color, textDecoration: 'none' }}>{value}</a>
                    : <span style={{ ...T.small, color }}>{value}</span>
                  }
                </div>
              ))}

              <div>
                <div style={{ ...T.tiny, color: C.faint, marginBottom: '0.6rem' }}>Online</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { label: 'GitHub',   href: 'https://github.com'   },
                    { label: 'LinkedIn', href: 'https://linkedin.com' },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      style={{ ...T.tiny, padding: '0.5rem 1rem', background: C.surface, border: `1px solid ${C.borderSub}`, borderRadius: R.md, color: C.muted, textDecoration: 'none', transition: `all 0.18s ease` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.gold }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSub; e.currentTarget.style.color = C.muted }}
                    >{label}</a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div style={{ padding: '2rem', background: C.surface, border: `1px solid ${C.borderSub}`, borderRadius: R.lg }}>
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.borderSub}`, padding: '2.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.25em', color: C.faint, margin: 0 }}>
          GeminiDzi &nbsp;·&nbsp; Built by Dzifa &nbsp;·&nbsp; {new Date().getFullYear()}
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(212,175,55,0.2); color: #F0EAE0; }

        @keyframes worldSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (max-width: 720px) {
          .world-hero    { grid-template-columns: 1fr !important; text-align: center; }
          .world-skills  { grid-template-columns: 1fr !important; }
          .world-contact { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}