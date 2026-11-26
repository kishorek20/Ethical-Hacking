import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>© 2026 Risk Scorer – Aware, Safe, Protected</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
        </div>
      </div>
    </footer>
  )
}
