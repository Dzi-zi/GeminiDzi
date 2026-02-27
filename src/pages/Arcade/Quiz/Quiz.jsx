import { useState, useEffect, useRef, useCallback } from 'react'

// ── Question Bank ─────────────────────────────────────────────────────────────
const ALL_QUESTIONS = {
  africa: [
    { q: "Which ancient African empire was known as the 'Land of Gold' and controlled trans-Saharan trade routes?", options: ["Mali Empire", "Songhai Empire", "Ghana Empire", "Kush Empire"], answer: 0, fact: "The Ghana Empire (300–1200 AD) controlled gold and salt trade routes across the Sahara." },
    { q: "Who was the first democratically elected president of South Africa?", options: ["Desmond Tutu", "Nelson Mandela", "Thabo Mbeki", "Walter Sisulu"], answer: 1, fact: "Nelson Mandela became South Africa's first Black president in 1994 after 27 years in prison." },
    { q: "The Great Pyramid of Giza was built for which Pharaoh?", options: ["Ramesses II", "Tutankhamun", "Khufu", "Cleopatra"], answer: 2, fact: "The Great Pyramid was built around 2560 BC for Pharaoh Khufu and stands 138.5 metres tall." },
    { q: "Which African country was never colonised by a European power?", options: ["Ghana", "Ethiopia", "Kenya", "Nigeria"], answer: 1, fact: "Ethiopia successfully resisted Italian colonisation at the Battle of Adwa in 1896." },
    { q: "What is the longest river in Africa?", options: ["Congo River", "Niger River", "Zambezi River", "Nile River"], answer: 3, fact: "The Nile stretches 6,650 km and flows through 11 countries in northeastern Africa." },
    { q: "The ancient city of Timbuktu was a centre of learning in which empire?", options: ["Songhai Empire", "Zulu Kingdom", "Ashanti Empire", "Benin Empire"], answer: 0, fact: "Timbuktu housed the famous Sankore University, with over 25,000 students at its peak." },
    { q: "Which African leader led Ghana to independence in 1957?", options: ["Julius Nyerere", "Jomo Kenyatta", "Kwame Nkrumah", "Patrice Lumumba"], answer: 2, fact: "Kwame Nkrumah led Ghana to become the first sub-Saharan African country to gain independence." },
    { q: "The Kente cloth originates from which ethnic group?", options: ["Yoruba", "Zulu", "Akan", "Hausa"], answer: 2, fact: "Kente cloth was originally woven by the Akan people of Ghana and worn by royalty." },
    { q: "Which is the largest country in Africa by land area?", options: ["DR Congo", "Sudan", "Algeria", "Libya"], answer: 2, fact: "Algeria covers 2.38 million km², making it the largest country in Africa and the Arab world." },
    { q: "The Swahili language developed from Bantu languages mixed with which other language?", options: ["Portuguese", "Arabic", "French", "Hindi"], answer: 1, fact: "Swahili developed along the East African coast through centuries of Arab trade." },
    { q: "Who was the first African to win the Nobel Peace Prize?", options: ["Nelson Mandela", "Kofi Annan", "Albert Luthuli", "Wangari Maathai"], answer: 2, fact: "Albert Luthuli of South Africa won the Nobel Peace Prize in 1960 for his non-violent resistance." },
    { q: "The Kingdom of Kush was located in present-day which country?", options: ["Egypt", "Sudan", "Ethiopia", "Somalia"], answer: 1, fact: "Kush was a powerful ancient kingdom along the Nile in modern-day Sudan." },
    { q: "Victoria Falls borders which two countries?", options: ["Tanzania & Kenya", "Zambia & Zimbabwe", "Mozambique & Malawi", "Angola & Namibia"], answer: 1, fact: "Victoria Falls is 1.7 km wide and drops 108 metres — one of the world's natural wonders." },
    { q: "The African philosophy 'Ubuntu' roughly means what?", options: ["Strength in war", "I am because we are", "Knowledge is power", "God is great"], answer: 1, fact: "Ubuntu is a Nguni Bantu philosophy meaning 'I am because we are' — humanity through community." },
    { q: "Which city hosted the first-ever African Football World Cup?", options: ["Cairo", "Lagos", "Johannesburg", "Nairobi"], answer: 2, fact: "South Africa hosted the 2010 FIFA World Cup — the first ever held on the African continent." },
  ],
  music: [
    { q: "Which Nigerian artist is known as the pioneer of Afrobeat?", options: ["Wizkid", "Burna Boy", "Davido", "Fela Kuti"], answer: 3, fact: "Fela Kuti pioneered Afrobeat in the 1970s, blending jazz, funk, and West African rhythms with political lyrics." },
    { q: "What year did Michael Jackson release 'Thriller'?", options: ["1980", "1982", "1984", "1986"], answer: 1, fact: "Thriller (1982) is the best-selling album of all time with over 66 million copies sold worldwide." },
    { q: "Which country does 'Amapiano' music originate from?", options: ["Nigeria", "Ghana", "Kenya", "South Africa"], answer: 3, fact: "Amapiano emerged from South African townships in the early 2010s, blending house, jazz and lounge." },
    { q: "Who sang 'Halo' and 'Crazy in Love'?", options: ["Rihanna", "Beyoncé", "Alicia Keys", "Mary J. Blige"], answer: 1, fact: "Beyoncé has won 32 Grammy Awards — more than any other artist in Grammy history." },
    { q: "What does BPM stand for in music?", options: ["Bass Per Minute", "Beat Per Measure", "Beats Per Minute", "Bars Per Mix"], answer: 2, fact: "BPM measures tempo. Most dance music sits between 120–140 BPM." },
    { q: "Which legendary artist sang 'No Woman No Cry'?", options: ["Peter Tosh", "Burning Spear", "Bob Marley", "Jimmy Cliff"], answer: 2, fact: "Bob Marley is considered the father of reggae music and sold over 75 million records worldwide." },
    { q: "'Highlife' music originated from which country?", options: ["Senegal", "Ghana", "Cameroon", "Ivory Coast"], answer: 1, fact: "Highlife originated in Ghana in the early 20th century, blending indigenous rhythms with Western instruments." },
    { q: "Which artist released the album 'Scorpion' in 2018?", options: ["Kendrick Lamar", "J. Cole", "Drake", "Travis Scott"], answer: 2, fact: "Scorpion broke streaming records with 132 million Spotify streams in its first day." },
    { q: "What is the traditional musical bow of the Zulu people?", options: ["Mbira", "Kora", "Uhadi", "Djembe"], answer: 2, fact: "The Uhadi is a mouth bow played by Zulu and Xhosa women, often in healing ceremonies." },
    { q: "Which music streaming platform was founded in Sweden in 2006?", options: ["Apple Music", "Tidal", "Spotify", "Deezer"], answer: 2, fact: "Spotify was founded by Daniel Ek and Martin Lorentzon and launched publicly in 2008." },
  ],
  general: [
    { q: "What is the capital city of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], answer: 3, fact: "Ottawa has been Canada's capital since 1857, chosen by Queen Victoria for its strategic location." },
    { q: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], answer: 1, fact: "There are 8 planets after Pluto was reclassified as a dwarf planet by the IAU in 2006." },
    { q: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Caravaggio"], answer: 2, fact: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It hangs in the Louvre, Paris." },
    { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, fact: "Au comes from the Latin word 'Aurum'. Gold has been valued by humans for over 5,000 years." },
    { q: "In which year did the first iPhone launch?", options: ["2005", "2006", "2007", "2008"], answer: 2, fact: "Steve Jobs unveiled the first iPhone on January 9, 2007, calling it 'a revolutionary product'." },
    { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, fact: "The Pacific Ocean covers 165 million km² — larger than all of Earth's landmasses combined." },
    { q: "Which country invented football (soccer)?", options: ["Brazil", "Spain", "England", "Germany"], answer: 2, fact: "Modern football was codified in England in 1863 when the Football Association was founded." },
    { q: "What programming language was created by Guido van Rossum?", options: ["Java", "Ruby", "Python", "C++"], answer: 2, fact: "Python was created in 1991 and named after 'Monty Python's Flying Circus'." },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1, fact: "Honeybee combs use hexagons because they're the most efficient shape in nature." },
    { q: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], answer: 2, fact: "Vatican City covers just 0.44 km² and has a population of around 800 people." },
  ],
  riddles: [
    { q: "🌀 I have cities but no houses. Mountains but no trees. Water but no fish. What am I?", options: ["A dream", "A painting", "A map", "A mirror"], answer: 2, fact: "A map represents all these things without containing the real thing. Classic misdirection!" },
    { q: "🌀 The more you take, the more you leave behind. What am I?", options: ["Time", "Money", "Footsteps", "Memories"], answer: 2, fact: "Every step leaves a footprint — a favourite riddle across many African cultures." },
    { q: "🌀 AFRICAN RIDDLE: A woman who gives birth but has never been pregnant. What is she?", options: ["A cloud", "A river", "The earth", "An egg"], answer: 2, fact: "The earth 'gives birth' to all plants and animals — from West African oral tradition." },
    { q: "🌀 I speak without a mouth, hear without ears, have no body but come alive with wind. What am I?", options: ["A ghost", "An echo", "A shadow", "A dream"], answer: 1, fact: "An echo travels through air and speaks your words back — no mouth, no ears needed." },
    { q: "🌀 AFRICAN RIDDLE: It goes to the river and comes back dry. What is it?", options: ["A boat", "A shadow", "A fish", "A stone"], answer: 1, fact: "A shadow cannot get wet — it follows you everywhere but water can't touch it." },
    { q: "🌀 I have hands but cannot clap. A face but cannot smile. What am I?", options: ["A statue", "A clock", "A doll", "A photograph"], answer: 1, fact: "A clock has hands and a face but performs neither of their human functions." },
    { q: "🌀 AFRICAN RIDDLE: Two brothers who always run together but never catch each other. What?", options: ["Day & night", "Left & right foot", "Sun & moon", "Fire & water"], answer: 1, fact: "Your two feet run together forever but left can never catch right — a Ghanaian riddle." },
    { q: "🌀 The more you dry me, the wetter I get. What am I?", options: ["Mud", "A sponge", "A towel", "Rain"], answer: 2, fact: "A towel absorbs water as it dries things, getting wetter the more it works." },
    { q: "🌀 I fly with no wings and cry with no eyes. What am I?", options: ["A kite", "A cloud", "The wind", "Smoke"], answer: 1, fact: "A cloud floats through the sky without wings and produces rain — its tears." },
    { q: "🌀 I have keys but no locks, space but no room, Enter but you can't go inside. What am I?", options: ["A piano", "A map", "A keyboard", "A dictionary"], answer: 2, fact: "A keyboard has keys, a spacebar, and Enter — but you can't physically enter any of them!" },
  ],
}

const CATEGORIES = [
  { id: 'africa',  label: 'Africa Mode',       emoji: '🌍', desc: 'History · Culture · Leaders · Geography', color: '#E8B84B', bg: '#1C1400' },
  { id: 'music',   label: 'Music Trivia',       emoji: '🎵', desc: 'Global artists · Genres · Music facts',    color: '#E84B7A', bg: '#1C0008' },
  { id: 'general', label: 'General Knowledge',  emoji: '🧩', desc: 'Science · World facts · Pop culture',      color: '#9B6BFF', bg: '#0E0018' },
  { id: 'riddles', label: 'Riddles',            emoji: '🌀', desc: 'African riddles · Brain teasers · Tricks', color: '#4BE8A0', bg: '#001C10' },
  { id: 'mixed',   label: 'Mixed Bag',          emoji: '🎲', desc: 'Everything. Shuffled. Good luck.',         color: '#FF7A4B', bg: '#1C0A00' },
]

const TOTAL_QUESTIONS = 20
const TIME_PER_Q = 30

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getQuestions(id) {
  if (id === 'mixed') return shuffle(Object.values(ALL_QUESTIONS).flat()).slice(0, TOTAL_QUESTIONS)
  return shuffle(ALL_QUESTIONS[id] || []).slice(0, TOTAL_QUESTIONS)
}

// ── Category Select ───────────────────────────────────────────────────────────
function CategorySelect({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{
          display: 'inline-block',
          background: '#E8B84B', color: '#0A0800',
          fontFamily: 'monospace', fontSize: '0.68rem',
          fontWeight: 700, letterSpacing: '0.12em',
          padding: '0.25rem 0.7rem', marginBottom: '1rem',
          transform: 'rotate(-1.2deg)',
        }}>THE ARCADE</span>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(2rem, 7vw, 3.8rem)',
          fontWeight: 700, color: '#F5F0E8',
          margin: '0 0 0.4rem', lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}>Quiz</h1>
        <p style={{
          fontFamily: 'monospace', fontSize: '0.82rem',
          color: 'rgba(245,240,232,0.38)', letterSpacing: '0.04em',
        }}>
          20 questions · 30 sec each · pick your category
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {CATEGORIES.map((cat, i) => (
          <button key={cat.id}
            onClick={() => onSelect(cat)}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.1rem',
              padding: '1rem 1.3rem',
              background: hovered === cat.id ? cat.bg : 'transparent',
              border: `2px solid ${hovered === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
              transform: hovered === cat.id ? 'translateX(5px)' : 'none',
              animation: `slideUp 0.35s ease ${i * 0.06}s both`,
            }}
          >
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{cat.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '0.98rem', fontWeight: 700,
                color: hovered === cat.id ? cat.color : '#F5F0E8',
                margin: '0 0 0.1rem', transition: 'color 0.15s',
              }}>{cat.label}</p>
              <p style={{
                fontFamily: 'monospace', fontSize: '0.7rem',
                color: 'rgba(245,240,232,0.32)', margin: 0,
              }}>{cat.desc}</p>
            </div>
            <span style={{
              fontFamily: 'monospace', fontSize: '1rem',
              color: hovered === cat.id ? cat.color : 'rgba(255,255,255,0.18)',
              transition: 'all 0.15s',
            }}>→</span>
          </button>
        ))}
      </div>
      <p style={{
        fontFamily: 'monospace', fontSize: '0.68rem',
        color: 'rgba(245,240,232,0.18)', marginTop: '2rem',
        textAlign: 'center', letterSpacing: '0.04em',
      }}>built by Moi · Questions shuffle every game</p>
    </div>
  )
}

// ── Timer Bar ─────────────────────────────────────────────────────────────────
function TimerBar({ timeLeft, total, color }) {
  const pct = (timeLeft / total) * 100
  const urgent = timeLeft <= 10
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.68rem',
          color: urgent ? '#E84B7A' : 'rgba(245,240,232,0.32)',
          letterSpacing: '0.06em', transition: 'color 0.3s',
        }}>{urgent ? '⚡ hurry!' : 'time left'}</span>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700,
          color: urgent ? '#E84B7A' : color, transition: 'color 0.3s',
        }}>{timeLeft}s</span>
      </div>
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '3px',
          background: urgent ? '#E84B7A' : color,
          transition: 'width 0.95s linear, background 0.3s',
        }} />
      </div>
    </div>
  )
}

// ── Question Screen ───────────────────────────────────────────────────────────
function QuestionScreen({ question, questionNum, total, timeLeft, onAnswer, selected, category }) {
  const letters = ['A', 'B', 'C', 'D']
  const { color, bg } = category

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <span style={{
          background: color, color: '#0A0800',
          fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700,
          padding: '0.25rem 0.65rem', borderRadius: '4px', flexShrink: 0,
        }}>{questionNum}/{total}</span>
        <div style={{ display: 'flex', gap: '3px', flex: 1, flexWrap: 'wrap' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
              background: i < questionNum ? color : 'rgba(255,255,255,0.09)',
              opacity: i < questionNum - 1 ? 0.45 : 1,
            }} />
          ))}
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.65rem',
          color: 'rgba(245,240,232,0.28)', flexShrink: 0,
        }}>{category.emoji}</span>
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <TimerBar timeLeft={timeLeft} total={TIME_PER_Q} color={color} />
      </div>

      {/* Question */}
      <div style={{
        padding: '1.6rem 1.8rem',
        background: 'rgba(255,255,255,0.04)',
        border: '2px solid rgba(255,255,255,0.09)',
        borderRadius: '10px', marginBottom: '1rem',
        animation: 'slideUp 0.28s ease',
      }}>
        <p style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1rem, 2.8vw, 1.2rem)',
          color: '#F5F0E8', lineHeight: 1.7, margin: 0,
        }}>{question.q}</p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect  = selected !== null && i === question.answer
          const isWrong    = isSelected && i !== question.answer
          let border = 'rgba(255,255,255,0.09)'
          let bgCol  = 'transparent'
          let txt    = 'rgba(245,240,232,0.78)'
          let badge  = 'rgba(255,255,255,0.07)'
          let badgeTxt = 'rgba(245,240,232,0.45)'
          if (selected !== null) {
            if (isCorrect) { border = '#4BE8A0'; bgCol = 'rgba(75,232,160,0.09)'; txt = '#F5F0E8'; badge = '#4BE8A0'; badgeTxt = '#0A0A00' }
            if (isWrong)   { border = '#E84B7A'; bgCol = 'rgba(232,75,122,0.09)'; txt = 'rgba(245,240,232,0.4)'; badge = '#E84B7A'; badgeTxt = '#fff' }
          }
          return (
            <button key={i}
              onClick={() => selected === null && onAnswer(i)}
              disabled={selected !== null}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.9rem',
                padding: '0.85rem 1.1rem',
                background: bgCol, border: `2px solid ${border}`,
                borderRadius: '8px', cursor: selected === null ? 'pointer' : 'default',
                textAlign: 'left', transition: 'all 0.13s ease',
                animation: `slideUp 0.32s ease ${i * 0.045}s both`,
              }}
              onMouseEnter={e => { if (selected === null) { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = bg } }}
              onMouseLeave={e => { if (selected === null) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'transparent' } }}
            >
              <span style={{
                width: '28px', height: '28px', background: badge, color: badgeTxt,
                borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700,
                flexShrink: 0, transition: 'all 0.13s',
              }}>
                {selected !== null && isCorrect ? '✓' : selected !== null && isWrong ? '✗' : letters[i]}
              </span>
              <span style={{
                fontFamily: 'Georgia, serif', fontSize: '0.93rem',
                color: txt, lineHeight: 1.4, transition: 'color 0.13s',
              }}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Fact Card ─────────────────────────────────────────────────────────────────
function FactCard({ fact, isCorrect, onNext, isLast, category }) {
  const { color } = category
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem', animation: 'slideUp 0.3s ease' }}>
      <div style={{
        display: 'inline-block',
        border: `3px solid ${isCorrect ? '#4BE8A0' : '#E84B7A'}`,
        color: isCorrect ? '#4BE8A0' : '#E84B7A',
        fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700,
        letterSpacing: '0.12em', padding: '0.35rem 0.9rem',
        borderRadius: '5px', transform: isCorrect ? 'rotate(-1.5deg)' : 'rotate(1.2deg)',
        marginBottom: '1.4rem',
      }}>
        {isCorrect ? '✓ correct!' : '✗ wrong!'}
      </div>

      <div style={{
        padding: '1.6rem 1.8rem',
        background: 'rgba(255,255,255,0.04)',
        border: '2px solid rgba(255,255,255,0.09)',
        borderRadius: '10px', marginBottom: '1.2rem',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '-1px', left: '1.4rem',
          background: color, color: '#0A0800',
          fontFamily: 'monospace', fontSize: '0.58rem', fontWeight: 700,
          letterSpacing: '0.1em', padding: '0.18rem 0.55rem',
          borderRadius: '0 0 4px 4px',
        }}>did you know?</div>
        <p style={{
          fontFamily: 'Georgia, serif', fontSize: '1rem',
          color: '#F5F0E8', lineHeight: 1.75, margin: '0.6rem 0 0',
        }}>{fact}</p>
      </div>

      <button onClick={onNext}
        style={{
          width: '100%', padding: '0.95rem',
          background: color, border: 'none', borderRadius: '8px',
          color: '#0A0800', fontFamily: 'monospace',
          fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em',
          cursor: 'pointer', transition: 'opacity 0.13s, transform 0.13s',
        }}
        onMouseEnter={e => { e.target.style.opacity = '0.86'; e.target.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
      >
        {isLast ? '→ see my results' : '→ next question'}
      </button>
    </div>
  )
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ score, total, category, onRestart, onChangeCategory }) {
  const pct = Math.round((score / total) * 100)
  const { color } = category
  const grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
  const msg   = pct === 100 ? 'perfect. absolutely perfect.' : pct >= 80 ? 'you really know your stuff.' : pct >= 60 ? 'solid! keep learning.' : pct >= 40 ? 'getting there. try again!' : 'everyone starts somewhere.'

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem', animation: 'slideUp 0.4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '110px', height: '110px',
          border: `4px solid ${color}`, borderRadius: '14px',
          background: `${color}15`, transform: 'rotate(-2deg)',
          marginBottom: '1.2rem',
        }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '4.5rem', fontWeight: 700, color, lineHeight: 1 }}>{grade}</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.1rem, 3.5vw, 1.7rem)', fontWeight: 700, color: '#F5F0E8', margin: '0 0 0.35rem' }}>
          {score} out of {total}
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(245,240,232,0.38)', margin: 0, letterSpacing: '0.04em' }}>{msg}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', marginBottom: '1.8rem' }}>
        {[
          { label: 'correct',  value: score,         col: '#4BE8A0' },
          { label: 'wrong',    value: total - score,  col: '#E84B7A' },
          { label: 'score',    value: `${pct}%`,     col: color },
        ].map(({ label, value, col }) => (
          <div key={label} style={{
            padding: '0.9rem 0.5rem', textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '2px solid rgba(255,255,255,0.08)', borderRadius: '8px',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.7rem', fontWeight: 700, color: col }}>{value}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(245,240,232,0.32)', marginTop: '0.15rem', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <button onClick={onRestart}
          style={{
            padding: '0.95rem', background: color, border: 'none', borderRadius: '8px',
            color: '#0A0800', fontFamily: 'monospace', fontSize: '0.82rem',
            fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'opacity 0.13s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.86'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >play again — {category.label}</button>
        <button onClick={onChangeCategory}
          style={{
            padding: '0.95rem', background: 'transparent',
            border: '2px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: 'rgba(245,240,232,0.45)', fontFamily: 'monospace',
            fontSize: '0.82rem', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.13s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,240,232,0.45)' }}
        >← change category</button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UbuntuQuiz() {
  const [screen,    setScreen]    = useState('category')
  const [category,  setCategory]  = useState(null)
  const [questions, setQuestions] = useState([])
  const [qIndex,    setQIndex]    = useState(0)
  const [score,     setScore]     = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [timeLeft,  setTimeLeft]  = useState(TIME_PER_Q)
  const timerRef = useRef(null)

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(TIME_PER_Q)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setSelected(-1); setScreen('fact'); return 0 }
        return t - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => clearTimer(), [])

  const handleCategorySelect = (cat) => {
    const qs = getQuestions(cat.id)
    setCategory(cat); setQuestions(qs); setQIndex(0)
    setScore(0); setSelected(null); setScreen('game')
    setTimeout(() => startTimer(), 100)
  }

  const handleAnswer = (idx) => {
    clearTimer(); setSelected(idx)
    if (idx === questions[qIndex].answer) setScore(s => s + 1)
    setScreen('fact')
  }

  const handleNext = () => {
    const next = qIndex + 1
    if (next >= questions.length) { setScreen('results') }
    else { setQIndex(next); setSelected(null); setScreen('game'); setTimeout(() => startTimer(), 100) }
  }

  const currentQ = questions[qIndex]

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E12', paddingTop: '80px', paddingBottom: '4rem' }}>
      {screen === 'category' && <CategorySelect onSelect={handleCategorySelect} />}
      {screen === 'game' && currentQ && (
        <QuestionScreen question={currentQ} questionNum={qIndex + 1} total={questions.length}
          timeLeft={timeLeft} onAnswer={handleAnswer} selected={selected} category={category} />
      )}
      {screen === 'fact' && currentQ && (
        <FactCard fact={currentQ.fact} isCorrect={selected === currentQ.answer}
          onNext={handleNext} isLast={qIndex === questions.length - 1} category={category} />
      )}
      {screen === 'results' && (
        <ResultsScreen score={score} total={questions.length} category={category}
          onRestart={() => handleCategorySelect(category)}
          onChangeCategory={() => { clearTimer(); setScreen('category') }} />
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}