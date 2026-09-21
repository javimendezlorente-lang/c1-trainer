import { describe, expect, it } from 'vitest'
import { getDueReviewQueue } from './reviewQueue'

const card = (id) => ({ id, due: '2026-09-20T00:00:00.000Z' })

describe('review queue dispositions', () => {
  it('suppresses mastered and archived cards but leaves active cards due', () => {
    const cards = [card('active'), card('mastered'), card('archived')]
    const dispositions = [
      { reviewCardId: 'mastered', state: 'mastered' },
      { reviewCardId: 'archived', state: 'archived' },
    ]
    expect(getDueReviewQueue(cards, '2026-09-21T00:00:00.000Z', dispositions).map((item) => item.id)).toEqual(['active'])
  })

  it('replays active, mastered, restored, archived and restored states without touching history', () => {
    const history = [{ kind: 'attempt_submitted' }, { kind: 'review_submitted' }]
    let state = 'active'
    const states = [state]
    state = 'mastered'; states.push(state)
    state = 'active'; states.push(state)
    state = 'archived'; states.push(state)
    state = 'active'; states.push(state)
    expect(states).toEqual(['active', 'mastered', 'active', 'archived', 'active'])
    expect(history).toHaveLength(2)
  })
})
