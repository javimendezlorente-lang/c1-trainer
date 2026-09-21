import { useEffect, useMemo, useState } from 'react'
import { loadReviewData, type ReviewData } from '../../application/reviewData'
import { getDueReviewQueue } from '../../learning/fsrs'
import ReviewSessionPage from './ReviewSessionPage'
import { getPart1ReviewPrompt } from './reviewPrompt'
import { nowIso } from '../../time/clock'
import './learning.css'
import { attemptRepository } from '../../storage'
import { reviewLabel } from '../../presentation/exerciseLabels'

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [session, setSession] = useState(false)
  const now = nowIso()
  const due = useMemo(() => data ? getDueReviewQueue(data.cards, now, data.dispositions) : [], [data, now])

  useEffect(() => {
    let active = true
    loadReviewData().then((result) => { if (active) setData(result) })
    return () => { active = false }
  }, [session])

  if (session && data) return <ReviewSessionPage cards={due} records={data.errorBank} onDone={() => setSession(false)} />

  return <section className="learning-page" aria-labelledby="review-title">
    <p className="eyebrow">C1 Trainer</p>
    <h1 id="review-title">Review</h1>
    <p className="learning-intro">Recall the answer first, then rate how well you remembered it.</p>
    {!data ? <p>Loading reviews…</p> : <>
      <div className="learning-summary"><div><strong>{due.length}</strong><span>Due now</span></div><div><strong>{data.errorBank.filter((record) => record.status === 'active').length}</strong><span>Active errors</span></div><div><strong>{data.errorBank.filter((record) => record.status === 'cleared').length}</strong><span>Recovered</span></div></div>
      {due.length > 0 && <button type="button" className="review-start" onClick={() => setSession(true)}>Start review</button>}
      <div className="learning-card"><h2>Error Bank</h2><p className="learning-muted">Error Bank records mistakes; Review schedules active cards. Your history is never deleted.</p>{data.errorBank.length === 0 ? <p>No errors recorded yet. Start a practice exercise to build your learning history.</p> : <ul className="learning-list">{data.errorBank.map((record) => { const prompt = getPart1ReviewPrompt(record); const disposition = data.dispositions.find((item) => item.reviewCardId === `review-card:${record.exerciseId}:${record.questionId}`); const state = disposition?.state ?? 'active'; return <li className="learning-card" key={record.itemKey}><h3>{reviewLabel(record)}</h3><p><span className={state === 'active' ? 'learning-status-active' : 'learning-status-cleared'}>{state === 'active' ? (record.status === 'active' ? 'Needs review' : 'Recovered') : state === 'mastered' ? 'Mastered' : 'Archived'}</span>{' · '}{record.incorrectAttempts} incorrect of {record.totalAttempts} attempts</p><p>{prompt?.questionText ?? 'The approved question is unavailable.'}</p><p><strong>Correct answer:</strong> {prompt?.correctText ?? record.canonicalAnswer}</p><div className="review-card-actions"><button type="button" onClick={() => void updateDisposition(record, 'active')}>Review again</button>{state === 'mastered' ? <button type="button" onClick={() => void updateDisposition(record, 'active')}>Restore</button> : <button type="button" onClick={() => void updateDisposition(record, 'mastered')}>Mark mastered</button>}{state === 'archived' ? <button type="button" onClick={() => void updateDisposition(record, 'active')}>Restore</button> : <button type="button" onClick={() => void updateDisposition(record, 'archived')}>Remove from review</button>}</div></li> })}</ul>}</div>
    </>}
  </section>

  async function updateDisposition(record: ReviewData['errorBank'][number], state: 'active' | 'mastered' | 'archived') {
    await attemptRepository.setReviewDisposition({ reviewCardId: `review-card:${record.exerciseId}:${record.questionId}`, exerciseId: record.exerciseId, questionId: record.questionId, state, changedAt: nowIso() })
    setData(await loadReviewData())
  }
}
