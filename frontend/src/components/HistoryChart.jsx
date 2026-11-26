import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HistoryChart({ assessments }) {
  const data = [...assessments].reverse().map(a => ({
    date: formatDate(a.created_at),
    score: a.score,
    level: a.level,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}`, 'Score']} />
        <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', position: 'insideRight', fontSize: 10, fill: '#22c55e' }} />
        <ReferenceLine y={50} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Moderate', position: 'insideRight', fontSize: 10, fill: '#eab308' }} />
        <ReferenceLine y={75} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'High', position: 'insideRight', fontSize: 10, fill: '#f97316' }} />
        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
