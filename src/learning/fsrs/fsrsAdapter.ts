import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'
import type { ReviewRating, ReviewCardStateSnapshot } from '../../domain/review'
import type { ReviewCardProjection, ReviewCardIdentity } from './reviewCardProjection'

export const FSRS_CONFIGURATION = Object.freeze({
  requestRetention: 0.9,
  maximumInterval: 36500,
  enableFuzz: false,
  enableShortTerm: true,
})

const parameters = generatorParameters({
  request_retention: FSRS_CONFIGURATION.requestRetention,
  maximum_interval: FSRS_CONFIGURATION.maximumInterval,
  enable_fuzz: FSRS_CONFIGURATION.enableFuzz,
  enable_short_term: FSRS_CONFIGURATION.enableShortTerm,
})
const scheduler = fsrs(parameters)

const ratingMap: Record<ReviewRating, Grade> = {
  Again: Rating.Again as Grade,
  Hard: Rating.Hard as Grade,
  Good: Rating.Good as Grade,
  Easy: Rating.Easy as Grade,
}

const stateMap: Record<State, ReviewCardStateSnapshot['state']> = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning',
}

const stateFromName: Record<ReviewCardStateSnapshot['state'], State> = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
}

function toIso(date: Date): string {
  return date.toISOString()
}

function toDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid review timestamp: ${value}`)
  return date
}

function toSnapshot(card: Card): ReviewCardStateSnapshot {
  return {
    state: stateMap[card.state],
    due: toIso(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.last_review ? toIso(card.last_review) : null,
  }
}

function toCard(snapshot: ReviewCardStateSnapshot): Card {
  return {
    due: toDate(snapshot.due),
    stability: snapshot.stability,
    difficulty: snapshot.difficulty,
    elapsed_days: snapshot.elapsedDays,
    scheduled_days: snapshot.scheduledDays,
    learning_steps: snapshot.learningSteps,
    reps: snapshot.reps,
    lapses: snapshot.lapses,
    state: stateFromName[snapshot.state],
    last_review: snapshot.lastReview ? toDate(snapshot.lastReview) : undefined,
  }
}

export function createNewReviewCard(identity: ReviewCardIdentity, createdAt: string, part: 1, primarySkill: ReviewCardProjection['primarySkill']): ReviewCardProjection {
  const snapshot = toSnapshot(createEmptyCard(toDate(createdAt)))
  return { ...identity, ...snapshot, part, primarySkill, createdAt }
}

export function applyReviewRating(card: ReviewCardProjection, rating: ReviewRating, reviewedAt: string): ReviewCardProjection {
  const result = scheduler.next(toCard(card), toDate(reviewedAt), ratingMap[rating])
  return { ...card, ...toSnapshot(result.card) }
}

export interface ReviewPreview {
  rating: ReviewRating
  due: string
  intervalDays: number
}

export function previewReviewRatings(card: ReviewCardProjection, reviewedAt: string): ReviewPreview[] {
  const preview = scheduler.repeat(toCard(card), toDate(reviewedAt))
  return (['Again', 'Hard', 'Good', 'Easy'] as const).map((rating) => {
    const item = preview[ratingMap[rating]]
    return { rating, due: toIso(item.card.due), intervalDays: item.log.scheduled_days }
  })
}

export function snapshotFromReviewCard(card: ReviewCardProjection): ReviewCardStateSnapshot {
  const { id: _id, exerciseId: _exerciseId, questionId: _questionId, part: _part, primarySkill: _skill, createdAt: _createdAt, ...snapshot } = card
  return snapshot
}
