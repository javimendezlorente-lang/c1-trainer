import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getRandomWords, getDistractors, shuffleArray, getRandomTranslation } from '../utils/practiceUtils'
import { getVocabularyWords, getDirections } from '../utils/vocabularyUtils'
import './MultipleChoice.css'
import SpeakerIcon from './SpeakerIcon'
import { shouldShowTTSForMultipleChoice } from '../utils/ttsUtils'

export default function MultipleChoice() {
  const {
    direction,
    wordPoolFilter,
    levelFilter,
    settings,
    incrementCorrect,
    incrementIncorrect
  } = usePracticeStore()

  const {
    learnedWords,
    mistakeWords,
    markAsMistake,
    clearMistake
  } = useVocabularyStore()

  const { language } = useLanguageStore()
  const { t } = useTranslation()
  const langDirections = getDirections(language)
  const allWords = getVocabularyWords(language)

  const [currentWord, setCurrentWord] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const hasInitializedRef = useRef(false)

  const optionCount = settings.multipleChoice.optionCount

  // Filter words based on word pool filter and level filter
  const filteredWords = useMemo(() => {
    let words = allWords

    // Apply word pool filter
    if (wordPoolFilter === 'learned') {
      words = words.filter(w => learnedWords.has(w.id))
    } else if (wordPoolFilter === 'mistakes') {
      words = words.filter(w => mistakeWords.has(w.id))
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      words = words.filter(w => w.level === levelFilter)
    }

    return words
  }, [wordPoolFilter, levelFilter, learnedWords, mistakeWords, allWords])

  // Generate new question
  const generateQuestion = useCallback(() => {
    if (filteredWords.length === 0) {
      return { word: null, options: [], correctAnswer: null }
    }

    // Pick a random word
    const [word] = getRandomWords(filteredWords, 1)

    // Generate options based on direction (target-to-native or native-to-target)
    const isToNative = direction === langDirections.toNative
    if (isToNative) {
      // Show English word, pick Hungarian translation
      const correct = getRandomTranslation(word)

      // Get distractors (other Hungarian translations)
      const distractorWords = getDistractors(word, filteredWords, optionCount - 1)
      const distractorOptions = distractorWords.map(w => getRandomTranslation(w))

      // Combine and shuffle
      const allOptions = shuffleArray([correct, ...distractorOptions])

      return { word, options: allOptions, correctAnswer: correct }
    } else {
      // Show Hungarian translation, pick English word
      const hungarianPrompt = getRandomTranslation(word)

      // Get distractor English words
      const distractorWords = getDistractors(word, filteredWords, optionCount - 1)
      const distractorOptions = distractorWords.map(w => w.word)

      // Combine and shuffle
      const allOptions = shuffleArray([word.word, ...distractorOptions])

      // Store the Hungarian word used as prompt
      const wordWithPrompt = { ...word, promptText: hungarianPrompt }

      return { word: wordWithPrompt, options: allOptions, correctAnswer: word.word }
    }
  }, [filteredWords, direction, optionCount, langDirections.toNative])

  // Generate first question on mount only
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      const question = generateQuestion()
      setCurrentWord(question.word)
      setOptions(question.options)
      setCorrectAnswer(question.correctAnswer)
      setSelectedOption(null)
      setIsCorrect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Regenerate question when direction, wordPoolFilter, or levelFilter changes
  useEffect(() => {
    if (hasInitializedRef.current && isCorrect === null) {
      const question = generateQuestion()
      setCurrentWord(question.word)
      setOptions(question.options)
      setCorrectAnswer(question.correctAnswer)
      setSelectedOption(null)
      setIsCorrect(null)
    }
  }, [direction, wordPoolFilter, levelFilter, generateQuestion, isCorrect])

  const handleOptionClick = useCallback((option) => {
    if (isCorrect !== null) return // Already answered

    setSelectedOption(option)
    const correct = option === correctAnswer

    setIsCorrect(correct)

    if (correct) {
      incrementCorrect()
      clearMistake(currentWord.id)
    } else {
      incrementIncorrect()
      markAsMistake(currentWord.id)
    }
  }, [isCorrect, correctAnswer, currentWord, incrementCorrect, incrementIncorrect, markAsMistake, clearMistake])

  const handleNext = () => {
    const question = generateQuestion()
    setCurrentWord(question.word)
    setOptions(question.options)
    setCorrectAnswer(question.correctAnswer)
    setSelectedOption(null)
    setIsCorrect(null)
  }

  const handleKeyPress = useCallback((e) => {
    if (isCorrect !== null && e.key === 'Enter') {
      const question = generateQuestion()
      setCurrentWord(question.word)
      setOptions(question.options)
      setCorrectAnswer(question.correctAnswer)
      setSelectedOption(null)
      setIsCorrect(null)
      return
    }

    // Number keys 1-8 for option selection
    const num = parseInt(e.key)
    if (num >= 1 && num <= options.length && isCorrect === null) {
      handleOptionClick(options[num - 1])
    }
  }, [isCorrect, options, generateQuestion, handleOptionClick])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  if (filteredWords.length === 0) {
    return (
      <div className="multiple-choice">
        <div className="no-words-message">
          <p>{t('noWordsAvailable')}</p>
          <p>{t('tryChangingFilter')}</p>
        </div>
      </div>
    )
  }

  if (!currentWord) {
    return <div className="multiple-choice">{t('loading')}</div>
  }

  const isToNative = direction === langDirections.toNative
  const promptText = isToNative
    ? currentWord.word
    : currentWord.promptText

  const instructionText = isToNative
    ? t('selectTranslation')
    : t('selectWord')

  const showMainSpeaker = shouldShowTTSForMultipleChoice({ direction, side: 'main' })
  const showOptionSpeaker = shouldShowTTSForMultipleChoice({ direction, side: 'option' })

  return (
    <div className="multiple-choice">
      <div className="question-card">
        <div className="badges">
          <span className="level-badge">{currentWord.level}</span>
          <span className="pos-badge">{t(currentWord.partOfSpeech)}</span>
        </div>

        <div className="prompt-word">
          {promptText}
          {showMainSpeaker && <SpeakerIcon text={promptText} size={18} className="multiplechoice-speaker" noRole />}
        </div>

        <div className="instruction">
          {instructionText}
        </div>

        <div className="options-list">
          {options.map((option, index) => {
            const isSelected = selectedOption === option
            const isTheCorrectAnswer = option === correctAnswer
            const showAsCorrect = isCorrect !== null && isTheCorrectAnswer
            const showAsWrong = isSelected && !isCorrect

            return (
              <button
                key={index}
                className={`option-button ${isSelected ? 'selected' : ''} ${showAsCorrect ? 'correct' : ''} ${showAsWrong ? 'wrong' : ''}`}
                onClick={() => handleOptionClick(option)}
                disabled={isCorrect !== null}
              >
                <span className="hotkey">{index + 1}</span>
                <span className="option-text">{option}</span>
                {showOptionSpeaker && <SpeakerIcon text={option} size={16} className="multiplechoice-speaker" noRole />}
                {showAsCorrect && <span className="option-icon">✓</span>}
                {showAsWrong && <span className="option-icon">✗</span>}
              </button>
            )
          })}
        </div>

        {isCorrect !== null && (
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
            {isCorrect ? (
              <p>{t('correctFeedback')}</p>
            ) : (
              <p>{t('incorrectFeedback', { answer: correctAnswer })}</p>
            )}
            <button className="next-button" onClick={handleNext}>
              {t('nextQuestion')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
