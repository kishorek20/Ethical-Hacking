import React from 'react'
import clsx from 'clsx'

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700', className)} {...props}>
      {children}
    </div>
  )
}
