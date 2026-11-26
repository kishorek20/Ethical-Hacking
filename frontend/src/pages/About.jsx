import React from 'react'
import Card from '../components/ui/Card'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-100 dark:bg-blue-900 p-4 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 6v6c0 5.25 3.4 10.14 8 11.35C16.6 22.14 20 17.25 20 12V6l-8-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">About Risk Scorer</h1>
          <p className="text-blue-600 font-semibold mt-1">Aware · Safe · Protected</p>
        </div>
        <div className="space-y-6 text-slate-600 dark:text-slate-300">
          <p>The Personal Information Leakage Risk Scoring and Prevention System helps individuals understand and reduce their digital privacy risk. By answering questions about what personal information they share online, their account security habits, and their exposure to known data breaches, users receive a 0–100 risk score with personalised action items.</p>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">How the Score is Calculated</h2>
            <div className="space-y-2">
              {[
                ['Personal Info Exposure', 'Points for each type of sensitive info shared publicly (ID details, address, phone, email, name)'],
                ['Account Exposure', 'Points for public social profiles and total number of accounts'],
                ['Password Security', 'Points for weak passwords, password reuse, and lack of a password manager'],
                ['Security Practices', 'Points for missing 2FA, unreviewed privacy settings, and disabled login alerts'],
                ['Breach Data', 'Points if your password or email appears in known data breaches'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{title}: </span>
                  <span className="text-sm">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400">Built as a capstone project demonstrating privacy engineering, secure data handling, and actionable risk communication.</p>
        </div>
      </Card>
    </div>
  )
}
