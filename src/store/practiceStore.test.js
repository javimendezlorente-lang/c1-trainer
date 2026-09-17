import { describe, it, expect, beforeEach } from 'vitest'
import { usePracticeStore } from './practiceStore'

describe('practiceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePracticeStore.getState().resetAll()
  })

  describe('mode management', () => {
    it('should default to multiple-choice mode', () => {
      const { currentMode } = usePracticeStore.getState()
      expect(currentMode).toBe('multiple-choice')
    })

    it('should change mode', () => {
      const { setMode } = usePracticeStore.getState()
      
      setMode('match-pairs')
      expect(usePracticeStore.getState().currentMode).toBe('match-pairs')
      
      setMode('fill-blanks')
      expect(usePracticeStore.getState().currentMode).toBe('fill-blanks')
    })
  })

  describe('direction management', () => {
    it('should default to Hungarian to English', () => {
      const { direction } = usePracticeStore.getState()
      expect(direction).toBe('hu-to-en')
    })

    it('should change direction', () => {
      const { setDirection } = usePracticeStore.getState()
      
      setDirection('en-to-hu')
      expect(usePracticeStore.getState().direction).toBe('en-to-hu')
    })
  })

  describe('word pool filter', () => {
    it('should default to all words', () => {
      const { wordPoolFilter } = usePracticeStore.getState()
      expect(wordPoolFilter).toBe('all')
    })

    it('should change word pool filter', () => {
      const { setWordPoolFilter } = usePracticeStore.getState()
      
      setWordPoolFilter('learned')
      expect(usePracticeStore.getState().wordPoolFilter).toBe('learned')
      
      setWordPoolFilter('mistakes')
      expect(usePracticeStore.getState().wordPoolFilter).toBe('mistakes')
    })
  })

  describe('statistics tracking', () => {
    it('should start with zero counts', () => {
      const { correctCount, incorrectCount } = usePracticeStore.getState()
      expect(correctCount).toBe(0)
      expect(incorrectCount).toBe(0)
    })

    it('should increment correct count', () => {
      const { incrementCorrect } = usePracticeStore.getState()
      
      incrementCorrect()
      incrementCorrect()
      incrementCorrect()
      
      expect(usePracticeStore.getState().correctCount).toBe(3)
    })

    it('should increment incorrect count', () => {
      const { incrementIncorrect } = usePracticeStore.getState()
      
      incrementIncorrect()
      incrementIncorrect()
      
      expect(usePracticeStore.getState().incorrectCount).toBe(2)
    })

    it('should calculate accuracy', () => {
      const { incrementCorrect, incrementIncorrect, getAccuracy } = usePracticeStore.getState()
      
      // 0 total should be 0%
      expect(getAccuracy()).toBe(0)
      
      // 3 correct, 1 incorrect = 75%
      incrementCorrect()
      incrementCorrect()
      incrementCorrect()
      incrementIncorrect()
      
      expect(getAccuracy()).toBe(75)
      
      // 3 correct, 2 incorrect = 60%
      incrementIncorrect()
      expect(getAccuracy()).toBe(60)
    })

    it('should reset session stats', () => {
      const { incrementCorrect, incrementIncorrect, resetSession } = usePracticeStore.getState()
      
      incrementCorrect()
      incrementCorrect()
      incrementIncorrect()
      
      expect(usePracticeStore.getState().correctCount).toBe(2)
      expect(usePracticeStore.getState().incorrectCount).toBe(1)
      
      resetSession()
      
      expect(usePracticeStore.getState().correctCount).toBe(0)
      expect(usePracticeStore.getState().incorrectCount).toBe(0)
    })
  })

  describe('settings management', () => {
    it('should have default settings for all modes', () => {
      const { settings } = usePracticeStore.getState()
      
      expect(settings.multipleChoice.optionCount).toBe(4)
      expect(settings.matchPairs.pairCount).toBe(6)
      expect(settings.fillBlanks.distractorCount).toBe(3)
    })

    it('should update mode settings', () => {
      const { updateSettings } = usePracticeStore.getState()
      
      updateSettings('multipleChoice', { optionCount: 8 })
      expect(usePracticeStore.getState().settings.multipleChoice.optionCount).toBe(8)
      
      updateSettings('matchPairs', { pairCount: 4 })
      expect(usePracticeStore.getState().settings.matchPairs.pairCount).toBe(4)
    })

    it('should not affect other mode settings when updating', () => {
      const { updateSettings } = usePracticeStore.getState()
      
      updateSettings('multipleChoice', { optionCount: 6 })
      
      // Other modes should remain unchanged
      expect(usePracticeStore.getState().settings.matchPairs.pairCount).toBe(6)
      expect(usePracticeStore.getState().settings.fillBlanks.distractorCount).toBe(3)
    })
  })

  describe('question state', () => {
    it('should start with no current question', () => {
      const { currentQuestion } = usePracticeStore.getState()
      expect(currentQuestion).toBeNull()
    })

    it('should set current question', () => {
      const { setCurrentQuestion } = usePracticeStore.getState()
      
      const question = { wordId: 'test-1', options: ['a', 'b', 'c', 'd'] }
      setCurrentQuestion(question)
      
      expect(usePracticeStore.getState().currentQuestion).toEqual(question)
    })

    it('should clear question on session reset', () => {
      const { setCurrentQuestion, resetSession } = usePracticeStore.getState()
      
      setCurrentQuestion({ wordId: 'test-1' })
      expect(usePracticeStore.getState().currentQuestion).not.toBeNull()
      
      resetSession()
      expect(usePracticeStore.getState().currentQuestion).toBeNull()
    })
  })

  describe('resetAll', () => {
    it('should reset all state to defaults', () => {
      const { 
        setMode, 
        setDirection, 
        setWordPoolFilter, 
        incrementCorrect, 
        setCurrentQuestion,
        resetAll 
      } = usePracticeStore.getState()
      
      // Change everything
      setMode('match-pairs')
      setDirection('en-to-hu')
      setWordPoolFilter('learned')
      incrementCorrect()
      incrementCorrect()
      setCurrentQuestion({ test: true })
      
      // Reset all
      resetAll()
      
      const state = usePracticeStore.getState()
      expect(state.currentMode).toBe('multiple-choice')
      expect(state.direction).toBe('hu-to-en')
      expect(state.wordPoolFilter).toBe('all')
      expect(state.correctCount).toBe(0)
      expect(state.incorrectCount).toBe(0)
      expect(state.currentQuestion).toBeNull()
    })
  })
})
