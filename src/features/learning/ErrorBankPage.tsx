import { useEffect, useState } from 'react'
import { rebuildProjections } from '../../application/part1Submission'
import type { ErrorBankRecord } from '../../learning'
import './learning.css'

export default function ErrorBankPage() {
  const [records, setRecords] = useState<ErrorBankRecord[] | null>(null)

  useEffect(() => {
    let active = true
    rebuildProjections().then((projections) => {
      if (active) setRecords(projections.errorBank)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="learning-page" aria-labelledby="review-title">
      <p className="eyebrow">C1 Trainer</p>
      <h1 id="review-title">Review</h1>
      <h2 id="error-bank-title">Error Bank</h2>
      <p className="learning-intro">Incorrect responses are grouped by question and rebuilt from your saved attempt events.</p>
      {!records ? <p>Loading Error Bank…</p> : records.length === 0 ? (
        <div className="learning-card"><p>No errors recorded yet. Complete a Part 1 exercise to start building this list.</p></div>
      ) : (
        <ul className="learning-list">
          {records.map((record) => (
            <li className="learning-card" key={record.itemKey}>
              <h2>{record.exerciseId} · {record.questionId}</h2>
              <p>
                <span className={record.status === 'active' ? 'learning-status-active' : 'learning-status-cleared'}>
                  {record.status === 'active' ? 'Needs review' : 'Cleared on latest attempt'}
                </span>
                {' · '}{record.incorrectAttempts} incorrect of {record.totalAttempts} attempts
              </p>
              <p className="learning-muted">Skill: {record.skill} · Explanation: {record.explanationReference}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
