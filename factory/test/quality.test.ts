import { describe, expect, it } from 'vitest'
import { parseCriticResult, policyDecision } from '../src/quality/review'

const passingScores = {
  cambridgeResemblance: 4, c1Calibration: 4, naturalness: 5, coherence: 4, distractorPlausibility: 4,
  answerUniqueness: 4, lexicalSophistication: 4, gapQuality: 4, explanationCorrectness: 4, pedagogicalUsefulness: 4,
}

describe('critic policy', () => {
  it('requires critical thresholds and rejects hard failures regardless of mean', () => {
    const result = parseCriticResult({ scores: passingScores, hardFailures: ['more than one defensible answer'], verdict: 'ACCEPT', rationale: 'Not safe.' })
    expect(policyDecision(result)).toBe('rejected')
  })

  it('accepts only a clean result above every threshold', () => {
    const result = parseCriticResult({ scores: passingScores, hardFailures: [], verdict: 'ACCEPT', rationale: 'Suitable for manual promotion review.' })
    expect(policyDecision(result)).toBe('accepted')
  })
})
