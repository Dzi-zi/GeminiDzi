import { useState, useEffect, useRef } from 'react'

// ── Sparkle component — scattered across the page ─────────────────────────────
function Sparkles() {
  const sparkles = [
    { top: '8%',  left: '5%',  size: 14, delay: 0 },
    { top: '15%', left: '92%', size: 10, delay: 0.4 },
    { top: '32%', left: '2%',  size: 8,  delay: 0.8 },
    { top: '45%', left: '96%', size: 12, delay: 0.2 },
    { top: '60%', left: '4%',  size: 9,  delay: 1.1 },
    { top: '72%', left: '94%', size: 11, delay: 0.6 },
    { top: '88%', left: '8%',  size: 8,  delay: 0.9 },
    { top: '22%', left: '50%', size: 7,  delay: 1.3 },
  ]
  return (
    <>
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: 'fixed', top: s.top, left: s.left,
          width: s.size, height: s.size,
          pointerEvents: 'none', zIndex: 0,
          animation: `twinkle 2.5s ease-in-out ${s.delay}s infinite`,
        }}>
          <svg viewBox="0 0 24 24" fill="#FF69B4" style={{ width: '100%', opacity: 0.5 }}>
            <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
          </svg>
        </div>
      ))}
    </>
  )
}

// ── FadeIn wrapper ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, up = true }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : up ? 'translateY(28px)' : 'translateY(0)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Tool Card ─────────────────────────────────────────────────────────────────
function ToolCard({ emoji, title, desc, tag, color, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? color + '12' : '#fff',
          border: `2px solid ${hovered ? color : '#FFB6C1'}`,
          borderRadius: '16px',
          padding: '1.6rem',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-5px) rotate(0.5deg)' : 'translateY(0) rotate(0)',
          boxShadow: hovered ? `0 12px 30px ${color}25` : '0 2px 12px rgba(255,105,180,0.08)',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{emoji}</div>
        <div style={{
          display: 'inline-block',
          background: color + '22',
          color,
          fontFamily: '"Courier New", monospace',
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          padding: '0.2rem 0.6rem',
          borderRadius: '20px',
          marginBottom: '0.6rem',
        }}>{tag}</div>
        <h3 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#2a0a1a',
          margin: '0 0 0.5rem',
        }}>{title}</h3>
        <p style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.78rem',
          color: '#8a5a6a',
          lineHeight: 1.65,
          margin: 0,
        }}>{desc}</p>
      </div>
    </FadeIn>
  )
}

// ── Designer Card ─────────────────────────────────────────────────────────────
function DesignerCard({ name, country, flag, specialty, colorway, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? colorway.bg : '#fff',
          border: `2px solid ${hovered ? colorway.accent : '#FFB6C1'}`,
          borderRadius: '14px',
          padding: '1.4rem',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? `0 10px 25px ${colorway.accent}30` : '0 2px 10px rgba(255,105,180,0.07)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>{flag}</span>
          <span style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: colorway.accent,
            background: colorway.bg,
            border: `1px solid ${colorway.accent}40`,
            padding: '0.2rem 0.5rem',
            borderRadius: '20px',
            fontWeight: 700,
          }}>{country}</span>
        </div>
        <h3 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#2a0a1a',
          margin: '0 0 0.3rem',
        }}>{name}</h3>
        <p style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.73rem',
          color: '#8a5a6a',
          margin: 0,
          lineHeight: 1.5,
        }}>{specialty}</p>
      </div>
    </FadeIn>
  )
}

// ── Lookbook item ─────────────────────────────────────────────────────────────
function LookbookItem({ title, vibe, palette, desc, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          border: `2px solid ${hovered ? '#FF69B4' : '#FFB6C1'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-5px)' : 'none',
          boxShadow: hovered ? '0 14px 35px rgba(255,105,180,0.2)' : '0 2px 12px rgba(255,105,180,0.07)',
        }}
      >
        {/* Palette strip */}
        <div style={{ display: 'flex', height: '8px' }}>
          {palette.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.62rem',
            color: '#FF69B4',
            letterSpacing: '0.12em',
            fontWeight: 700,
            margin: '0 0 0.4rem',
          }}>{vibe}</p>
          <h3 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#2a0a1a',
            margin: '0 0 0.6rem',
          }}>{title}</h3>
          <p style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.76rem',
            color: '#8a5a6a',
            lineHeight: 1.65,
            margin: 0,
          }}>{desc}</p>
        </div>
      </div>
    </FadeIn>
  )
}

// ── Beauty Tip ────────────────────────────────────────────────────────────────
function BeautyTip({ number, tip, category, delay }) {
  return (
    <FadeIn delay={delay}>
      <div style={{
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
        padding: '1.1rem 1.3rem',
        background: '#fff',
        border: '2px solid #FFB6C1',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(255,105,180,0.06)',
      }}>
        <span style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#FFB6C1',
          lineHeight: 1,
          flexShrink: 0,
          minWidth: '28px',
        }}>
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <p style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#FF69B4',
            letterSpacing: '0.1em',
            fontWeight: 700,
            margin: '0 0 0.3rem',
          }}>{category}</p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.92rem',
            color: '#2a0a1a',
            margin: 0,
            lineHeight: 1.6,
          }}>{tip}</p>
        </div>
      </div>
    </FadeIn>
  )
}

// ── Main Glam Room ────────────────────────────────────────────────────────────
export default function GlamRoom() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF5F8',
      paddingTop: '80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Sparkles />

      {/* Decorative background blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,182,193,0.25), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,105,180,0.12), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
          <FadeIn delay={0}>
            <div style={{
              display: 'inline-block',
              background: '#FF69B4',
              color: '#fff',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              padding: '0.3rem 0.9rem',
              marginBottom: '1.2rem',
              transform: 'rotate(-1deg)',
            }}>
              ✦ DISTRICT ✦
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 700,
              color: '#FF1493',
              margin: '0 0 0.3rem',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
            }}>
              The Glam Room
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.95rem',
              color: '#c06080',
              letterSpacing: '0.05em',
              marginBottom: '2rem',
            }}>
              fashion · beauty · style · African style · lookbooks
            </p>
          </FadeIn>

          {/* Intro card */}
          <FadeIn delay={0.3}>
            <div style={{
              background: '#fff',
              border: '2px solid #FFB6C1',
              borderRadius: '20px',
              padding: '2rem 2.5rem',
              maxWidth: '640px',
              boxShadow: '0 4px 20px rgba(255,105,180,0.1)',
              position: 'relative',
            }}>
              {/* Corner star */}
              <div style={{ position: 'absolute', top: '-14px', right: '2rem', fontSize: '1.8rem' }}>💖</div>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.05rem',
                color: '#2a0a1a',
                lineHeight: 1.8,
                margin: 0,
              }}>
                Welcome to the Glam Room: a space that celebrates fashion with full confidence and zero apology.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ── LOOKBOOKS ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 700,
                color: '#FF1493',
                margin: '0 0 0.3rem',
                letterSpacing: '-0.01em',
              }}>
                Lookbooks ✨
              </h2>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#c06080', margin: 0 }}>
                curated vibes for every mood and moment
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <LookbookItem
              delay={0.05}
              title="Kente & Chrome"
              vibe="AFROFUTURIST GLAM"
              palette={['#D4AF37', '#2a0a1a', '#FF69B4', '#C0C0C0', '#FF1493']}
              desc="Gold Kente patterns meet silver chrome accessories. Bold prints, structured silhouettes, and earrings that could be satellites."
            />
            <LookbookItem
              delay={0.1}
              title="Soft Life Era"
              vibe="PINK MINIMALIST"
              palette={['#FFB6C1', '#FFC0CB', '#FF69B4', '#fff', '#FFE4E1']}
              desc="All blush everything. Satin slip skirts, oversized blazers in dusty rose, pearl earrings. Quiet luxury with a pink soul."
            />
            <LookbookItem
              delay={0.15}
              title="Night Out"
              vibe="ELEVATED CASUAL"
              palette={['#800020', '#FF69B4', '#2a0a1a', '#D4AF37', '#FF1493']}
              desc="Deep wine bodycon, gold hoops, sculptural heels. The kind of look that turns every street into a runway."
            />
            <LookbookItem
              delay={0.2}
              title="Fairy Academia"
              vibe="WHIMSICAL CHIC"
              palette={['#E6E6FA', '#DDA0DD', '#FF69B4', '#98FF98', '#FFD700']}
              desc="Winx Club met Oxford and they both won. Plaid minis, butterfly clips, platform mary janes, shimmer everywhere."
            />
            <LookbookItem
              delay={0.25}
              title="Ankara Style"
              vibe="BOLD TRADITIONAL"
              palette={['#FF4500', '#228B22', '#FF69B4', '#FFD700', '#4169E1']}
              desc="Full Ankara co-ords, chunky gold jewellery, a matching gele. When you walk in, the room knows it."
            />
            <LookbookItem
              delay={0.3}
              title="Malibu Dzi"
              vibe="BEACH LUXE"
              palette={['#87CEEB', '#FF69B4', '#FFD700', '#fff', '#00CED1']}
              desc="Like Barbie beach house but make it fashion. Crochet sets, gold anklets, oversized sunnies, linen cover-ups."
            />
          </div>
        </section>

        {/* ── AFRICAN DESIGNERS ── */}
        <section style={{ background: '#fff', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <FadeIn>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                  fontWeight: 700,
                  color: '#FF1493',
                  margin: '0 0 0.3rem',
                }}>
                  African Designers to Know 🌍
                </h2>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#c06080', margin: 0 }}>
                  the continent is the fashion capital. Period
                </p>
              </div>
            </FadeIn>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'Loza Maléombho', country: 'Ivory Coast', flag: '🇨🇮', specialty: 'Bold Ankara silhouettes blending Ivorian identity with high fashion geometry.', colorway: { bg: '#FFF5E4', accent: '#FF8C00' } },
                { name: 'Kenneth Ize', country: 'Nigeria', flag: '🇳🇬', specialty: 'Handwoven aso-oke fabrics reimagined as luxury ready-to-wear. Slow fashion, fast impact.', colorway: { bg: '#F5FFF5', accent: '#228B22' } },
                { name: 'Maxhosa Africa', country: 'South Africa', flag: '🇿🇦', specialty: 'Xhosa beadwork patterns translated into stunning knitwear. Culture as couture.', colorway: { bg: '#FFF5F8', accent: '#FF1493' } },
                { name: 'Adama Paris', country: 'Senegal', flag: '🇸🇳', specialty: 'Founder of Dakar Fashion Week. Bold, Pan-African, unapologetically Black luxury.', colorway: { bg: '#F5F0FF', accent: '#8B00FF' } },
                { name: 'Thebe Magugu', country: 'South Africa', flag: '🇿🇦', specialty: 'LVMH Prize winner. Conceptual fashion rooted in South African history and feminism.', colorway: { bg: '#F0F8FF', accent: '#4169E1' } },
                { name: 'Christie Brown', country: 'Ghana', flag: '🇬🇭', specialty: 'Elegant African-print womenswear with a romantic, editorial edge. Ghana\'s fashion icon.', colorway: { bg: '#FFFAF0', accent: '#DAA520' } },
              ].map((d, i) => (
                <DesignerCard key={d.name} {...d} delay={i * 0.05} />
              ))}
            </div>
          </div>
        </section>

        {/* ── STYLE TOOLS ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 700,
                color: '#FF1493',
                margin: '0 0 0.3rem',
              }}>
                Style Tools 💅
              </h2>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#c06080', margin: 0 }}>
                tools coming to this district
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            <ToolCard delay={0.05} emoji="🎨" title="Palette Finder" tag="COMING SOON" color="#FF69B4"
              desc="Upload a fit or mood image and get an AI-generated colour palette you can actually shop." />
            <ToolCard delay={0.1} emoji="👗" title="Outfit Builder" tag="COMING SOON" color="#9B59B6"
              desc="Pick your vibe, occasion, and body type and get a curated outfit suggestion with African designer picks." />
            <ToolCard delay={0.15} emoji="💄" title="Skin Tone Match" tag="COMING SOON" color="#E91E8C"
              desc="Find the exact foundation shades, lip colours, and blush tones that work for your melanin." />
            <ToolCard delay={0.2} emoji="✨" title="Style Quiz" tag="COMING SOON" color="#FF4081"
              desc="10 questions. Discover your fashion archetype: are you Ankara Royalty, Soft Life, or Fairy Academia?" />
          </div>
        </section>

        {/* ── BEAUTY TIPS ── */}
        <section style={{ background: 'linear-gradient(135deg, #FFF0F5, #FFF5F8)', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FadeIn>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                  fontWeight: 700,
                  color: '#FF1493',
                  margin: '0 0 0.3rem',
                }}>
                  Beauty Notes 💋
                </h2>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#c06080', margin: 0 }}>
                  tips written for melanin-rich skin first
                </p>
              </div>
            </FadeIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { number: 1, category: 'SKINCARE', tip: 'Double cleanse at night — oil cleanser first to lift SPF and makeup, then your regular face wash for a truly clean base.' },
                { number: 2, category: 'MAKEUP', tip: 'For deeper skin tones, use a red or orange lip liner as a base before applying any lipstick. It makes every colour pop and last twice as long.' },
                { number: 3, category: 'HAIR', tip: 'Protective styles don\'t mean neglecting your hair. Keep your scalp moisturised with a light oil every 3–4 days even when in braids.' },
                { number: 4, category: 'GLOW', tip: 'Pat, don\'t rub your moisturiser in. Patting traps moisture in the skin instead of dragging it across the surface.' },
                { number: 5, category: 'SPF', tip: 'Yes, Black skin needs SPF. Hyperpigmentation and sun damage are real. A tinted SPF 30+ daily keeps your skin tone even.' },
                { number: 6, category: 'NAILS', tip: 'Cuticle oil every night, especially after washing hands. It\'s the difference between healthy glam nails and brittle ones.' },
              ].map((tip) => (
                <BeautyTip key={tip.number} {...tip} delay={tip.number * 0.05} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER QUOTE ── */}
        <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FadeIn>
            <p style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
              fontStyle: 'italic',
              color: '#FF69B4',
              maxWidth: '600px',
              margin: '0 auto 1rem',
              lineHeight: 1.5,
            }}>
              "Style is a way to say who you are without having to speak."
            </p>
            <p style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.72rem',
              color: '#c06080',
              letterSpacing: '0.1em',
            }}>
              — Rachel Zoe · curated by Dzi
            </p>
          </FadeIn>
        </section>

      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50%       { opacity: 0.8; transform: scale(1.3) rotate(20deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}