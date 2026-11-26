import React from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

const levelColors = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  Critical: '#ef4444',
}

export default function GaugeMeter({ score, level, size = 260 }) {
  const color = levelColors[level] || '#6b7280'
  const data = [{ value: score, fill: color }]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <RadialBarChart
          width={size}
          height={size}
          cx={size / 2}
          cy={size / 2}
          innerRadius={size * 0.35}
          outerRadius={size * 0.48}
          barSize={size * 0.1}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#e2e8f0' }}
            dataKey="value"
            angleAxisId={0}
            data={data}
            cornerRadius={8}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
          <span className="text-4xl font-black" style={{ color }}>{Math.round(score)}</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ 100</span>
          <span className="mt-1 text-lg font-bold" style={{ color }}>{level}</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Low 0–25</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>Mod 26–50</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>High 51–75</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Crit 76–100</span>
      </div>
    </div>
  )
}
