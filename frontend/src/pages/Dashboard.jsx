import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import Footer from '../components/Footer'

const CHANNELS = [
  {
    id: 'voice',
    icon: '🎤',
    title: 'Voice First',
    desc: 'Apply using voice commands in your preferred language. Simply speak to fill forms — our AI assistant guides you through every step.',
    color: 'bg-gradient-to-br from-saffron-50 to-orange-50',
    iconBg: 'bg-gradient-to-br from-saffron-500 to-saffron-400',
    border: 'hover:border-saffron-400',
    tags: ['Hands-free', 'Multilingual', 'AI Guided'],
    tagColor: 'bg-saffron-50 text-saffron-600',
  },
  {
    id: 'whatsapp',
    icon: '📱',
    title: 'WhatsApp',
    desc: 'Apply through WhatsApp with step-by-step guided assistance. Chat, share documents, and receive updates — all in WhatsApp.',
    color: 'bg-gradient-to-br from-green-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    border: 'hover:border-green-400',
    tags: ['Chat-based', 'Document Upload', 'Notifications'],
    tagColor: 'bg-green-50 text-green-600',
  },
  {
    id: 'ivr',
    icon: '📞',
    title: 'IVR / Phone Call',
    desc: 'Apply through a phone call with interactive voice response. Available 24/7 in multiple languages, accessible from any phone.',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    border: 'hover:border-blue-400',
    tags: ['24/7 Available', 'Any Phone', 'Toll-free'],
    tagColor: 'bg-blue-50 text-blue-600',
  },
]

const ADMIN_FEATURES = [
  {
    icon: '📋',
    title: 'View Applications',
    desc: 'Review all submitted certificate applications in real-time with detailed information.',
    action: '/admin/dashboard',
    color: 'bg-gradient-to-br from-navy-50 to-blue-50',
    iconBg: 'bg-gradient-to-br from-navy-700 to-navy-600',
    tags: ['Real-time', 'Searchable', 'Live Updates'],
    tagColor: 'bg-navy-50 text-navy-600',
  },
  {
    icon: '✅',
    title: 'Verify Documents',
    desc: 'Verify and approve citizen documents and applications. Comprehensive review tools at your disposal.',
    action: null,
    color: 'bg-gradient-to-br from-emerald-50 to-green-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
    tags: ['Document Review', 'Approval Workflow'],
    tagColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'View service performance metrics, application statistics, and generate comprehensive reports.',
    action: null,
    color: 'bg-gradient-to-br from-purple-50 to-violet-50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
    tags: ['Reports', 'Metrics', 'Insights'],
    tagColor: 'bg-purple-50 text-purple-600',
  },
]

export default function Dashboard() {
  const { user, portalType } = useAuth()
  const navigate = useNavigate()

  const isAdmin = portalType === 'admin'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Welcome Banner */}
      <section className="gradient-hero pt-24 pb-14 sm:pt-28 sm:pb-16 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-56 h-56 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">
                {isAdmin ? 'Admin Portal' : 'Citizen Portal'} — Active
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
              Welcome, <span className="text-saffron-400">{user?.name || 'User'}</span>
            </h1>
            <p className="text-navy-200 text-base max-w-xl">
              {isAdmin
                ? 'Manage applications, verify documents, and monitor service analytics.'
                : 'Choose your preferred channel to apply for revenue certificates.'}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 py-12 sm:py-16 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in-up delay-100">
            <div className="section-divider mb-4" />
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-800 mb-2">
              {isAdmin ? 'Admin Dashboard' : 'Choose Your Application Channel'}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              {isAdmin
                ? 'Select a function to manage certificate applications and services.'
                : 'Select how you\'d like to apply for your certificate. All channels support multilingual interaction.'}
            </p>
          </div>

          {/* ===== Admin View ===== */}
          {isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {ADMIN_FEATURES.map((feat, i) => (
                <div
                  key={feat.title}
                  className="channel-card hover:border-navy-400 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                >
                  <div className={`card-icon ${feat.iconBg} text-white shadow-lg`}>
                    <span className="text-3xl">{feat.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-navy-800 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {feat.desc}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {feat.tags.map(tag => (
                      <span key={tag} className={`${feat.tagColor} text-xs font-medium px-3 py-1 rounded-full`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    className={`${feat.action ? 'btn-primary' : 'btn-outline-navy opacity-60 cursor-not-allowed'} w-full py-3 text-sm`}
                    onClick={() => feat.action && navigate(feat.action)}
                    disabled={!feat.action}
                  >
                    {feat.action ? 'Open' : 'Coming Soon'}
                    {feat.action && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* ===== Citizen View ===== */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {CHANNELS.map((ch, i) => (
                  <div
                    key={ch.id}
                    className={`channel-card ${ch.border} animate-fade-in-up`}
                    style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                  >
                    <div className={`card-icon ${ch.iconBg} text-white shadow-lg`}>
                      <span className="text-3xl">{ch.icon}</span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-navy-800 mb-2">
                      {ch.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">
                      {ch.desc}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {ch.tags.map(tag => (
                        <span key={tag} className={`${ch.tagColor} text-xs font-medium px-3 py-1 rounded-full`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      className="btn-primary w-full py-3 text-sm"
                      onClick={() => ch.id === 'voice' && navigate('/apply/ai')}
                    >
                      Start with {ch.title}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Info */}
              <div className="mt-12 max-w-3xl mx-auto animate-fade-in-up delay-600">
                <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-xl flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-navy-800 text-sm mb-1">Not sure which channel to choose?</h4>
                    <p className="text-gray-500 text-sm m-0 leading-relaxed">
                      <strong>Voice First</strong> is recommended for the fastest experience. All channels lead to the same
                      validated certificate application — choose the one that's most comfortable for you.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
