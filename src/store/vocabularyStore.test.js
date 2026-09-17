import { describe, it, expect, beforeEach } from 'vitest'
import { useVocabularyStore } from './vocabularyStore'

describe('vocabularyStore - mistake tracking', () => {
  beforeEach(() => {
    // Reset store state before each test
    useVocabularyStore.setState({
      mistakeWords: new Set(),
      learnedWords: new Set()
    })
  })

  it('should mark a word as mistake', () => {
    const { markAsMistake, isMistake } = useVocabularyStore.getState()
    
    markAsMistake('word-1')
    
    expect(isMistake('word-1')).toBe(true)
    expect(isMistake('word-2')).toBe(false)
  })

  it('should clear a mistake', () => {
    const { markAsMistake, clearMistake, isMistake } = useVocabularyStore.getState()
    
    markAsMistake('word-1')
    expect(isMistake('word-1')).toBe(true)
    
    clearMistake('word-1')
    expect(isMistake('word-1')).toBe(false)
  })

  it('should track multiple mistakes', () => {
    const { markAsMistake, getMistakeCount } = useVocabularyStore.getState()
    
    markAsMistake('word-1')
    markAsMistake('word-2')
    markAsMistake('word-3')
    
    expect(getMistakeCount()).toBe(3)
  })

  it('should clear all mistakes', () => {
    const { markAsMistake, clearAllMistakes, getMistakeCount } = useVocabularyStore.getState()
    
    markAsMistake('word-1')
    markAsMistake('word-2')
    markAsMistake('word-3')
    expect(getMistakeCount()).toBe(3)
    
    clearAllMistakes()
    expect(getMistakeCount()).toBe(0)
  })

  it('should not duplicate mistakes', () => {
    const { markAsMistake, getMistakeCount } = useVocabularyStore.getState()
    
    markAsMistake('word-1')
    markAsMistake('word-1')
    markAsMistake('word-1')
    
    expect(getMistakeCount()).toBe(1)
  })

  it('should reset both learned and mistakes on resetProgress', () => {
    const { markAsLearned, markAsMistake, resetProgress, getLearnedCount, getMistakeCount } = useVocabularyStore.getState()
    
    markAsLearned('word-1')
    markAsLearned('word-2')
    markAsMistake('word-3')
    markAsMistake('word-4')
    
    expect(getLearnedCount()).toBe(2)
    expect(getMistakeCount()).toBe(2)
    
    resetProgress()
    
    expect(getLearnedCount()).toBe(0)
    expect(getMistakeCount()).toBe(0)
  })

  it('should allow word to be both learned and mistake', () => {
    const { markAsLearned, markAsMistake, isLearned, isMistake } = useVocabularyStore.getState()
    
    markAsLearned('word-1')
    markAsMistake('word-1')
    
    expect(isLearned('word-1')).toBe(true)
    expect(isMistake('word-1')).toBe(true)
  })
})
