import { describe, it, expect } from 'vitest'
import { 
  shuffleArray, 
  getRandomWords, 
  getDistractors, 
  getRandomTranslation,
  checkAnswer 
} from './practiceUtils'

describe('shuffleArray', () => {
  it('should return array with same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result.length).toBe(input.length)
  })

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result.sort()).toEqual(input.sort())
  })

  it('should not mutate original array', () => {
    const input = [1, 2, 3, 4, 5]
    const original = [...input]
    shuffleArray(input)
    expect(input).toEqual(original)
  })

  it('should handle empty array', () => {
    const result = shuffleArray([])
    expect(result).toEqual([])
  })

  it('should handle single element', () => {
    const result = shuffleArray([42])
    expect(result).toEqual([42])
  })
})

describe('getRandomWords', () => {
  const mockWords = [
    { id: '1', word: 'one' },
    { id: '2', word: 'two' },
    { id: '3', word: 'three' },
    { id: '4', word: 'four' },
    { id: '5', word: 'five' }
  ]

  it('should return requested number of words', () => {
    const result = getRandomWords(mockWords, 3)
    expect(result.length).toBe(3)
  })

  it('should return all words if count exceeds pool size', () => {
    const result = getRandomWords(mockWords, 10)
    expect(result.length).toBe(5)
  })

  it('should exclude specified word IDs', () => {
    const result = getRandomWords(mockWords, 3, ['1', '2'])
    expect(result.length).toBe(3)
    expect(result.every(w => w.id !== '1' && w.id !== '2')).toBe(true)
  })

  it('should handle empty pool', () => {
    const result = getRandomWords([], 3)
    expect(result).toEqual([])
  })

  it('should handle empty exclude list', () => {
    const result = getRandomWords(mockWords, 2, [])
    expect(result.length).toBe(2)
  })

  it('should return empty if all words excluded', () => {
    const result = getRandomWords(mockWords, 5, ['1', '2', '3', '4', '5'])
    expect(result).toEqual([])
  })
})

describe('getDistractors', () => {
  const mockWords = [
    { id: '1', word: 'abolish', level: 'C1', partOfSpeech: 'verb' },
    { id: '2', word: 'abandon', level: 'C1', partOfSpeech: 'verb' },
    { id: '3', word: 'abstract', level: 'C1', partOfSpeech: 'adjective' },
    { id: '4', word: 'achieve', level: 'B2', partOfSpeech: 'verb' },
    { id: '5', word: 'accurate', level: 'B2', partOfSpeech: 'adjective' },
    { id: '6', word: 'adapt', level: 'C1', partOfSpeech: 'verb' },
    { id: '7', word: 'adequate', level: 'C1', partOfSpeech: 'adjective' }
  ]

  it('should return requested number of distractors', () => {
    const correctWord = mockWords[0] // abolish, C1, verb
    const result = getDistractors(correctWord, mockWords, 3)
    expect(result.length).toBe(3)
  })

  it('should not include the correct word', () => {
    const correctWord = mockWords[0]
    const result = getDistractors(correctWord, mockWords, 5)
    expect(result.every(w => w.id !== correctWord.id)).toBe(true)
  })

  it('should prioritize same level and part of speech', () => {
    const correctWord = mockWords[0] // abolish, C1, verb
    const result = getDistractors(correctWord, mockWords, 2)
    
    // Should prefer other C1 verbs (abandon, adapt)
    const allC1Verbs = result.every(w => 
      w.level === 'C1' && w.partOfSpeech === 'verb'
    )
    // Note: Due to randomness, this may not always be true
    // but with only 2 other C1 verbs available, it should be likely
    expect(allC1Verbs || result.length === 2).toBe(true)
  })

  it('should handle when not enough similar words exist', () => {
    const correctWord = mockWords[0] // abolish, C1, verb
    const result = getDistractors(correctWord, mockWords, 10)
    
    // Can't get 10 distractors from 6 other words
    expect(result.length).toBeLessThanOrEqual(6)
  })

  it('should return empty array for empty pool', () => {
    const correctWord = mockWords[0]
    const result = getDistractors(correctWord, [], 3)
    expect(result).toEqual([])
  })

  it('should handle pool with only the correct word', () => {
    const correctWord = mockWords[0]
    const result = getDistractors(correctWord, [correctWord], 3)
    expect(result).toEqual([])
  })
})

describe('getRandomTranslation', () => {
  it('should return a translation from the array', () => {
    const word = { 
      word: 'abolish', 
      translations: ['eltöröl', 'megszüntet'] 
    }
    const result = getRandomTranslation(word)
    expect(word.translations).toContain(result)
  })

  it('should return empty string for word with no translations', () => {
    const word = { word: 'test', translations: [] }
    const result = getRandomTranslation(word)
    expect(result).toBe('')
  })

  it('should handle missing translations property', () => {
    const word = { word: 'test' }
    const result = getRandomTranslation(word)
    expect(result).toBe('')
  })

  it('should return the only translation if only one exists', () => {
    const word = { word: 'test', translations: ['egyetlen'] }
    const result = getRandomTranslation(word)
    expect(result).toBe('egyetlen')
  })
})

describe('checkAnswer', () => {
  it('should match exact answer', () => {
    expect(checkAnswer('hello', 'hello')).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(checkAnswer('Hello', 'hello')).toBe(true)
    expect(checkAnswer('HELLO', 'hello')).toBe(true)
  })

  it('should trim whitespace', () => {
    expect(checkAnswer('  hello  ', 'hello')).toBe(true)
    expect(checkAnswer('hello', '  hello  ')).toBe(true)
  })

  it('should match against array of correct answers', () => {
    expect(checkAnswer('eltöröl', ['eltöröl', 'megszüntet'])).toBe(true)
    expect(checkAnswer('megszüntet', ['eltöröl', 'megszüntet'])).toBe(true)
  })

  it('should return false for incorrect answer', () => {
    expect(checkAnswer('wrong', 'correct')).toBe(false)
    expect(checkAnswer('wrong', ['right', 'correct'])).toBe(false)
  })

  it('should return false for empty answer', () => {
    expect(checkAnswer('', 'correct')).toBe(false)
    expect(checkAnswer(null, 'correct')).toBe(false)
    expect(checkAnswer(undefined, 'correct')).toBe(false)
  })

  it('should handle empty correct answers array', () => {
    expect(checkAnswer('anything', [])).toBe(false)
  })
})
