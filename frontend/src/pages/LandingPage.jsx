import React from 'react'
import Footer from '../components/Footer'

const FEATURES = [
  {
    icon: '🎤',
    title: 'Voice-First Application',
    desc: 'Apply for certificates using voice commands in your preferred language. No typing required.',
    color: 'bg-saffron-50 text-saffron-600',
  },
  {
    icon: '📱',
    title: 'WhatsApp Integration',
    desc: 'Complete your application through WhatsApp with guided step-by-step assistance.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: '📞',
    title: 'IVR / Call Support',
    desc: 'Apply through a phone call with interactive voice response in multiple languages.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: '🌐',
    title: 'Multilingual Support',
    desc: 'Services available in Hindi, English, and regional languages for maximum accessibility.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: '📄',
    title: '25+ Certificate Services',
    desc: 'Income, domicile, caste, solvency, nativity and many more certificate services available.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: '🔒',
    title: 'Data Sovereignty & Security',
    desc: 'Your sensitive data stays on-premise. Citizen information never leaves government servers.',
    color: 'bg-navy-50 text-navy-600',
  },
]

const STEPS = [
  { num: '01', label: 'Choose Channel', desc: 'Select Voice, WhatsApp, or IVR', icon: '🎯' },
  { num: '02', label: 'Apply & Upload', desc: 'Fill form via conversation, upload documents', icon: '📝' },
  { num: '03', label: 'Track Status', desc: 'Real-time tracking & notifications', icon: '📊' },
  { num: '04', label: 'Receive Certificate', desc: 'Download or collect your certificate', icon: '✅' },
]

const CERTIFICATES = [
  'Income Certificate',
  'Domicile Certificate',
  'Caste Certificate',
  'Solvency Certificate',
  'Nativity Certificate',
  'Character Certificate',
  'EWS Certificate',
  'Non-Creamy Layer',
]

export default function LandingPage({ onLoginClick, onSignupClick }) {
  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="gradient-hero pt-28 pb-20 sm:pt-36 sm:pb-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Floating accent shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-saffron-400/10 rounded-full blur-2xl animate-float delay-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Revenue Department — Government of India</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5 animate-fade-in-up">
              Revenue Services{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 to-saffron-300">
                Portal
              </span>
            </h1>

            <p className="text-navy-200 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto animate-fade-in-up delay-100">
              Multilingual Voice-First Certificate Services Platform.
              Apply for income, domicile, caste, and 25+ certificates through
              <strong className="text-white"> voice</strong>,
              <strong className="text-white"> WhatsApp</strong>, or
              <strong className="text-white"> phone call</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
              <button onClick={onSignupClick} className="btn-primary text-base px-8 py-3.5">
                Get Started — It's Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={onLoginClick} className="btn-secondary text-base px-8 py-3.5">
                Sign In to Portal
              </button>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in-up delay-300">
              {[
                { val: '25+', label: 'Certificates' },
                { val: '10+', label: 'Languages' },
                { val: '3', label: 'Channels' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display font-bold text-2xl sm:text-3xl text-saffron-400">{s.val}</div>
                  <div className="text-navy-300 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="services" className="py-20 sm:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-divider mb-4" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-800 mb-3">
              Platform Features
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A unified, accessible, and secure platform for all revenue department certificate services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center text-2xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-navy-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AVAILABLE SERVICES ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-800 mb-3">
              Available Certificate Services
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Apply for any of the following certificates through your preferred channel.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {CERTIFICATES.map((c, i) => (
              <span
                key={c}
                className="bg-navy-50 text-navy-700 px-4 py-2 rounded-full text-sm font-medium border border-navy-100 hover:bg-saffron-50 hover:text-saffron-700 hover:border-saffron-200 transition-all cursor-default animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {c}
              </span>
            ))}
            <span className="bg-saffron-50 text-saffron-600 px-4 py-2 rounded-full text-sm font-semibold border border-saffron-200">
              + 17 more
            </span>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 sm:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-divider mb-4" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-800 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Four simple steps to get your certificate — through any channel you prefer.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div
                  className="text-center max-w-[200px] animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-3xl mx-auto mb-4 hover:shadow-xl transition-shadow">
                    {s.icon}
                  </div>
                  <div className="text-saffron-500 font-display font-bold text-xs mb-1">STEP {s.num}</div>
                  <h4 className="font-display font-semibold text-navy-800 mb-1">{s.label}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed m-0">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block step-connector mx-4 mt-[-2rem]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 sm:py-20 gradient-hero relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center px-4 relative">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Create your account and apply for certificates in minutes — using voice, WhatsApp, or phone call.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onSignupClick} className="btn-primary text-base px-8 py-3.5">
              Create Free Account
            </button>
            <button onClick={onLoginClick} className="btn-secondary text-base px-8 py-3.5">
              Sign In
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
