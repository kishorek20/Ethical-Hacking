import React from 'react'

const priorityColors = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
}

export default function RiskFactorBar({ factor, maxContribution }) {
  const pct = maxContribution > 0 ? (factor.contribution / maxContribution) * 100 : 0
  const barColor = priorityColors[factor.priority] || 'bg-blue-500'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{factor.name}</span>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">+{factor.contribution.toFixed(1)} pts</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }}></div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{factor.description}</p>
    </div>
  )
}
