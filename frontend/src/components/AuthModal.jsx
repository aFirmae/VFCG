import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const backdropRef = useRef(null)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      setError('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, mode])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (!formData.name.trim()) return setError('Full name is required')
      if (!formData.email.trim()) return setError('Email is required')
      if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters')
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')

      signup({ name: formData.name.trim(), email: formData.email.trim() })
    } else {
      if (!formData.email.trim()) return setError('Email is required')
      if (!formData.password) return setError('Password is required')

      login({ name: formData.email.split('@')[0], email: formData.email.trim() })
    }

    onClose()
    navigate('/select-portal')
  }

  const isLogin = mode === 'login'

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Header */}
        <div className="gradient-hero px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white border-none cursor-pointer transition-all"
            aria-label="Close modal"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
          <div className="w-12 h-12 rounded-full bg-saffron-500 flex items-center justify-center text-white font-bold font-display text-xl mb-3 shadow-lg">
            RS
          </div>
          <h2 className="text-white font-display font-bold text-xl m-0">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-navy-200 text-sm mt-1 m-0">
            {isLogin
              ? 'Sign in to access Revenue Services Portal'
              : 'Register for certificate services'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoFocus={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoFocus={isLogin}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-gray-500 pt-1">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className="text-saffron-600 hover:text-saffron-700 font-semibold bg-transparent border-none cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className="text-saffron-600 hover:text-saffron-700 font-semibold bg-transparent border-none cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
