import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../App'
import Footer from '../components/Footer'

const API_URL = 'http://localhost:8000'

const SERVICE_LABELS = {
  income_certificate: 'Income Certificate',
  domicile_certificate: 'Domicile Certificate',
  caste_certificate: 'Caste Certificate',
}

const SERVICE_ICONS = {
  income_certificate: '💰',
  domicile_certificate: '🏠',
  caste_certificate: '📜',
}

const SERVICE_COLORS = {
  income_certificate: { bg: 'bg-gradient-to-br from-emerald-50 to-green-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  domicile_certificate: { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  caste_certificate: { bg: 'bg-gradient-to-br from-purple-50 to-violet-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
}

const FIELD_LABELS = {
  full_name: 'Full Name',
  date_of_birth: 'Date of Birth',
  annual_income: 'Annual Income',
  occupation: 'Occupation',
  address: 'Address',
  years_of_residence: 'Years of Residence',
  caste: 'Caste',
}

const POLL_INTERVAL = 5000

export default function AdminDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [expandedRow, setExpandedRow] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/applications`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      setApplications(data)
      setError(null)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* Initial fetch + polling */
  useEffect(() => {
    fetchApplications()
    const interval = setInterval(fetchApplications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchApplications])

  /* Filtered applications */
  const filtered = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.application_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fields?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (SERVICE_LABELS[app.service] || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterService === 'all' || app.service === filterService

    return matchesSearch && matchesFilter
  })

  /* Stats */
  const totalApps = applications.length
  const incomeCount = applications.filter((a) => a.service === 'income_certificate').length
  const domicileCount = applications.filter((a) => a.service === 'domicile_certificate').length
  const casteCount = applications.filter((a) => a.service === 'caste_certificate').length

  const toggleRow = (appNo) => {
    setExpandedRow(expandedRow === appNo ? null : appNo)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== Hero Banner ===== */}
      <section className="gradient-hero pt-24 pb-10 sm:pt-28 sm:pb-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-56 h-56 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">
                Admin Portal — Live Dashboard
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
              Application <span className="text-saffron-400">Management</span>
            </h1>
            <p className="text-navy-200 text-base max-w-xl">
              Monitor and manage submitted certificate applications in real-time.
              Data refreshes every {POLL_INTERVAL / 1000} seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Stats Cards ===== */}
      <section className="relative -mt-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="admin-stats-grid">
            {/* Total */}
            <div className="admin-stat-card animate-fade-in-up delay-100">
              <div className="admin-stat-icon bg-gradient-to-br from-navy-700 to-navy-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <p className="admin-stat-label">Total Applications</p>
                <p className="admin-stat-value">{totalApps}</p>
              </div>
            </div>

            {/* Income */}
            <div className="admin-stat-card animate-fade-in-up delay-200">
              <div className="admin-stat-icon bg-gradient-to-br from-emerald-500 to-green-500">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="admin-stat-label">Income Certificates</p>
                <p className="admin-stat-value">{incomeCount}</p>
              </div>
            </div>

            {/* Domicile */}
            <div className="admin-stat-card animate-fade-in-up delay-300">
              <div className="admin-stat-icon bg-gradient-to-br from-blue-500 to-indigo-500">
                <span className="text-xl">🏠</span>
              </div>
              <div>
                <p className="admin-stat-label">Domicile Certificates</p>
                <p className="admin-stat-value">{domicileCount}</p>
              </div>
            </div>

            {/* Caste */}
            <div className="admin-stat-card animate-fade-in-up delay-400">
              <div className="admin-stat-icon bg-gradient-to-br from-purple-500 to-violet-500">
                <span className="text-xl">📜</span>
              </div>
              <div>
                <p className="admin-stat-label">Caste Certificates</p>
                <p className="admin-stat-value">{casteCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Applications Table ===== */}
      <section className="flex-1 py-8 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="admin-toolbar animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Search */}
              <div className="admin-search-wrapper">
                <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by name, app no, or certificate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter */}
              <select
                className="admin-filter-select"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
              >
                <option value="all">All Certificates</option>
                <option value="income_certificate">Income Certificate</option>
                <option value="domicile_certificate">Domicile Certificate</option>
                <option value="caste_certificate">Caste Certificate</option>
              </select>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Refresh indicator */}
              <div className="admin-refresh-badge">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              </div>

              {/* Manual refresh */}
              <button
                className="admin-refresh-btn"
                onClick={fetchApplications}
                title="Refresh now"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="admin-error-banner animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Failed to fetch applications: {error}. Retrying...</span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && applications.length === 0 && (
            <div className="admin-empty-state animate-fade-in">
              <div className="admin-empty-icon">
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E87722" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Loading applications...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && applications.length === 0 && !error && (
            <div className="admin-empty-state animate-fade-in-up delay-300">
              <div className="admin-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9eafcb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-navy-800 mb-1">No Applications Yet</h3>
              <p className="text-gray-500 text-sm max-w-sm text-center">
                Submitted applications from the Citizen Portal will appear here in real-time.
                The dashboard auto-refreshes every {POLL_INTERVAL / 1000} seconds.
              </p>
            </div>
          )}

          {/* Applications table */}
          {filtered.length > 0 && (
            <div className="admin-table-wrapper animate-fade-in-up delay-200">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Application No.</th>
                    <th>Applicant Name</th>
                    <th>Certificate Type</th>
                    <th>Date of Birth</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const colors = SERVICE_COLORS[app.service] || SERVICE_COLORS.income_certificate
                    const isExpanded = expandedRow === app.application_no

                    return (
                      <React.Fragment key={app.application_no}>
                        <tr
                          className={`admin-table-row ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleRow(app.application_no)}
                        >
                          <td>
                            <span className="admin-app-no">{app.application_no}</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="admin-avatar">
                                {app.fields?.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-navy-800">
                                {app.fields?.full_name || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`admin-service-badge ${colors.badge}`}>
                              <span>{SERVICE_ICONS[app.service] || '📄'}</span>
                              {SERVICE_LABELS[app.service] || app.service}
                            </span>
                          </td>
                          <td className="text-gray-600 text-sm">
                            {app.fields?.date_of_birth || '—'}
                          </td>
                          <td className="text-gray-500 text-sm">
                            {app.submitted_at_display || '—'}
                          </td>
                          <td>
                            <span className="admin-status-badge submitted">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              Submitted
                            </span>
                          </td>
                          <td>
                            <button className={`admin-expand-btn ${isExpanded ? 'expanded' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <tr className="admin-detail-row">
                            <td colSpan="7">
                              <div className="admin-detail-content animate-fade-in">
                                <div className="admin-detail-header">
                                  <h4 className="font-display font-semibold text-navy-800 text-sm">
                                    Application Details — {app.application_no}
                                  </h4>
                                  <span className="text-xs text-gray-400">
                                    Session: {app.session_id}
                                  </span>
                                </div>
                                <div className="admin-detail-grid">
                                  {Object.entries(app.fields || {}).map(([key, value]) => (
                                    <div key={key} className="admin-detail-field">
                                      <span className="admin-detail-label">
                                        {FIELD_LABELS[key] || key}
                                      </span>
                                      <span className="admin-detail-value">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* No results for filter */}
          {!isLoading && applications.length > 0 && filtered.length === 0 && (
            <div className="admin-empty-state animate-fade-in" style={{ marginTop: '2rem' }}>
              <div className="admin-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9eafcb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No applications match your search or filter.</p>
            </div>
          )}

          {/* Results count */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400">
                Auto-refresh active
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
