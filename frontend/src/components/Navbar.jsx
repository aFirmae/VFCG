import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function Navbar({ onLoginClick, onSignupClick }) {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-navy-800/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 no-underline" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-full bg-saffron-500 flex items-center justify-center text-white font-bold font-display text-lg shadow-lg">
              RS
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-display font-semibold text-sm leading-tight">
                Revenue Services Portal
              </div>
              <div className="text-navy-200 text-xs">Government of India</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-navy-200 hover:text-white text-sm font-medium transition-colors duration-200 no-underline"
            >
              Home
            </Link>
            <a
              href="#services"
              className="text-navy-200 hover:text-white text-sm font-medium transition-colors duration-200 no-underline"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-navy-200 hover:text-white text-sm font-medium transition-colors duration-200 no-underline"
            >
              How It Works
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-8 h-8 rounded-full bg-saffron-500/20 border border-saffron-500/40 flex items-center justify-center text-saffron-400 font-semibold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-navy-300 hover:text-white text-sm font-medium transition-colors cursor-pointer bg-transparent border-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="text-white hover:text-saffron-400 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="btn-primary text-sm py-2 px-5"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white bg-transparent border-none cursor-pointer p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-800/98 backdrop-blur-lg border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block text-navy-200 hover:text-white text-sm font-medium py-2 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <a
              href="#services"
              className="block text-navy-200 hover:text-white text-sm font-medium py-2 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="block text-navy-200 hover:text-white text-sm font-medium py-2 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <div className="text-white text-sm font-medium py-1">
                    👤 {user?.name || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-left text-navy-300 hover:text-white text-sm font-medium py-1 bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onLoginClick(); setMobileOpen(false) }}
                    className="text-left text-white text-sm font-medium py-2 bg-transparent border-none cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { onSignupClick(); setMobileOpen(false) }}
                    className="btn-primary text-sm py-2 w-full"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
