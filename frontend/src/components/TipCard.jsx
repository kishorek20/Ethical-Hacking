import React from 'react'
import clsx from 'clsx'

const priorityColors = {
  Critical: 'border-red-500 bg-red-50 dark:bg-red-950/30',
  High: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
  Medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  Low: 'border-green-500 bg-green-50 dark:bg-green-950/30',
}

export default function TipCard({ tip, onToggleDone, projectedScore, originalScore }) {
  const delta = projectedScore !== null && projectedScore !== undefined ? (projectedScore - originalScore) : null
  return (
    <div className={clsx('border-l-4 rounded-r-xl p-4 transition-all duration-200', tip.done ? 'opacity-60 border-slate-300 bg-slate-50 dark:bg-slate-800/50' : (priorityColors[tip.priority] || 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'))}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', tip.done ? 'bg-slate-200 text-slate-500' : (tip.priority === 'Critical' ? 'bg-red-100 text-red-700' : tip.priority === 'High' ? 'bg-orange-100 text-orange-700' : tip.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'))}>
              {tip.done ? '✓ Done' : tip.priority}
            </span>
            {!tip.done && delta !== null && delta < 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                Would save {Math.abs(delta).toFixed(1)} pts → {projectedScore.toFixed(1)}
              </span>
            )}
          </div>
          <h4 className={clsx('text-sm font-semibold mb-1', tip.done ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200')}>{tip.title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{tip.description}</p>
        </div>
        <button
          onClick={() => onToggleDone(tip.id, !tip.done)}
          className={clsx('shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', tip.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-400 hover:border-blue-500')}
          aria-label={tip.done ? 'Mark as undone' : 'Mark as done'}
        >
          {tip.done && <span className="text-xs">✓</span>}
        </button>
      </div>
    </div>
  )
}
