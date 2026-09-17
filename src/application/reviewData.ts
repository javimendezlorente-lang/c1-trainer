import { rebuildErrorBank, rebuildReviewCards, type ErrorBankRecord } from '../learning'
import type { ReviewCardProjection } from '../learning/fsrs'
import { attemptRepository, type AttemptRepository } from '../storage'

export interface ReviewData {
  cards: ReviewCardProjection[]
  errorBank: ErrorBankRecord[]
}

export async function loadReviewData(repository: AttemptRepository = attemptRepository): Promise<ReviewData> {
  const [attemptEvents, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()])
  const cards = rebuildReviewCards(attemptEvents, reviewEvents)
  await repository.replaceReviewCards(cards)
  const errorBank = rebuildErrorBank(attemptEvents)
  return { cards, errorBank }
}
