import { describe, expect, it } from 'vitest'
import { validCandidate } from '../../backend/test/fixtures'
import { validateAndCanonicalizePart1 } from '../../backend/src/validation'
import { compareNovelty, exerciseEntry } from '../src/novelty/fingerprints'

describe('local novelty fingerprints', () => {
  it('rejects an exact passage duplicate', () => {
    const first = validateAndCanonicalizePart1(validCandidate(), 'test')
    const second = validateAndCanonicalizePart1(validCandidate(), 'test')
    const decision = compareNovelty(second, [exerciseEntry(first, 'candidate')])
    expect(decision.accepted).toBe(false)
    expect(decision.flags).toContain('exact passage duplicate')
  })

  it('flags or rejects a near-duplicate through shingles', () => {
    const first = validateAndCanonicalizePart1(validCandidate(), 'test')
    const changed = validCandidate()
    changed.content.text = changed.content.text.replace('careful observers', 'patient observers')
    const second = validateAndCanonicalizePart1(changed, 'test')
    const decision = compareNovelty(second, [exerciseEntry(first, 'candidate')])
    expect(decision.flags.some((flag) => flag.includes('near-duplicate'))).toBe(true)
  })
})
