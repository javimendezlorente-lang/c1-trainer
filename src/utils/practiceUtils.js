/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (does not mutate original)
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get N random words from a pool, optionally excluding some IDs
 * @param {Array} pool - Array of word objects
 * @param {number} count - Number of words to select
 * @param {Array} exclude - Array of word IDs to exclude (optional)
 * @returns {Array} - Array of random word objects
 */
export function getRandomWords(pool, count, exclude = []) {
  const excludeSet = new Set(exclude)
  const filtered = pool.filter(word => !excludeSet.has(word.id))
  const shuffled = shuffleArray(filtered)
  return shuffled.slice(0, count)
}

/**
 * Find distractor words similar to the correct word
 * Prioritizes: same level > same part of speech > random
 * @param {Object} correctWord - The correct word object
 * @param {Array} wordPool - Pool of all available words
 * @param {number} count - Number of distractors to return
 * @returns {Array} - Array of distractor word objects
 */
export function getDistractors(correctWord, wordPool, count) {
  // Exclude the correct word
  const candidates = wordPool.filter(w => w.id !== correctWord.id)
  
  if (candidates.length === 0) return []
  
  // Prioritize by similarity
  const sameLevel = candidates.filter(w => w.level === correctWord.level)
  const sameLevelAndPOS = sameLevel.filter(w => w.partOfSpeech === correctWord.partOfSpeech)
  const samePOS = candidates.filter(w => w.partOfSpeech === correctWord.partOfSpeech)
  
  let distractors = []
  
  // Try to get from most similar first
  if (sameLevelAndPOS.length >= count) {
    distractors = getRandomWords(sameLevelAndPOS, count)
  } else if (sameLevelAndPOS.length > 0) {
    // Use all same level+POS, then fill with same level
    distractors = [...sameLevelAndPOS]
    const needed = count - distractors.length
    const remaining = sameLevel.filter(w => !distractors.find(d => d.id === w.id))
    distractors.push(...getRandomWords(remaining, needed))
  } else if (sameLevel.length >= count) {
    distractors = getRandomWords(sameLevel, count)
  } else if (samePOS.length >= count) {
    distractors = getRandomWords(samePOS, count)
  } else {
    // Not enough similar words, just use random
    distractors = getRandomWords(candidates, count)
  }
  
  return distractors.slice(0, count)
}

/**
 * Get a random translation for a word
 * @param {Object} word - Word object with translations array
 * @returns {string} - Random translation
 */
export function getRandomTranslation(word) {
  const translations = word.translations || []
  if (translations.length === 0) return ''
  return translations[Math.floor(Math.random() * translations.length)]
}

/**
 * Check if a user's answer matches any of the correct answers
 * Case-insensitive, trims whitespace
 * @param {string} userAnswer - User's input
 * @param {Array|string} correctAnswers - Correct answer(s)
 * @returns {boolean} - True if match found
 */
export function checkAnswer(userAnswer, correctAnswers) {
  if (!userAnswer) return false
  
  const normalized = userAnswer.toLowerCase().trim()
  const answers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers]
  
  return answers.some(answer => 
    answer.toLowerCase().trim() === normalized
  )
}
