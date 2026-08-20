import React, { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import LandingPage from './pages/LandingPage'
import PortalSelect from './pages/PortalSelect'
import Dashboard from './pages/Dashboard'

/* ===== Auth Context ===== */
const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [portalType, setPortalType] = useState(null) // 'citizen' | 'admin'

  const isLoggedIn = !!user

  const login = (userData) => setUser(userData)
  const signup = (userData) => setUser(userData)
  const logout = () => {
    setUser(null)
    setPortalType(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, portalType, setPortalType }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ===== Protected Route ===== */
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/" replace />
  return children
}

/* ===== App Shell ===== */
export default function App() {
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })

  const openLogin = () => setAuthModal({ open: true, mode: 'login' })
  const openSignup = () => setAuthModal({ open: true, mode: 'signup' })
  const closeAuth = () => setAuthModal({ open: false, mode: 'login' })

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar onLoginClick={openLogin} onSignupClick={openSignup} />
        <AuthModal
          isOpen={authModal.open}
          onClose={closeAuth}
          initialMode={authModal.mode}
        />
        <Routes>
          <Route
            path="/"
            element={<LandingPage onLoginClick={openLogin} onSignupClick={openSignup} />}
          />
          <Route
            path="/select-portal"
            element={
              <ProtectedRoute>
                <PortalSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}
