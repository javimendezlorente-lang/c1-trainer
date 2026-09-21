import type { ReviewCardProjection } from './reviewCardProjection'
import type { ReviewDisposition } from '../../domain/reviewDisposition'

export function getDueReviewQueue(cards: readonly ReviewCardProjection[], nowIso: string, dispositions: readonly ReviewDisposition[] = []): ReviewCardProjection[] {
  const now = new Date(nowIso).getTime()
  if (Number.isNaN(now)) throw new Error(`Invalid queue timestamp: ${nowIso}`)
  const dispositionByCard = new Map(dispositions.map((item) => [item.reviewCardId, item]))
  return cards
    .filter((card) => dispositionByCard.get(card.id)?.state !== 'mastered' && dispositionByCard.get(card.id)?.state !== 'archived')
    .filter((card) => new Date(card.due).getTime() <= now)
    .sort((left, right) => {
      const byDue = left.due.localeCompare(right.due)
      return byDue === 0 ? left.id.localeCompare(right.id) : byDue
    })
}
