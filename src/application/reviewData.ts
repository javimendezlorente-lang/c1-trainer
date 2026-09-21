import { rebuildErrorBank, rebuildReviewCards, type ErrorBankRecord } from '../learning'
import type { ReviewCardProjection } from '../learning/fsrs'
import { attemptRepository, type AttemptRepository } from '../storage'
import type { ReviewDisposition } from '../domain/reviewDisposition'

export interface ReviewData {
  cards: ReviewCardProjection[]
  errorBank: ErrorBankRecord[]
  dispositions: ReviewDisposition[]
}

export async function loadReviewData(repository: AttemptRepository = attemptRepository): Promise<ReviewData> {
  const [attemptEvents, reviewEvents, dispositions] = await Promise.all([repository.list(), repository.listReviewEvents(), repository.listReviewDispositions()])
  const cards = rebuildReviewCards(attemptEvents, reviewEvents)
  await repository.replaceReviewCards(cards)
  const errorBank = rebuildErrorBank(attemptEvents)
  return { cards, errorBank, dispositions }
}
