import { useState } from 'react'

// ── Course colour palette ─────────────────────────────────────────────────────
const COURSE_COLORS = [
  { accent: '#E8758A', bg: '#FFF0F3', border: '#F5C0CB', light: '#FFE0E8' },
  { accent: '#5B9BD5', bg: '#EFF6FF', border: '#B8D4F0', light: '#DCEEFF' },
  { accent: '#6AAF7A', bg: '#F0FAF2', border: '#B8E0C0', light: '#D8F0DC' },
  { accent: '#E8A040', bg: '#FFF8EE', border: '#F0D0A0', light: '#FFE8C0' },
  { accent: '#9B78D8', bg: '#F5F0FF', border: '#D0B8F0', light: '#E8D8FF' },
  { accent: '#D87860', bg: '#FFF3F0', border: '#F0C0B0', light: '#FFE0D8' },
]

const gc = (i) => COURSE_COLORS[i % COURSE_COLORS.length]

// ── Grade helpers ─────────────────────────────────────────────────────────────
function getLetterGrade(pct) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

function getGPA(pct) {
  if (pct >= 90) return 4.0
  if (pct >= 87) return 3.7
  if (pct >= 83) return 3.3
  if (pct >= 80) return 3.0
  if (pct >= 77) return 2.7
  if (pct >= 73) return 2.3
  if (pct >= 70) return 2.0
  if (pct >= 67) return 1.7
  if (pct >= 63) return 1.3
  if (pct >= 60) return 1.0
  return 0.0
}

function getMessage(pct) {
  if (pct >= 90) return 'outstanding — you are crushing it 🌟'
  if (pct >= 80) return 'really solid work, keep it up ✨'
  if (pct >= 70) return 'you\'re doing well, stay consistent 💪'
  if (pct >= 60) return 'passing — a little push and you\'re there 🎯'
  if (pct > 0)   return 'it\'s not over — you can turn this around 🔥'
  return 'add some grades to see how you\'re doing'
}

// Calculate weighted grade for a course
function calcCourseGrade(categories) {
  let totalWeight = 0, weightedSum = 0
  categories.forEach(cat => {
    const w = parseFloat(cat.weight) || 0
    const grades = cat.assignments
      .map(a => parseFloat(a.grade))
      .filter(g => !isNaN(g) && g >= 0)
    if (grades.length > 0 && w > 0) {
      const avg = grades.reduce((s, g) => s + g, 0) / grades.length
      weightedSum += avg * (w / 100)
      totalWeight += w
    }
  })
  if (totalWeight === 0) return null
  return (weightedSum / totalWeight) * 100
}

// What grade do I need on next assignment?
function calcNeeded(categories, targetPct, catIndex) {
  const cat = categories[catIndex]
  if (!cat) return null
  const catWeight = parseFloat(cat.weight) || 0
  if (catWeight === 0) return null

  // Sum of other categories' contributions
  let otherWeightedSum = 0, otherWeight = 0
  categories.forEach((c, i) => {
    if (i === catIndex) return
    const w = parseFloat(c.weight) || 0
    const grades = c.assignments.map(a => parseFloat(a.grade)).filter(g => !isNaN(g) && g >= 0)
    if (grades.length > 0 && w > 0) {
      otherWeightedSum += (grades.reduce((s, g) => s + g, 0) / grades.length) * (w / 100)
      otherWeight += w
    }
  })

  // Current grades in this category
  const existing = cat.assignments.map(a => parseFloat(a.grade)).filter(g => !isNaN(g) && g >= 0)
  const catAvgContrib = existing.length > 0
    ? (existing.reduce((s, g) => s + g, 0) / existing.length) * (catWeight / 100)
    : 0

  // targetPct = (otherWeightedSum + newCatContrib) / totalWeight * 100
  // solve for newCatAvg
  const totalWeight = otherWeight + catWeight
  const needed = ((targetPct / 100 * totalWeight) - otherWeightedSum) / (catWeight / 100)
  return needed
}

// ── Small components ──────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, type = 'text', small, color }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: small ? '0.32rem 0.6rem' : '0.6rem 0.8rem',
        border: `2px solid ${focused ? (color || '#8B9467') : '#E8DDD0'}`,
        borderRadius: '8px', outline: 'none',
        fontFamily: '"Courier New", monospace',
        fontSize: small ? '0.78rem' : '0.88rem',
        color: '#2A1A00', background: '#fff',
        width: '100%', boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        boxShadow: focused ? `0 0 0 3px ${(color || '#8B9467')}20` : 'none',
      }}
    />
  )
}

function Btn({ children, onClick, variant = 'primary', small, color, disabled }) {
  const [hov, setHov] = useState(false)
  const c = color || '#2A1A00'
  const styles = {
    primary:   { bg: hov ? c + 'DD' : c, text: '#fff', border: `2px solid ${c}`, shadow: `0 2px 0px ${c}88` },
    secondary: { bg: hov ? c + '18' : '#fff', text: c, border: `2px solid ${c}50`, shadow: 'none' },
    ghost:     { bg: 'transparent', text: hov ? c : '#B0A090', border: '2px solid transparent', shadow: 'none' },
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: small ? '0.3rem 0.7rem' : '0.6rem 1.2rem',
        background: styles.bg, color: styles.text,
        border: styles.border, borderRadius: '8px',
        fontFamily: 'Georgia, serif', fontSize: small ? '0.75rem' : '0.88rem',
        fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.13s',
        boxShadow: styles.shadow,
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        whiteSpace: 'nowrap',
      }}>{children}</button>
  )
}

function GradeBar({ pct, color }) {
  const safe = Math.min(100, Math.max(0, pct || 0))
  return (
    <div style={{ height: '8px', background: '#F0E8DF', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${safe}%`,
        background: color, borderRadius: '4px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, index, onUpdate, onRemove }) {
  const c = gc(index)
  const [expanded, setExpanded]       = useState(true)
  const [targetGrade, setTargetGrade] = useState('')
  const [targetCat, setTargetCat]     = useState(0)
  const [showNeeded, setShowNeeded]   = useState(false)

  const grade = calcCourseGrade(course.categories)
  const letter = grade !== null ? getLetterGrade(grade) : '—'
  const gpa    = grade !== null ? getGPA(grade) : null
  const msg    = getMessage(grade)

  const needed = showNeeded && targetGrade
    ? calcNeeded(course.categories, parseFloat(targetGrade), targetCat)
    : null

  const updateCatName = (ci, val) => {
    const cats = [...course.categories]
    cats[ci] = { ...cats[ci], name: val }
    onUpdate({ ...course, categories: cats })
  }

  const updateCatWeight = (ci, val) => {
    const cats = [...course.categories]
    cats[ci] = { ...cats[ci], weight: val }
    onUpdate({ ...course, categories: cats })
  }

  const addAssignment = (ci) => {
    const cats = [...course.categories]
    cats[ci] = { ...cats[ci], assignments: [...cats[ci].assignments, { name: '', grade: '' }] }
    onUpdate({ ...course, categories: cats })
  }

  const updateAssignment = (ci, ai, field, val) => {
    const cats = [...course.categories]
    const assignments = [...cats[ci].assignments]
    assignments[ai] = { ...assignments[ai], [field]: val }
    cats[ci] = { ...cats[ci], assignments }
    onUpdate({ ...course, categories: cats })
  }

  const removeAssignment = (ci, ai) => {
    const cats = [...course.categories]
    cats[ci] = { ...cats[ci], assignments: cats[ci].assignments.filter((_, i) => i !== ai) }
    onUpdate({ ...course, categories: cats })
  }

  const addCategory = () => {
    onUpdate({ ...course, categories: [...course.categories, { id: Date.now().toString(), name: '', weight: '', assignments: [] }] })
  }

  const removeCategory = (ci) => {
    onUpdate({ ...course, categories: course.categories.filter((_, i) => i !== ci) })
  }

  const totalWeight = course.categories.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0)
  const weightOk = Math.abs(totalWeight - 100) < 0.5

  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${expanded ? c.border : '#EEE5DB'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '1.2rem',
      boxShadow: expanded ? `0 4px 20px ${c.accent}18` : '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease',
      animation: 'fadeUp 0.3s ease',
    }}>

      {/* ── Course header ── */}
      <div style={{
        background: expanded ? c.bg : '#FDFAF7',
        padding: '1.2rem 1.4rem',
        borderBottom: expanded ? `2px solid ${c.border}` : 'none',
        display: 'flex', alignItems: 'center', gap: '1rem',
        transition: 'background 0.2s',
      }}>
        {/* Colour dot */}
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.accent, flexShrink: 0, boxShadow: `0 0 0 3px ${c.light}` }} />

        {/* Course name input */}
        <div style={{ flex: 1 }}>
          <input
            value={course.name}
            onChange={e => onUpdate({ ...course, name: e.target.value })}
            placeholder="course name..."
            style={{
              fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700,
              color: '#2A1A00', background: 'transparent', border: 'none', outline: 'none',
              width: '100%',
            }}
          />
        </div>

        {/* Grade badge */}
        {grade !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              display: 'inline-block',
              background: c.accent, color: '#fff',
              fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700,
              width: '44px', height: '44px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 0px ${c.accent}88`,
            }}>{letter}</div>
          </div>
        )}

        {/* Expand / remove */}
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0A890', fontSize: '1rem', padding: '0.2rem', transition: 'color 0.13s' }}
          onMouseEnter={e => e.target.style.color = c.accent}
          onMouseLeave={e => e.target.style.color = '#C0A890'}
        >{expanded ? '▲' : '▼'}</button>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0A890', fontSize: '1rem', padding: '0.2rem', transition: 'color 0.13s' }}
          onMouseEnter={e => e.target.style.color = '#E05070'}
          onMouseLeave={e => e.target.style.color = '#C0A890'}
        >✕</button>
      </div>

      {expanded && (
        <div style={{ padding: '1.4rem' }}>

          {/* Grade summary */}
          {grade !== null && (
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#B0A090' }}>CURRENT GRADE</span>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: c.accent }}>{grade.toFixed(1)}%</span>
                  {gpa !== null && <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#B0A090' }}>GPA {gpa.toFixed(1)}</span>}
                </div>
              </div>
              <GradeBar pct={grade} color={c.accent} />
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: c.accent, margin: '0.5rem 0 0', fontStyle: 'italic' }}>{msg}</p>
            </div>
          )}

          {/* Weight warning */}
          {totalWeight > 0 && !weightOk && (
            <div style={{ padding: '0.6rem 0.9rem', background: '#FFF8EC', border: '2px solid #F0D080', borderRadius: '8px', marginBottom: '1rem', fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#A07020' }}>
              ⚠ weights add up to {totalWeight.toFixed(0)}% — should be 100%
            </div>
          )}
          {totalWeight > 0 && weightOk && (
            <div style={{ padding: '0.5rem 0.9rem', background: '#F0FAF2', border: '2px solid #A8D8B0', borderRadius: '8px', marginBottom: '1rem', fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#3A7A50' }}>
              ✓ weights add up to 100%
            </div>
          )}

          {/* Categories */}
          {course.categories.map((cat, ci) => (
            <div key={cat.id} style={{
              background: c.bg, border: `2px solid ${c.border}`,
              borderRadius: '12px', padding: '1rem', marginBottom: '0.8rem',
            }}>
              {/* Category header */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ flex: 2 }}>
                  <Input value={cat.name} onChange={v => updateCatName(ci, v)} placeholder="category name (e.g. Exams)" color={c.accent} />
                </div>
                <div style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Input value={cat.weight} onChange={v => updateCatWeight(ci, v)} placeholder="%" type="number" small color={c.accent} />
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#B0A090', flexShrink: 0 }}>%</span>
                </div>
                <button onClick={() => removeCategory(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0A890', fontSize: '0.85rem', flexShrink: 0 }}
                  onMouseEnter={e => e.target.style.color = '#E05070'}
                  onMouseLeave={e => e.target.style.color = '#C0A890'}
                >✕</button>
              </div>

              {/* Assignments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                {cat.assignments.map((a, ai) => (
                  <div key={ai} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 2 }}>
                      <Input value={a.name} onChange={v => updateAssignment(ci, ai, 'name', v)} placeholder={`assignment ${ai + 1}`} small color={c.accent} />
                    </div>
                    <div style={{ width: '72px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Input value={a.grade} onChange={v => updateAssignment(ci, ai, 'grade', v)} placeholder="%" type="number" small color={c.accent} />
                      <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#C0A890', flexShrink: 0 }}>%</span>
                    </div>
                    <button onClick={() => removeAssignment(ci, ai)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B0', fontSize: '0.8rem', flexShrink: 0 }}
                      onMouseEnter={e => e.target.style.color = '#E05070'}
                      onMouseLeave={e => e.target.style.color = '#D0C0B0'}
                    >✕</button>
                  </div>
                ))}
              </div>

              <Btn small variant="secondary" color={c.accent} onClick={() => addAssignment(ci)}>+ assignment</Btn>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
            <Btn small variant="secondary" color={c.accent} onClick={addCategory}>+ category</Btn>
          </div>

          {/* What do I need? */}
          <div style={{ borderTop: `2px dashed ${c.border}`, paddingTop: '1.2rem' }}>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#B0A090', margin: '0 0 0.8rem' }}>
              WHAT DO I NEED TO GET?
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#C0A890', margin: '0 0 0.3rem', letterSpacing: '0.06em' }}>target grade</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '70px' }}>
                    <Input value={targetGrade} onChange={setTargetGrade} placeholder="e.g. 80" type="number" small color={c.accent} />
                  </div>
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#B0A090' }}>%</span>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#C0A890', margin: '0 0 0.3rem', letterSpacing: '0.06em' }}>in category</p>
                <select value={targetCat} onChange={e => setTargetCat(Number(e.target.value))}
                  style={{
                    padding: '0.35rem 0.6rem', border: `2px solid ${c.border}`, borderRadius: '8px',
                    fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: '#2A1A00',
                    background: '#fff', outline: 'none', cursor: 'pointer',
                  }}>
                  {course.categories.map((cat, ci) => (
                    <option key={ci} value={ci}>{cat.name || `Category ${ci + 1}`}</option>
                  ))}
                </select>
              </div>
              <Btn small color={c.accent} onClick={() => setShowNeeded(true)} disabled={!targetGrade}>calculate</Btn>
            </div>

            {/* Result */}
            {showNeeded && needed !== null && targetGrade && (
              <div style={{
                marginTop: '0.9rem', padding: '0.9rem 1.1rem',
                background: needed > 100 ? '#FFF3F0' : needed < 0 ? '#F0FAF2' : c.bg,
                border: `2px solid ${needed > 100 ? '#F0B0A0' : needed < 0 ? '#A8D8B0' : c.border}`,
                borderRadius: '10px',
              }}>
                {needed > 100 ? (
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#C05040', margin: 0 }}>
                    You'd need <strong>{needed.toFixed(1)}%</strong> — that's over 100%. It may not be possible unless there's extra credit. Don't give up though! 💪
                  </p>
                ) : needed < 0 ? (
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#3A7A50', margin: 0 }}>
                    Great news — you've already secured {targetGrade}% even if you score 0 on the next one! 🎉
                  </p>
                ) : (
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: c.accent, margin: 0 }}>
                    You need <strong>{needed.toFixed(1)}%</strong> on your next {course.categories[targetCat]?.name || 'assignment'} to reach {targetGrade}%. {needed <= 70 ? 'Very doable! ✨' : needed <= 85 ? 'You can do this! 💪' : 'Push hard — it\'s possible! 🔥'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── GPA Summary ───────────────────────────────────────────────────────────────
function GPASummary({ courses }) {
  const graded = courses.map((c, i) => ({ ...c, grade: calcCourseGrade(c.categories), index: i })).filter(c => c.grade !== null)
  if (graded.length === 0) return null
  const avgGPA = graded.reduce((s, c) => s + getGPA(c.grade), 0) / graded.length
  const avgPct = graded.reduce((s, c) => s + c.grade, 0) / graded.length

  return (
    <div style={{
      background: '#fff', border: '2px solid #EEE5DB',
      borderRadius: '16px', padding: '1.4rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: '#B0A090', margin: '0 0 1rem' }}>
        OVERALL SNAPSHOT
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.7rem' }}>
        <div style={{ padding: '0.9rem', background: '#FDFAF7', border: '2px solid #EEE5DB', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#2A1A00' }}>{avgGPA.toFixed(2)}</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', letterSpacing: '0.06em', marginTop: '0.1rem' }}>avg GPA</div>
        </div>
        <div style={{ padding: '0.9rem', background: '#FDFAF7', border: '2px solid #EEE5DB', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#2A1A00' }}>{avgPct.toFixed(1)}%</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', letterSpacing: '0.06em', marginTop: '0.1rem' }}>avg grade</div>
        </div>
        <div style={{ padding: '0.9rem', background: '#FDFAF7', border: '2px solid #EEE5DB', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#2A1A00' }}>{getLetterGrade(avgPct)}</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', letterSpacing: '0.06em', marginTop: '0.1rem' }}>letter grade</div>
        </div>
        <div style={{ padding: '0.9rem', background: '#FDFAF7', border: '2px solid #EEE5DB', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#2A1A00' }}>{graded.length}</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', letterSpacing: '0.06em', marginTop: '0.1rem' }}>courses</div>
        </div>
      </div>

      {/* Mini bar per course */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {graded.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: gc(c.index).accent, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#6A5040', width: '120px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || 'Unnamed'}</span>
            <div style={{ flex: 1 }}><GradeBar pct={c.grade} color={gc(c.index).accent} /></div>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#9A8070', width: '40px', textAlign: 'right', flexShrink: 0 }}>{c.grade.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GradeCalc() {
  const [courses, setCourses] = useState([
    {
      id: '1', name: '',
      categories: [
        { id: 'a', name: '', weight: '', assignments: [] },
      ],
    },
  ])

  const addCourse = () => {
    setCourses(prev => [...prev, {
      id: Date.now().toString(), name: '',
      categories: [{ id: Date.now().toString() + 'c', name: '', weight: '', assignments: [] }],
    }])
  }

  const updateCourse = (id, updated) => {
    setCourses(prev => prev.map(c => c.id === id ? updated : c))
  }

  const removeCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', paddingTop: '80px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '28px', height: '2px', background: '#C0A060' }} />
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: '#C0A060' }}>the lab</span>
          </div>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
            fontWeight: 700, color: '#2A1A00',
            margin: '0 0 0.3rem', lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}>Grade Calculator 📚</h1>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', color: '#B0A090', letterSpacing: '0.04em' }}>
            track your grades · set targets · know what you need
          </p>
        </div>

        {/* GPA snapshot */}
        <GPASummary courses={courses} />

        {/* Course cards */}
        {courses.map((course, i) => (
          <CourseCard
            key={course.id}
            course={course}
            index={i}
            onUpdate={updated => updateCourse(course.id, updated)}
            onRemove={() => removeCourse(course.id)}
          />
        ))}

        {/* Add course */}
        <button onClick={addCourse}
          style={{
            width: '100%', padding: '1rem',
            background: 'transparent',
            border: '2px dashed #D8C8B8',
            borderRadius: '14px',
            fontFamily: 'Georgia, serif', fontSize: '0.92rem',
            color: '#C0A890', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0A060'; e.currentTarget.style.color = '#C0A060'; e.currentTarget.style.background = '#FFF8F0' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8C8B8'; e.currentTarget.style.color = '#C0A890'; e.currentTarget.style.background = 'transparent' }}
        >
          + add another course
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #C8B8A8; }
      `}</style>
    </div>
  )
}