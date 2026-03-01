import { useState, useEffect, useRef, useCallback } from 'react'

// ── Card Definitions ──────────────────────────────────────────────────────────
const CARD_DEFS = [
  // Attack cards
  { id: 'gye_nyame',   name: 'Gye Nyame',      symbol: '𝌗', type: 'attack',  power: 6,  desc: 'The supreme symbol. Deals 6 damage — unstoppable force.',         proverb: '"Except God"',                    color: '#7B2FBE', rarity: 'common'  },
  { id: 'dwennimmen',  name: 'Dwennimmen',     symbol: '⌖', type: 'attack',  power: 4,  desc: 'Ram horns. Strength through humility. Deals 4 damage.',            proverb: '"Strength with humility"',        color: '#C2185B', rarity: 'common'  },
  { id: 'akofena',     name: 'Akofena',        symbol: '⚔', type: 'attack',  power: 7,  desc: 'Crossed swords of courage. Deals 7 damage.',                       proverb: '"Courage and valor"',             color: '#B71C1C', rarity: 'uncommon'},
  { id: 'mmusuyidee',  name: 'Mmusuyidee',     symbol: '✦', type: 'attack',  power: 5,  desc: 'Fortune\'s charm. Deals 5 damage and draws 1 card.',               proverb: '"Good fortune"',                  color: '#AD1457', rarity: 'common'  },
  { id: 'sepow',       name: 'Sepow',          symbol: '◈', type: 'attack',  power: 9,  desc: 'The executioner\'s knife. Deals 9 damage but skip your next draw.', proverb: '"Justice is served"',             color: '#880E4F', rarity: 'rare'    },
  { id: 'akoma_ntoso', name: 'Akoma Ntoso',    symbol: '❧', type: 'attack',  power: 3,  desc: 'Linked hearts — attack deals 3 damage to ALL opponents.',          proverb: '"Understanding"',                 color: '#6A1B9A', rarity: 'uncommon'},

  // Defence cards
  { id: 'fawohodie',   name: 'Fawohodie',      symbol: '⬡', type: 'defence', power: 5,  desc: 'Independence. Block up to 5 incoming damage this turn.',           proverb: '"Freedom from servitude"',        color: '#1565C0', rarity: 'common'  },
  { id: 'nyame_biribi', name: 'Nyame Biribi',  symbol: '✸', type: 'defence', power: 4,  desc: 'God is in the heavens. Reduces next attack by 4.',                 proverb: '"God\'s providence"',             color: '#0D47A1', rarity: 'common'  },
  { id: 'bese_saka',   name: 'Bese Saka',      symbol: '⬟', type: 'defence', power: 7,  desc: 'Sack of cola nuts — prosperity shield. Block 7 damage.',           proverb: '"Affluence and abundance"',       color: '#1A237E', rarity: 'uncommon'},
  { id: 'aban',        name: 'Aban',           symbol: '⏣', type: 'defence', power: 3,  desc: 'The fortress. Block 3 damage and counter-deal 2.',                 proverb: '"Strength and authority"',        color: '#283593', rarity: 'uncommon'},

  // Heal cards
  { id: 'aya',         name: 'Aya',            symbol: '⸙', type: 'heal',    power: 4,  desc: 'The fern — endurance. Restore 4 HP.',                             proverb: '"Resourcefulness"',               color: '#2E7D32', rarity: 'common'  },
  { id: 'nyame_dua',   name: 'Nyame Dua',      symbol: '⊕', type: 'heal',    power: 6,  desc: 'Tree of God. Restore 6 HP and draw 1 card.',                      proverb: '"God\'s presence"',               color: '#1B5E20', rarity: 'uncommon'},
  { id: 'eban',        name: 'Eban',           symbol: '⌂', type: 'heal',    power: 3,  desc: 'Home and love. Heal 3 HP. Draw 2 cards.',                         proverb: '"Love and safety"',               color: '#33691E', rarity: 'common'  },

  // Special / Sankofa
  { id: 'sankofa',     name: 'Sankofa',        symbol: '𓅿', type: 'sankofa', power: 0,  desc: 'Return and fetch it. Retrieve any discarded card back to hand.',   proverb: '"It is not wrong to go back"',    color: '#D4AF37', rarity: 'sankofa' },
  { id: 'sankofa_fire',name: 'Sankofa Blaze',  symbol: '🔥', type: 'sankofa', power: 8,  desc: 'Rise from ashes. Deal 8 damage AND heal 4 HP.',                   proverb: '"Reclaim what was lost"',         color: '#FF6F00', rarity: 'sankofa' },
  { id: 'adinkrahene', name: 'Adinkrahene',    symbol: '◎', type: 'sankofa', power: 0,  desc: 'Chief of Adinkra. Copy the last card played by either player.',    proverb: '"Greatness and charisma"',        color: '#C8A850', rarity: 'sankofa' },
  { id: 'nkyinkyim',   name: 'Nkyinkyim',      symbol: '꩜', type: 'sankofa', power: 5,  desc: 'Adaptability. Swap hands with opponent.',                          proverb: '"Adaptability"',                  color: '#4ECDC4', rarity: 'sankofa' },

  // More commons for deck variety
  { id: 'owia_kokroko',name: 'Owia Kokroko',   symbol: '☀', type: 'attack',  power: 4,  desc: 'The great sun — bright and relentless. Deals 4 damage.',           proverb: '"Vitality of the sun"',           color: '#E65100', rarity: 'common'  },
  { id: 'kintinkantan',name: 'Kintinkantan',   symbol: '⬢', type: 'attack',  power: 3,  desc: 'Arrogance overthrown. Deals 3 damage, opponent discards 1 card.',  proverb: '"Extravagance brings downfall"',  color: '#6A1B9A', rarity: 'uncommon'},
  { id: 'bi_nka_bi',   name: 'Bi Nka Bi',      symbol: '☯', type: 'defence', power: 6,  desc: 'No one should bite the other. Negate an attack completely.',       proverb: '"Peace and harmony"',             color: '#006064', rarity: 'rare'    },
  { id: 'hwehwemudua', name: 'Hwehwemudua',    symbol: '✣', type: 'heal',    power: 5,  desc: 'Measuring rod of excellence. Heal 5 and shuffle discard into deck.',proverb: '"Excellence and quality"',        color: '#004D40', rarity: 'rare'    },
]

const RARITY_COLORS = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', sankofa: '#D4AF37' }
const TYPE_ICONS    = { attack: '⚔', defence: '🛡', heal: '💚', sankofa: '𓅿' }
const TYPE_COLORS   = { attack: '#C2185B', defence: '#1565C0', heal: '#2E7D32', sankofa: '#D4AF37' }

const MAX_HP   = 20
const HAND_SIZE = 5

// ── Build deck ────────────────────────────────────────────────────────────────
function buildDeck() {
  const deck = []
  CARD_DEFS.forEach(c => {
    const count = c.rarity === 'sankofa' ? 1 : c.rarity === 'rare' ? 1 : c.rarity === 'uncommon' ? 2 : 3
    for (let i = 0; i < count; i++) deck.push({ ...c, uid: `${c.id}_${i}_${Math.random()}` })
  })
  return shuffle(deck)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawCards(deck, hand, count = 1) {
  const newDeck = [...deck]
  const newHand = [...hand]
  for (let i = 0; i < count; i++) {
    if (newDeck.length === 0) break
    newHand.push(newDeck.pop())
  }
  return { deck: newDeck, hand: newHand }
}

// ── Card Component ────────────────────────────────────────────────────────────
function CardFace({ card, selected, onClick, disabled, small, flipped }) {
  const [hov, setHov] = useState(false)
  const [revealed, setRevealed] = useState(!flipped)

  useEffect(() => {
    if (flipped) {
      setRevealed(false)
      const t = setTimeout(() => setRevealed(true), 350)
      return () => clearTimeout(t)
    } else {
      setRevealed(true)
    }
  }, [flipped, card?.uid])

  const w = small ? 80 : 110
  const h = small ? 110 : 155

  if (!revealed) {
    return (
      <div style={{ width: w, height: h, borderRadius: '10px', background: 'linear-gradient(135deg, #2D1B5E, #1A0A3A)', border: '2px solid #D4AF37', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', animation: 'flipIn 0.35s ease' }}>
        𓅿
      </div>
    )
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: w, height: h, borderRadius: '10px', flexShrink: 0,
        background: `linear-gradient(160deg, ${card.color}22, #0D0520 80%)`,
        border: `2px solid ${selected ? '#D4AF37' : hov && !disabled ? card.color + '90' : card.color + '40'}`,
        boxShadow: selected ? `0 0 18px ${card.color}60, 0 6px 0 ${card.color}40` : hov && !disabled ? `0 4px 16px ${card.color}30` : 'none',
        transform: selected ? 'translateY(-16px) scale(1.04)' : hov && !disabled ? 'translateY(-6px)' : 'none',
        transition: 'all 0.18s ease',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column',
        padding: small ? '0.4rem' : '0.55rem',
        position: 'relative', overflow: 'hidden',
        animation: 'cardDeal 0.3s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Rarity shimmer */}
      {card.rarity === 'sankofa' && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(45deg, transparent 30%, ${card.color}20 50%, transparent 70%)`, animation: 'shimmer 2.5s ease infinite', pointerEvents: 'none' }} />
      )}

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: small ? '0.2rem' : '0.3rem' }}>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: small ? '0.5rem' : '0.58rem', color: TYPE_COLORS[card.type], fontWeight: 700, background: TYPE_COLORS[card.type] + '20', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{TYPE_ICONS[card.type]}</span>
        {card.power > 0 && <span style={{ fontFamily: '"Courier New", monospace', fontSize: small ? '0.6rem' : '0.72rem', fontWeight: 700, color: card.color }}>{card.power}</span>}
      </div>

      {/* Symbol */}
      <div style={{ textAlign: 'center', fontSize: small ? '1.4rem' : '2rem', lineHeight: 1, marginBottom: small ? '0.2rem' : '0.35rem', filter: `drop-shadow(0 0 6px ${card.color})` }}>
        {card.symbol}
      </div>

      {/* Name */}
      <div style={{ fontFamily: 'Georgia, serif', fontSize: small ? '0.5rem' : '0.62rem', fontWeight: 700, color: '#F0EDE8', marginBottom: small ? '0.15rem' : '0.25rem', lineHeight: 1.2, textAlign: 'center' }}>{card.name}</div>

      {!small && (
        <>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.58rem', color: 'rgba(240,237,232,0.5)', lineHeight: 1.45, flex: 1, marginBottom: '0.25rem' }}>{card.desc}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.52rem', color: card.color, fontStyle: 'italic', borderTop: `1px solid ${card.color}30`, paddingTop: '0.2rem' }}>{card.proverb}</div>
        </>
      )}

      {/* Rarity dot */}
      <div style={{ position: 'absolute', bottom: small ? 3 : 5, right: small ? 3 : 5, width: 5, height: 5, borderRadius: '50%', background: RARITY_COLORS[card.rarity] }} />
    </div>
  )
}

// ── AI Logic ──────────────────────────────────────────────────────────────────
function aiChooseCard(hand, aiHp, playerHp, lastPlayed) {
  if (hand.length === 0) return null
  // Prioritise: low HP → heal, player low → attack hard, else balance
  const attacks  = hand.filter(c => c.type === 'attack').sort((a, b) => b.power - a.power)
  const defences = hand.filter(c => c.type === 'defence').sort((a, b) => b.power - a.power)
  const heals    = hand.filter(c => c.type === 'heal').sort((a, b) => b.power - a.power)
  const sankofas = hand.filter(c => c.type === 'sankofa')

  if (aiHp <= 6 && heals.length)    return heals[0]
  if (playerHp <= 5 && attacks.length) return attacks[0]
  if (aiHp <= 10 && defences.length) return defences[0]
  if (sankofas.length && Math.random() < 0.3) return sankofas[0]
  if (attacks.length) return attacks[0]
  return hand[Math.floor(Math.random() * hand.length)]
}

// ── Game Log Entry ────────────────────────────────────────────────────────────
function LogEntry({ entry }) {
  return (
    <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: entry.type === 'damage' ? '#FF6B6B' : entry.type === 'heal' ? '#6AAF7A' : entry.type === 'defence' ? '#5B9BD5' : entry.type === 'sankofa' ? '#D4AF37' : 'rgba(255,255,255,0.4)', padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', lineHeight: 1.5 }}>
      {entry.text}
    </div>
  )
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function SankofaCards() {
  const [mode,       setMode]       = useState(null) // null | 'ai' | 'pvp'
  const [phase,      setPhase]      = useState('menu') // menu | play | over
  const [turn,       setTurn]       = useState(0) // 0 = p1, 1 = p2/ai
  const [p1,         setP1]         = useState({})
  const [p2,         setP2]         = useState({})
  const [selected,   setSelected]   = useState(null)
  const [log,        setLog]        = useState([])
  const [animCard,   setAnimCard]   = useState(null)
  const [winner,     setWinner]     = useState(null)
  const [lastPlayed, setLastPlayed] = useState(null)
  const [aiThinking, setAiThinking] = useState(false)
  const [showRules,  setShowRules]  = useState(false)
  const logRef = useRef(null)

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [log])

  const addLog = useCallback((text, type = 'info') => {
    setLog(prev => [...prev.slice(-30), { text, type, id: Date.now() + Math.random() }])
  }, [])

  const initGame = useCallback((m) => {
    const d1 = buildDeck(), d2 = buildDeck()
    const { deck: deck1, hand: hand1 } = drawCards(d1, [], HAND_SIZE)
    const { deck: deck2, hand: hand2 } = drawCards(d2, [], HAND_SIZE)
    setP1({ hp: MAX_HP, deck: deck1, hand: hand1, discard: [], name: 'You', skipDraw: false })
    setP2({ hp: MAX_HP, deck: deck2, hand: hand2, discard: [], name: m === 'ai' ? 'The Ancestor' : 'Player 2', skipDraw: false })
    setTurn(0); setLog([]); setSelected(null); setWinner(null); setLastPlayed(null)
    setMode(m); setPhase('play')
    addLog('⚔ The game of ancestors begins.', 'info')
    addLog(`Draw ${HAND_SIZE} cards. Play one each turn.`, 'info')
  }, [addLog])

  const resolveCard = useCallback((card, attacker, setAttacker, defender, setDefender, isPlayer) => {
    let atkHp = attacker.hp
    let defHp = defender.hp
    let extraDraw = 0
    let defenderDiscard = false
    let swapHands = false
    let copyLast = false
    let retrieveDiscard = null

    switch (card.id) {
      case 'mmusuyidee':  extraDraw = 1; break
      case 'nyame_dua':   extraDraw = 1; break
      case 'eban':        extraDraw = 2; break
      case 'sepow':       setAttacker(prev => ({ ...prev, skipDraw: true })); break
      case 'aban':        defHp += 2; break // counter
      case 'sankofa':
        retrieveDiscard = true; break
      case 'adinkrahene': copyLast = true; break
      case 'nkyinkyim':   swapHands = true; break
      case 'kintinkantan': defenderDiscard = true; break
      case 'hwehwemudua':
        // Shuffle discard back
        setAttacker(prev => ({ ...prev, deck: shuffle([...prev.deck, ...prev.discard]), discard: [] }))
        break
    }

    // Apply power
    if (card.type === 'attack')  defHp  = Math.max(0, defHp  - card.power)
    if (card.type === 'defence') {
      // Will be used as a reactive shield — for now block is pre-emptive
      atkHp = Math.min(MAX_HP, atkHp + 0) // defence blocks next incoming
    }
    if (card.type === 'heal')    atkHp  = Math.min(MAX_HP, atkHp + card.power)
    if (card.type === 'sankofa') {
      if (card.id === 'sankofa_fire') {
        defHp = Math.max(0, defHp - card.power)
        atkHp = Math.min(MAX_HP, atkHp + 4)
      }
    }

    // Log
    if (card.type === 'attack')        addLog(`${attacker.name} plays ${card.name} — ${card.power} damage!`, 'damage')
    else if (card.type === 'defence')  addLog(`${attacker.name} raises ${card.name} — ${card.power} shield!`, 'defence')
    else if (card.type === 'heal')     addLog(`${attacker.name} calls ${card.name} — +${card.power} HP`, 'heal')
    else if (card.id === 'sankofa_fire') addLog(`𓅿 Sankofa Blaze! ${card.power} dmg + 4 heal!`, 'sankofa')
    else if (card.id === 'nkyinkyim') addLog(`꩜ Nkyinkyim! Hands swapped!`, 'sankofa')
    else if (card.id === 'adinkrahene') addLog(`◎ Adinkrahene copies last play!`, 'sankofa')
    else if (card.id === 'sankofa')   addLog(`𓅿 Sankofa — retrieving from the past...`, 'sankofa')

    // Apply extra draw
    let newAtk = { ...attacker, hp: atkHp }
    let newDef = { ...defender, hp: defHp }

    if (extraDraw > 0) {
      const res = drawCards(newAtk.deck, newAtk.hand, extraDraw)
      newAtk = { ...newAtk, deck: res.deck, hand: res.hand }
      addLog(`${attacker.name} draws ${extraDraw} extra card${extraDraw > 1 ? 's' : ''}.`, 'info')
    }

    if (defenderDiscard && newDef.hand.length > 0) {
      const idx = Math.floor(Math.random() * newDef.hand.length)
      const discarded = newDef.hand[idx]
      newDef = { ...newDef, hand: newDef.hand.filter((_, i) => i !== idx), discard: [...newDef.discard, discarded] }
      addLog(`${defender.name} is forced to discard ${discarded.name}!`, 'damage')
    }

    if (swapHands) {
      const tmpHand = newAtk.hand
      newAtk = { ...newAtk, hand: newDef.hand }
      newDef = { ...newDef, hand: tmpHand }
    }

    if (retrieveDiscard && newAtk.discard.length > 0) {
      const retrieved = newAtk.discard[newAtk.discard.length - 1]
      newAtk = { ...newAtk, discard: newAtk.discard.slice(0, -1), hand: [...newAtk.hand, retrieved] }
      addLog(`Retrieved ${retrieved.name} from the discard!`, 'sankofa')
    }

    setAttacker(newAtk)
    setDefender(newDef)

    return { atkHp, defHp }
  }, [addLog])

  const playCard = useCallback((cardIdx) => {
    if (phase !== 'play' || animCard) return
    const isP1 = turn === 0
    const attacker = isP1 ? p1 : p2
    const card = attacker.hand[cardIdx]
    if (!card) return

    setAnimCard(card)
    setLastPlayed(card)

    // Remove from hand, add to discard
    const newHand = attacker.hand.filter((_, i) => i !== cardIdx)
    const newDiscard = [...attacker.discard, card]
    const updatedAttacker = { ...attacker, hand: newHand, discard: newDiscard }

    if (isP1) {
      setP1(updatedAttacker)
      resolveCard(card, updatedAttacker, setP1, p2, setP2, true)
    } else {
      setP2(updatedAttacker)
      resolveCard(card, updatedAttacker, setP2, p1, setP1, false)
    }

    setSelected(null)

    setTimeout(() => {
      setAnimCard(null)
      // Check win
      setP1(prev => {
        setP2(prev2 => {
          if (prev2.hp <= 0) { setWinner(isP1 ? 'p1' : 'p2'); setPhase('over') }
          if (prev.hp  <= 0) { setWinner(isP1 ? 'p2' : 'p1'); setPhase('over') }
          return prev2
        })
        return prev
      })

      // Draw card for next turn
      const drawFor = (setter) => {
        setter(prev => {
          if (prev.skipDraw) { addLog(`${prev.name} skips draw this turn.`, 'info'); return { ...prev, skipDraw: false } }
          if (prev.deck.length === 0 && prev.discard.length > 0) {
            const reshuffled = shuffle(prev.discard)
            addLog(`${prev.name}'s deck reshuffled from discard!`, 'info')
            const { deck, hand } = drawCards(reshuffled, prev.hand, 1)
            return { ...prev, deck, hand, discard: [] }
          }
          const { deck, hand } = drawCards(prev.deck, prev.hand, 1)
          return { ...prev, deck, hand }
        })
      }
      if (isP1) drawFor(setP1)
      else      drawFor(setP2)

      // Switch turn
      const nextTurn = isP1 ? 1 : 0
      setTurn(nextTurn)
      addLog(`── ${nextTurn === 0 ? 'Your' : (mode === 'ai' ? "Ancestor's" : "Player 2's")} turn ──`, 'info')
    }, 700)
  }, [phase, turn, p1, p2, animCard, resolveCard, addLog, mode])

  // AI turn
  useEffect(() => {
    if (phase !== 'play' || turn !== 1 || mode !== 'ai' || animCard) return
    if (p2.hand.length === 0) return
    setAiThinking(true)
    const delay = 900 + Math.random() * 600
    const t = setTimeout(() => {
      setAiThinking(false)
      const chosenCard = aiChooseCard(p2.hand, p2.hp, p1.hp, lastPlayed)
      if (!chosenCard) return
      const idx = p2.hand.findIndex(c => c.uid === chosenCard.uid)
      if (idx >= 0) playCard(idx)
    }, delay)
    return () => clearTimeout(t)
  }, [turn, phase, mode, p2.hand, animCard])

  // ── HP Bar ────────────────────────────────────────────────────────────────
  const HpBar = ({ hp, maxHp = MAX_HP, name, isActive }) => {
    const pct = hp / maxHp
    const color = pct > 0.5 ? '#6AAF7A' : pct > 0.25 ? '#D4AF37' : '#E8758A'
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', fontWeight: 700, color: isActive ? '#D4AF37' : '#F0EDE8' }}>{name} {isActive ? '◀' : ''}</span>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color, fontWeight: 700 }}>{hp}/{maxHp}</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: '4px', transition: 'width 0.4s ease, background 0.4s' }} />
        </div>
      </div>
    )
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div style={{ minHeight: '100vh', background: '#080516', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', paddingTop: '100px' }}>
        {/* Background pattern */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(123,47,190,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px #D4AF37)' }}>𓅿</div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', color: '#D4AF37', marginBottom: '0.5rem' }}>WEST AFRICAN STRATEGY</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 7vw, 3.2rem)', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>Sankofa Cards</h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: 'rgba(240,237,232,0.4)', margin: '0 0 2rem', fontStyle: 'italic', lineHeight: 1.6 }}>
            "It is not wrong to go back for what you forgot."
          </p>

          {/* Sample cards */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[CARD_DEFS[0], CARD_DEFS[13], CARD_DEFS[6], CARD_DEFS[11]].map((c, i) => (
              <div key={c.id} style={{ animation: `cardDeal 0.4s ease ${i * 0.1}s both` }}>
                <CardFace card={c} disabled small />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => initGame('ai')}
              style={{ padding: '0.8rem 1.8rem', background: '#7B2FBE', border: '2px solid #9C4FDE', borderRadius: '10px', color: '#F0EDE8', fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #4A1A80', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >🤖 vs The Ancestor</button>
            <button onClick={() => initGame('pvp')}
              style={{ padding: '0.8rem 1.8rem', background: '#D4AF37', border: '2px solid #E8C84A', borderRadius: '10px', color: '#0A0516', fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #8B6914', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >👥 Pass & Play</button>
          </div>
          <button onClick={() => setShowRules(r => !r)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>
            {showRules ? 'hide rules' : 'how to play'}
          </button>
          {showRules && (
            <div style={{ marginTop: '1rem', padding: '1.2rem', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(212,175,55,0.2)', borderRadius: '12px', textAlign: 'left', animation: 'fadeUp 0.2s ease' }}>
              {[
                ['Goal', 'Reduce opponent\'s HP from 20 to 0.'],
                ['Turn', 'Play 1 card from your hand of 5. Draw 1 card after.'],
                ['Attack ⚔', 'Deals damage to opponent\'s HP.'],
                ['Defence 🛡', 'Blocks incoming damage — play before you get hit.'],
                ['Heal 💚', 'Restores your own HP. Some give extra draws.'],
                ['Sankofa 𓅿', 'Rare powerful cards. Each bends the rules differently.'],
              ].map(([label, text]) => (
                <div key={label} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#D4AF37', fontWeight: 700 }}>{label}: </span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <style>{`
          @keyframes cardDeal { from { opacity:0; transform: translateY(20px) rotate(-5deg); } to { opacity:1; transform: none; } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
          @keyframes flipIn { from { transform: rotateY(90deg); } to { transform: rotateY(0); } }
          @keyframes shimmer { 0%,100% { opacity:0; } 50% { opacity:1; } }
          @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        `}</style>
      </div>
    )
  }

  // ── Game Over ──────────────────────────────────────────────────────────────
  if (phase === 'over') {
    const winnerName = winner === 'p1' ? p1.name : p2.name
    return (
      <div style={{ minHeight: '100vh', background: '#080516', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.2rem', paddingTop: '80px' }}>
        <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 20px #D4AF37)' }}>𓅿</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#D4AF37', margin: 0 }}>{winnerName} wins!</h2>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', margin: 0 }}>"The ancestors are pleased."</p>
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
          <button onClick={() => initGame(mode)} style={{ padding: '0.65rem 1.4rem', background: '#7B2FBE', border: '2px solid #9C4FDE', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#F0EDE8', cursor: 'pointer', fontSize: '0.9rem' }}>Play Again</button>
          <button onClick={() => setPhase('menu')} style={{ padding: '0.65rem 1.2rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Georgia, serif', color: '#F0EDE8', cursor: 'pointer' }}>Menu</button>
        </div>
        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }`}</style>
      </div>
    )
  }

  // ── Play ──────────────────────────────────────────────────────────────────
  const isMyTurn = turn === 0
  const activePlayer = isMyTurn ? p1 : p2
  const canPlay = isMyTurn || mode === 'pvp'

  return (
    <div style={{ minHeight: '100vh', background: '#080516', paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(123,47,190,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 1rem 2rem', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#D4AF37', margin: 0 }}>𓅿 Sankofa Cards</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: isMyTurn ? '#D4AF37' : '#A78BFA', animation: 'pulse 1.5s ease infinite' }}>
              {aiThinking ? '⏳ Ancestor thinking...' : `${isMyTurn || mode === 'pvp' ? (isMyTurn ? p1.name : p2.name) + "'s turn" : ''}`}
            </span>
            <button onClick={() => setPhase('menu')} style={{ padding: '0.25rem 0.7rem', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.3)', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', cursor: 'pointer' }}>quit</button>
          </div>
        </div>

        {/* ── HP bars ── */}
        <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.9rem 1.2rem', alignItems: 'center' }}>
          <HpBar hp={p1.hp} name={p1.name} isActive={turn === 0} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>vs</div>
          <HpBar hp={p2.hp} name={p2.name} isActive={turn === 1} />
        </div>

        {/* ── Battlefield ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '0.8rem', flex: 1 }}>

          {/* Left: hands + play area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

            {/* Opponent hand (face-down for AI, face-up for PvP) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.8rem' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                {p2.name.toUpperCase()} · {p2.hand.length} cards · deck: {p2.deck.length}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {p2.hand.map((card, i) => (
                  <div key={card.uid} onClick={mode === 'pvp' && turn === 1 ? () => { setSelected(selected === i ? null : i) } : undefined}>
                    {mode === 'ai' ? (
                      <div style={{ width: 80, height: 110, borderRadius: '10px', background: 'linear-gradient(135deg, #2D1B5E, #1A0A3A)', border: '2px solid #7B2FBE40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>𓅿</div>
                    ) : (
                      <CardFace card={card} selected={mode === 'pvp' && turn === 1 && selected === i} disabled={mode === 'pvp' && turn === 0} small />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Last played area */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem', minHeight: '80px' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', flexShrink: 0 }}>LAST<br/>PLAYED</div>
              {lastPlayed ? (
                <div style={{ animation: 'cardDeal 0.3s ease' }}>
                  <CardFace card={lastPlayed} disabled small />
                </div>
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>no card played yet</div>
              )}
            </div>

            {/* Player hand */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `2px solid ${isMyTurn ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '0.8rem', transition: 'border-color 0.3s' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: isMyTurn ? '#D4AF37' : 'rgba(255,255,255,0.25)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                {p1.name.toUpperCase()} {isMyTurn ? '— YOUR TURN' : ''} · {p1.hand.length} cards · deck: {p1.deck.length}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {p1.hand.map((card, i) => (
                  <div key={card.uid} onClick={canPlay && isMyTurn ? () => setSelected(selected === i ? null : i) : undefined}>
                    <CardFace card={card} selected={isMyTurn && selected === i} disabled={!canPlay || !isMyTurn} small={false} />
                  </div>
                ))}
                {p1.hand.length === 0 && <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', padding: '1rem' }}>no cards in hand</div>}
              </div>

              {/* Play button */}
              {selected !== null && isMyTurn && (
                <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button onClick={() => playCard(selected)}
                    style={{ padding: '0.55rem 1.4rem', background: '#D4AF37', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: '#0A0516', boxShadow: '0 3px 0 #8B6914', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    ▶ Play {p1.hand[selected]?.name}
                  </button>
                  <button onClick={() => setSelected(null)} style={{ padding: '0.55rem 0.8rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', cursor: 'pointer' }}>cancel</button>
                </div>
              )}
              {/* PvP P2 play button */}
              {mode === 'pvp' && !isMyTurn && selected !== null && (
                <div style={{ marginTop: '0.8rem' }}>
                  <button onClick={() => playCard(selected)}
                    style={{ padding: '0.55rem 1.4rem', background: '#A78BFA', border: 'none', borderRadius: '8px', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: '#0A0516', boxShadow: '0 3px 0 #6D28D9' }}>
                    ▶ Play {p2.hand[selected]?.name}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: log + discard info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {/* Battle log */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>BATTLE LOG</div>
              <div ref={logRef} style={{ flex: 1, overflowY: 'auto', maxHeight: '260px' }}>
                {log.map(e => <LogEntry key={e.id} entry={e} />)}
              </div>
            </div>

            {/* Rarity guide */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.7rem' }}>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>RARITY</div>
              {Object.entries(RARITY_COLORS).map(([r, c]) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                  <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardDeal { from{opacity:0;transform:translateY(16px) rotate(-4deg);}to{opacity:1;transform:none;} }
        @keyframes flipIn   { from{transform:rotateY(90deg);}to{transform:rotateY(0);} }
        @keyframes shimmer  { 0%,100%{opacity:0;}50%{opacity:1;} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }
        @keyframes pulse    { 0%,100%{opacity:0.6;}50%{opacity:1;} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);}
      `}</style>
    </div>
  )
}