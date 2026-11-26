import React from 'react'
import Card from '../components/ui/Card'

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="p-8 prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-black mb-2 dark:text-white">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Last updated: November 2026</p>
        <div className="space-y-6 text-slate-600 dark:text-slate-300">
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">What We Collect</h2>
            <p>We store only the minimum necessary data: a SHA-256 hash of your email address (for unique identification), a masked display version (e.g. a***@gmail.com), and your bcrypt-hashed password. We never store raw PII.</p></section>
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Assessment Data</h2>
            <p>Assessment responses are stored with all sensitive fields masked before storage. Phone numbers become ******1234, ID numbers become XXXX-XXXX-1234. Raw values are never persisted to the database.</p></section>
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Password Checks</h2>
            <p>The optional breach check is 100% client-side. Your password is hashed with SHA-1 in your browser using the Web Crypto API. Only the first 5 characters of that hash are sent to HaveIBeenPwned's k-anonymity API — your password is never reconstructable from this.</p></section>
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your Rights</h2>
            <p>You can delete all your data at any time using the "Delete My Account & Data" button on your results page. This permanently removes your user record and all associated assessments.</p></section>
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Third-Party Tracking</h2>
            <p>We use no advertising cookies, analytics platforms, or data brokers. The only external service contacted is HaveIBeenPwned for breach checking, and only when you explicitly trigger it.</p></section>
        </div>
      </Card>
    </div>
  )
}
