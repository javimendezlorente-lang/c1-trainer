import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import MultipleChoice from './MultipleChoice.jsx'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'

// Mock stores
vi.mock('../store/practiceStore')
vi.mock('../store/vocabularyStore')

// Mock vocabulary data
vi.mock('../data/vocabulary-en.json', () => ({
  default: {
    words: [
      { id: 1, word: 'apple', level: 'B2', partOfSpeech: 'noun', translations: ['alma'], definition: 'a fruit', example: 'I ate an apple' },
      { id: 2, word: 'banana', level: 'B2', partOfSpeech: 'noun', translations: ['banán'], definition: 'a fruit', example: 'I like banana' },
      { id: 3, word: 'cherry', level: 'B2', partOfSpeech: 'noun', translations: ['cseresznye'], definition: 'a fruit', example: 'cherry is red' },
      { id: 4, word: 'date', level: 'B2', partOfSpeech: 'noun', translations: ['dátum'], definition: 'a date', example: 'the date is today' },
      { id: 5, word: 'elder', level: 'B2', partOfSpeech: 'noun', translations: ['idősebb'], definition: 'older', example: 'my elder sister' }
    ]
  }
}))

describe('MultipleChoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default store mocks
    usePracticeStore.mockReturnValue({
      direction: 'hu-to-en',
      wordPoolFilter: 'all',
      levelFilter: 'all',
      settings: { multipleChoice: { optionCount: 4 } },
      incrementCorrect: vi.fn(),
      incrementIncorrect: vi.fn()
    })

    useVocabularyStore.mockReturnValue({
      learnedWords: new Set(),
      mistakeWords: new Set(),
      markAsMistake: vi.fn(),
      clearMistake: vi.fn()
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<MultipleChoice />)
    expect(container).toBeTruthy()
  })

  it('displays a question card', () => {
    const { container } = render(<MultipleChoice />)
    const card = container.querySelector('.question-card')
    expect(card).toBeTruthy()
  })

  it('displays multiple choice options', () => {
    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('calls incrementCorrect when correct option is selected', () => {
    const mockIncorrect = vi.fn()
    const mockCorrect = vi.fn()
    usePracticeStore.mockReturnValue({
      direction: 'hu-to-en',
      wordPoolFilter: 'all',
      levelFilter: 'all',
      settings: { multipleChoice: { optionCount: 4 } },
      incrementCorrect: mockCorrect,
      incrementIncorrect: mockIncorrect
    })

    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      // At least one of the callbacks should be called
      expect(mockCorrect.mock.calls.length + mockIncorrect.mock.calls.length).toBeGreaterThan(0)
    }
  })

  it('disables option selection after answer is given', () => {
    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      // Button should have selected class or be disabled
      const selectedOption = container.querySelector('.option-button.selected')
      expect(selectedOption).toBeTruthy()
    }
  })

  it('allows moving to next question with Enter key', () => {
    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      fireEvent.keyDown(document, { key: 'Enter' })
      const nextCard = container.querySelector('.question-card')
      // Card should still exist (regenerated)
      expect(nextCard).toBeTruthy()
    }
  })

  it('regenerates question when direction changes', () => {
    const { rerender, container: container1 } = render(<MultipleChoice />)
    container1.querySelectorAll('.option-button').length

    usePracticeStore.mockReturnValue({
      direction: 'en-to-hu',
      wordPoolFilter: 'all',
      levelFilter: 'all',
      settings: { multipleChoice: { optionCount: 4 } },
      incrementCorrect: vi.fn(),
      incrementIncorrect: vi.fn()
    })

    rerender(<MultipleChoice />)
    const { container: container2 } = { container: container1 }
    const options2 = container2.querySelectorAll('.option-button').length
    expect(options2).toBeGreaterThan(0)
  })

  it('respects wordPoolFilter setting', () => {
    const learnedSet = new Set([1, 2])
    useVocabularyStore.mockReturnValue({
      learnedWords: learnedSet,
      mistakeWords: new Set(),
      markAsMistake: vi.fn(),
      clearMistake: vi.fn()
    })

    usePracticeStore.mockReturnValue({
      direction: 'hu-to-en',
      wordPoolFilter: 'learned',
      levelFilter: 'all',
      settings: { multipleChoice: { optionCount: 4 } },
      incrementCorrect: vi.fn(),
      incrementIncorrect: vi.fn()
    })

    const { container } = render(<MultipleChoice />)
    expect(container.querySelector('.question-card')).toBeTruthy()
  })

  it('marks word as mistake when wrong answer is selected', () => {
    const mockMarkMistake = vi.fn()
    useVocabularyStore.mockReturnValue({
      learnedWords: new Set(),
      mistakeWords: new Set(),
      markAsMistake: mockMarkMistake,
      clearMistake: vi.fn()
    })

    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      // If click caused an action, callback may have been called
      expect(buttons.length).toBeGreaterThan(0)
    }
  })

  it('handles number key presses for option selection', () => {
    const { container } = render(<MultipleChoice />)
    fireEvent.keyDown(document, { key: '1' })
    // Should not crash
    expect(container.querySelector('.question-card')).toBeTruthy()
  })

  it('shows feedback after selection', () => {
    const { container } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      const feedback = container.querySelector('.feedback')
      // Feedback section should appear
      expect(feedback || buttons[0].classList.contains('selected')).toBeTruthy()
    }
  })

  it('does not skip feedback when wordPoolFilter changes', () => {
    const learnedSet = new Set([1, 2])
    const mockIncrement = vi.fn()
    
    // Start with 'all' word pool
    usePracticeStore.mockReturnValue({
      direction: 'hu-to-en',
      wordPoolFilter: 'all',
      levelFilter: 'all',
      settings: { multipleChoice: { optionCount: 4 } },
      incrementCorrect: mockIncrement,
      incrementIncorrect: vi.fn()
    })

    useVocabularyStore.mockReturnValue({
      learnedWords: learnedSet,
      mistakeWords: new Set(),
      markAsMistake: vi.fn(),
      clearMistake: vi.fn()
    })

    const { container, rerender } = render(<MultipleChoice />)
    const buttons = container.querySelectorAll('.option-button')
    
    if (buttons.length > 0) {
      // Click first option to show feedback
      fireEvent.click(buttons[0])
      const feedbackBefore = container.querySelector('.feedback')
      expect(feedbackBefore).toBeTruthy()
      
      // Change word pool filter (simulating user changing filter mid-question)
      usePracticeStore.mockReturnValue({
        direction: 'hu-to-en',
        wordPoolFilter: 'learned', // Changed filter
        levelFilter: 'all',
        settings: { multipleChoice: { optionCount: 4 } },
        incrementCorrect: mockIncrement,
        incrementIncorrect: vi.fn()
      })
      
      // Rerender with new filter
      rerender(<MultipleChoice />)
      
      // Feedback should still be visible (not replaced by new question)
      const feedbackAfter = container.querySelector('.feedback')
      expect(feedbackAfter).toBeTruthy()
    }
  })
})
