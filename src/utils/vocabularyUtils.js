import vocabularyEn from '../data/vocabulary-en.json'
import vocabularyDe from '../data/vocabulary-de.json'

const vocabularies = {
  en: vocabularyEn,
  de: vocabularyDe,
}

export function getVocabulary(language) {
  return vocabularies[language] || vocabularyEn
}

export function getVocabularyWords(language) {
  const vocab = getVocabulary(language)
  return vocab?.words || []
}

// Get TTS language code for a target language
export function getTTSLang(language) {
  return language === 'de' ? 'de-DE' : 'en-GB'
}

// Get direction strings for a given target language
export function getDirections(language) {
  if (language === 'de') {
    return {
      toTarget: 'hu-to-de',
      toNative: 'de-to-hu',
    }
  }
  return {
    toTarget: 'hu-to-en',
    toNative: 'en-to-hu',
  }
}

// Check if a direction string refers to a target language
export function isTargetLanguageDirection(direction) {
  return direction === 'hu-to-en' || direction === 'hu-to-de'
}
