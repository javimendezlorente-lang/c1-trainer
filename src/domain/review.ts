import type { SkillSet } from './skills'

export const REVIEW_EVENT_VERSION = '1.0.0' as const

export type ReviewRating = 'Again' | 'Hard' | 'Good' | 'Easy'
export type ReviewCardState = 'New' | 'Learning' | 'Review' | 'Relearning'

export interface ReviewCardStateSnapshot {
  state: ReviewCardState
  due: string
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  lastReview: string | null
}

export interface ReviewEvent {
  eventVersion: typeof REVIEW_EVENT_VERSION
  eventId: string
  idempotencyKey: string
  kind: 'review_submitted'
  reviewCardId: string
  exerciseId: string
  questionId: string
  reviewedAt: string
  rating: ReviewRating
  previousState: ReviewCardStateSnapshot
  resultingState: ReviewCardStateSnapshot
  sourceAttemptId?: string
  skillSet?: SkillSet
}
