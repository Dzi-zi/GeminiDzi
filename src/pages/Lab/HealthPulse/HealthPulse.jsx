import { useState, useEffect, useRef } from 'react'

// ── Colours ───────────────────────────────────────────────────────────────────
const COLORS = {
  workout: { accent: '#FF6B35', bg: 'rgba(255,107,53,0.1)',  border: 'rgba(255,107,53,0.25)' },
  meal:    { accent: '#4ECDC4', bg: 'rgba(78,205,196,0.1)',  border: 'rgba(78,205,196,0.25)' },
  sleep:   { accent: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  ai:      { accent: '#F9CA24', bg: 'rgba(249,202,36,0.08)', border: 'rgba(249,202,36,0.2)'  },
}

const TODAY = new Date().toISOString().split('T')[0]

// ── Local storage helpers ─────────────────────────────────────────────────────
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def } catch { return def } }
const save = (key, val)  => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ── Tiny reusable components ──────────────────────────────────────────────────
function SectionTag({ children, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
      <div style={{ width: '24px', height: '2px', background: color }} />
      <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', color }}>{children}</span>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.9rem 0.5rem', background: 'rgba(255,255,255,0.04)', border: `2px solid ${color}30`, borderRadius: '12px' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: '0.15rem' }}>{label}</div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text', color }) {
  const [foc, setFoc] = useState(false)
  return (
    <div>
      {label && <label style={{ display: 'block', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{
          width: '100%', padding: '0.65rem 0.85rem', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.06)', border: `2px solid ${foc ? color : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '8px', outline: 'none', color: '#F0EDE8',
          fontFamily: 'Georgia, serif', fontSize: '0.9rem',
          transition: 'border-color 0.15s',
          boxShadow: foc ? `0 0 0 3px ${color}20` : 'none',
        }}
      />
    </div>
  )
}

function Btn({ children, onClick, color, outline, small, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: small ? '0.38rem 0.85rem' : '0.65rem 1.3rem',
        background: outline ? (hov ? color + '22' : 'transparent') : (hov ? color + 'CC' : color),
        border: `2px solid ${color}`,
        borderRadius: '8px', color: outline ? color : '#0A0A0F',
        fontFamily: 'Georgia, serif', fontSize: small ? '0.75rem' : '0.88rem',
        fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.13s',
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: !outline && !disabled ? `0 2px 0px ${color}66` : 'none',
        whiteSpace: 'nowrap',
      }}>{children}</button>
  )
}

function Select({ label, value, onChange, options, color }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '0.65rem 0.85rem',
          background: 'rgba(255,255,255,0.06)', border: `2px solid rgba(255,255,255,0.1)`,
          borderRadius: '8px', color: '#F0EDE8',
          fontFamily: 'Georgia, serif', fontSize: '0.88rem',
          outline: 'none', cursor: 'pointer',
        }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1A1A2E' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, color, label, unit = '' }) {
  if (!data || data.length === 0) return null
  const max   = Math.max(...data.map(d => d.value), 1)
  const W = 340, H = 80, barW = Math.floor((W - 20) / data.length) - 4

  return (
    <div style={{ marginTop: '0.8rem' }}>
      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.4rem', letterSpacing: '0.08em' }}>{label}</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const bh = Math.max(4, (d.value / max) * H)
          const x  = 10 + i * (barW + 4)
          const y  = H - bh
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx={3} fill={color + '80'} />
              <rect x={x} y={y} width={barW} height={4} rx={2} fill={color} />
              <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Courier New">{d.label}</text>
              {d.value > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={color} fontSize={8} fontFamily="Courier New">{d.value}{unit}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Sleep quality arc ─────────────────────────────────────────────────────────
function SleepArc({ hours, quality }) {
  const pct   = Math.min(hours / 9, 1)
  const R     = 44, cx = 56, cy = 56
  const angle = pct * Math.PI
  const x     = cx + R * Math.cos(Math.PI - angle)
  const y     = cy - R * Math.sin(angle)
  const color = COLORS.sleep.accent

  return (
    <svg width="112" height="72" viewBox="0 0 112 72">
      {/* Track */}
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth={8} strokeLinecap="round" />
      {/* Fill */}
      {pct > 0 && (
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 ${pct > 0.5 ? 1 : 0} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
      )}
      {/* Text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize={18} fontWeight="bold" fontFamily="Georgia">{hours || 0}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="Courier New">hrs</text>
    </svg>
  )
}

// ── AI Insights (using Claude API) ────────────────────────────────────────────
async function fetchInsights(workouts, meals, sleepLogs) {
  const summary = {
    workouts: workouts.slice(-7).map(w => `${w.type} ${w.duration}min intensity:${w.intensity}`).join(', ') || 'none',
    meals:    meals.slice(-7).map(m => `${m.name} ~${m.calories}cal mood:${m.mood}`).join(', ') || 'none',
    sleep:    sleepLogs.slice(-7).map(s => `${s.hours}hrs quality:${s.quality}/5`).join(', ') || 'none',
  }

  const prompt = `You are a supportive personal health coach. Based on this week's health data, give 3 specific, actionable, encouraging insights. Be warm but direct. No fluff.

Workouts: ${summary.workouts}
Meals: ${summary.meals}  
Sleep: ${summary.sleep}

Format your response as exactly 3 insights, each starting with an emoji and being 1-2 sentences. No headers, no bullet points, just the 3 insights separated by newlines.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Log some data this week to get your personal insights.'
}

// ── WORKOUT SECTION ───────────────────────────────────────────────────────────
function WorkoutSection({ workouts, onAdd }) {
  const [type,      setType]      = useState('run')
  const [duration,  setDuration]  = useState('')
  const [intensity, setIntensity] = useState('medium')
  const [notes,     setNotes]     = useState('')
  const [open,      setOpen]      = useState(false)
  const c = COLORS.workout

  const recentWeek = workouts.filter(w => {
    const d = new Date(w.date)
    return (Date.now() - d) < 7 * 24 * 60 * 60 * 1000
  })

  const totalMins  = recentWeek.reduce((s, w) => s + (parseInt(w.duration) || 0), 0)
  const sessions   = recentWeek.length

  // Last 7 days bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d    = new Date(); d.setDate(d.getDate() - (6 - i))
    const key  = d.toISOString().split('T')[0]
    const mins = workouts.filter(w => w.date === key).reduce((s, w) => s + (parseInt(w.duration) || 0), 0)
    return { label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], value: mins }
  })

  const submit = () => {
    if (!duration) return
    onAdd({ id: Date.now(), date: TODAY, type, duration: parseInt(duration), intensity, notes })
    setDuration(''); setNotes(''); setOpen(false)
  }

  return (
    <div style={{ background: '#12121E', border: `2px solid ${c.border}`, borderRadius: '16px', padding: '1.4rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <SectionTag color={c.accent}>WORKOUTS</SectionTag>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
            Movement Log 🔥
          </h2>
        </div>
        <Btn small color={c.accent} onClick={() => setOpen(!open)}>{open ? 'cancel' : '+ log workout'}</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
        <StatPill label="sessions" value={sessions} color={c.accent} />
        <StatPill label="minutes" value={totalMins} color={c.accent} />
        <StatPill label="this week" value={sessions > 0 ? '💪' : '—'} color={c.accent} />
      </div>

      <BarChart data={last7} color={c.accent} label="MINUTES PER DAY — LAST 7 DAYS" unit="" />

      {/* Log form */}
      {open && (
        <div style={{ marginTop: '1.2rem', padding: '1.2rem', background: c.bg, border: `2px solid ${c.border}`, borderRadius: '12px', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' }}>
            <Select label="TYPE" value={type} onChange={setType} color={c.accent} options={[
              { value: 'run',      label: '🏃 Run'      },
              { value: 'gym',      label: '💪 Gym'      },
              { value: 'swim',     label: '🏊 Swim'     },
              { value: 'cycle',    label: '🚴 Cycle'    },
              { value: 'yoga',     label: '🧘 Yoga'     },
              { value: 'walk',     label: '🚶 Walk'     },
              { value: 'sport',    label: '⚽ Sport'    },
              { value: 'other',    label: '✨ Other'    },
            ]} />
            <Input label="DURATION (MINS)" value={duration} onChange={setDuration} placeholder="45" type="number" color={c.accent} />
          </div>
          <div style={{ marginBottom: '0.7rem' }}>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 0.4rem' }}>INTENSITY</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['easy', 'medium', 'hard', 'beast'].map(lvl => (
                <button key={lvl} onClick={() => setIntensity(lvl)} style={{
                  flex: 1, padding: '0.45rem', borderRadius: '7px', cursor: 'pointer',
                  background: intensity === lvl ? c.accent : 'transparent',
                  border: `2px solid ${intensity === lvl ? c.accent : 'rgba(255,255,255,0.1)'}`,
                  color: intensity === lvl ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Georgia, serif', fontSize: '0.75rem', fontWeight: intensity === lvl ? 700 : 400,
                  transition: 'all 0.13s',
                }}>{lvl}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <Input label="NOTES (OPTIONAL)" value={notes} onChange={setNotes} placeholder="how did it feel?" color={c.accent} />
          </div>
          <Btn color={c.accent} onClick={submit} disabled={!duration}>save workout</Btn>
        </div>
      )}

      {/* Recent entries */}
      {workouts.slice(-3).reverse().map(w => (
        <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.6rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.accent, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#F0EDE8', fontWeight: 700 }}>{w.type}</span>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.5rem' }}>{w.duration}min · {w.intensity}</span>
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{w.date === TODAY ? 'today' : w.date}</span>
        </div>
      ))}
    </div>
  )
}

// ── MEAL SECTION ──────────────────────────────────────────────────────────────
function MealSection({ meals, onAdd }) {
  const [name,     setName]     = useState('')
  const [calories, setCalories] = useState('')
  const [type,     setType]     = useState('lunch')
  const [mood,     setMood]     = useState('good')
  const [open,     setOpen]     = useState(false)
  const c = COLORS.meal

  const todayMeals  = meals.filter(m => m.date === TODAY)
  const todayCals   = todayMeals.reduce((s, m) => s + (parseInt(m.calories) || 0), 0)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const cal = meals.filter(m => m.date === key).reduce((s, m) => s + (parseInt(m.calories) || 0), 0)
    return { label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], value: cal }
  })

  const submit = () => {
    if (!name) return
    onAdd({ id: Date.now(), date: TODAY, name, calories: parseInt(calories) || 0, type, mood })
    setName(''); setCalories(''); setOpen(false)
  }

  const moodEmoji = { great: '😄', good: '🙂', okay: '😐', bad: '😔' }

  return (
    <div style={{ background: '#12121E', border: `2px solid ${c.border}`, borderRadius: '16px', padding: '1.4rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <SectionTag color={c.accent}>NUTRITION</SectionTag>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
            Meal Log 🥗
          </h2>
        </div>
        <Btn small color={c.accent} onClick={() => setOpen(!open)}>{open ? 'cancel' : '+ log meal'}</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
        <StatPill label="today cal" value={todayCals || '—'} color={c.accent} />
        <StatPill label="meals today" value={todayMeals.length || '—'} color={c.accent} />
        <StatPill label="logged days" value={new Set(meals.map(m => m.date)).size} color={c.accent} />
      </div>

      <BarChart data={last7} color={c.accent} label="CALORIES PER DAY — LAST 7 DAYS" unit="" />

      {open && (
        <div style={{ marginTop: '1.2rem', padding: '1.2rem', background: c.bg, border: `2px solid ${c.border}`, borderRadius: '12px', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' }}>
            <Input label="WHAT DID YOU EAT?" value={name} onChange={setName} placeholder="jollof rice, salad..." color={c.accent} />
            <Input label="CALORIES (EST.)" value={calories} onChange={setCalories} placeholder="500" type="number" color={c.accent} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.9rem' }}>
            <Select label="MEAL TYPE" value={type} onChange={setType} color={c.accent} options={[
              { value: 'breakfast', label: '🌅 Breakfast' },
              { value: 'lunch',     label: '☀️ Lunch'     },
              { value: 'dinner',    label: '🌙 Dinner'    },
              { value: 'snack',     label: '🍎 Snack'     },
            ]} />
            <div>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 0.4rem' }}>HOW DID YOU FEEL AFTER?</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {Object.entries(moodEmoji).map(([key, emoji]) => (
                  <button key={key} onClick={() => setMood(key)} style={{
                    flex: 1, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontSize: '1.1rem',
                    background: mood === key ? c.accent + '30' : 'transparent',
                    border: `2px solid ${mood === key ? c.accent : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.13s',
                  }}>{emoji}</button>
                ))}
              </div>
            </div>
          </div>
          <Btn color={c.accent} onClick={submit} disabled={!name}>save meal</Btn>
        </div>
      )}

      {todayMeals.slice(-3).reverse().map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.6rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.accent, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#F0EDE8', fontWeight: 700 }}>{m.name}</span>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.5rem' }}>{m.type} · {m.calories}cal</span>
          </div>
          <span style={{ fontSize: '1rem' }}>{moodEmoji[m.mood]}</span>
        </div>
      ))}
    </div>
  )
}

// ── SLEEP SECTION ─────────────────────────────────────────────────────────────
function SleepSection({ sleepLogs, onAdd }) {
  const [hours,   setHours]   = useState('')
  const [quality, setQuality] = useState(3)
  const [notes,   setNotes]   = useState('')
  const [open,    setOpen]    = useState(false)
  const c = COLORS.sleep

  const last = sleepLogs[sleepLogs.length - 1]
  const avg7 = sleepLogs.slice(-7).length > 0
    ? (sleepLogs.slice(-7).reduce((s, l) => s + parseFloat(l.hours), 0) / sleepLogs.slice(-7).length).toFixed(1)
    : '—'

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const log = sleepLogs.find(l => l.date === key)
    return { label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], value: log ? parseFloat(log.hours) : 0 }
  })

  const submit = () => {
    if (!hours) return
    onAdd({ id: Date.now(), date: TODAY, hours: parseFloat(hours), quality, notes })
    setHours(''); setNotes(''); setOpen(false)
  }

  const sleepMsg = avg7 === '—' ? '' : parseFloat(avg7) >= 8 ? 'well rested 🌙' : parseFloat(avg7) >= 7 ? 'pretty good' : parseFloat(avg7) >= 6 ? 'could be better' : 'need more rest 😴'

  return (
    <div style={{ background: '#12121E', border: `2px solid ${c.border}`, borderRadius: '16px', padding: '1.4rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <SectionTag color={c.accent}>SLEEP</SectionTag>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
            Sleep Tracker 🌙
          </h2>
        </div>
        <Btn small color={c.accent} onClick={() => setOpen(!open)}>{open ? 'cancel' : '+ log sleep'}</Btn>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <SleepArc hours={last?.hours || 0} quality={last?.quality || 0} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <StatPill label="last night" value={last ? `${last.hours}h` : '—'} color={c.accent} />
            <StatPill label="7-day avg" value={avg7 !== '—' ? `${avg7}h` : '—'} color={c.accent} />
          </div>
          {sleepMsg && <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: c.accent, margin: '0.5rem 0 0', fontStyle: 'italic' }}>{sleepMsg}</p>}
        </div>
      </div>

      <BarChart data={last7} color={c.accent} label="HOURS PER NIGHT — LAST 7 DAYS" unit="h" />

      {open && (
        <div style={{ marginTop: '1.2rem', padding: '1.2rem', background: c.bg, border: `2px solid ${c.border}`, borderRadius: '12px', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ marginBottom: '0.7rem' }}>
            <Input label="HOURS SLEPT" value={hours} onChange={setHours} placeholder="7.5" type="number" color={c.accent} />
          </div>
          <div style={{ marginBottom: '0.7rem' }}>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 0.4rem' }}>QUALITY</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} onClick={() => setQuality(q)} style={{
                  flex: 1, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer',
                  background: quality >= q ? c.accent + '30' : 'transparent',
                  border: `2px solid ${quality >= q ? c.accent : 'rgba(255,255,255,0.08)'}`,
                  color: quality >= q ? c.accent : 'rgba(255,255,255,0.3)',
                  fontFamily: '"Courier New", monospace', fontSize: '0.8rem', fontWeight: 700,
                  transition: 'all 0.13s',
                }}>{q}</button>
              ))}
            </div>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '0.3rem 0 0' }}>1 = terrible · 5 = amazing</p>
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <Input label="NOTES" value={notes} onChange={setNotes} placeholder="dreams, woke up at 3am..." color={c.accent} />
          </div>
          <Btn color={c.accent} onClick={submit} disabled={!hours}>save sleep</Btn>
        </div>
      )}

      {sleepLogs.slice(-2).reverse().map(l => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.6rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.accent, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#F0EDE8', fontWeight: 700 }}>{l.hours} hours</span>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.5rem' }}>quality {l.quality}/5</span>
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{l.date === TODAY ? 'today' : l.date}</span>
        </div>
      ))}
    </div>
  )
}

// ── AI INSIGHTS SECTION ───────────────────────────────────────────────────────
function InsightsSection({ workouts, meals, sleepLogs }) {
  const [insights, setInsights] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const c = COLORS.ai

  const hasData = workouts.length > 0 || meals.length > 0 || sleepLogs.length > 0

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const text = await fetchInsights(workouts, meals, sleepLogs)
      setInsights(text)
    } catch (e) {
      setError('Could not connect. Check your API key.')
    }
    setLoading(false)
  }

  const lines = insights.split('\n').filter(l => l.trim())

  return (
    <div style={{ background: '#12121E', border: `2px solid ${c.border}`, borderRadius: '16px', padding: '1.4rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <SectionTag color={c.accent}>AI COACH</SectionTag>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
            Weekly Insights ✦
          </h2>
        </div>
        <Btn small color={c.accent} onClick={generate} disabled={loading || !hasData}>
          {loading ? 'thinking...' : insights ? 'refresh' : 'get insights'}
        </Btn>
      </div>

      {!hasData && (
        <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed rgba(249,202,36,0.2)', borderRadius: '12px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            log some workouts, meals, or sleep first to get your AI insights
          </p>
        </div>
      )}

      {error && <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#E05070', margin: 0 }}>⚠ {error}</p>}

      {loading && (
        <div style={{ display: 'flex', gap: '0.4rem', padding: '1rem 0' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.accent, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      )}

      {lines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              padding: '0.9rem 1.1rem',
              background: c.bg, border: `2px solid ${c.border}`,
              borderRadius: '10px',
              animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#F0EDE8', margin: 0, lineHeight: 1.6 }}>{line}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HealthPulse() {
  const [workouts,   setWorkouts]   = useState(() => load('hp_workouts', []))
  const [meals,      setMeals]      = useState(() => load('hp_meals', []))
  const [sleepLogs,  setSleepLogs]  = useState(() => load('hp_sleep', []))

  useEffect(() => { save('hp_workouts', workouts) }, [workouts])
  useEffect(() => { save('hp_meals', meals)       }, [meals])
  useEffect(() => { save('hp_sleep', sleepLogs)   }, [sleepLogs])

  const addWorkout = (w) => setWorkouts(prev => [...prev, w])
  const addMeal    = (m) => setMeals(prev => [...prev, m])
  const addSleep   = (s) => setSleepLogs(prev => [...prev, s])

  // Today's streak
  const streak = (() => {
    let s = 0
    for (let i = 0; i < 30; i++) {
      const d   = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const hasAny = workouts.some(w => w.date === key) || meals.some(m => m.date === key) || sleepLogs.some(l => l.date === key)
      if (hasAny) s++; else break
    }
    return s
  })()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', paddingTop: '80px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#FF6B35' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#FF6B35' }}>the lab</span>
          </div>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
            fontWeight: 700, color: '#F0EDE8',
            margin: '0 0 0.3rem', lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}>HealthPulse ❤️</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', margin: 0 }}>
              workouts · meals · sleep · AI insights
            </p>
            {streak > 0 && (
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', fontWeight: 700, color: '#FF6B35', background: 'rgba(255,107,53,0.15)', border: '2px solid rgba(255,107,53,0.3)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                🔥 {streak} day streak
              </span>
            )}
          </div>
        </div>

        <WorkoutSection  workouts={workouts}   onAdd={addWorkout} />
        <MealSection     meals={meals}         onAdd={addMeal}    />
        <SleepSection    sleepLogs={sleepLogs} onAdd={addSleep}   />
        <InsightsSection workouts={workouts} meals={meals} sleepLogs={sleepLogs} />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #12121E; }
      `}</style>
    </div>
  )
}