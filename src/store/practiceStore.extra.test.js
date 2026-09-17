import { describe, it, expect, beforeEach } from 'vitest'
import { usePracticeStore } from './practiceStore'

describe('practiceStore additional', () => {
  beforeEach(() => {
    usePracticeStore.setState({
      _currentLanguage: 'en',
      _statsPerLanguage: { en: { globalCorrectCount: 2, globalIncorrectCount: 1 }, de: { globalCorrectCount: 5, globalIncorrectCount: 0 } },
      globalCorrectCount: 2,
      globalIncorrectCount: 1
    })
  })

  it('setLanguage swaps stats and resets session', () => {
    const { setLanguage } = usePracticeStore.getState()
    setLanguage('de')
    const s = usePracticeStore.getState()
    expect(s._currentLanguage).toBe('de')
    expect(s.globalCorrectCount).toBe(5)
    expect(s.globalIncorrectCount).toBe(0)
    expect(s.correctCount).toBe(0)
    expect(s.incorrectCount).toBe(0)
  })

  it('importStatsForLanguage overwrites per-language stats and updates current if match', () => {
    const { importStatsForLanguage } = usePracticeStore.getState()
    importStatsForLanguage('en', { globalCorrectCount: 10, globalIncorrectCount: 3 })
    const s = usePracticeStore.getState()
    expect(s._statsPerLanguage.en.globalCorrectCount).toBe(10)
    expect(s.globalCorrectCount).toBe(10)
    expect(s.globalIncorrectCount).toBe(3)
  })
})
