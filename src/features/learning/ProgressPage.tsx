import { useEffect, useState } from 'react'
import { rebuildProjections } from '../../application/part1Submission'
import type { ProgressProjection, ReviewProgressProjection } from '../../learning'
import './learning.css'

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressProjection | null>(null)
  const [review, setReview] = useState<ReviewProgressProjection | null>(null)

  useEffect(() => {
    let active = true
    rebuildProjections().then((projections) => {
      if (active) { setProgress(projections.progress); setReview(projections.review) }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="learning-page" aria-labelledby="progress-title">
      <p className="eyebrow">C1 Trainer</p>
      <h1 id="progress-title">Progress</h1>
      <p className="learning-intro">Practice performance and memory reviews are shown separately so you can decide what to do next.</p>
      {!progress ? <p>Loading progress…</p> : <>
      <div className="learning-summary">
        <div><strong>{progress.attempts}</strong><span>Attempts</span></div>
        <div><strong>{progress.accuracy}%</strong><span>Accuracy</span></div>
        <div><strong>{progress.score} / {progress.maxScore}</strong><span>Marks</span></div>
        <div><strong>{progress.markAccuracy}%</strong><span>Mark accuracy</span></div>
      </div>
      <div className="learning-card">
        <h2>Practice by part</h2>
        <p className="learning-muted">Marks and accuracy are practice results; they are not Cambridge Scale scores.</p>
        {progress.byPart.length === 0 ? <p>No part data yet.</p> : (
          <table className="learning-table">
            <thead><tr><th>Part</th><th>Marks</th><th>Accuracy</th><th>Attempts</th></tr></thead>
            <tbody>{progress.byPart.map((record) => <tr key={record.part}><td>Part {record.part}</td><td>{record.marksEarned} / {record.marksAvailable}</td><td>{record.accuracy}%</td><td>{record.attempts}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <div className="learning-card">
        <h2>Recent trend</h2>
        <p>{progress.recentAttempts === 0 ? 'Complete an exercise to create a trend.' : `${progress.recentAccuracy}% accuracy across the last ${progress.recentAttempts} practice attempt${progress.recentAttempts === 1 ? '' : 's'}.`}</p>
      </div>
      <div className="learning-card">
        <h2>Skills to strengthen</h2>
        {progress.bySkill.length === 0 ? <p>No skill data yet.</p> : (
            <table className="learning-table">
              <thead><tr><th>Skill</th><th>Attempts</th><th>Accuracy</th></tr></thead>
            <tbody>
              {progress.bySkill.map((record) => (
                <tr key={record.skill}><td>{record.skill.replaceAll('_', ' ')}</td><td>{record.attempts}</td><td>{record.accuracy}%</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="learning-card">
        <h2>Memory reviews</h2>
        <p className="learning-muted">Review activity is separate from practice accuracy.</p>
        <div className="learning-summary"><div><strong>{review?.reviewsCompleted ?? 0}</strong><span>Completed</span></div><div><strong>{review?.reviewsDue ?? 0}</strong><span>Due now</span></div><div><strong>{review?.reviewedCards ?? 0}</strong><span>Cards reviewed</span></div></div>
        <p>{review ? Object.entries(review.ratingDistribution).map(([rating, count]) => `${rating}: ${count}`).join(' · ') : 'Loading review metrics…'}</p>
      </div>
      </>}
    </section>
  )
}
