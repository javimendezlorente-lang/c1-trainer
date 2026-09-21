export type ReviewDispositionState = 'active' | 'mastered' | 'archived'

export interface ReviewDisposition {
  reviewCardId: string
  exerciseId: string
  questionId: string
  state: ReviewDispositionState
  changedAt: string
}
