import { useState, useRef, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

async function askClaude(systemPrompt, messages) {
  // call the chat completions endpoint rather than the old /messages path
  const response = await fetch('https://api.anthropic.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      messages,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error('Claude error', response.status, data)
    throw new Error(data.error?.message || 'unknown')
  }

  // return the assistant's text content from the first choice
  return data.choices?.[0]?.message?.content ?? ''
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += `\n--- Page ${i} ---\n${pageText}`
  }
  return fullText
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadZone({ onFileUpload, isProcessing }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') onFileUpload(file)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) onFileUpload(file)
  }

  return (
    <div
      onClick={() => !isProcessing && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragOver ? '#D4AF37' : 'rgba(212,175,55,0.3)'}`,
        borderRadius: '20px',
        padding: '4rem 2rem',
        textAlign: 'center',
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        background: dragOver
          ? 'rgba(212,175,55,0.08)'
          : 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s ease',
        boxShadow: dragOver ? '0 0 40px rgba(212,175,55,0.2)' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {isProcessing ? (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', color: '#D4AF37', letterSpacing: '0.1em' }}>
            Reading your document...
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.4)', marginTop: '0.5rem' }}>
            This may take a moment for large files
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Drop your PDF here
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(245,240,232,0.45)' }}>
            or click to browse your files
          </p>
          <div style={{
            marginTop: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.2rem',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '20px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(245,240,232,0.4)',
          }}>
            <span>Supports PDF files up to 50MB</span>
          </div>
        </>
      )}
    </div>
  )
}

function ChatMessage({ role, content, isNew }) {
  const isUser = role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
      animation: isNew ? 'fadeSlideIn 0.3s ease' : 'none',
    }}>
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #7B2FBE, #D4AF37)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', flexShrink: 0, marginRight: '0.75rem',
          marginTop: '2px',
          boxShadow: '0 0 12px rgba(123,47,190,0.4)',
        }}>
          
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '0.85rem 1.1rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.12))'
          : 'rgba(255,255,255,0.05)',
        border: isUser
          ? '1px solid rgba(212,175,55,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        color: isUser ? '#F5F0E8' : 'rgba(245,240,232,0.85)',
        boxShadow: isUser ? '0 4px 15px rgba(212,175,55,0.1)' : 'none',
        whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
      {isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37, #C2185B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', flexShrink: 0, marginLeft: '0.75rem',
          marginTop: '2px',
        }}>
          
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #7B2FBE, #D4AF37)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.9rem',
      }}>
        
      </div>
      <div style={{
        padding: '0.85rem 1.1rem',
        borderRadius: '16px 16px 16px 4px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#D4AF37',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function SuggestedQuestion({ text, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => onClick(text)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.6rem 1rem',
        background: hovered ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px',
        color: hovered ? '#D4AF37' : 'rgba(245,240,232,0.6)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        lineHeight: 1.4,
      }}
    >
      {text}
    </button>
  )
}

// ── Main DocuChat Component ───────────────────────────────────────────────────
export default function DocuChat() {
  const [pdfText, setPdfText]       = useState('')
  const [fileName, setFileName]     = useState('')
  const [pageCount, setPageCount]   = useState(0)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError]           = useState('')
  const [newMsgIdx, setNewMsgIdx]   = useState(null)
  const chatEndRef = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleFileUpload = async (file) => {
    setIsProcessing(true)
    setError('')
    setMessages([])
    try {
      const text = await extractTextFromPDF(file)

      // Count pages
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPageCount(pdf.numPages)

      setPdfText(text)
      setFileName(file.name)

      // Welcome message
      const welcomeMsg = {
        role: 'assistant',
        content: `I've read "${file.name}" (${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}). I'm ready to answer any questions about it!\n\nYou can ask me to summarise it, explain specific sections, find key information, compare ideas, or anything else you need.`,
      }
      setMessages([welcomeMsg])
      setNewMsgIdx(0)
    } catch (err) {
      setError('Could not read this PDF. Please make sure it contains selectable text (not a scanned image).')
    }
    setIsProcessing(false)
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || isLoading || !pdfText) return

    setInput('')
    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setNewMsgIdx(newMessages.length - 1)
    setIsLoading(true)
    setError('')

    try {
      const systemPrompt = `You are DocuChat, an intelligent AI assistant that helps users understand documents. 
You have been given the full text of a PDF document called "${fileName}".
Answer questions about this document clearly, accurately, and helpfully.
If asked to summarise, be thorough but concise. 
If information is not in the document, say so clearly.
Format your responses with line breaks for readability when appropriate.

DOCUMENT CONTENT:
${pdfText.slice(0, 50000)}`

      const apiMessages = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))

      const reply = await askClaude(systemPrompt, apiMessages)
      const assistantMsg = { role: 'assistant', content: reply }
      setMessages(prev => {
        const updated = [...prev, assistantMsg]
        setNewMsgIdx(updated.length - 1)
        return updated
      })
    } catch (err) {
      setError('Something went wrong. Please check your API key and try again.')
    }
    setIsLoading(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearDocument = () => {
    setPdfText('')
    setFileName('')
    setPageCount(0)
    setMessages([])
    setInput('')
    setError('')
  }

  const SUGGESTED = [
    ' Summarise this document for me',
    ' What are the key points?',
    ' What is the main argument or purpose?',
    ' Are there any statistics or data mentioned?',
    ' What conclusions does it reach?',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0A14 0%, #0D0820 50%, #0A0A14 100%)',
      paddingTop: '80px',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Header ── */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '3rem 2rem 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.5em', color: 'rgba(212,175,55,0.5)', marginBottom: '0.5rem' }}>
              ✦ THE LAB ✦
            </p>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900,
              color: '#D4AF37',
              textShadow: '0 0 40px rgba(212,175,55,0.4)',
              margin: 0,
              letterSpacing: '0.05em',
            }}>
              DocuChat
            </h1>
            <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Upload any PDF and have a conversation with it
            </p>
          </div>

          {/* Powered by badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(123,47,190,0.1)',
            border: '1px solid rgba(123,47,190,0.3)',
            borderRadius: '20px',
          }}>
            <span style={{ fontSize: '0.9rem' }}></span>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#7B2FBE' }}>
              POWERED BY CLAUDE AI
            </span>
          </div>
        </div>

        {/* File info bar */}
        {fileName && (
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.2rem',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            animation: 'fadeSlideIn 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span>
              <div>
                <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#D4AF37', fontWeight: 600 }}>
                  {fileName}
                </p>
                <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>
                  {pageCount} page{pageCount !== 1 ? 's' : ''} · Ready to chat
                </p>
              </div>
            </div>
            <button
              onClick={clearDocument}
              style={{
                padding: '0.4rem 0.9rem',
                background: 'transparent',
                border: '1px solid rgba(194,24,91,0.4)',
                borderRadius: '6px',
                color: 'rgba(194,24,91,0.8)',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(194,24,91,0.1)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent' }}
            >
              ✕ CLEAR
            </button>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 4rem' }}>

        {/* Upload zone — shown when no PDF loaded */}
        {!pdfText && (
          <UploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        )}

        {/* Chat interface — shown when PDF is loaded */}
        {pdfText && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(212,175,55,0.12)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>

            {/* Chat messages */}
            <div style={{
              height: '460px',
              overflowY: 'auto',
              padding: '1.5rem',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(212,175,55,0.3) transparent',
            }}>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isNew={i === newMsgIdx}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested questions — shown after welcome message */}
            {messages.length === 1 && !isLoading && (
              <div style={{
                padding: '0 1.5rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.4)', margin: '1rem 0 0.75rem' }}>
                  SUGGESTED QUESTIONS
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {SUGGESTED.map(q => (
                    <SuggestedQuestion key={q} text={q} onClick={sendMessage} />
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your document..."
                rows={1}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '12px',
                  color: '#F5F0E8',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                  transition: 'border-color 0.2s',
                  minHeight: '42px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  width: '42px', height: '42px',
                  borderRadius: '12px',
                  background: isLoading || !input.trim()
                    ? 'rgba(212,175,55,0.1)'
                    : 'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(212,175,55,0.2))',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: isLoading || !input.trim() ? 'rgba(212,175,55,0.3)' : '#D4AF37',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: !isLoading && input.trim() ? '0 0 15px rgba(212,175,55,0.2)' : 'none',
                }}
              >
                ➤
              </button>
            </div>

            {/* Hint */}
            <div style={{ padding: '0.5rem 1.5rem 0.75rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,232,0.2)' }}>
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.2rem',
            background: 'rgba(194,24,91,0.1)',
            border: '1px solid rgba(194,24,91,0.3)',
            borderRadius: '10px',
            color: '#C2185B',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* How it works — shown when no PDF */}
        {!pdfText && !isProcessing && (
          <div style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {[
              { emoji: '', title: 'Upload', desc: 'Drop any PDF — contracts, papers, reports, books' },
              { emoji: '', title: 'AI Reads It', desc: 'Claude AI processes every page instantly' },
              { emoji: '', title: 'Ask Anything', desc: 'Chat with your document in plain English' },
              { emoji: '', title: 'Get Answers', desc: 'Summaries, key points, specific details — anything' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{emoji}</div>
                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                  {title}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.4)', lineHeight: 1.5, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}