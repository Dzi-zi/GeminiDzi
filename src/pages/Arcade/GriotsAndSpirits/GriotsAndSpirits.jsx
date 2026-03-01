import { useState, useEffect, useRef, useCallback } from 'react'

const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY || ''

// ── Game Data ─────────────────────────────────────────────────────────────────

const SPIRITS = [
  { id: 'anansi',  name: 'Anansi',     symbol: '🕷',  color: '#D4AF37', power: 'Weave deception — reveal hidden truths in conversations', chapter: 1 },
  { id: 'ogun',    name: 'Ogun',       symbol: '⚔',   color: '#E05050', power: 'Iron will — your words carry the force of a blade',     chapter: 2 },
  { id: 'yemoja',  name: 'Yemoja',     symbol: '🌊',  color: '#4ECDC4', power: 'Water memory — recall any story ever told',              chapter: 3 },
  { id: 'eshu',    name: 'Eshu',       symbol: '🔀',  color: '#A78BFA', power: 'Open crossroads — any path becomes possible',           chapter: 4 },
]

const ARTEFACTS = [
  { id: 'kora',       name: 'Kora',              symbol: '𝄞',  desc: 'A 21-string instrument. Its music unlocks spirit doors.',     chapter: 1, color: '#C8A850' },
  { id: 'cowrie',     name: 'Cowrie Shells',     symbol: '◌',  desc: 'Ancient currency and divination tools. Trade or read fate.',   chapter: 1, color: '#F5E6C8' },
  { id: 'talking_drum', name: 'Talking Drum',    symbol: '◎',  desc: 'Sends messages across distances. Speak to the ancestors.',     chapter: 2, color: '#8B4513' },
  { id: 'adinkra_cloth', name: 'Adinkra Cloth',  symbol: '⬡',  desc: 'Woven with symbols. Each pattern carries a hidden law.',       chapter: 2, color: '#D4AF37' },
  { id: 'baobab_seed', name: 'Baobab Seed',      symbol: '⊕',  desc: 'Contains a thousand years of memory. Plant it, unlock them.',  chapter: 3, color: '#6AAF7A' },
  { id: 'bronze_mask', name: 'Bronze Mask of Benin', symbol: '◈', desc: 'Wear it to see the spirit world overlaid on the physical.',  chapter: 4, color: '#B87333' },
]

const CHAPTERS = [
  {
    id: 1, title: 'The Village of Echoes',
    setting: 'A dry-season evening in a West African village. Fires crackle. Children gather.',
    spiritWorld: false,
  },
  {
    id: 2, title: 'The Iron Road',
    setting: 'A crossroads between two kingdoms. Merchants, soldiers, and shadows pass.',
    spiritWorld: false,
  },
  {
    id: 3, title: 'Where the River Remembers',
    setting: 'The banks of a sacred river at midnight. The water speaks in voices.',
    spiritWorld: true,
  },
  {
    id: 4, title: 'The Spirit Market',
    setting: 'A marketplace that exists between worlds. Every stall sells something impossible.',
    spiritWorld: true,
  },
  {
    id: 5, title: 'The Final Story',
    setting: 'The griot stands before all worlds. What they say next will be remembered forever.',
    spiritWorld: true,
  },
]

const RIDDLES = [
  { q: 'I have cities, but no houses live there. Mountains, but no trees grow there. Water, but no fish swim there. What am I?', a: 'map', hint: 'A griot knows all territories...' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps', hint: 'Every journey leaves a trace...' },
  { q: 'I speak without a mouth. I hear without ears. I have no body, but I come alive with wind. What am I?', a: 'echo', hint: 'The village has one of these...' },
  { q: 'I have roots that nobody sees. I am taller than trees. Up, up, I go, yet I never grow. What am I?', a: 'mountain', hint: 'Look to the horizon...' },
  { q: 'What travels the world but stays in a corner?', a: 'stamp', hint: 'A griot sends many messages...' },
]

// ── Claude API ────────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, maxTokens = 600) {
  if (!CLAUDE_KEY) throw new Error('No API key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userMessage }],
      system: systemPrompt,
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

function buildSystemPrompt(state) {
  const chapter = CHAPTERS[state.chapterIndex]
  const spirits = state.spirits.map(s => s.name).join(', ') || 'none yet'
  const artefacts = state.inventory.map(a => a.name).join(', ') || 'none yet'
  const rep = Object.entries(state.reputation).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ') || 'neutral everywhere'

  return `You are the narrator of "Griots & Spirits", a narrative RPG set in mythic West Africa.

The player is a GRIOT — a sacred storyteller whose words literally reshape reality. Their spoken choices alter the world around them.

CURRENT STATE:
- Chapter: ${chapter.title} (Chapter ${chapter.id}/5)
- Setting: ${chapter.setting}
- Spirit World Active: ${chapter.spiritWorld}
- Spirit Companions: ${spirits}
- Inventory: ${artefacts}
- Reputation: ${rep}
- Player Name: ${state.playerName || 'The Griot'}

WRITING RULES:
- Write in second person ("You stand before...")
- 3-5 sentences of vivid, lyrical description
- End with exactly 3 choices, formatted as:
  [A] First choice
  [B] Second choice  
  [C] Third choice
- Each choice should feel meaningfully different — one practical, one spiritual, one unpredictable
- When spirit world is active, blend the mystical with the mundane
- Reference the player's inventory and companions naturally when relevant
- Choices should sometimes have visible consequences to reputation

Keep the tone: lyrical, wise, slightly dangerous. Like a griot's tale told at night.`
}

// ── UI Components ─────────────────────────────────────────────────────────────

function TypedText({ text, onDone, speed = 22 }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    indexRef.current = 0
    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, ++indexRef.current))
      } else {
        clearInterval(timerRef.current)
        setDone(true)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(timerRef.current)
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span style={{ animation: 'blink 0.8s step-end infinite', opacity: 0.7 }}>|</span>}
    </span>
  )
}

function parseChoices(text) {
  const lines = text.split('\n')
  const choices = []
  const storyLines = []
  lines.forEach(line => {
    const m = line.match(/^\[([ABC])\]\s*(.+)/)
    if (m) choices.push({ key: m[1], text: m[2].trim() })
    else storyLines.push(line)
  })
  return {
    story: storyLines.join('\n').trim(),
    choices,
  }
}

function SpiritBar({ spirits, isSpirit }) {
  if (spirits.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {spirits.map(s => (
        <div key={s.id} style={{
          padding: '0.25rem 0.7rem', borderRadius: '20px',
          background: s.color + '18', border: `1px solid ${s.color}50`,
          fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
          color: s.color, display: 'flex', alignItems: 'center', gap: '0.3rem',
          animation: isSpirit ? `spiritGlow 2s ease-in-out infinite` : 'none',
        }}>
          <span>{s.symbol}</span> {s.name}
        </div>
      ))}
    </div>
  )
}

function InventoryPanel({ inventory, isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '1rem',
    }}>
      <div style={{
        maxWidth: 500, width: '100%',
        background: '#1A0E05', border: '2px solid #D4AF37',
        borderRadius: '16px', padding: '1.5rem',
        animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#D4AF37', margin: 0 }}>Your Artefacts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>
        {inventory.length === 0 && (
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Your satchel is empty. The journey has just begun.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {inventory.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: `1px solid ${a.color}30` }}>
              <span style={{ fontSize: '1.4rem', color: a.color, flexShrink: 0 }}>{a.symbol}</span>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: '#F0EDE8', marginBottom: '0.2rem' }}>{a.name}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RiddleChallenge({ riddle, onSolve, onFail, isSpirit }) {
  const [answer, setAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState(null)

  const check = () => {
    const clean = answer.trim().toLowerCase()
    if (clean === riddle.a || clean.includes(riddle.a)) {
      setResult('correct')
      setTimeout(() => onSolve(), 1200)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        setResult('fail')
        setTimeout(() => onFail(), 1200)
      } else {
        setResult('wrong')
        setTimeout(() => setResult(null), 1000)
      }
    }
  }

  const accent = isSpirit ? '#A78BFA' : '#D4AF37'

  return (
    <div style={{
      background: isSpirit ? 'rgba(80,0,160,0.2)' : 'rgba(212,175,55,0.08)',
      border: `2px solid ${accent}40`,
      borderRadius: '14px', padding: '1.5rem', marginTop: '1rem',
    }}>
      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: accent, marginBottom: '0.8rem' }}>⚔ WORD CHALLENGE</div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#F0EDE8', lineHeight: 1.7, margin: '0 0 1rem', fontStyle: 'italic' }}>"{riddle.q}"</p>

      {showHint && (
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: accent, fontStyle: 'italic', margin: '0 0 0.8rem' }}>Hint: {riddle.hint}</p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <input
          value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Speak your answer..."
          style={{
            flex: 1, padding: '0.6rem 0.9rem',
            background: 'rgba(255,255,255,0.06)',
            border: `2px solid ${result === 'correct' ? '#6AAF7A' : result === 'wrong' || result === 'fail' ? '#E05050' : accent + '40'}`,
            borderRadius: '8px', color: '#F0EDE8',
            fontFamily: 'Georgia, serif', fontSize: '0.88rem', outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
        <button onClick={check} style={{
          padding: '0.6rem 1.2rem', background: accent, border: 'none',
          borderRadius: '8px', color: '#0A0A0F', fontFamily: 'Georgia, serif',
          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>Speak</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < attempts ? '#E05050' : `${accent}40` }} />
          ))}
        </div>
        {!showHint && attempts > 0 && (
          <button onClick={() => setShowHint(true)} style={{ background: 'none', border: 'none', color: accent, fontFamily: '"Courier New", monospace', fontSize: '0.6rem', cursor: 'pointer', textDecoration: 'underline' }}>ask a spirit for a hint</button>
        )}
      </div>

      {result === 'correct' && <p style={{ fontFamily: 'Georgia, serif', color: '#6AAF7A', margin: '0.5rem 0 0', fontStyle: 'italic' }}>✓ The spirits nod. Your words rang true.</p>}
      {result === 'fail' && <p style={{ fontFamily: 'Georgia, serif', color: '#E05050', margin: '0.5rem 0 0', fontStyle: 'italic' }}>The riddle defeats you — but the story continues.</p>}
    </div>
  )
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function GriotsAndSpirits() {
  const [screen, setScreen] = useState('title') // title | name | play | ending
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')

  const [gameState, setGameState] = useState({
    chapterIndex: 0,
    playerName: '',
    inventory: [],
    spirits: [],
    reputation: { village: 0, spirits: 0, kingdoms: 0 },
    choices: [],
    spiritWorld: false,
  })

  const [scene, setScene] = useState('')
  const [choices, setChoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [textDone, setTextDone] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [riddle, setRiddle] = useState(null)
  const [pendingChoice, setPendingChoice] = useState(null)
  const [log, setLog] = useState([])
  const [ending, setEnding] = useState('')
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const chapter = CHAPTERS[gameState.chapterIndex] || CHAPTERS[0]
  const isSpirit = gameState.spiritWorld || chapter.spiritWorld

  // bg and palette based on spirit world state
  const palette = isSpirit
    ? { bg: '#07030F', paper: '#120830', text: '#E8E0FF', accent: '#A78BFA', secondary: '#D4AF37', border: 'rgba(167,139,250,0.2)' }
    : { bg: '#1A0E05', paper: '#2A1A08', text: '#F0E6D0', accent: '#D4AF37', secondary: '#C8A850', border: 'rgba(212,175,55,0.2)' }

  const generateScene = useCallback(async (state, context = '') => {
    setLoading(true)
    setTextDone(false)
    setChoices([])
    try {
      const prompt = context || `Begin the scene. The griot enters ${CHAPTERS[state.chapterIndex].title}.`
      const raw = await callClaude(buildSystemPrompt(state), prompt, 700)
      const parsed = parseChoices(raw)
      setScene(parsed.story)
      setChoices(parsed.choices.length > 0 ? parsed.choices : [
        { key: 'A', text: 'Speak words of wisdom' },
        { key: 'B', text: 'Listen in silence' },
        { key: 'C', text: 'Step into the unknown' },
      ])
    } catch {
      setScene('The spirits are silent for a moment. Something stirs in the distance...')
      setChoices([
        { key: 'A', text: 'Wait and observe' },
        { key: 'B', text: 'Call out to the spirits' },
        { key: 'C', text: 'Move forward' },
      ])
    }
    setLoading(false)
  }, [])

  const startGame = () => {
    const name = nameInput.trim() || 'The Griot'
    setPlayerName(name)
    const state = { ...gameState, playerName: name }
    setGameState(state)
    setScreen('play')
    generateScene(state)
  }

  const makeChoice = async (choice) => {
    if (loading || !textDone) return

    // Sometimes trigger a riddle (chapters 2+, 30% chance)
    if (gameState.chapterIndex >= 1 && Math.random() < 0.3 && !riddle) {
      const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)]
      setRiddle(r)
      setPendingChoice(choice)
      return
    }

    await resolveChoice(choice, true)
  }

  const resolveChoice = async (choice, riddleSolved = true) => {
    setRiddle(null)
    setPendingChoice(null)

    // Add to log
    setLog(prev => [...prev.slice(-20), { choice: choice.text, chapter: chapter.title }])

    // Update state
    let newState = { ...gameState }
    newState.choices = [...newState.choices, choice.key]

    // Award artefact sometimes
    const chapterArtefacts = ARTEFACTS.filter(a => a.chapter === chapter.id && !newState.inventory.find(i => i.id === a.id))
    if (chapterArtefacts.length > 0 && Math.random() < 0.4) {
      const art = chapterArtefacts[Math.floor(Math.random() * chapterArtefacts.length)]
      newState.inventory = [...newState.inventory, art]
    }

    // Award spirit sometimes
    const availableSpirits = SPIRITS.filter(s => s.chapter === chapter.id && !newState.spirits.find(sp => sp.id === s.id))
    if (availableSpirits.length > 0 && choice.key === 'B' && Math.random() < 0.5) {
      newState.spirits = [...newState.spirits, availableSpirits[0]]
    }

    // Reputation shift
    const repShift = choice.key === 'A' ? { village: 1 } : choice.key === 'B' ? { spirits: 1 } : { kingdoms: 1 }
    newState.reputation = { ...newState.reputation }
    Object.entries(repShift).forEach(([k, v]) => { newState.reputation[k] = (newState.reputation[k] || 0) + v })

    // Advance chapter
    if (newState.choices.filter(c => ['A', 'B', 'C'].includes(c)).length % 4 === 0) {
      if (newState.chapterIndex < CHAPTERS.length - 1) {
        newState.chapterIndex++
        newState.spiritWorld = CHAPTERS[newState.chapterIndex].spiritWorld
      } else {
        // Ending
        setGameState(newState)
        generateEnding(newState)
        return
      }
    }

    setGameState(newState)
    const prompt = `The griot chose: "${choice.text}". Continue the story from this choice. The setting is ${CHAPTERS[newState.chapterIndex].title}.`
    generateScene(newState, prompt)
  }

  const generateEnding = async (state) => {
    setScreen('ending')
    setLoading(true)
    try {
      const dominant = Object.entries(state.reputation).sort((a, b) => b[1] - a[1])[0]?.[0] || 'balance'
      const prompt = `Write a beautiful, final epilogue for ${state.playerName}'s journey as a griot. They collected: ${state.inventory.map(i => i.name).join(', ')}. Their spirit companions were: ${state.spirits.map(s => s.name).join(', ')}. Their greatest reputation was with: ${dominant}. Write 3 paragraphs of lyrical, satisfying conclusion. No choices needed.`
      const text = await callClaude(buildSystemPrompt(state), prompt, 500)
      setEnding(text)
    } catch {
      setEnding(`${state.playerName}'s story is woven into the fabric of the world now. The griots who come after will speak your name at the fire.`)
    }
    setLoading(false)
  }

  // ── Title Screen ──────────────────────────────────────────────────────────
  if (screen === 'title') {
    return (
      <div style={{ minHeight: '100vh', background: '#07030F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
        {/* Floating glyphs */}
        {['𓂀','𓅱','𓈖','𓇋','𓏭','𓆑','◈','⬡','✦'].map((g, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + (i * 11) % 80}%`,
            top: `${10 + (i * 17) % 75}%`,
            fontFamily: 'Georgia, serif', fontSize: `${1 + (i % 3) * 0.5}rem`,
            color: i % 2 === 0 ? '#D4AF3720' : '#A78BFA15',
            animation: `float ${4 + i * 0.7}s ease-in-out ${i * 0.3}s infinite`,
            pointerEvents: 'none', userSelect: 'none',
          }}>{g}</div>
        ))}

        <div style={{ maxWidth: 580, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px #D4AF37)' }}>🔮</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', color: '#D4AF37', marginBottom: '0.6rem' }}>A NARRATIVE RPG</div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.2rem, 7vw, 4rem)', fontWeight: 700, color: '#F0E6D0', margin: '0 0 0.3rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Griots &<br />Spirits
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'rgba(240,230,208,0.45)', fontStyle: 'italic', margin: '0 0 2rem', lineHeight: 1.6 }}>
            "Your words do not describe the world.<br />They create it."
          </p>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[['5 Chapters', '📖'], ['4 Spirits', '✨'], ['6 Artefacts', '🏺'], ['AI Narrative', '🔮']].map(([label, icon]) => (
              <div key={label} style={{ padding: '0.4rem 0.9rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: 'rgba(240,230,208,0.55)' }}>
                {icon} {label}
              </div>
            ))}
          </div>

          <button onClick={() => setScreen('name')} style={{
            padding: '0.85rem 2.5rem', background: 'linear-gradient(135deg, #D4AF37, #C8A850)',
            border: 'none', borderRadius: '10px', color: '#0A0505',
            fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            Begin the Story
          </button>

          {!CLAUDE_KEY && (
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#E05070', marginTop: '1rem' }}>
              ⚠ Add VITE_CLAUDE_API_KEY for AI-generated narrative
            </p>
          )}
        </div>

        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-12px) rotate(5deg);} }
          @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:none;} }
          @keyframes spiritGlow { 0%,100%{box-shadow:none;} 50%{box-shadow:0 0 12px currentColor;} }
          @keyframes shimmer { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
        `}</style>
      </div>
    )
  }

  // ── Name Screen ───────────────────────────────────────────────────────────
  if (screen === 'name') {
    return (
      <div style={{ minHeight: '100vh', background: '#1A0E05', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '100px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', color: '#D4AF37', marginBottom: '0.8rem' }}>BEFORE THE STORY BEGINS</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#F0E6D0', margin: '0 0 0.5rem' }}>What is your name,<br />Griot?</h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: 'rgba(240,230,208,0.45)', fontStyle: 'italic', margin: '0 0 2rem', lineHeight: 1.6 }}>
            A name is the first story you ever tell.
          </p>
          <input
            value={nameInput} onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startGame()}
            placeholder="Enter your name..."
            autoFocus
            style={{
              width: '100%', padding: '0.9rem 1.2rem', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(212,175,55,0.35)',
              borderRadius: '10px', color: '#F0E6D0', fontFamily: 'Georgia, serif',
              fontSize: '1rem', outline: 'none', textAlign: 'center',
              marginBottom: '1rem',
            }}
          />
          <button onClick={startGame} style={{
            width: '100%', padding: '0.8rem', background: '#D4AF37',
            border: 'none', borderRadius: '10px', color: '#0A0505',
            fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 3px 0 #8B6914',
          }}>
            This is my name →
          </button>
        </div>
      </div>
    )
  }

  // ── Ending Screen ─────────────────────────────────────────────────────────
  if (screen === 'ending') {
    return (
      <div style={{ minHeight: '100vh', background: '#07030F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '100px' }}>
        <div style={{ maxWidth: 620, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px #D4AF37)' }}>✦</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#D4AF37', margin: '0 0 1.5rem' }}>The Story Is Complete</h2>
          {loading ? (
            <p style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', animation: 'shimmer 1.5s ease infinite' }}>The ancestors are composing your epilogue...</p>
          ) : (
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'rgba(240,230,208,0.75)', lineHeight: 1.9, textAlign: 'left', whiteSpace: 'pre-line', fontStyle: 'italic', marginBottom: '2rem' }}>
              {ending}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button onClick={() => { setScreen('title'); setGameState({ chapterIndex: 0, playerName: '', inventory: [], spirits: [], reputation: { village: 0, spirits: 0, kingdoms: 0 }, choices: [], spiritWorld: false }); setLog([]) }} style={{ padding: '0.65rem 1.4rem', background: '#D4AF37', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#0A0505', cursor: 'pointer' }}>
              Tell a New Story
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Play Screen ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: palette.bg, paddingTop: '80px', transition: 'background 1.5s ease' }}>
      <InventoryPanel inventory={gameState.inventory} isOpen={showInventory} onClose={() => setShowInventory(false)} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1rem 1rem 4rem', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem', alignItems: 'start' }}>

        {/* ── Main panel ── */}
        <div>
          {/* Chapter header */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', color: palette.accent, marginBottom: '0.3rem' }}>
              CHAPTER {chapter.id} OF 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: palette.text, margin: 0, letterSpacing: '-0.02em' }}>
              {chapter.title}
            </h2>
            {isSpirit && (
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#A78BFA', marginTop: '0.3rem', animation: 'shimmer 2s ease infinite' }}>
                ✦ THE SPIRIT WORLD IS OPEN
              </div>
            )}
          </div>

          {/* Story text */}
          <div style={{
            background: palette.paper, border: `2px solid ${palette.border}`,
            borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem',
            minHeight: '180px', position: 'relative',
            boxShadow: isSpirit ? '0 0 40px rgba(167,139,250,0.08)' : 'none',
            transition: 'all 1.2s ease',
          }}>
            {loading ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: palette.accent, animation: 'shimmer 0.8s ease infinite' }} />
                <p style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0, fontSize: '0.88rem' }}>
                  The griot's words take shape...
                </p>
              </div>
            ) : (
              <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '0.95rem', lineHeight: 1.85, color: palette.text, margin: 0, whiteSpace: 'pre-line' }}>
                {scene ? <TypedText text={scene} onDone={() => setTextDone(true)} speed={18} /> : ''}
              </p>
            )}
          </div>

          {/* Riddle challenge */}
          {riddle && (
            <RiddleChallenge
              riddle={riddle}
              isSpirit={isSpirit}
              onSolve={() => resolveChoice(pendingChoice, true)}
              onFail={() => resolveChoice(pendingChoice, false)}
            />
          )}

          {/* Choices */}
          {!riddle && textDone && choices.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {choices.map((c, i) => (
                <button key={c.key} onClick={() => makeChoice(c)}
                  style={{
                    padding: '0.85rem 1.2rem', textAlign: 'left',
                    background: 'rgba(255,255,255,0.04)',
                    border: `2px solid ${palette.border}`,
                    borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
                    animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = palette.accent + '80'; e.currentTarget.style.background = `${palette.accent}08` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 700, color: palette.accent, background: palette.accent + '18', padding: '0.15rem 0.45rem', borderRadius: '4px', flexShrink: 0, marginTop: '2px' }}>{c.key}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: palette.text, lineHeight: 1.5 }}>{c.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'sticky', top: '1rem' }}>

          {/* Player */}
          <div style={{ background: palette.paper, border: `2px solid ${palette.border}`, borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.4rem' }}>GRIOT</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 700, color: palette.text, marginBottom: '0.7rem' }}>{playerName}</div>

            {/* Reputation */}
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.4rem' }}>REPUTATION</div>
            {Object.entries(gameState.reputation).map(([k, v]) => (
              <div key={k} style={{ marginBottom: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{k}</span>
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: palette.accent }}>{v > 0 ? '+' : ''}{v}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (v / 5) * 100)}%`, background: palette.accent, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Spirits */}
          {gameState.spirits.length > 0 && (
            <div style={{ background: palette.paper, border: `2px solid ${palette.border}`, borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.6rem' }}>COMPANIONS</div>
              <SpiritBar spirits={gameState.spirits} isSpirit={isSpirit} />
            </div>
          )}

          {/* Inventory button */}
          <button onClick={() => setShowInventory(true)} style={{
            padding: '0.7rem', background: palette.paper,
            border: `2px solid ${palette.border}`, borderRadius: '12px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.14s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = palette.accent + '60'}
            onMouseLeave={e => e.currentTarget.style.borderColor = palette.border}
          >
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.3rem' }}>SATCHEL</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: palette.text }}>
              {gameState.inventory.length === 0 ? 'Empty' : `${gameState.inventory.length} artefact${gameState.inventory.length !== 1 ? 's' : ''}`}
            </div>
            {gameState.inventory.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {gameState.inventory.map(a => (
                  <span key={a.id} style={{ fontSize: '1rem', filter: `drop-shadow(0 0 4px ${a.color})` }} title={a.name}>{a.symbol}</span>
                ))}
              </div>
            )}
          </button>

          {/* Story log */}
          {log.length > 0 && (
            <div style={{ background: palette.paper, border: `2px solid ${palette.border}`, borderRadius: '12px', padding: '0.8rem' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>YOUR PATH</div>
              <div ref={logRef} style={{ maxHeight: 160, overflowY: 'auto' }}>
                {log.slice(-6).map((entry, i) => (
                  <div key={i} style={{ fontFamily: 'Georgia, serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem', lineHeight: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.3rem', fontStyle: 'italic' }}>
                    "{entry.choice}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-12px) rotate(5deg);} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        @keyframes spiritGlow { 0%,100%{opacity:0.7;} 50%{opacity:1;} }
        @keyframes shimmer { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);}
      `}</style>
    </div>
  )
}