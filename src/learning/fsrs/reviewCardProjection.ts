import type { ReviewCardStateSnapshot, ReviewCardState } from '../../domain/review'
import type { Skill } from '../../domain/skills'

export interface ReviewCardIdentity {
  id: string
  exerciseId: string
  questionId: string
}

export interface ReviewCardProjection extends ReviewCardIdentity, ReviewCardStateSnapshot {
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  primarySkill: Skill
  createdAt: string
  answerKind?: 'choice' | 'text' | 'transformation' | 'matching'
  promptSnapshot?: { originalSentence?: string; secondSentence?: string; keyword?: string; root?: string; canonicalAnswer?: string; acceptedAnswers?: string[]; explanation?: string; prompt?: string; contextSnapshot?: string; targetLabel?: string; correctTargetLabel?: string }
}

export function reviewCardId(exerciseId: string, questionId: string): string {
  return `review-card:${exerciseId}:${questionId}`
}

export function reviewCardIdentity(exerciseId: string, questionId: string): ReviewCardIdentity {
  return { id: reviewCardId(exerciseId, questionId), exerciseId, questionId }
}

export function cloneReviewCard(card: ReviewCardProjection): ReviewCardProjection {
  return { ...card }
}

export function isReviewCardState(value: string): value is ReviewCardState {
  return value === 'New' || value === 'Learning' || value === 'Review' || value === 'Relearning'
}
