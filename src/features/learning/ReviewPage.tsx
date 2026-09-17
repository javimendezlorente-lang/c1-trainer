import { useEffect, useMemo, useState } from 'react'
import { loadReviewData, type ReviewData } from '../../application/reviewData'
import { getDueReviewQueue } from '../../learning/fsrs'
import ReviewSessionPage from './ReviewSessionPage'
import { getPart1ReviewPrompt } from './reviewPrompt'
import { nowIso } from '../../time/clock'
import './learning.css'

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [session, setSession] = useState(false)
  const now = nowIso()
  const due = useMemo(() => data ? getDueReviewQueue(data.cards, now) : [], [data, now])

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
      <div className="learning-card"><h2>Error Bank</h2>{data.errorBank.length === 0 ? <p>No errors recorded yet. Complete a Part 1 exercise to create a review item.</p> : <ul className="learning-list">{data.errorBank.map((record) => { const prompt = getPart1ReviewPrompt(record); return <li className="learning-card" key={record.itemKey}><h3>{record.exerciseId} · {record.questionId}</h3><p>{record.status === 'active' ? 'Needs review' : 'Recovered; card history retained'} · {record.incorrectAttempts} incorrect of {record.totalAttempts} attempts</p><p className="learning-muted">{prompt?.questionText ?? 'Approved question unavailable'} </p></li> })}</ul>}</div>
    </>}
  </section>
}
