import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
        await register(email, password)
      }
      navigate('/assess')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-100 dark:bg-blue-900 p-3 rounded-xl mb-3">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 6v6c0 5.25 3.4 10.14 8 11.35C16.6 22.14 20 17.25 20 12V6l-8-4z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Risk Scorer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Aware · Safe · Protected</p>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder={tab === 'register' ? 'Min 8 characters' : '••••••••'} />
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Demo: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">demo@example.com</code> / <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Demo@1234</code>
        </p>
      </Card>
    </div>
  )
}
