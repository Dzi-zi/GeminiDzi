import { useState, useRef } from 'react'

// ── Person colours — warm, distinct, works for anyone ─────────────────────────
const PALETTE = [
  { bg: '#FFF0F3', border: '#E8758A', text: '#C0415A', dot: '#E8758A' },
  { bg: '#FFF6EC', border: '#E8A056', text: '#C07030', dot: '#E8A056' },
  { bg: '#F0F7FF', border: '#6EA8D8', text: '#3A78A8', dot: '#6EA8D8' },
  { bg: '#F2F0FF', border: '#8B7ED8', text: '#5A4EA8', dot: '#8B7ED8' },
  { bg: '#F0FFF5', border: '#5EC488', text: '#2A8A58', dot: '#5EC488' },
  { bg: '#FFF8F0', border: '#D8A86E', text: '#A87838', dot: '#D8A86E' },
  { bg: '#FFF0FB', border: '#D878C8', text: '#A84898', dot: '#D878C8' },
  { bg: '#F0FFFE', border: '#5EC8C0', text: '#2A9890', dot: '#5EC8C0' },
]

const gc = (i) => PALETTE[i % PALETTE.length]
const initials = (name) => name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

// ── Small reusable components ─────────────────────────────────────────────────
function Avatar({ name, index, size = 38 }) {
  const c = gc(index)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, border: `2.5px solid ${c.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', fontSize: size * 0.32, fontWeight: 700,
      color: c.text, flexShrink: 0, userSelect: 'none',
      boxShadow: `0 2px 8px ${c.border}30`,
    }}>
      {initials(name)}
    </div>
  )
}

function Tag({ children, color = '#E8758A' }) {
  return (
    <span style={{
      fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
      fontWeight: 700, letterSpacing: '0.12em',
      color, background: color + '18',
      border: `1px solid ${color}40`,
      padding: '0.18rem 0.55rem', borderRadius: '20px',
    }}>{children}</span>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #F0C8D0, transparent)', margin: '0.2rem 0' }} />
}

function Input({ label, value, onChange, placeholder, type = 'text', prefix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && (
        <label style={{
          display: 'block', fontFamily: '"Courier New", monospace',
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
          color: '#B08090', marginBottom: '0.35rem',
        }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        background: '#fff',
        border: `2px solid ${focused ? '#E8758A' : '#F0D8DF'}`,
        borderRadius: '10px', overflow: 'hidden',
        boxShadow: focused ? '0 0 0 3px rgba(232,117,138,0.12)' : 'none',
        transition: 'all 0.15s',
      }}>
        {prefix && (
          <span style={{
            padding: '0 0.8rem',
            fontFamily: 'Georgia, serif', fontSize: '0.9rem',
            color: '#C0A0A8', borderRight: '2px solid #F0D8DF',
            display: 'flex', alignItems: 'center', background: '#FFF8FA',
          }}>{prefix}</span>
        )}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '0.72rem 0.9rem', border: 'none', outline: 'none',
            fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#2A1520',
            background: 'transparent',
          }}
        />
      </div>
    </div>
  )
}

function Button({ children, onClick, variant = 'primary', small, disabled }) {
  const [hov, setHov] = useState(false)
  const base = {
    primary: {
      bg: hov ? '#C85A72' : '#E8758A',
      color: '#fff',
      border: '2px solid ' + (hov ? '#C85A72' : '#E8758A'),
      shadow: '0 2px 0px #C04060',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    secondary: {
      bg: '#fff',
      color: hov ? '#E8758A' : '#A08090',
      border: '2px solid ' + (hov ? '#E8758A' : '#F0D0D8'),
      shadow: 'none',
      transform: 'none',
    },
    ghost: {
      bg: 'transparent',
      color: hov ? '#E8758A' : '#B09098',
      border: '2px solid transparent',
      shadow: 'none',
      transform: 'none',
    },
    danger: {
      bg: hov ? '#FFF0F2' : '#fff',
      color: '#E05060',
      border: '2px solid ' + (hov ? '#F0B0B8' : '#F5CACE'),
      shadow: 'none',
      transform: 'none',
    },
  }[variant]
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: small ? '0.36rem 0.85rem' : '0.62rem 1.4rem',
        borderRadius: '8px',
        fontFamily: 'Georgia, serif',
        fontSize: small ? '0.75rem' : '0.9rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: 'all 0.13s',
        background: base.bg,
        color: base.color,
        border: base.border,
        boxShadow: base.shadow,
        transform: disabled ? 'none' : base.transform,
        letterSpacing: '0.01em',
      }}
    >{children}</button>
  )
}

// ── Settle-up math ────────────────────────────────────────────────────────────
function settle(people, bills) {
  const bal = {}
  people.forEach(p => bal[p.id] = 0)
  bills.forEach(b => {
    const amt = parseFloat(b.amount) || 0
    if (amt <= 0) return
    if (b.paidBy && bal[b.paidBy] !== undefined) bal[b.paidBy] += amt
    const who = b.splitBetween.length ? b.splitBetween : people.map(p => p.id)
    if (b.splitType === 'equal') {
      who.forEach(id => { if (bal[id] !== undefined) bal[id] -= amt / who.length })
    } else {
      who.forEach(id => { if (bal[id] !== undefined) bal[id] -= amt * (parseFloat(b.percentages?.[id]) || 0) / 100 })
    }
  })
  const pos = [], neg = []
  Object.entries(bal).forEach(([id, v]) => {
    if (v > 0.005) pos.push({ id, v })
    else if (v < -0.005) neg.push({ id, v: -v })
  })
  const txns = []
  const p2 = pos.map(x => ({ ...x })), n2 = neg.map(x => ({ ...x }))
  let pi = 0, ni = 0
  while (pi < p2.length && ni < n2.length) {
    const pay = Math.min(p2[pi].v, n2[ni].v)
    txns.push({ from: n2[ni].id, to: p2[pi].id, amount: pay })
    p2[pi].v -= pay; n2[ni].v -= pay
    if (p2[pi].v < 0.005) pi++
    if (n2[ni].v < 0.005) ni++
  }
  return { bal, txns }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SplitEase() {
  const [people, setPeople]     = useState([])
  const [bills, setBills]       = useState([])
  const [tab, setTab]           = useState('people')
  const [newName, setNewName]   = useState('')
  const [copied, setCopied]     = useState(false)

  // bill form
  const [bName, setBName]       = useState('')
  const [bAmt, setBAmt]         = useState('')
  const [bPaid, setBPaid]       = useState('')
  const [bType, setBType]       = useState('equal')
  const [bWho, setBWho]         = useState([])
  const [bPct, setBPct]         = useState({})
  const [bErr, setBErr]         = useState('')

  const getName = id => people.find(p => p.id === id)?.name || '?'
  const getIdx  = id => people.findIndex(p => p.id === id)
  const total   = bills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0)
  const { bal, txns } = settle(people, bills)

  const addPerson = () => {
    const n = newName.trim()
    if (!n || people.find(p => p.name.toLowerCase() === n.toLowerCase())) return
    setPeople(prev => [...prev, { id: Date.now().toString(), name: n }])
    setNewName('')
  }

  const removePerson = id => {
    setPeople(prev => prev.filter(p => p.id !== id))
    setBills(prev => prev.map(b => ({
      ...b,
      splitBetween: b.splitBetween.filter(x => x !== id),
      paidBy: b.paidBy === id ? '' : b.paidBy,
    })))
  }

  const toggleWho = id => setBWho(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const addBill = () => {
    setBErr('')
    if (!bName.trim()) return setBErr('What was this bill for?')
    if (!parseFloat(bAmt) || parseFloat(bAmt) <= 0) return setBErr('Enter a valid amount.')
    if (!bPaid) return setBErr('Who paid for this?')
    const who = bWho.length ? bWho : people.map(p => p.id)
    if (bType === 'percentage') {
      const sum = who.reduce((s, id) => s + (parseFloat(bPct[id]) || 0), 0)
      if (Math.abs(sum - 100) > 0.5) return setBErr(`Percentages add up to ${sum.toFixed(0)}% — needs to be 100%.`)
    }
    setBills(prev => [...prev, { id: Date.now().toString(), name: bName.trim(), amount: parseFloat(bAmt), paidBy: bPaid, splitType: bType, splitBetween: who, percentages: { ...bPct } }])
    setBName(''); setBAmt(''); setBPaid(''); setBType('equal'); setBWho([]); setBPct({})
  }

  const copyText = () => {
    let t = `✨ SplitEase Summary\n\nTotal: $${total.toFixed(2)}\nPeople: ${people.map(p => p.name).join(', ')}\n\nBills:\n`
    bills.forEach(b => { t += `  • ${b.name} — $${parseFloat(b.amount).toFixed(2)} (${getName(b.paidBy)} paid)\n` })
    t += txns.length ? `\nSettlements:\n` + txns.map(s => `  ${getName(s.from)} → ${getName(s.to)}: $${s.amount.toFixed(2)}`).join('\n') : '\n✓ All settled up!'
    navigator.clipboard.writeText(t)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  // ── Tab pill style ──
  const pill = (t) => ({
    padding: '0.5rem 1.1rem', borderRadius: '20px', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700,
    border: 'none', transition: 'all 0.15s',
    background: tab === t ? '#E8758A' : 'transparent',
    color: tab === t ? '#fff' : '#C0A0A8',
    boxShadow: tab === t ? '0 3px 12px rgba(232,117,138,0.35)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #FFF5F7 0%, #FFF8FA 60%, #FFF2F5 100%)', paddingTop: '80px' }}>

      {/* ── Decorative blobs ── */}
      <div style={{ position: 'fixed', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,117,138,0.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,168,110,0.1), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#E8758A' }} />
            <span style={{
              fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
              fontWeight: 700, letterSpacing: '0.18em',
              color: '#E8758A',
            }}>the lab</span>
          </div>

          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2.4rem, 7vw, 4rem)',
            fontWeight: 700, color: '#2A1520',
            margin: '0 0 0.3rem', lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}>SplitEase 🌸</h1>

          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', color: '#C0A0A8', letterSpacing: '0.04em' }}>
            split bills with your people — fair, simple, no drama
          </p>
        </div>

        {/* ── Stats bar (shown once there's data) ── */}
        {(people.length > 0 || bills.length > 0) && (
          <div style={{
            display: 'flex', gap: '0', marginBottom: '1.8rem',
            background: '#fff', border: '2px solid #F0D8DF',
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(232,117,138,0.08)',
          }}>
            {[
              { icon: '👥', label: 'people', value: people.length },
              { icon: '🧾', label: 'bills',  value: bills.length },
              { icon: '💰', label: 'total',  value: `$${total.toFixed(2)}` },
              { icon: '✅', label: 'to settle', value: txns.length },
            ].map(({ icon, label, value }, i, arr) => (
              <div key={label} style={{
                flex: 1, padding: '1rem 0.5rem', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '2px solid #F0D8DF' : 'none',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#2A1520' }}>{value}</div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#C0A0A8', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab nav ── */}
        <div style={{
          display: 'flex', gap: '0',
          borderBottom: '2px solid #F0D8DF',
          marginBottom: '2rem',
        }}>
          {[
            { key: 'people',  label: '01  people',  locked: false },
            { key: 'bills',   label: '02  bills',   locked: people.length < 2 },
            { key: 'results', label: '03  results', locked: bills.length === 0 },
          ].map(({ key, label, locked }) => (
            <button key={key}
              onClick={() => !locked && setTab(key)}
              style={{
                padding: '0.7rem 1.4rem',
                fontFamily: 'Georgia, serif',
                fontSize: '0.85rem', fontWeight: tab === key ? 700 : 400,
                border: 'none', background: 'none',
                borderBottom: tab === key ? '3px solid #E8758A' : '3px solid transparent',
                marginBottom: '-2px',
                color: tab === key ? '#2A1520' : locked ? '#D8C0C8' : '#A08090',
                cursor: locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >{label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB: PEOPLE
        ══════════════════════════════════════════════════════════ */}
        {tab === 'people' && (
          <div style={{ animation: 'fadeUp 0.28s ease' }}>
            <div style={{
              background: '#fff', border: '2px solid #F0D8DF',
              borderRadius: '16px', padding: '1.8rem',
              boxShadow: '0 4px 24px rgba(232,117,138,0.07)',
              marginBottom: '1.2rem',
            }}>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: '#C0A0A8', margin: '0 0 1rem' }}>
                WHO'S IN THE GROUP? ✨
              </p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div style={{ flex: 1 }}>
                  <Input value={newName} onChange={setNewName} placeholder="type a name..." />
                </div>
                <Button onClick={addPerson} disabled={!newName.trim()}>+ add</Button>
              </div>
              {newName.trim() && (
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: '#C0A0A8', marginTop: '0.5rem' }}>
                  press Enter or click add ↑
                </p>
              )}
            </div>

            {people.length === 0 ? (
              <div style={{
                padding: '3.5rem 2rem', textAlign: 'center',
                border: '2px dashed #F0C8D0', borderRadius: '16px',
                background: '#FFF8FA',
              }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '0.7rem' }}>🌸</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#C09090', margin: 0 }}>
                  add 2+ people to start splitting
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {people.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.9rem',
                    padding: '0.85rem 1.1rem',
                    background: '#fff', border: '2px solid #F0D8DF',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(232,117,138,0.05)',
                    animation: 'fadeUp 0.22s ease',
                  }}>
                    <Avatar name={p.name} index={i} />
                    <span style={{ flex: 1, fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#2A1520' }}>
                      {p.name}
                    </span>
                    <Tag color={gc(i).text}>{gc(i).text === '#C0415A' ? 'host' : 'guest'}</Tag>
                    <button onClick={() => removePerson(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DDB0B8', fontSize: '1rem', transition: 'color 0.13s', padding: '0.2rem' }}
                      onMouseEnter={e => e.target.style.color = '#E05070'}
                      onMouseLeave={e => e.target.style.color = '#DDB0B8'}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {people.length >= 2 && (
              <Button onClick={() => setTab('bills')}>continue to bills →</Button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: BILLS
        ══════════════════════════════════════════════════════════ */}
        {tab === 'bills' && (
          <div style={{ animation: 'fadeUp 0.28s ease' }}>

            {/* Add bill card */}
            <div style={{
              background: '#fff', border: '2px solid #F0D8DF',
              borderRadius: '16px', padding: '1.8rem',
              boxShadow: '0 4px 24px rgba(232,117,138,0.07)',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: '#C0A0A8', margin: '0 0 1.2rem' }}>
                ADD A BILL 🧾
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <Input label="what was it for?" value={bName} onChange={setBName} placeholder="dinner, uber, groceries..." />
                <Input label="how much?" value={bAmt} onChange={setBAmt} placeholder="0.00" type="number" prefix="$" />
              </div>

              {/* Who paid */}
              <div style={{ marginBottom: '1.2rem' }}>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C0A0A8', margin: '0 0 0.6rem' }}>WHO PAID?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {people.map((p, i) => (
                    <button key={p.id} onClick={() => setBPaid(p.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.45rem 1rem',
                      background: bPaid === p.id ? gc(i).bg : '#fff',
                      border: `2px solid ${bPaid === p.id ? gc(i).border : '#F0D0D8'}`,
                      borderRadius: '8px', cursor: 'pointer',
                      fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: bPaid === p.id ? 700 : 400,
                      color: bPaid === p.id ? gc(i).text : '#B09098',
                      transition: 'all 0.13s',
                      textDecoration: bPaid === p.id ? 'none' : 'none',
                      boxShadow: bPaid === p.id ? `0 2px 0px ${gc(i).border}` : 'none',
                    }}>
                      {bPaid === p.id && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split type */}
              <div style={{ marginBottom: '1.2rem' }}>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C0A0A8', margin: '0 0 0.6rem' }}>HOW TO SPLIT?</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {[['equal', '÷  split equally'], ['percentage', '%  custom split']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setBType(val)} style={{
                      padding: '0.5rem 1.1rem', cursor: 'pointer',
                      fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                      fontWeight: bType === val ? 700 : 400,
                      border: '2px solid',
                      borderRadius: '8px',
                      transition: 'all 0.13s',
                      background: bType === val ? '#2A1520' : '#fff',
                      borderColor: bType === val ? '#2A1520' : '#F0D0D8',
                      color: bType === val ? '#fff' : '#B09098',
                      boxShadow: bType === val ? '0 2px 0px #0A0008' : 'none',
                    }}>{lbl}</button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {people.map((p, i) => {
                    const on = bWho.length === 0 || bWho.includes(p.id)
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button onClick={() => toggleWho(p.id)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.38rem 0.8rem',
                          background: on ? gc(i).bg : '#FFF8FA',
                          border: `2px solid ${on ? gc(i).border : '#F0D8DF'}`,
                          borderRadius: '20px', cursor: 'pointer',
                          fontFamily: 'Georgia, serif', fontSize: '0.78rem', fontWeight: 700,
                          color: on ? gc(i).text : '#D0B0B8', transition: 'all 0.13s',
                        }}>
                          {on ? '✓' : '○'} {p.name}
                        </button>
                        {bType === 'percentage' && on && (
                          <input type="number" value={bPct[p.id] || ''} onChange={e => setBPct(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="%"
                            style={{
                              width: '50px', padding: '0.35rem 0.45rem',
                              border: '2px solid #F0D8DF', borderRadius: '8px',
                              fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#2A1520',
                              background: '#fff', outline: 'none',
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {bErr && (
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#E05070', margin: '0 0 0.8rem', letterSpacing: '0.02em' }}>
                  ⚠ {bErr}
                </p>
              )}
              <Button onClick={addBill} disabled={!bName.trim() || !bAmt || !bPaid}>
                + add this bill
              </Button>
            </div>

            {/* Bills list */}
            {bills.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                  <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C0A0A8', margin: 0 }}>
                    BILLS SO FAR
                  </p>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, color: '#2A1520' }}>
                    ${total.toFixed(2)} total
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {bills.map(b => (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.9rem',
                      padding: '0.9rem 1.1rem',
                      background: '#fff', border: '2px solid #F0D8DF', borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(232,117,138,0.05)',
                    }}>
                      <Avatar name={getName(b.paidBy)} index={getIdx(b.paidBy)} size={34} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#2A1520' }}>{b.name}</div>
                        <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#C0A0A8', marginTop: '0.1rem' }}>
                          paid by {getName(b.paidBy)} · {b.splitType === 'equal' ? `÷ ${b.splitBetween.length} people` : '% custom split'}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: '#2A1520' }}>
                        ${parseFloat(b.amount).toFixed(2)}
                      </span>
                      <button onClick={() => setBills(prev => prev.filter(x => x.id !== b.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DDB0B8', fontSize: '0.9rem', transition: 'color 0.13s' }}
                        onMouseEnter={e => e.target.style.color = '#E05070'}
                        onMouseLeave={e => e.target.style.color = '#DDB0B8'}>✕</button>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setTab('results')}>see who owes what 🌸</Button>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: RESULTS
        ══════════════════════════════════════════════════════════ */}
        {tab === 'results' && (
          <div style={{ animation: 'fadeUp 0.28s ease' }}>

            {/* Balances */}
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C0A0A8', margin: '0 0 0.8rem' }}>
              EVERYONE'S BALANCE
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.7rem', marginBottom: '2rem' }}>
              {people.map((p, i) => {
                const b = bal[p.id] || 0
                const pos = b > 0.005, neg = b < -0.005
                return (
                  <div key={p.id} style={{
                    padding: '1.1rem',
                    background: '#fff',
                    border: `2px solid ${pos ? '#86C896' : neg ? '#F0A0A8' : '#F0D8DF'}`,
                    borderRadius: '14px',
                    boxShadow: '0 2px 12px rgba(232,117,138,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
                      <Avatar name={p.name} index={i} size={30} />
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: '#2A1520' }}>{p.name}</span>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: pos ? '#3A9050' : neg ? '#D04060' : '#C0A0A8' }}>
                      {pos ? '+' : ''}{b.toFixed(2)}
                    </div>
                    <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: pos ? '#3A9050' : neg ? '#D04060' : '#C0A0A8', marginTop: '0.15rem', letterSpacing: '0.06em' }}>
                      {pos ? 'gets back' : neg ? 'owes' : 'all even ✓'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Settlements */}
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C0A0A8', margin: '0 0 0.8rem' }}>
              HOW TO SETTLE UP
            </p>

            {txns.length === 0 ? (
              <div style={{
                padding: '3rem', textAlign: 'center',
                background: '#F0FFF5', border: '2px solid #A8E0B8', borderRadius: '16px',
                marginBottom: '2rem',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🎉</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, color: '#2A8050', margin: '0 0 0.2rem' }}>
                  you're all settled up!
                </p>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#60A880', margin: 0 }}>
                  no payments needed
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '2rem' }}>
                {txns.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '1rem 1.2rem',
                    background: '#fff', border: '2px solid #F0D8DF', borderRadius: '14px',
                    boxShadow: '0 2px 10px rgba(232,117,138,0.06)',
                  }}>
                    <Avatar name={getName(s.from)} index={getIdx(s.from)} size={34} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700, color: '#2A1520' }}>{getName(s.from)}</span>
                      <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#C0A0A8', margin: '0 0.5rem' }}>sends to</span>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.92rem', fontWeight: 700, color: '#2A1520' }}>{getName(s.to)}</span>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: 700, color: '#E8758A' }}>
                      ${s.amount.toFixed(2)}
                    </div>
                    <Avatar name={getName(s.to)} index={getIdx(s.to)} size={34} />
                  </div>
                ))}
              </div>
            )}

            {/* Receipt card */}
            <div style={{
              background: '#fff', border: '2px dashed #F0C8D0',
              borderRadius: '16px', padding: '1.8rem',
              marginBottom: '1.5rem',
              position: 'relative',
            }}>
              {/* Tape decoration */}
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '20px',
                background: 'rgba(232,117,138,0.2)',
                border: '1px solid rgba(232,117,138,0.3)',
                borderRadius: '3px',
              }} />

              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.2em', color: '#2A1520' }}>SPLITEASE ✨</div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#C0A0A8', marginTop: '0.2rem' }}>your bill summary</div>
              </div>

              <Divider />

              <div style={{ margin: '0.9rem 0', fontFamily: '"Courier New", monospace', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#C0A0A8' }}>
                  <span>group</span><span style={{ color: '#2A1520', fontWeight: 700 }}>{people.map(p => p.name).join(', ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C0A0A8' }}>
                  <span>total</span><span style={{ color: '#E8758A', fontWeight: 700, fontFamily: 'Georgia, serif', fontSize: '0.95rem' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <Divider />

              <div style={{ margin: '0.9rem 0' }}>
                {bills.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', marginBottom: '0.3rem', color: '#2A1520' }}>
                    <span>{b.name} <span style={{ color: '#C0A0A8' }}>({getName(b.paidBy)})</span></span>
                    <span>${parseFloat(b.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Divider />

              <div style={{ margin: '0.9rem 0 0', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                {txns.length === 0 ? (
                  <div style={{ color: '#3A9050', fontWeight: 700 }}>✓ all settled up!</div>
                ) : txns.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#2A1520', marginBottom: '0.3rem' }}>
                    <span>{getName(s.from)} → {getName(s.to)}</span>
                    <span style={{ fontWeight: 700 }}>${s.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              <Button onClick={copyText}>{copied ? '✓ copied to clipboard!' : '⎘ copy & share'}</Button>
              <Button variant="secondary" onClick={() => { setPeople([]); setBills([]); setTab('people') }}>
                start over
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #D0B8C0; }
      `}</style>
    </div>
  )
}