import type { ReviewEvent, ReviewRating } from '../domain/review'
import { applyReviewRating, snapshotFromReviewCard, type ReviewCardProjection } from '../learning/fsrs'
import { rebuildLearningProjections, rebuildReviewCards } from '../learning'
import { attemptRepository, type AttemptRepository } from '../storage'
import { nowIso } from '../time/clock'

export interface ReviewEventOptions {
  idempotencyKey: string
  eventId?: string
  reviewedAt?: string
  sourceAttemptId?: string
}

function createIdentifier(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}_${crypto.randomUUID()}`
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function createReviewEvent(card: ReviewCardProjection, nextCard: ReviewCardProjection, rating: ReviewRating, options: ReviewEventOptions): ReviewEvent {
  const reviewedAt = options.reviewedAt ?? nowIso()
  return {
    eventVersion: '1.0.0',
    eventId: options.eventId ?? createIdentifier('review'),
    idempotencyKey: options.idempotencyKey,
    kind: 'review_submitted',
    reviewCardId: card.id,
    exerciseId: card.exerciseId,
    questionId: card.questionId,
    reviewedAt,
    rating,
    previousState: snapshotFromReviewCard(card),
    resultingState: snapshotFromReviewCard(nextCard),
    ...(options.sourceAttemptId ? { sourceAttemptId: options.sourceAttemptId } : {}),
    skillSet: { primarySkill: card.primarySkill, secondarySkills: [] },
  }
}

export interface SubmitReviewInput extends ReviewEventOptions {
  card: ReviewCardProjection
  rating: ReviewRating
  repository?: AttemptRepository
}

export async function submitReview(input: SubmitReviewInput) {
  const repository = input.repository ?? attemptRepository
  const existing = await repository.getReviewByIdempotencyKey(input.idempotencyKey)
  const reviewedAt = input.reviewedAt ?? nowIso()
  const event = existing ?? createReviewEvent(input.card, applyReviewRating(input.card, input.rating, reviewedAt), input.rating, { ...input, reviewedAt })
  const appendResult = existing ? { event: existing, inserted: false } : await repository.appendReviewEvent(event)
  const [attemptEvents, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()])
  const projections = rebuildLearningProjections(attemptEvents, reviewEvents)
  const cards = rebuildReviewCards(attemptEvents, reviewEvents)
  await repository.replaceReviewCards(cards)
  return { event: appendResult.event, inserted: appendResult.inserted, projections, card: cards.find((card) => card.id === event.reviewCardId) }
}
