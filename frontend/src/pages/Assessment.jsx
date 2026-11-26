import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { maskEmail, maskPhone, maskId, maskName, maskAddress } from '../utils/masking'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import PrivacyNotice from '../components/PrivacyNotice'
import PasswordStrength from '../components/PasswordStrength'

const ACCOUNTS = ['Instagram', 'Facebook', 'Google', 'X/Twitter', 'LinkedIn', 'WhatsApp', 'Snapchat', 'GitHub', 'Other']
const TOTAL_STEPS = 6

const STEP_TITLES = ['Personal Details', 'Online Accounts', 'Password Habits', 'Security Practices', 'Profile Privacy', 'Review & Confirm']

function StepIndicator({ step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Step {step} of {TOTAL_STEPS}</span>
        <span className="text-sm font-bold text-blue-600">{STEP_TITLES[step - 1]}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div className="h-2 bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
      </div>
    </div>
  )
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{label}</span>
    </label>
  )
}

function AccountChip({ name, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}>
      {name}
    </button>
  )
}

export default function Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hibpData, setHibpData] = useState({ prefix: '', suffix: '' })

  const [form, setForm] = useState({
    name: '', email: '', phone: '', home_address: '', id_type: '', id_number: '',
    name_public: false, email_public: false, phone_public: false, home_address_public: false, id_details_public: false,
    accounts: [],
    password_strength: 3, passwords_reused: false, uses_password_manager: false,
    accounts_with_2fa: [], privacy_settings_reviewed: false, login_alerts_on: false,
    public_accounts: [],
  })

  const toggleAccount = (name) => {
    setForm(f => ({
      ...f,
      accounts: f.accounts.includes(name) ? f.accounts.filter(a => a !== name) : [...f.accounts, name],
      accounts_with_2fa: f.accounts_with_2fa.filter(a => a !== name),
      public_accounts: f.public_accounts.filter(a => a !== name),
    }))
  }

  const toggle2FA = (name) => {
    setForm(f => ({
      ...f,
      accounts_with_2fa: f.accounts_with_2fa.includes(name) ? f.accounts_with_2fa.filter(a => a !== name) : [...f.accounts_with_2fa, name]
    }))
  }

  const setPublicStatus = (name, status) => {
    setForm(f => ({
      ...f,
      public_accounts: status === 'Public' ? [...new Set([...f.public_accounts, name])] : f.public_accounts.filter(a => a !== name)
    }))
  }

  const handleHibpCheck = ({ prefix, suffix }) => {
    setHibpData({ prefix, suffix })
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...form,
        password_hash_prefix: hibpData.prefix,
        password_hash_suffix: hibpData.suffix,
      }
      const r = await api.post('/assessments', payload)
      navigate(`/results/${r.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card className="p-8">
        <StepIndicator step={step} />

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tell us what personal details you share online. Check the box if that detail is publicly visible.</p>
            <PrivacyNotice />
            {[
              { key: 'name', label: 'Full Name', placeholder: 'John Doe', publicKey: 'name_public' },
              { key: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email', publicKey: 'email_public' },
              { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', publicKey: 'phone_public' },
              { key: 'home_address', label: 'Home Address', placeholder: '123 Main St, City', publicKey: 'home_address_public' },
            ].map(({ key, label, placeholder, type, publicKey }) => (
              <div key={key} className="space-y-2">
                <Input label={label} type={type || 'text'} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                <CheckboxField label={`I have shared my ${label.toLowerCase()} publicly online`}
                  checked={form[publicKey]} onChange={v => setForm(f => ({ ...f, [publicKey]: v }))} />
              </div>
            ))}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input label="ID Type" placeholder="Aadhaar / PAN / Passport"
                    value={form.id_type} onChange={e => setForm(f => ({ ...f, id_type: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <Input label="ID Number" placeholder="XXXX-XXXX-XXXX"
                    value={form.id_number} onChange={e => setForm(f => ({ ...f, id_number: e.target.value }))} />
                </div>
              </div>
              <CheckboxField label="I have shared my ID details publicly online"
                checked={form.id_details_public} onChange={v => setForm(f => ({ ...f, id_details_public: v }))} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Online Accounts</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Select all platforms you have an account on.</p>
            <div className="flex flex-wrap gap-3">
              {ACCOUNTS.map(name => (
                <AccountChip key={name} name={name} selected={form.accounts.includes(name)} onClick={() => toggleAccount(name)} />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Selected: {form.accounts.length} account(s)</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Password Habits</h2>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                How strong are your passwords? <span className="font-bold text-blue-600">{strengthLabels[form.password_strength]}</span>
              </label>
              <input type="range" min={1} max={5} value={form.password_strength}
                onChange={e => setForm(f => ({ ...f, password_strength: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Very Weak</span><span>Weak</span><span>Fair</span><span>Strong</span><span>Very Strong</span>
              </div>
            </div>
            <CheckboxField label="I reuse the same password across multiple accounts"
              checked={form.passwords_reused} onChange={v => setForm(f => ({ ...f, passwords_reused: v }))} />
            <CheckboxField label="I use a password manager (Bitwarden, 1Password, etc.)"
              checked={form.uses_password_manager} onChange={v => setForm(f => ({ ...f, uses_password_manager: v }))} />
            <div className="pt-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Optional: Check a password against known breaches</p>
              <PasswordStrength onCheck={handleHibpCheck} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security Practices</h2>
            {form.accounts.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Which accounts have Two-Factor Authentication (2FA) enabled?</p>
                {form.accounts.map(acc => (
                  <CheckboxField key={acc} label={`${acc} has 2FA enabled`}
                    checked={form.accounts_with_2fa.includes(acc)} onChange={() => toggle2FA(acc)} />
                ))}
              </div>
            )}
            <CheckboxField label="I have recently reviewed privacy settings on my accounts"
              checked={form.privacy_settings_reviewed} onChange={v => setForm(f => ({ ...f, privacy_settings_reviewed: v }))} />
            <CheckboxField label="I have login/suspicious activity alerts turned on"
              checked={form.login_alerts_on} onChange={v => setForm(f => ({ ...f, login_alerts_on: v }))} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Privacy Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">For each account, what is your profile visibility?</p>
            {form.accounts.length === 0 && <p className="text-slate-400 italic">No accounts selected. Go back to Step 2 to add accounts.</p>}
            {form.accounts.map(acc => (
              <div key={acc} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{acc}</p>
                <div className="flex gap-3">
                  {['Public', 'Friends only', 'Private'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`profile-${acc}`}
                        checked={status === 'Public' ? form.public_accounts.includes(acc) : !form.public_accounts.includes(acc) && status === 'Private'}
                        onChange={() => setPublicStatus(acc, status)}
                        className="accent-blue-600 cursor-pointer" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Review & Confirm</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Please review your information before analysis. Sensitive data is shown masked.</p>
            <PrivacyNotice />
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="text-slate-500 dark:text-slate-400">Name</span><span className="font-medium dark:text-white">{form.name ? maskName(form.name) : '—'} {form.name_public ? '(Public)' : '(Private)'}</span>
                <span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium dark:text-white">{form.email ? maskEmail(form.email) : '—'} {form.email_public ? '(Public)' : '(Private)'}</span>
                <span className="text-slate-500 dark:text-slate-400">Phone</span><span className="font-medium dark:text-white">{form.phone ? maskPhone(form.phone) : '—'} {form.phone_public ? '(Public)' : '(Private)'}</span>
                <span className="text-slate-500 dark:text-slate-400">Address</span><span className="font-medium dark:text-white">{form.home_address ? maskAddress(form.home_address) : '—'} {form.home_address_public ? '(Public)' : '(Private)'}</span>
                <span className="text-slate-500 dark:text-slate-400">ID</span><span className="font-medium dark:text-white">{form.id_type} {form.id_number ? maskId(form.id_number) : ''} {form.id_details_public ? '(Public)' : '(Private)'}</span>
                <span className="text-slate-500 dark:text-slate-400">Accounts</span><span className="font-medium dark:text-white">{form.accounts.join(', ') || 'None'}</span>
                <span className="text-slate-500 dark:text-slate-400">Password</span><span className="font-medium dark:text-white">{['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][form.password_strength]} {form.passwords_reused ? '· Reused' : ''} {form.uses_password_manager ? '· Manager used' : ''}</span>
                <span className="text-slate-500 dark:text-slate-400">2FA on</span><span className="font-medium dark:text-white">{form.accounts_with_2fa.join(', ') || 'None'}</span>
                <span className="text-slate-500 dark:text-slate-400">Public profiles</span><span className="font-medium dark:text-white">{form.public_accounts.join(', ') || 'None'}</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={submitting}>← Back</Button>}
          <div className="flex-1"></div>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep(s => s + 1)}>Next →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
              {submitting ? '⏳ Analysing...' : '🔍 Analyse My Risk'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
