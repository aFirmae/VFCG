import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function PortalSelect() {
  const { user, setPortalType } = useAuth()
  const navigate = useNavigate()

  const handleSelect = (type) => {
    setPortalType(type)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-hero relative">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-saffron-400/10 rounded-full blur-2xl animate-float delay-500 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              Welcome{user?.name ? `, ${user.name}` : ''}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4">
            Select Your Portal
          </h1>
          <p className="text-navy-200 text-lg max-w-md mx-auto leading-relaxed">
            Choose how you'd like to access the Revenue Services Platform.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
          {/* Citizen Portal */}
          <div
            className="portal-card citizen animate-fade-in-up delay-200 flex flex-col"
            onClick={() => handleSelect('citizen')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect('citizen')}
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-saffron-50 to-orange-50 flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
              🏛️
            </div>
            <h2 className="font-display font-bold text-2xl text-navy-800 mb-3">Citizen Portal</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Apply for certificates, track your applications, upload documents, and manage your profile.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Apply', 'Track', 'Upload', 'Download'].map(tag => (
                <span key={tag} className="bg-saffron-50 text-saffron-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-saffron-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-auto">
              <button className="btn-primary w-full py-3.5 text-base">
                Enter Citizen Portal
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3 px-2">
            <div className="w-px h-20 bg-white/20" />
            <span className="text-white/50 text-sm font-semibold tracking-wider">OR</span>
            <div className="w-px h-20 bg-white/20" />
          </div>
          <div className="md:hidden flex items-center justify-center gap-4 py-2">
            <div className="h-px w-16 bg-white/20" />
            <span className="text-white/50 text-sm font-semibold tracking-wider">OR</span>
            <div className="h-px w-16 bg-white/20" />
          </div>

          {/* Admin Portal */}
          <div
            className="portal-card admin animate-fade-in-up delay-400 flex flex-col"
            onClick={() => handleSelect('admin')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect('admin')}
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
              ⚙️
            </div>
            <h2 className="font-display font-bold text-2xl text-navy-800 mb-3">Admin Portal</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Manage applications, verify citizen documents, review submissions, and view analytics dashboards.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Manage', 'Verify', 'Review', 'Analytics'].map(tag => (
                <span key={tag} className="bg-navy-50 text-navy-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-navy-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-auto">
              <button className="btn-outline-navy w-full py-3.5 text-base">
                Enter Admin Portal
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/40 text-xs mt-10 animate-fade-in delay-600">
          You can switch portals anytime from the navigation menu.
        </p>
      </div>
    </div>
  )
}
