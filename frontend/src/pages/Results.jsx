import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import GaugeMeter from '../components/GaugeMeter'
import RiskFactorBar from '../components/RiskFactorBar'
import TipCard from '../components/TipCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { exportToPDF } from '../utils/pdf'

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deleteAccount } = useAuth()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projected, setProjected] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get(`/assessments/${id}`).then(r => {
      setAssessment(r.data)
      setLoading(false)
    }).catch(() => { setError('Assessment not found.'); setLoading(false) })
  }, [id])

  const toggleTip = async (tipId, done) => {
    try {
      const r = await api.patch(`/assessments/${id}/tips/${tipId}`, { done })
      setAssessment(a => ({ ...a, recommendations: r.data.recommendations }))
      setProjected({ score: r.data.projected_score, level: r.data.projected_level })
    } catch {}
  }

  const handleExport = async () => {
    setExporting(true)
    await exportToPDF('results-content', `risk-report-${id}.pdf`)
    setExporting(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!assessment) return null

  const maxContrib = Math.max(...(assessment.top_factors.map(f => f.contribution) || [1]), 1)
  const doneTips = assessment.recommendations.filter(r => r.done)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div id="results-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Your Risk Report</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(assessment.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/assess')}>New Assessment</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>History</Button>
            <Button size="sm" onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</Button>
          </div>
        </div>

        {/* Gauge + Projected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 flex flex-col items-center">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Current Risk Score</h2>
            <GaugeMeter score={assessment.score} level={assessment.level} />
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center">
            {projected ? (
              <>
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Projected After Actions</h2>
                <GaugeMeter score={projected.score} level={projected.level} size={200} />
                <div className="mt-3 text-sm text-green-600 dark:text-green-400 font-semibold text-center">
                  ▼ {(assessment.score - projected.score).toFixed(1)} pts saved by {doneTips.length} action(s)
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="text-5xl">✅</div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">What-If Simulator</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mark prevention tips as done below to see your projected new score here.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Breakdown */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Score Breakdown by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(assessment.breakdown).map(([cat, pts]) => (
              <div key={cat} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{Number(pts).toFixed(0)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{cat.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Factors */}
        {assessment.top_factors.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-5">Top Risk Factors</h2>
            <div className="space-y-5">
              {assessment.top_factors.map(f => (
                <RiskFactorBar key={f.tip_id} factor={f} maxContribution={maxContrib} />
              ))}
            </div>
          </Card>
        )}

        {/* Tips */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-5">
            Prevention Tips <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({doneTips.length}/{assessment.recommendations.length} done)</span>
          </h2>
          {assessment.recommendations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-green-600 font-semibold">Excellent! No major risk factors found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessment.recommendations.map(tip => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  onToggleDone={toggleTip}
                  projectedScore={projected?.score ?? null}
                  originalScore={assessment.score}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Delete data */}
        <Card className="p-6 border-red-200 dark:border-red-800">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">🗑️ Delete My Data</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">This will permanently delete your account and all assessment history.</p>
          <Button variant="danger" size="sm" onClick={async () => { if (confirm('Delete all your data permanently?')) { await deleteAccount(); navigate('/') } }}>Delete My Account & Data</Button>
        </Card>
      </div>
    </div>
  )
}
