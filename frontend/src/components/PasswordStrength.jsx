import React, { useState } from 'react'
import { getHibpParts } from '../utils/passwordHash'
import api from '../api/client'

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  return { score, label: labels[score], color: colors[score] }
}

export default function PasswordStrength({ onCheck }) {
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const strength = getStrength(password)

  const checkHibp = async () => {
    if (!password) return
    setChecking(true)
    try {
      const { prefix, suffix } = await getHibpParts(password)
      const r = await api.post('/breach/password', { hash_prefix: prefix, hash_suffix: suffix })
      setResult(r.data.pwned)
      onCheck && onCheck({ pwned: r.data.pwned, strength: strength.score, prefix, suffix })
    } catch {
      setResult(null)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">🔒 Client-side only — your password never leaves your browser</p>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="Type a password to check..."
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={checkHibp} disabled={checking || !password} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50 font-medium">
          {checking ? '...' : 'Check'}
        </button>
      </div>
      {password && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">Strength</span>
            <span className="font-semibold">{strength.label}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
          </div>
        </div>
      )}
      {result !== null && (
        <div className={`mt-3 p-2 rounded-lg text-sm font-semibold ${result ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
          {result ? '⚠️ This password has been found in data breaches! Change it immediately.' : '✅ Not found in known breaches.'}
        </div>
      )}
    </div>
  )
}
