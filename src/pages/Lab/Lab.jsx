import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const TOOLS = [
  {
    emoji: '📄',
    name: 'DocuChat',
    description: 'Upload any PDF and have a full AI conversation with it. Ask questions, get summaries, extract key points.',
    path: '/lab/docuchat',
    color: '#7B2FBE',
    status: 'live',
  },
  {
    emoji: '🎵',
    name: 'MoodTunes',
    description: 'Detects your emotion from your webcam and generates a matching Spotify playlist in real time.',
    path: '/lab/moodtunes',
    color: '#C2185B',
    status: 'coming',
  },
  {
    emoji: '🎞',
    name: 'AnimationStudio',
    description: 'Visual CSS animation builder. Design animations and export clean production-ready code.',
    path: '/lab/animationstudio',
    color: '#D4AF37',
    status: 'live',
  },
  {
    emoji: '💸',
    name: 'SplitEase',
    description: 'Smart bill splitter for groups. Track expenses, split fairly, send reminders, export reports.',
    path: '/lab/splitease',
    color: '#2E7D32',
    status: 'live',
  },
  {
    emoji: '💸',
    name: 'GradeCalc',
    description: 'Smart grade calculator for students. Track assignments, calculate grades, and see what you need to get.',
    path: '/lab/gradecalc',
    color: '#2E7D32',
    status: 'live',
  },
  {
    emoji: '❤️',
    name: 'HealthPulse',
    description: 'Personal health dashboard. Log workouts, meals, sleep, and get AI weekly insights.',
    path: '/lab/healthpulse',
    color: '#C2185B',
    status: 'live',
  },
  {
    emoji: '📰',
    name: 'NewsRoom',
    description: 'Personalised news aggregator that learns your preferences and summarises articles with AI.',
    path: '/lab/newsroom',
    color: '#00BCD4',
    status: 'live',
  },
]

function ToolCard({ emoji, name, description, path, color, status }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const isLive = status === 'live'

  return (
    <div
      onClick={() => isLive && navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '2rem',
        borderRadius: '16px',
        border: `1px solid ${hovered && isLive ? color + '60' : 'rgba(255,255,255,0.07)'}`,
        background: hovered && isLive
          ? `linear-gradient(135deg, ${color}15, ${color}05)`
          : 'rgba(255,255,255,0.03)',
        cursor: isLive ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: hovered && isLive ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered && isLive ? `0 16px 40px ${color}25` : 'none',
        opacity: isLive ? 1 : 0.6,
      }}
    >
      {/* Status badge */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '20px',
        background: isLive ? 'rgba(46,125,50,0.2)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isLive ? 'rgba(46,125,50,0.5)' : 'rgba(255,255,255,0.1)'}`,
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.55rem',
        letterSpacing: '0.1em',
        color: isLive ? '#4CAF50' : 'rgba(245,240,232,0.3)',
      }}>
        {isLive ? '● LIVE' : 'COMING SOON'}
      </div>

      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{emoji}</div>

      <h3 style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1rem',
        fontWeight: 700,
        color: hovered && isLive ? color : '#F5F0E8',
        letterSpacing: '0.05em',
        marginBottom: '0.6rem',
        transition: 'color 0.3s',
      }}>
        {name}
      </h3>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.85rem',
        color: 'rgba(245,240,232,0.5)',
        lineHeight: 1.6,
        margin: 0,
      }}>
        {description}
      </p>

      {isLive && hovered && (
        <div style={{
          marginTop: '1.2rem',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color,
        }}>
          OPEN TOOL →
        </div>
      )}
    </div>
  )
}

export default function Lab() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0A14 0%, #0D0820 50%, #0A0A14 100%)',
      paddingTop: '80px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.5em', color: 'rgba(212,175,55,0.5)', marginBottom: '0.75rem' }}>
            ✦ DISTRICT ✦
          </p>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#D4AF37',
            textShadow: '0 0 40px rgba(212,175,55,0.4)',
            margin: '0 0 0.5rem',
          }}>
            🛠 The Lab
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(245,240,232,0.5)', maxWidth: '500px' }}>
            Real tools that solve real problems. Every app here is fully functional and deployable.
          </p>
        </div>

        {/* Tools grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {TOOLS.map(tool => <ToolCard key={tool.name} {...tool} />)}
        </div>
      </div>
    </div>
  )
}