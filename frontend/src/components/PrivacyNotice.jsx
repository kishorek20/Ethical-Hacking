import React, { useState } from 'react'

export default function PrivacyNotice() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">🔐</span>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Your Privacy is Protected</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs text-blue-600 hover:underline">{open ? 'Hide' : 'Learn more'}</button>
      </div>
      {open && (
        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p><strong>What we store:</strong> Only masked versions (e.g. a***@gmail.com, ******1234) and SHA-256 hashes. Never raw sensitive data.</p>
          <p><strong>Passwords:</strong> Never sent to our server. Only the first 5 characters of a SHA-1 hash are sent to HaveIBeenPwned for k-anonymity checking.</p>
          <p><strong>Your rights:</strong> Use the "Delete my data" button in your account settings to permanently erase all your data.</p>
          <p><strong>No third-party tracking:</strong> We do not use analytics cookies or share your data with advertisers.</p>
        </div>
      )}
    </div>
  )
}
