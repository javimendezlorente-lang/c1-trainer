import { describe, expect, it } from 'vitest'
import { createAttemptEvent } from '../application/part1Submission'
import { createReviewEvent } from '../application/reviewSubmission'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from '../grading'
import { applyReviewRating, createNewReviewCard, reviewCardIdentity } from './fsrs'
import { rebuildReviewCards } from './projections'

const exercise = listApprovedPart1Exercises()[0]
const wrongAnswers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.options.find((option) => option.id !== question.correctOptionId).id]))
const attempt = createAttemptEvent(exercise, wrongAnswers, gradePart1(exercise, wrongAnswers), { idempotencyKey: 'wrong', eventId: 'wrong-event', occurredAt: '2026-01-01T00:00:00.000Z' })

describe('review card replay', () => {
  it('rebuilds create → Good → Good → Hard equivalently', () => {
    const identity = reviewCardIdentity(exercise.id, 'q1')
    let card = createNewReviewCard(identity, attempt.occurredAt, 1, exercise.skills.primarySkill)
    const reviewEvents = []
    for (const [index, rating] of ['Good', 'Good', 'Hard'].entries()) {
      const reviewedAt = `2026-01-0${index + 2}T00:00:00.000Z`
      const next = applyReviewRating(card, rating, reviewedAt)
      reviewEvents.push(createReviewEvent(card, next, rating, { idempotencyKey: `review-${index}`, eventId: `review-event-${index}`, reviewedAt }))
      card = next
    }
    expect(rebuildReviewCards([attempt], reviewEvents).find((item) => item.id === identity.id)).toEqual(card)
  })

  it('keeps independent cards in stable identity order and retains recovered errors', () => {
    const second = createAttemptEvent(exercise, wrongAnswers, gradePart1(exercise, wrongAnswers), { idempotencyKey: 'wrong-2', eventId: 'wrong-event-2', occurredAt: '2026-01-03T00:00:00.000Z' })
    const cards = rebuildReviewCards([attempt, second], [])
    expect(cards).toHaveLength(8)
    expect(cards.map((card) => card.id)).toEqual([...cards].sort((a, b) => a.id.localeCompare(b.id)).map((card) => card.id))
  })
})
