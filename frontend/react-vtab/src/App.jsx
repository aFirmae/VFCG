import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Welcome! This is a lite chat.' },
  ])
  const [text, setText] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)
  const listRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Setup SpeechRecognition if available and voiceMode toggled on
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (voiceMode && SpeechRecognition) {
      const r = new SpeechRecognition()
      r.lang = 'en-US'
      r.interimResults = false
      r.onresult = (ev) => {
        const transcript = Array.from(ev.results).map(r => r[0].transcript).join('')
        handleSend(transcript)
      }
      r.onerror = () => setVoiceMode(false)
      r.start()
      recognitionRef.current = r
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
        recognitionRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode])

  const handleSend = async (messageText) => {
    if (!messageText || !messageText.trim()) return
    const msg = { id: Date.now(), sender: 'me', text: messageText }
    setMessages(m => [...m, msg])
    setText('')

    // Send to backend POST /
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })
    } catch (e) {
      // ignore network errors in lite mode
      console.warn('Failed to send to backend', e)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex items-center">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">WV</div>
        <div className="ml-3">
          <div className="font-semibold">WhatsLite</div>
          <div className="text-xs text-gray-500">Lite chat</div>
        </div>
        <nav className="ml-auto">
          <Link to="/tab" className="text-sm text-blue-500">Tab</Link>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden p-4">
        <div ref={listRef} className="h-full overflow-auto space-y-3 p-2">
          {messages.map(m => (
            <div key={m.id} className={`${m.sender === 'me' ? 'justify-end' : 'justify-start'} flex`}> 
              <div className={`${m.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'} max-w-[70%] p-3 rounded-lg shadow`}> 
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </main>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(text) }} className="p-3 bg-white border-t flex items-center gap-2">
        <button type="button" onClick={() => setVoiceMode(v => !v)} className={`p-2 rounded ${voiceMode ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`} aria-pressed={voiceMode}>
          {voiceMode ? '🔴 Voice' : '🎤 Voice'}
        </button>
        <input
          className="flex-1 p-2 rounded border focus:outline-none"
          placeholder={voiceMode ? 'Voice mode active — speak to send' : 'Type a message'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Send</button>
      </form>
    </div>
  )
}

function Tab() { return <div className="p-6">Tab content</div> }

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/tab" element={<Tab />} />
      </Routes>
    </div>
  )
}
