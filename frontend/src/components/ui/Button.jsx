import React from 'react'
import clsx from 'clsx'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        variant === 'secondary' && 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 focus:ring-slate-400',
        variant === 'danger' && 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        variant === 'ghost' && 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3.5 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
