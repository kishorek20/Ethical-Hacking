import React from 'react'

const colors = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

export default function Badge({ label, variant }) {
  const cls = colors[variant || label] || colors.default
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}
