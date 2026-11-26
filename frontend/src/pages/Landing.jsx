import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const features = [
  { icon: '🛡️', title: 'Risk Score', desc: 'Get a 0–100 score based on your actual exposure, habits, and known breaches.' },
  { icon: '🔍', title: 'Factor Analysis', desc: 'See exactly which habits and exposures are raising your risk — ranked by impact.' },
  { icon: '✅', title: 'Action Plan', desc: 'Personalised, prioritised tips. Mark them done and watch your projected score drop.' },
  { icon: '📈', title: 'Track Progress', desc: 'Your history shows how your risk score improves over time as you act.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Sensitive data is masked before storage. Passwords never leave your browser.' },
  { icon: '⚡', title: 'Breach Detection', desc: 'Checks your password against 800M+ breached passwords via k-anonymity.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900">
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 6v6c0 5.25 3.4 10.14 8 11.35C16.6 22.14 20 17.25 20 12V6l-8-4z"/>
            </svg>
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white mb-4">
          Know Your <span className="text-blue-600">Privacy Risk</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-4 font-medium">Aware · Safe · Protected</p>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          Discover how much of your personal information is exposed online. Get a risk score, understand the threats, and take action with personalised tips.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate(user ? '/assess' : '/auth')}>
            {user ? '🚀 Start Assessment' : '🚀 Get Your Risk Score'}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/about')}>Learn More</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">Everything you need to stay protected</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <Card key={f.title} className="p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
