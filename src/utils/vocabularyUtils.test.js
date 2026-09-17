import { describe, it, expect } from 'vitest'
import { getTTSLang, getDirections, isTargetLanguageDirection, getVocabulary, getVocabularyWords } from './vocabularyUtils'

describe('vocabularyUtils', () => {
  it('getTTSLang returns correct locale', () => {
    expect(getTTSLang('en')).toBe('en-GB')
    expect(getTTSLang('de')).toBe('de-DE')
  })

  it('getDirections returns correct strings', () => {
    expect(getDirections('de')).toEqual({ toTarget: 'hu-to-de', toNative: 'de-to-hu' })
    expect(getDirections('en')).toEqual({ toTarget: 'hu-to-en', toNative: 'en-to-hu' })
  })

  it('isTargetLanguageDirection recognizes hu-to-*', () => {
    expect(isTargetLanguageDirection('hu-to-en')).toBe(true)
    expect(isTargetLanguageDirection('hu-to-de')).toBe(true)
    expect(isTargetLanguageDirection('en-to-hu')).toBe(false)
  })

  it('getVocabulary and getVocabularyWords return data structures', () => {
    const vocabEn = getVocabulary('en')
    expect(vocabEn).toHaveProperty('words')
    const words = getVocabularyWords('en')
    expect(Array.isArray(words)).toBe(true)
    expect(words.length).toBeGreaterThan(0)
  })
})
