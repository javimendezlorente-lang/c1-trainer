import { describe, expect, it } from 'vitest'
import { applyReviewRating, createNewReviewCard, previewReviewRatings, reviewCardIdentity } from './index'

const identity = reviewCardIdentity('exercise-1', 'q1')
const createdAt = '2026-01-01T00:00:00.000Z'

describe('FSRS adapter contract', () => {
  it('creates a serializable new card and leaves input immutable', () => {
    const card = createNewReviewCard(identity, createdAt, 1, 'collocation')
    const original = structuredClone(card)
    expect(card.state).toBe('New')
    expect(() => JSON.stringify(card)).not.toThrow()
    const next = applyReviewRating(card, 'Good', '2026-01-02T00:00:00.000Z')
    expect(card).toEqual(original)
    expect(next).not.toBe(card)
    expect(next.lastReview).toBe('2026-01-02T00:00:00.000Z')
  })

  it.each(['Again', 'Hard', 'Good', 'Easy'])('applies %s without exposing library objects', (rating) => {
    const card = createNewReviewCard(identity, createdAt, 1, 'collocation')
    const next = applyReviewRating(card, rating, '2026-01-02T00:00:00.000Z')
    expect(next.id).toBe(identity.id)
    expect(next.due).toMatch(/^2026-/)
    expect(next).not.toHaveProperty('card')
    expect(next).not.toHaveProperty('log')
  })

  it('previews all four outcomes from the library scheduler', () => {
    const card = createNewReviewCard(identity, createdAt, 1, 'collocation')
    const preview = previewReviewRatings(card, '2026-01-02T00:00:00.000Z')
    expect(preview.map((item) => item.rating)).toEqual(['Again', 'Hard', 'Good', 'Easy'])
    expect(preview.every((item) => item.due && typeof item.intervalDays === 'number')).toBe(true)
  })
})
