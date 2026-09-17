import { useMemo, useState } from 'react'
import { submitReview } from '../../application/reviewSubmission'
import type { ReviewRating } from '../../domain/review'
import type { ErrorBankRecord } from '../../learning'
import { previewReviewRatings, type ReviewCardProjection } from '../../learning/fsrs'
import { getPart1ReviewPrompt } from './reviewPrompt'

interface ReviewSessionPageProps {
  cards: ReviewCardProjection[]
  records: ErrorBankRecord[]
  onDone: () => void
}

const ratings: ReviewRating[] = ['Again', 'Hard', 'Good', 'Easy']

export default function ReviewSessionPage({ cards, records, onDone }: ReviewSessionPageProps) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [counts, setCounts] = useState<Record<ReviewRating, number>>({ Again: 0, Hard: 0, Good: 0, Easy: 0 })
  const [saving, setSaving] = useState(false)
  const card = cards[index]
  const preview = useMemo(() => card ? previewReviewRatings(card, new Date().toISOString()) : [], [card])
  if (index >= cards.length) {
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
    return <section className="learning-page" aria-labelledby="review-complete-title"><p className="eyebrow">C1 Trainer</p><h1 id="review-complete-title">Review complete</h1><div className="learning-card"><p>Reviewed: {total}</p><ul className="learning-list review-summary-list">{ratings.map((rating) => <li key={rating}>{rating}: {counts[rating]}</li>)}</ul><button type="button" onClick={onDone}>Back to Review</button></div></section>
  }
  const record = records.find((item) => item.itemKey === `${card.exerciseId}:${card.questionId}`)
  const prompt = record ? getPart1ReviewPrompt(record) : undefined

  if (!card || !prompt) {
    return <div className="learning-card"><p>This review item is no longer available in the approved content.</p><button type="button" onClick={onDone}>Back to Review</button></div>
  }

  async function rate(rating: ReviewRating) {
    setSaving(true)
    try {
      await submitReview({ card, rating, idempotencyKey: `${card.id}:${card.reps}:${rating}:${card.due}`, reviewedAt: new Date().toISOString() })
      const nextCounts = { ...counts, [rating]: counts[rating] + 1 }
      setCounts(nextCounts)
      if (index + 1 >= cards.length) {
        setIndex(cards.length)
      } else {
        setIndex(index + 1)
        setRevealed(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return <section className="learning-page" aria-labelledby="review-session-title">
    <p className="eyebrow">C1 Trainer</p>
    <h1 id="review-session-title">Review Session</h1>
    <p className="learning-intro">{index + 1} / {cards.length}</p>
    <div className="learning-card review-session-card">
      <p className="review-context">{prompt.questionText}</p>
      {!revealed ? <button type="button" onClick={() => setRevealed(true)}>Reveal answer</button> : <div className="review-answer"><p><strong>Correct:</strong> {prompt.correctText}</p><p><strong>Explanation:</strong> {prompt.explanation}</p></div>}
    </div>
    {revealed && <div className="review-ratings" aria-label="Memory rating">
      {ratings.map((rating) => {
        const item = preview.find((entry) => entry.rating === rating)
        const interval = item?.intervalDays === 0 ? '<1 day' : `${Math.max(1, Math.round(item?.intervalDays ?? 0))} day${Math.round(item?.intervalDays ?? 0) === 1 ? '' : 's'}`
        return <button key={rating} type="button" disabled={saving} onClick={() => void rate(rating)}>{rating}<span>{interval}</span></button>
      })}
    </div>}
  </section>
}
