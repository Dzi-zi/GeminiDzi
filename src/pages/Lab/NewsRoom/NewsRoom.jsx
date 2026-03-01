import { useState, useEffect, useCallback } from 'react'

// ── Config — drop your keys here ─────────────────────────────────────────────
// Get a free NewsAPI key at https://newsapi.org (free tier: 100 req/day)
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || ''
const CLAUDE_KEY   = import.meta.env.VITE_CLAUDE_API_KEY || ''

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'technology',  label: 'Technology',  icon: '💻', color: '#0097A7', query: 'technology OR programming OR AI OR software' },
  { id: 'design',      label: 'Design',      icon: '✏️', color: '#E8758A', query: 'design OR UX OR UI OR typography OR branding' },
  { id: 'science',     label: 'Science',     icon: '🔬', color: '#6AAF7A', query: 'science OR research OR discovery OR space' },
  { id: 'culture',     label: 'Culture',     icon: '🎭', color: '#D4AF37', query: 'culture OR art OR music OR film OR literature' },
  { id: 'business',    label: 'Business',    icon: '📈', color: '#5B9BD5', query: 'business OR startup OR economy OR finance' },
  { id: 'africa',      label: 'Africa',      icon: '🌍', color: '#FF6B35', query: 'Africa OR Nigerian OR Ghanaian OR Kenyan OR African' },
  { id: 'health',      label: 'Health',      icon: '❤️', color: '#A78BFA', query: 'health OR medicine OR wellness OR mental health' },
  { id: 'climate',     label: 'Climate',     icon: '🌱', color: '#4ECDC4', query: 'climate OR environment OR sustainability OR green energy' },
]

const REGIONS = [
  { id: '',   label: 'Global'        },
  { id: 'us', label: 'United States' },
  { id: 'gb', label: 'UK'            },
  { id: 'ng', label: 'Nigeria'       },
  { id: 'gh', label: 'Ghana'         },
  { id: 'za', label: 'South Africa'  },
  { id: 'ke', label: 'Kenya'         },
  { id: 'fr', label: 'France'        },
  { id: 'de', label: 'Germany'       },
  { id: 'au', label: 'Australia'     },
]

// ── NewsAPI fetch ─────────────────────────────────────────────────────────────
async function fetchNews(query, region = '', pageSize = 12) {
  if (!NEWS_API_KEY) return { articles: DEMO_ARTICLES, demo: true }
  try {
    const params = new URLSearchParams({
      q: query, pageSize,
      sortBy: 'publishedAt',
      language: 'en',
      apiKey: NEWS_API_KEY,
    })
    if (region) params.set('country', region)
    const endpoint = region
      ? `https://newsapi.org/v2/top-headlines?${params}`
      : `https://newsapi.org/v2/everything?${params}`
    const res  = await fetch(endpoint)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'NewsAPI error')
    return { articles: data.articles || [], demo: false }
  } catch (e) {
    console.error(e)
    return { articles: DEMO_ARTICLES, demo: true }
  }
}

// ── Claude AI summary ─────────────────────────────────────────────────────────
async function summariseArticle(title, description, content) {
  if (!CLAUDE_KEY) return 'Add your VITE_CLAUDE_API_KEY to enable AI summaries.'
  const text = [title, description, content].filter(Boolean).join('\n\n').slice(0, 3000)
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
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Summarise this news article in 3 punchy bullet points. Be direct, no fluff. Start each point with a relevant emoji.\n\n${text}`,
      }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Could not generate summary.'
}

// ── Demo articles (shown when no API key) ─────────────────────────────────────
const DEMO_ARTICLES = [
  { title: 'The Quiet Revolution in African Tech', description: 'How a new generation of engineers from Lagos to Nairobi is reshaping what it means to build software for the continent — and for the world.', source: { name: 'Tech Insider' }, publishedAt: new Date().toISOString(), url: '#', urlToImage: null, author: 'Amara Osei' },
  { title: 'Design Systems Are Eating the World', description: 'Every major company now runs on a design system. But are they making interfaces better, or just more uniform? The case for and against.', source: { name: 'Design Weekly' }, publishedAt: new Date(Date.now() - 3600000).toISOString(), url: '#', urlToImage: null, author: 'Zara Mensah' },
  { title: 'What Generative AI Actually Costs', description: 'The compute bills are astronomical. The environmental footprint is contested. A clear-eyed look at what powering the AI boom really means.', source: { name: 'The Register' }, publishedAt: new Date(Date.now() - 7200000).toISOString(), url: '#', urlToImage: null, author: 'James Hartley' },
  { title: 'Music as Memory: The Science of Nostalgia', description: 'Researchers have mapped which parts of the brain activate when we hear a song from our past. The findings are stranger than expected.', source: { name: 'Science Daily' }, publishedAt: new Date(Date.now() - 10800000).toISOString(), url: '#', urlToImage: null, author: 'Dr. Fatima Nwosu' },
  { title: 'Lagos as a Model City for 2040', description: 'Urban planners are increasingly looking to Lagos not as a problem to be solved but as a prototype for how megacities can adapt and thrive.', source: { name: 'City Lab' }, publishedAt: new Date(Date.now() - 14400000).toISOString(), url: '#', urlToImage: null, author: 'Emeka Okonkwo' },
  { title: 'The Typography Renaissance', description: 'Variable fonts, fluid type scales, optical sizing — the web is finally catching up to print in how it handles type. A tour of what\'s possible now.', source: { name: 'Smashing Magazine' }, publishedAt: new Date(Date.now() - 18000000).toISOString(), url: '#', urlToImage: null, author: 'Klara Hoffman' },
  { title: 'Climate Finance: Who\'s Actually Paying?', description: 'The pledges are large. The disbursements are not. An investigation into where the money for climate adaptation in the Global South is actually going.', source: { name: 'Bloomberg Green' }, publishedAt: new Date(Date.now() - 21600000).toISOString(), url: '#', urlToImage: null, author: 'Sophie Andersen' },
  { title: 'The Case for Boring Technology', description: 'In a world chasing the newest stack, some engineers are quietly building resilient, maintainable systems with tools that are a decade old. They\'re right.', source: { name: 'Increment' }, publishedAt: new Date(Date.now() - 25200000).toISOString(), url: '#', urlToImage: null, author: 'Dan Luu' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function cleanTitle(t) {
  return t?.replace(/ - [\w\s]+$/, '').trim() || 'Untitled'
}

// ── Article card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, index, catColor, isFeatured, saved, onSave, onSummarise, summary, summarising }) {
  const [hov, setHov] = useState(false)
  const [showSum, setShowSum] = useState(false)
  const title = cleanTitle(article.title)

  const handleSummarise = async () => {
    setShowSum(true)
    if (!summary) await onSummarise()
  }

  if (isFeatured) {
    return (
      <div style={{
        gridColumn: 'span 2',
        background: '#fff', border: `2px solid ${hov ? catColor + '60' : '#E8DDD0'}`,
        borderRadius: '4px', overflow: 'hidden',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease', cursor: 'pointer',
        animation: `fadeUp 0.4s ease both`,
        borderTop: `4px solid ${catColor}`,
        position: 'relative',
      }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div style={{ padding: '1.8rem 1.8rem 1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, color: catColor, background: catColor + '18', padding: '0.15rem 0.55rem', borderRadius: '20px', letterSpacing: '0.06em' }}>FEATURED</span>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090' }}>{article.source?.name}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); onSave() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: saved ? 1 : 0.3, transition: 'opacity 0.15s' }}
              title={saved ? 'Saved' : 'Save for later'}
            >{saved ? '🔖' : '🔖'}</button>
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 700, color: '#1A0E00', margin: '0 0 0.7rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{title}</h2>
          {article.description && <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#6A5040', margin: '0 0 1rem', lineHeight: 1.7 }}>{article.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              {article.author && <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#B0A090' }}>{article.author.split(',')[0]}</span>}
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#C8C0B8' }}>{timeAgo(article.publishedAt)}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSummarise}
                style={{ padding: '0.35rem 0.8rem', background: showSum ? catColor + '15' : '#F5F0EA', border: `2px solid ${showSum ? catColor : '#E8DDD0'}`, borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: showSum ? catColor : '#A09080', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 700 }}>
                {summarising ? '⏳ reading...' : '✦ AI summary'}
              </button>
              {article.url !== '#' && (
                <a href={article.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '0.35rem 0.8rem', background: catColor, border: 'none', borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#fff', cursor: 'pointer', textDecoration: 'none', fontWeight: 700, boxShadow: `0 2px 0 ${catColor}88` }}>
                  read →
                </a>
              )}
            </div>
          </div>
          {showSum && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: catColor + '0A', border: `2px solid ${catColor}25`, borderRadius: '8px' }}>
              {summarising ? (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: catColor, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
                </div>
              ) : (
                <pre style={{ fontFamily: 'Georgia, serif', fontSize: '0.82rem', color: '#4A3020', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{summary}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', border: `2px solid ${hov ? catColor + '50' : '#EEE5DB'}`,
      borderRadius: '4px', padding: '1.2rem',
      boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.07)' : '0 1px 6px rgba(0,0,0,0.04)',
      transition: 'all 0.18s ease',
      animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      borderTop: `3px solid ${catColor}`,
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090' }}>{article.source?.name}</span>
          <button onClick={onSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: saved ? 1 : 0.25, transition: 'opacity 0.15s', padding: '0 0 0 0.4rem' }}>🔖</button>
        </div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1A0E00', margin: '0 0 0.5rem', lineHeight: 1.35, letterSpacing: '-0.01em' }}>{title}</h3>
        {article.description && <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: '#8A7060', margin: '0 0 0.8rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.description}</p>}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#C0B0A0' }}>{timeAgo(article.publishedAt)}</span>
          {article.author && <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#C0B0A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{article.author.split(',')[0]}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleSummarise}
            style={{ flex: 1, padding: '0.32rem 0', background: showSum ? catColor + '12' : '#F5F0EA', border: `2px solid ${showSum ? catColor : '#E8DDD0'}`, borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: showSum ? catColor : '#A09080', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
            {summarising ? '⏳' : '✦ AI'}
          </button>
          {article.url !== '#' && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              style={{ flex: 2, padding: '0.32rem 0', background: catColor, borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#fff', cursor: 'pointer', textDecoration: 'none', fontWeight: 700, textAlign: 'center', boxShadow: `0 2px 0 ${catColor}88` }}>
              read →
            </a>
          )}
        </div>
        {showSum && (
          <div style={{ marginTop: '0.7rem', padding: '0.7rem', background: catColor + '08', border: `2px solid ${catColor}20`, borderRadius: '7px' }}>
            {summarising ? (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: catColor, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            ) : (
              <pre style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: '#4A3020', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{summary}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Saved panel ───────────────────────────────────────────────────────────────
function SavedPanel({ saved, articles, onRemove, onClose }) {
  const savedArticles = articles.filter(a => saved.includes(a.url))
  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '340px', background: '#FAF6F0', borderLeft: '2px solid #E8DDD0', zIndex: 200, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.08)', animation: 'slideIn 0.25s ease' }}>
      <div style={{ padding: '1.2rem 1.2rem 1rem', borderBottom: '2px solid #EEE5DB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#2A1A00', margin: 0 }}>Reading List</h3>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', margin: '0.1rem 0 0' }}>{savedArticles.length} saved</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B0A090', fontSize: '1.1rem' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {savedArticles.length === 0 && (
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#C0A890', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>no saved articles yet — bookmark some to read later</p>
        )}
        {savedArticles.map(a => (
          <div key={a.url} style={{ padding: '0.9rem', background: '#fff', border: '2px solid #EEE5DB', borderRadius: '8px', marginBottom: '0.6rem' }}>
            <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: 700, color: '#2A1A00', margin: '0 0 0.3rem', lineHeight: 1.35 }}>{cleanTitle(a.title)}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090' }}>{a.source?.name}</span>
              <button onClick={() => onRemove(a.url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E05070', fontSize: '0.75rem', fontFamily: '"Courier New", monospace' }}>remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NewsRoom() {
  const [activeCategory, setActiveCategory] = useState('technology')
  const [region,         setRegion]         = useState('')
  const [articles,       setArticles]       = useState([])
  const [loading,        setLoading]        = useState(false)
  const [isDemo,         setIsDemo]         = useState(false)
  const [search,         setSearch]         = useState('')
  const [searchInput,    setSearchInput]    = useState('')
  const [savedUrls,      setSavedUrls]      = useState(() => { try { return JSON.parse(localStorage.getItem('nr_saved') || '[]') } catch { return [] } })
  const [showSaved,      setShowSaved]      = useState(false)
  const [summaries,      setSummaries]      = useState({})
  const [summarising,    setSummarising]    = useState({})
  const [followedCats,   setFollowedCats]   = useState(['technology', 'design', 'africa'])

  const cat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0]

  const loadNews = useCallback(async () => {
    setLoading(true)
    setSummaries({})
    const query = search || cat.query
    const { articles: arts, demo } = await fetchNews(query, region)
    setArticles(arts.filter(a => a.title && a.title !== '[Removed]'))
    setIsDemo(demo)
    setLoading(false)
  }, [activeCategory, region, search, cat.query])

  useEffect(() => { loadNews() }, [activeCategory, region])

  useEffect(() => {
    try { localStorage.setItem('nr_saved', JSON.stringify(savedUrls)) } catch {}
  }, [savedUrls])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setTimeout(() => loadNews(), 50)
  }

  const toggleSave = (url) => {
    setSavedUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url])
  }

  const handleSummarise = async (article) => {
    const key = article.url
    setSummarising(prev => ({ ...prev, [key]: true }))
    const text = await summariseArticle(article.title, article.description, article.content)
    setSummaries(prev => ({ ...prev, [key]: text }))
    setSummarising(prev => ({ ...prev, [key]: false }))
  }

  const toggleFollow = (id) => {
    setFollowedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const displayArticles = articles.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', paddingTop: '80px' }}>

      {/* ── Masthead ── */}
      <div style={{ borderBottom: '3px double #2A1A00', padding: '1.5rem 1.5rem 1rem', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Date line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#B0A090', letterSpacing: '0.08em' }}>{today}</span>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              {isDemo && <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#E8758A', background: '#FFF0F3', border: '2px solid #F5C0CB', padding: '0.15rem 0.55rem', borderRadius: '20px' }}>demo mode — add VITE_NEWS_API_KEY</span>}
              <button onClick={() => setShowSaved(s => !s)}
                style={{ padding: '0.35rem 0.8rem', background: showSaved ? '#2A1A00' : '#fff', border: '2px solid #2A1A00', borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: showSaved ? '#F5ECD8' : '#2A1A00', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
                🔖 {savedUrls.length > 0 ? `${savedUrls.length} saved` : 'reading list'}
              </button>
              <button onClick={loadNews} style={{ padding: '0.35rem 0.8rem', background: '#fff', border: '2px solid #E8DDD0', borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#9A8070', cursor: 'pointer' }}>↺ refresh</button>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', borderTop: '2px solid #2A1A00', borderBottom: '2px solid #2A1A00', padding: '0.8rem 0', marginBottom: '1rem' }}>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 700, color: '#2A1A00', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
              The NewsRoom
            </h1>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#B0A090', margin: '0.3rem 0 0', letterSpacing: '0.1em' }}>
              CURATED · SUMMARISED · PERSONALISED
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: '500px', margin: '0 auto 1rem' }}>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="search headlines..."
              style={{ flex: 1, padding: '0.55rem 0.9rem', border: '2px solid #E8DDD0', borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#2A1A00', background: '#fff', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#2A1A00'}
              onBlur={e => e.target.style.borderColor = '#E8DDD0'}
            />
            {search && <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setTimeout(loadNews, 50) }}
              style={{ padding: '0.55rem 0.7rem', background: '#fff', border: '2px solid #E8DDD0', borderRadius: '6px', cursor: 'pointer', color: '#B0A090', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>✕</button>}
            <button type="submit"
              style={{ padding: '0.55rem 1rem', background: '#2A1A00', border: 'none', borderRadius: '6px', color: '#F5ECD8', fontFamily: '"Courier New", monospace', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 0 #00000030' }}>search</button>
          </form>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.2rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(c => (
              <button key={c.id}
                onClick={() => { setActiveCategory(c.id); setSearch(''); setSearchInput('') }}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', border: 'none', flexShrink: 0,
                  background: activeCategory === c.id ? c.color : '#fff',
                  color: activeCategory === c.id ? '#fff' : '#9A8070',
                  fontFamily: 'Georgia, serif', fontSize: '0.82rem',
                  fontWeight: activeCategory === c.id ? 700 : 400,
                  boxShadow: activeCategory === c.id ? `0 2px 0 ${c.color}88` : '0 1px 4px rgba(0,0,0,0.06)',
                  border: `2px solid ${activeCategory === c.id ? c.color : '#E8DDD0'}`,
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                <span>{c.icon}</span> {c.label}
                {followedCats.includes(c.id) && <span style={{ fontSize: '0.5rem', opacity: 0.7 }}>●</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub-bar: region + follow ── */}
      <div style={{ background: '#F0EBE3', borderBottom: '1px solid #E8DDD0', padding: '0.6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', letterSpacing: '0.08em' }}>REGION</span>
            <select value={region} onChange={e => setRegion(e.target.value)}
              style={{ padding: '0.3rem 0.6rem', border: '2px solid #E8DDD0', borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#2A1A00', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <button onClick={() => toggleFollow(activeCategory)}
            style={{ padding: '0.3rem 0.8rem', background: followedCats.includes(activeCategory) ? '#2A1A00' : '#fff', border: '2px solid #2A1A00', borderRadius: '6px', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: followedCats.includes(activeCategory) ? '#F5ECD8' : '#2A1A00', cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
            {followedCats.includes(activeCategory) ? '✓ following' : '+ follow'}
          </button>
        </div>
      </div>

      {/* ── Article grid ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '4px', height: '28px', background: cat.color, borderRadius: '2px' }} />
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#2A1A00', margin: 0 }}>
              {search ? `results for "${search}"` : `${cat.icon} ${cat.label}`}
            </h2>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#B0A090', margin: 0 }}>
              {loading ? 'loading...' : `${displayArticles.length} articles`}{region ? ` · ${REGIONS.find(r => r.id === region)?.label}` : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '220px', background: '#fff', border: '2px solid #EEE5DB', borderRadius: '4px', borderTop: `3px solid ${cat.color}30`, animation: `shimmer 1.5s ease ${i * 0.1}s infinite alternate` }} />
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#C0A890', fontStyle: 'italic' }}>no articles found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', alignItems: 'start' }}>
            {displayArticles.map((article, i) => (
              <ArticleCard
                key={article.url + i}
                article={article}
                index={i}
                catColor={cat.color}
                isFeatured={i === 0}
                saved={savedUrls.includes(article.url)}
                onSave={() => toggleSave(article.url)}
                onSummarise={() => handleSummarise(article)}
                summary={summaries[article.url]}
                summarising={summarising[article.url]}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Saved panel ── */}
      {showSaved && (
        <SavedPanel
          saved={savedUrls}
          articles={articles}
          onRemove={url => setSavedUrls(prev => prev.filter(u => u !== url))}
          onClose={() => setShowSaved(false)}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes shimmer {
          from { opacity: 0.5; }
          to   { opacity: 0.9; }
        }
        select::-webkit-scrollbar { width: 4px; }
        input::placeholder { color: #C8B8A8; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  )
}