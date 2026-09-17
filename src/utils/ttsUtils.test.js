import { describe, it, expect } from 'vitest'
import { normalizeText, shouldShowTTSForMultipleChoice } from './ttsUtils'

describe('ttsUtils', () => {
  it('normalizeText removes punctuation and collapses whitespace', () => {
    const input = '  Hello,  world!! This is a "test". '
    const out = normalizeText(input)
    expect(out).toBe('Hello world This is a test')
  })

  it('shouldShowTTSForMultipleChoice behaves by direction and side', () => {
    expect(shouldShowTTSForMultipleChoice({ direction: 'en_to_hu', side: 'main' })).toBe(true)
    expect(shouldShowTTSForMultipleChoice({ direction: 'hu_to_en', side: 'main' })).toBe(false)
    expect(shouldShowTTSForMultipleChoice({ direction: 'hu_to_en', side: 'option' })).toBe(true)
    expect(shouldShowTTSForMultipleChoice({ direction: 'en_to_hu', side: 'option' })).toBe(false)
    // Accepts dashed and underscored variants
    expect(shouldShowTTSForMultipleChoice({ direction: 'hu-to-de', side: 'option' })).toBe(true)
  })
})
