import { describe, expect, it } from 'vitest'
import { GenerationError } from '../src/errors'
import { part1Metrics, validateAndCanonicalizePart1 } from '../src/validation'
import { validCandidate } from './fixtures'

describe('Part 1 generation validation', () => {
  it('canonicalizes a structured candidate with a generated UUID and metrics', () => {
    const exercise = validateAndCanonicalizePart1(validCandidate(), 'gpt-5.6-luna')
    const metrics = part1Metrics(exercise)
    expect(exercise.id).toMatch(/^gen-c1-p1-[0-9a-f-]{36}$/)
    expect(exercise.source).toEqual({ kind: 'original_ai', generator: 'gpt-5.6-luna', reviewStatus: 'review' })
    expect(metrics.wordCount).toBeGreaterThanOrEqual(130)
    expect(metrics.wordCount).toBeLessThanOrEqual(170)
    expect(metrics.paragraphCount).toBe(3)
    expect(metrics.gapSpacing.every((value) => value >= 6)).toBe(true)
  })

  it('rejects candidates outside the empirical calibration gate', () => {
    const candidate = validCandidate()
    candidate.content.text = '{{gap:1}} too short {{gap:2}} text {{gap:3}} cannot {{gap:4}} pass {{gap:5}} the {{gap:6}} calibration {{gap:7}} gate {{gap:8}}.'
    expect(() => validateAndCanonicalizePart1(candidate, 'gpt-5.6-luna')).toThrowError(GenerationError)
    expect(() => validateAndCanonicalizePart1(candidate, 'gpt-5.6-luna')).toThrow(/calibration|deterministic Part 1/)
  })

  it('rejects duplicate option text even when the JSON shape is valid', () => {
    const candidate = validCandidate()
    candidate.questions[0].options[1].text = candidate.questions[0].options[0].text
    expect(() => validateAndCanonicalizePart1(candidate, 'gpt-5.6-luna')).toThrow(/duplicate option text/)
  })
})
