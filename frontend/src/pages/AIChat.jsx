import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../App'
import Footer from '../components/Footer'

const API_URL = 'http://localhost:8000/conversation/message'

/* Human-readable labels for field keys */
const FIELD_LABELS = {
  full_name: 'Full Name',
  date_of_birth: 'Date of Birth',
  annual_income: 'Annual Income',
  occupation: 'Occupation',
  address: 'Address',
  years_of_residence: 'Years of Residence',
  caste: 'Caste',
}

const SERVICE_LABELS = {
  income_certificate: 'Income Certificate',
  domicile_certificate: 'Domicile Certificate',
  caste_certificate: 'Caste Certificate',
}

function generateSessionId() {
  return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

/* Strip markdown bold / bullet markers so TTS reads cleanly */
function cleanForSpeech(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/[•●]/g, ',')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
}

/* Voice states */
const VS = {
  IDLE: 'IDLE',
  SPEAKING: 'SPEAKING',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
}

const AUTO_SEND_MS = 2000 // 2-second countdown before auto-send

/* ================================================================
   Main AIChat Component — Voice-First
   ================================================================ */
export default function AIChat() {
  const { user } = useAuth()
  const [sessionId] = useState(generateSessionId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [appState, setAppState] = useState({
    service: null,
    collected_fields: {},
    missing_fields: ['service'],
    validation_errors: [],
    status: 'STARTED',
  })
  const [showReview, setShowReview] = useState(false)

  /* Voice-first state */
  const [voiceMode, setVoiceMode] = useState(true)
  const [voiceStarted, setVoiceStarted] = useState(false)
  const [voiceState, setVoiceState] = useState(VS.IDLE)
  const [autoSendProgress, setAutoSendProgress] = useState(0) // 0–100
  const [isAutoSending, setIsAutoSending] = useState(false)

  /* Refs */
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const autoSendTimerRef = useRef(null)
  const autoSendIntervalRef = useRef(null)
  const spokenIndicesRef = useRef(new Set()) // track which bot messages have been spoken
  const voiceModeRef = useRef(voiceMode) // keep a ref in sync for use in callbacks
  const isLoadingRef = useRef(false)

  /* Keep refs in sync */
  useEffect(() => { voiceModeRef.current = voiceMode }, [voiceMode])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])

  /* ------------------------------------------------------------------
     SpeechRecognition setup
     ------------------------------------------------------------------ */
  const sttSupported = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    sttSupported.current = true
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      const text = final || interim
      finalTranscriptRef.current = text
      setInput(text)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setVoiceState(VS.IDLE)
    }

    recognition.onend = () => {
      setIsListening(false)
      const transcript = finalTranscriptRef.current.trim()
      if (transcript && voiceModeRef.current && !isLoadingRef.current) {
        // Start auto-send countdown
        startAutoSendCountdown(transcript)
      } else {
        setVoiceState(VS.IDLE)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------------
     Speech Synthesis (TTS)
     ------------------------------------------------------------------ */
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) return Promise.resolve()

    return new Promise((resolve) => {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text))
      utterance.rate = 1.05
      utterance.pitch = 1.0
      utterance.lang = 'en-IN'

      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      setVoiceState(VS.SPEAKING)
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  /* ------------------------------------------------------------------
     Auto-listen: start STT after TTS finishes
     ------------------------------------------------------------------ */
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isLoadingRef.current) return
    try {
      finalTranscriptRef.current = ''
      setInput('')
      recognitionRef.current.start()
      setIsListening(true)
      setVoiceState(VS.LISTENING)
    } catch {
      // recognition might already be running
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* noop */ }
    }
    setIsListening(false)
  }, [])

  /* ------------------------------------------------------------------
     Auto-send countdown
     ------------------------------------------------------------------ */
  const clearAutoSend = useCallback(() => {
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
    if (autoSendIntervalRef.current) clearInterval(autoSendIntervalRef.current)
    autoSendTimerRef.current = null
    autoSendIntervalRef.current = null
    setAutoSendProgress(0)
    setIsAutoSending(false)
  }, [])

  const startAutoSendCountdown = useCallback((transcript) => {
    clearAutoSend()
    setIsAutoSending(true)
    setAutoSendProgress(0)

    const startTime = Date.now()
    autoSendIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / AUTO_SEND_MS) * 100, 100)
      setAutoSendProgress(progress)
    }, 50)

    autoSendTimerRef.current = setTimeout(() => {
      clearAutoSend()
      // Auto-send the transcript
      doSendMessage(transcript)
    }, AUTO_SEND_MS)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cancelAutoSend = useCallback(() => {
    clearAutoSend()
    setVoiceState(VS.IDLE)
  }, [clearAutoSend])

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      clearAutoSend()
      window.speechSynthesis?.cancel()
      recognitionRef.current?.abort()
    }
  }, [clearAutoSend])

  /* ------------------------------------------------------------------
     Scroll to bottom
     ------------------------------------------------------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  /* ------------------------------------------------------------------
     Initial greeting (text bubble only — spoken when voice session starts)
     ------------------------------------------------------------------ */
  const greetingText = `Hello${user?.name ? ` ${user.name}` : ''}! 👋 I'm your AI assistant for certificate applications.\n\nYou can apply for:\n• Income Certificate\n• Domicile Certificate\n• Caste Certificate\n\nWhich certificate would you like to apply for?`

  useEffect(() => {
    setMessages([
      { role: 'bot', text: greetingText, timestamp: new Date() },
    ])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------------
     Voice-first loop: speak new bot messages → then listen
     ------------------------------------------------------------------ */
  useEffect(() => {
    if (!voiceMode || !voiceStarted) return

    const lastIdx = messages.length - 1
    if (lastIdx < 0) return
    const lastMsg = messages[lastIdx]
    if (lastMsg.role !== 'bot' || lastMsg.isError) return
    if (spokenIndicesRef.current.has(lastIdx)) return

    spokenIndicesRef.current.add(lastIdx)

    // Don't auto-listen if status is SUBMITTED or READY_FOR_REVIEW (review card is showing)
    const shouldListenAfter = appState.status !== 'SUBMITTED' && appState.status !== 'READY_FOR_REVIEW'

    ;(async () => {
      await speakText(lastMsg.text)
      if (voiceModeRef.current && shouldListenAfter && sttSupported.current) {
        // Small delay before listening
        setTimeout(() => startListening(), 400)
      } else {
        setVoiceState(VS.IDLE)
      }
    })()
  }, [messages, voiceMode, voiceStarted, speakText, startListening, appState.status])

  /* ------------------------------------------------------------------
     Send message
     ------------------------------------------------------------------ */
  const doSendMessage = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim()
    if (!text || isLoadingRef.current) return

    if (isListening) stopListening()
    clearAutoSend()
    window.speechSynthesis?.cancel()

    const userMsg = { role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setVoiceState(VS.PROCESSING)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error (${res.status})`)
      }

      const data = await res.json()

      setAppState({
        service: data.service,
        collected_fields: data.collected_fields || {},
        missing_fields: data.missing_fields || [],
        validation_errors: data.validation_errors || [],
        status: data.status,
      })

      setMessages(prev => [...prev, { role: 'bot', text: data.reply, timestamp: new Date() }])

      if (data.status === 'READY_FOR_REVIEW') {
        setShowReview(true)
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: `⚠️ Sorry, something went wrong: ${err.message}. Please try again.`,
          timestamp: new Date(),
          isError: true,
        },
      ])
      setVoiceState(VS.IDLE)
    } finally {
      setIsLoading(false)
    }
  }, [input, sessionId, isListening, stopListening, clearAutoSend]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => doSendMessage()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      clearAutoSend()
      doSendMessage()
    }
  }

  /* When user types manually, cancel auto-send */
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (isAutoSending) cancelAutoSend()
  }

  /* ------------------------------------------------------------------
     Start voice session (from overlay)
     ------------------------------------------------------------------ */
  const handleStartVoice = async () => {
    setVoiceStarted(true)
    // Speak the greeting (index 0)
    if (messages.length > 0 && messages[0].role === 'bot') {
      spokenIndicesRef.current.add(0)
      await speakText(messages[0].text)
      if (voiceModeRef.current && sttSupported.current) {
        setTimeout(() => startListening(), 400)
      } else {
        setVoiceState(VS.IDLE)
      }
    }
  }

  /* Skip voice start (text-only mode) */
  const handleSkipVoice = () => {
    setVoiceStarted(true)
    setVoiceMode(false)
  }

  /* Toggle voice mode */
  const handleVoiceToggle = () => {
    const newMode = !voiceMode
    setVoiceMode(newMode)
    if (!newMode) {
      // Turning off: stop everything
      window.speechSynthesis?.cancel()
      stopListening()
      clearAutoSend()
      setVoiceState(VS.IDLE)
    }
  }

  /* Manual mic click */
  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      clearAutoSend()
      window.speechSynthesis?.cancel()
      startListening()
    }
  }

  /* Progress sidebar fields */
  const allRequiredFields = appState.service
    ? Object.keys(FIELD_LABELS).filter(
        f => f in appState.collected_fields || appState.missing_fields.includes(f)
      )
    : []

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== Hero Banner ===== */}
      <section className="gradient-hero pt-20 pb-5 sm:pt-24 sm:pb-6 relative overflow-hidden">
        <div className="absolute top-6 right-8 w-40 h-40 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs font-medium">
                  AI Voice Assistant — {voiceMode ? 'Voice Mode' : 'Text Mode'}
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">
                {appState.service
                  ? SERVICE_LABELS[appState.service] || appState.service
                  : 'Certificate Application'}
              </h1>
              <p className="text-navy-200 text-sm max-w-xl">
                {appState.status === 'READY_FOR_REVIEW'
                  ? 'All information collected — please review your application below.'
                  : voiceMode
                  ? 'I\'ll speak each question and listen for your response.'
                  : 'Type your responses to complete the application.'}
              </p>
            </div>

            {/* Voice Mode Toggle */}
            {voiceStarted && (
              <button
                className="voice-toggle mt-2 flex-shrink-0"
                onClick={handleVoiceToggle}
                title={voiceMode ? 'Switch to text mode' : 'Switch to voice mode'}
              >
                <span>{voiceMode ? '🔊' : '🔇'}</span>
                <span className="hidden sm:inline">{voiceMode ? 'Voice On' : 'Voice Off'}</span>
                <div className={`voice-toggle-track ${voiceMode ? 'active' : ''}`}>
                  <div className="voice-toggle-knob" />
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== Voice State Bar ===== */}
      {voiceStarted && voiceMode && voiceState !== VS.IDLE && (
        <div className={`voice-state-bar ${voiceState.toLowerCase()}`}>
          {voiceState === VS.SPEAKING && (
            <>
              <div className="speaking-bars">
                <div className="speaking-bar" />
                <div className="speaking-bar" />
                <div className="speaking-bar" />
                <div className="speaking-bar" />
                <div className="speaking-bar" />
              </div>
              <span>Speaking...</span>
            </>
          )}
          {voiceState === VS.LISTENING && (
            <>
              <span className="w-2.5 h-2.5 bg-saffron-500 rounded-full animate-pulse" />
              <span>Listening — speak now...</span>
            </>
          )}
          {voiceState === VS.PROCESSING && (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              <span>Processing...</span>
            </>
          )}
        </div>
      )}

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col lg:flex-row gradient-subtle relative">
        {/* Voice Start Overlay */}
        {!voiceStarted && (
          <div className="voice-start-overlay">
            <button className="voice-start-btn mb-6" onClick={handleStartVoice}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </button>
            <h2 className="font-display font-bold text-2xl text-navy-800 mb-2 animate-fade-in-up">
              Start Voice Assistant
            </h2>
            <p className="text-gray-500 text-sm max-w-sm text-center mb-6 animate-fade-in-up delay-100">
              Tap the microphone to begin. I'll guide you through the application with voice prompts.
            </p>
            <button
              className="text-gray-400 hover:text-saffron-600 text-sm font-medium bg-transparent border-none cursor-pointer transition-colors animate-fade-in delay-300"
              onClick={handleSkipVoice}
            >
              Or continue with text only →
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="chat-messages flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot avatar */}
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-700 to-navy-600 flex items-center justify-center text-white text-xs font-bold font-display mr-3 mt-1 flex-shrink-0 shadow-md">
                      AI
                    </div>
                  )}

                  <div
                    className={`chat-bubble ${
                      msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                    } ${msg.isError ? '!border-red-300 !bg-red-50/80' : ''}`}
                  >
                    {msg.text.split('\n').map((line, li) => (
                      <React.Fragment key={li}>
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                          part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={pi}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={pi}>{part}</span>
                          )
                        )}
                        {li < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-400 flex items-center justify-center text-white text-xs font-bold font-display ml-3 mt-1 flex-shrink-0 shadow-md">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex mb-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-700 to-navy-600 flex items-center justify-center text-white text-xs font-bold font-display mr-3 mt-1 flex-shrink-0 shadow-md">
                    AI
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}

              {/* Review Card */}
              {showReview && appState.status === 'READY_FOR_REVIEW' && (
                <div className="my-6">
                  <div className="review-card max-w-lg mx-auto">
                    <div className="review-card-header">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                          ✅
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg m-0">Application Ready</h3>
                          <p className="text-white/80 text-xs m-0 mt-0.5">
                            {SERVICE_LABELS[appState.service] || appState.service}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-display font-semibold text-navy-800 text-sm mb-3">
                        Collected Information
                      </h4>
                      <div className="space-y-2.5">
                        {Object.entries(appState.collected_fields).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-gray-500 text-sm">
                              {FIELD_LABELS[key] || key}
                            </span>
                            <span className="text-navy-800 text-sm font-medium text-right">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn-primary w-full py-3 mt-5 text-sm"
                        onClick={() => {
                          setMessages(prev => [
                            ...prev,
                            {
                              role: 'bot',
                              text: '🎉 Your application has been submitted successfully! You will receive a confirmation and tracking ID shortly. Thank you for using the Revenue Services Portal.',
                              timestamp: new Date(),
                            },
                          ])
                          setShowReview(false)
                          setAppState(prev => ({ ...prev, status: 'SUBMITTED' }))
                        }}
                      >
                        Submit Application
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ===== Input Area ===== */}
          {appState.status !== 'SUBMITTED' && voiceStarted && (
            <div className="chat-input-bar">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  {/* Mic Button */}
                  {sttSupported.current && (
                    <button
                      type="button"
                      className={`mic-btn ${isListening ? 'recording' : ''} ${
                        voiceMode && isListening ? 'listening-ring' : ''
                      }`}
                      onClick={handleMicClick}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      {isListening ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg
                          width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <rect x="9" y="2" width="6" height="11" rx="3" />
                          <path d="M5 10a7 7 0 0 0 14 0" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                          <line x1="8" y1="22" x2="16" y2="22" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      className="form-input pr-4"
                      placeholder={
                        isListening
                          ? 'Listening... speak now'
                          : voiceMode
                          ? 'Or type your response here...'
                          : 'Type your message...'
                      }
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                    />
                    {isListening && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-500 text-xs font-medium">REC</span>
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    className="send-btn"
                    onClick={() => { clearAutoSend(); doSendMessage() }}
                    disabled={!input.trim() || isLoading}
                    title="Send message"
                    aria-label="Send message"
                  >
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>

                {/* Auto-send countdown */}
                {isAutoSending && (
                  <div className="mt-2 animate-fade-in">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="auto-send-bar h-full m-0"
                        style={{ width: `${autoSendProgress}%` }}
                      />
                    </div>
                    <div className="auto-send-label">
                      <span className="text-xs text-gray-400">
                        Sending automatically...
                      </span>
                      <button
                        className="text-xs text-saffron-600 hover:text-saffron-700 font-semibold bg-transparent border-none cursor-pointer"
                        onClick={cancelAutoSend}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Voice mode hint */}
                {voiceMode && !isListening && !isAutoSending && !isLoading && voiceState === VS.IDLE && (
                  <p className="text-xs text-gray-400 text-center mt-2 m-0">
                    🎤 Voice mode is on — questions are spoken aloud and I'll listen for your answers
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Progress Sidebar ===== */}
        {appState.service && allRequiredFields.length > 0 && (
          <div className="progress-panel w-full lg:w-80 p-5 lg:pt-8 order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              {/* Service badge */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-saffron-50 to-orange-50 flex items-center justify-center text-lg shadow-sm">
                  📄
                </div>
                <div>
                  <p className="text-xs text-gray-500 m-0 leading-none mb-0.5">Applying for</p>
                  <p className="text-sm font-display font-semibold text-navy-800 m-0">
                    {SERVICE_LABELS[appState.service] || appState.service}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">Progress</span>
                  <span className="text-xs font-semibold text-saffron-600">
                    {Object.keys(appState.collected_fields).length} / {allRequiredFields.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        allRequiredFields.length
                          ? (Object.keys(appState.collected_fields).length / allRequiredFields.length) * 100
                          : 0
                      }%`,
                      background: 'linear-gradient(90deg, #E87722, #f49240)',
                    }}
                  />
                </div>
              </div>

              {/* Field checklist */}
              <h4 className="font-display font-semibold text-navy-800 text-xs uppercase tracking-wider mb-3">
                Required Fields
              </h4>
              <div>
                {allRequiredFields.map((field) => {
                  const isDone = field in appState.collected_fields
                  return (
                    <div key={field} className="progress-field">
                      <div className={`progress-check ${isDone ? 'done' : 'pending'}`}>
                        {isDone ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span>–</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm m-0 ${isDone ? 'text-navy-800 font-medium' : 'text-gray-400'}`}>
                          {FIELD_LABELS[field] || field}
                        </p>
                        {isDone && (
                          <p className="text-xs text-gray-500 m-0 mt-0.5 truncate">
                            {String(appState.collected_fields[field])}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Status badge */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      appState.status === 'READY_FOR_REVIEW' || appState.status === 'SUBMITTED'
                        ? 'bg-green-500'
                        : appState.status === 'VALIDATION_FAILED'
                        ? 'bg-red-500'
                        : 'bg-saffron-500 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {appState.status === 'STARTED' && 'In Progress'}
                    {appState.status === 'READY_FOR_REVIEW' && 'Ready for Review'}
                    {appState.status === 'VALIDATION_FAILED' && 'Needs Correction'}
                    {appState.status === 'SUBMITTED' && 'Submitted'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
