import { useEffect, useState } from 'react'
import { rebuildProjections } from '../../application/part1Submission'
import type { ProgressProjection } from '../../learning'
import './learning.css'

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressProjection | null>(null)

  useEffect(() => {
    let active = true
    rebuildProjections().then((projections) => {
      if (active) setProgress(projections.progress)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="learning-page" aria-labelledby="progress-title">
      <p className="eyebrow">C1 Trainer</p>
      <h1 id="progress-title">Progress</h1>
      <p className="learning-intro">These practice metrics are derived from AttemptEvent history and can be rebuilt from scratch.</p>
      {!progress ? <p>Loading progress…</p> : <>
      <div className="learning-summary">
        <div><strong>{progress.attempts}</strong><span>Attempts</span></div>
        <div><strong>{progress.accuracy}%</strong><span>Accuracy</span></div>
        <div><strong>{progress.score} / {progress.maxScore}</strong><span>Marks</span></div>
      </div>
      <div className="learning-card">
        <h2>Skill profile</h2>
        {progress.bySkill.length === 0 ? <p>No skill data yet.</p> : (
          <table className="learning-table">
            <thead><tr><th>Skill</th><th>Attempts</th><th>Accuracy</th></tr></thead>
            <tbody>
              {progress.bySkill.map((record) => (
                <tr key={record.skill}><td>{record.skill}</td><td>{record.attempts}</td><td>{record.accuracy}%</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </>}
    </section>
  )
}
