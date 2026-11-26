import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Button from '../ui/Button'

function ShieldIcon() {
  return (
    <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L4 6v6c0 5.25 3.4 10.14 8 11.35C16.6 22.14 20 17.25 20 12V6l-8-4z"/>
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
          <ShieldIcon />
          <span className="hidden sm:block text-sm font-semibold">Risk Scorer</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link to="/assess" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">New Assessment</Link>
              <Link to="/history" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">History</Link>
            </>
          )}
          <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <Button variant="secondary" size="sm" onClick={() => { logout(); navigate('/') }}>Logout</Button>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  )
}
