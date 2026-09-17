import type { ReviewCardProjection } from './reviewCardProjection'

export function getDueReviewQueue(cards: readonly ReviewCardProjection[], nowIso: string): ReviewCardProjection[] {
  const now = new Date(nowIso).getTime()
  if (Number.isNaN(now)) throw new Error(`Invalid queue timestamp: ${nowIso}`)
  return cards
    .filter((card) => new Date(card.due).getTime() <= now)
    .sort((left, right) => {
      const byDue = left.due.localeCompare(right.due)
      return byDue === 0 ? left.id.localeCompare(right.id) : byDue
    })
}
