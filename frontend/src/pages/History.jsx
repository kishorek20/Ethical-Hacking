import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import HistoryChart from '../components/HistoryChart'

export default function History() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/assessments').then(r => { setAssessments(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Assessment History</h1>
        <Button onClick={() => navigate('/assess')}>+ New Assessment</Button>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No assessments yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Complete your first assessment to start tracking your risk score.</p>
          <Button onClick={() => navigate('/assess')}>Start Assessment</Button>
        </Card>
      ) : (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Score Over Time</h2>
            <HistoryChart assessments={assessments} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">All Assessments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Score</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Level</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Actions Done</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(a => {
                    const done = a.recommendations.filter(r => r.done).length
                    const total = a.recommendations.length
                    return (
                      <tr key={a.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-white">{Number(a.score).toFixed(1)}</td>
                        <td className="py-3 px-2"><Badge label={a.level} /></td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{done}/{total}</td>
                        <td className="py-3 px-2"><button onClick={() => navigate(`/results/${a.id}`)} className="text-blue-600 hover:text-blue-700 font-medium text-xs">View →</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
