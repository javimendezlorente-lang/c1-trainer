import { describe, it, expect, beforeEach } from 'vitest'
import { useVocabularyStore } from './vocabularyStore'

describe('vocabularyStore additional', () => {
  beforeEach(() => {
    useVocabularyStore.setState({
      _currentLanguage: 'en',
      _perLanguage: {
        en: { learnedWords: ['w1'], mistakeWords: [] },
        de: { learnedWords: ['w2'], mistakeWords: [] }
      },
      learnedWords: new Set(['w1']),
      mistakeWords: new Set()
    })
  })

  it('setLanguage saves and loads per-language sets', () => {
    const { setLanguage } = useVocabularyStore.getState()
    setLanguage('de')
    expect(useVocabularyStore.getState()._currentLanguage).toBe('de')
    expect(useVocabularyStore.getState().learnedWords.has('w2')).toBe(true)
    // switch back
    setLanguage('en')
    expect(useVocabularyStore.getState().learnedWords.has('w1')).toBe(true)
  })

  it('importProgress overwrites per-language arrays and updates current sets', () => {
    const { importProgress } = useVocabularyStore.getState()
    importProgress('en', { learnedWords: ['x','y'], mistakeWords: ['m'] })
    const state = useVocabularyStore.getState()
    expect(state._perLanguage.en.learnedWords).toEqual(['x','y'])
    // Since current language is en, sets should update
    expect(state.learnedWords.has('x')).toBe(true)
    expect(state.mistakeWords.has('m')).toBe(true)
  })
})
