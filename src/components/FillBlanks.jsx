import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { shuffleArray } from '../utils/practiceUtils'
import { getVocabulary, getVocabularyWords } from '../utils/vocabularyUtils'
import './FillBlanks.css'
import useInflections from '../utils/inflections'
import SpeakerIcon from './SpeakerIcon'

// Helper component to render word tooltip
function WordTooltip({ wordData, t }) {
  if (!wordData) return null
  
  return (
    <div className="word-tooltip">
      <div className="tooltip-header">
        <div className="tooltip-word">{wordData.word}</div>
        <div className="tooltip-meta">
          <span className="tooltip-level">{wordData.level}</span>
          <span className="tooltip-pos">{t(wordData.partOfSpeech)}</span>
        </div>
      </div>
      
      <div className="tooltip-translations">
        <strong>{t('nativeLabel')}</strong> {wordData.translations && wordData.translations.join(', ')}
      </div>
      
      {wordData.definition && (
        <div className="tooltip-definition">
          <strong>{t('definitionLabel')}</strong> {wordData.definition}
        </div>
      )}
      
      {wordData.example && (
        <div className="tooltip-example">
          <strong>{t('exampleLabel')}</strong> {wordData.example}
        </div>
      )}
    </div>
  )
}

export default function FillBlanks() {
  const {
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
  const allWords = getVocabularyWords(language)
  const vocabularyDataForLang = getVocabulary(language)
  const inflections = useInflections(language)

  const blankCount = settings.fillBlanks.blankCount
  const distractorCount = settings.fillBlanks.distractorCount

  // Filter words based on word pool filter and ensure they have examples
  const filteredWords = useMemo(() => {
    let words = allWords.filter(w => w.example && w.example.trim().length > 0)

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

  // State for current exercise
  const [word, setWord] = useState(null)
  const [sentence, setSentence] = useState('')
  const [blanks, setBlanks] = useState([]) // Array of {id, wordIdx, correctWord, wordData}
  const [options, setOptions] = useState([]) // Array of {id, word, isCorrect}
  const [filledBlanks, setFilledBlanks] = useState({}) // {blankId: wordId}
  const [draggedLozenge, setDraggedLozenge] = useState(null) // Track dragged word
  const [feedback, setFeedback] = useState(null) // {type, message}
  const [showingAnswers, setShowingAnswers] = useState(false) // Showing correct answers (disables lozenges)
  const [hoveredBlankId, setHoveredBlankId] = useState(null) // Track hovered correct answer in sentence
  const [hoveredWordIdx, setHoveredWordIdx] = useState(null) // Track hovered vocabulary word in sentence
  const [, setTouchTarget] = useState(null) // Track touch target receptacle
  const [isCorrect, setIsCorrect] = useState(false) // Track if current exercise is correct

  const hasInitializedRef = useRef(false)

  // Normalize text for comparison
  const normalize = (text) => {
    return text.toLowerCase().replace(/[^a-zäöüß]/g, '')
  }

  // Look up a word in the vocabulary and inflections database
  const lookupWord = useCallback((wordText) => {
    if (!vocabularyDataForLang || !inflections) return null

    const wordNorm = normalize(wordText)
    const allVocabWords = vocabularyDataForLang.words || []

    // First try direct vocabulary lookup
    for (const v of allVocabWords) {
      if (normalize(v.word) === wordNorm) {
        return v
      }
    }

    // Try to find through inflections database
    if (inflections.inflections) {
      for (const [, entry] of Object.entries(inflections.inflections)) {
        if (entry.observed && Array.isArray(entry.observed)) {
          for (const obs of entry.observed) {
            if (normalize(obs.form) === wordNorm) {
              // Found the observed form, now get the vocabulary entry
              const lemmaKey = normalize(entry.lemma || entry.base)
              for (const v of allVocabWords) {
                if (normalize(v.word) === lemmaKey) {
                  return v
                }
              }
            }
          }
        }
      }
    }

    return null
  }, [vocabularyDataForLang, inflections])

  // Generate an exercise by picking a random word and creating blanks
  const generateExercise = useCallback(() => {
    if (filteredWords.length === 0) return null

    // Pick a random word
    const selectedWord = filteredWords[Math.floor(Math.random() * filteredWords.length)]
    const example = selectedWord.example
    const words = example.split(/\s+/)

    // Find the index of the selected word in the sentence to ensure it's always a blank
    const selectedWordIndex = words.findIndex(w =>
      w.toLowerCase().replace(/[^a-zäöüß]/g, '') === selectedWord.word.toLowerCase()
    )

    // Create blanks: select indices but avoid trivial tokens (articles, 'to be' verbs)
    const allIndices = words.map((_, idx) => idx)
    const stripToken = (s) => String(s).replace(/[^a-zäöüßA-ZÄÖÜ]/g, '')
    const isStopToken = (token) => {
      const tok = stripToken(token).toLowerCase()
      if (!tok) return true
      const articlesEn = new Set(['the','a','an'])
      const beEn = new Set(['be','am','is','are','was','were','being','been'])
      const articlesDe = new Set(['der','die','das','den','dem','des','ein','eine','einen','einem','eines','einer'])
      const beDe = new Set(['sein','bin','bist','ist','sind','seid','war','waren','gewesen','warst'])
      if (language === 'de') {
        if (articlesDe.has(tok)) return true
        if (beDe.has(tok)) return true
      } else {
        if (articlesEn.has(tok)) return true
        if (beEn.has(tok)) return true
      }
      return false
    }
    // Prefer indices that are not trivial tokens
    let availableIndices = allIndices.filter(idx => !isStopToken(words[idx]))
    // If filtering removes everything, fall back to all indices
    if (availableIndices.length === 0) availableIndices = allIndices
    const numBlanks = Math.min(blankCount, availableIndices.length)
    // Start with the selected word's index only if it's not a trivial token
    let blankIndices = selectedWordIndex >= 0 && !isStopToken(words[selectedWordIndex]) ? [selectedWordIndex] : []
    // Add additional random indices to reach numBlanks
    if (numBlanks > blankIndices.length) {
      const remainingIndices = availableIndices.filter(idx => !blankIndices.includes(idx))
      const additionalIndices = shuffleArray(remainingIndices).slice(0, numBlanks - blankIndices.length)
      blankIndices = blankIndices.concat(additionalIndices)
    }
    // Shuffle the final indices for visual variety
    blankIndices = shuffleArray(blankIndices)

    // Build blanks array with correct words and their vocabulary data
    const stripArticle = (s) => (typeof s === 'string' ? s.replace(/^(der|die|das)\s+/i, '') : s)
    const normalize = (s) => stripArticle(String(s)).toLowerCase().replace(/[^a-zäöüß]/gi, '')

    const newBlanks = blankIndices.map((idx) => {
      const rawToken = words[idx]
      const punctMatch = rawToken.match(/[^a-zäöüßA-ZÄÖÜ]+$/)
      const trailingPunct = punctMatch ? punctMatch[0] : ''
      const wordFromSentence = rawToken.replace(/[^a-zäöüßA-ZÄÖÜ]/g, '')
      const normSentence = normalize(wordFromSentence)
      
      // Try to match using observed forms first (if inflections available)
      let wordData = null
      let matchedViaObserved = false
      
      if (inflections && inflections.inflections) {
        for (const [key, entry] of Object.entries(inflections.inflections)) {
          if (key === '__meta') continue
          const observed = entry.observed || []
          for (const obs of observed) {
            if (normalize(obs.form) === normSentence) {
              // Found a match in observed forms — now find the vocab entry
              const lemma = entry.lemma || entry.base || key
              wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normalize(lemma))
              if (wordData) {
                matchedViaObserved = true
                break
              }
            }
          }
          if (matchedViaObserved) break
        }
      }
      
      // Fallback: direct dictionary match
      if (!wordData) {
        wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normSentence)
      }
      
      // Fallback: try matching against generated inflections (if available)
      if (!wordData && inflections && inflections.inflections) {
        for (const [k, entry] of Object.entries(inflections.inflections)) {
          if (k === '__meta') continue
          const lemma = entry.lemma || entry.base || k
          const normLemma = normalize(lemma)

          if (entry.plural && normalize(entry.plural) === normSentence) {
            wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normLemma)
            if (wordData) break
          }

          if (entry.past_participle && normalize(entry.past_participle) === normSentence) {
            wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normLemma)
            if (wordData) break
          }

          if (entry.present) {
            for (const form of Object.values(entry.present)) {
              if (normalize(form) === normSentence) {
                wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normLemma)
                break
              }
            }
            if (wordData) break
          }

          if (entry.preterite) {
            for (const form of Object.values(entry.preterite)) {
              if (normalize(form) === normSentence) {
                wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normLemma)
                break
              }
            }
            if (wordData) break
          }

          if (entry.base && normalize(entry.base.replace(/^(der|die|das)\s+/i, '')) === normSentence) {
            wordData = vocabularyDataForLang.words.find(w => normalize(w.word) === normLemma)
            if (wordData) break
          }
        }
      }

      // Use the surface form from the sentence for display (preserve inflection)
      let correctWord = wordFromSentence
      // If the blank is at the start of the sentence, prefer a lowercased lozenge
      // unless the vocabulary form itself starts with uppercase (e.g., German nouns)
      if (idx === 0) {
        const vocabForm = wordData ? stripArticle(wordData.word) : null
        const vocabStartsUpper = vocabForm ? /^[A-ZÄÖÜ]/.test(vocabForm) : false
        if (!vocabStartsUpper) {
          correctWord = correctWord.charAt(0).toLowerCase() + correctWord.slice(1)
        }
      }
      // Determine target morphological form (to inflect distractors similarly)
      let targetMorph = null
      if (inflections && inflections.inflections && wordData) {
        const key = normalize(wordData.word)
        const entry = inflections.inflections[key] || inflections.inflections[normalize(stripArticle(wordData.word))]
        
        // Try to detect morph from observed forms first
        if (entry && entry.observed) {
          for (const obs of entry.observed) {
            if (normalize(obs.form) === normSentence) {
              const feats = obs.features || {}
              if (feats.Number === 'Plur') {
                targetMorph = { type: 'plural' }
              } else if (feats.VerbForm === 'Part') {
                targetMorph = { type: 'past_participle' }
              } else if (feats.Tense === 'Past' && feats.VerbForm !== 'Part') {
                // Map person for German and English
                let person
                if (language === 'de') {
                  person = {'1': 'ich', '2': 'du', '3': 'er'}[feats.Person] || 'er'
                } else {
                  // For English: map (Person, Number) tuple
                  const p = feats.Person
                  const n = feats.Number
                  if (p === '1' && n === 'Sing') person = 'I'
                  else if (p === '1' && n === 'Plur') person = 'we'
                  else if (p === '2') person = 'you'
                  else if (p === '3' && n === 'Plur') person = 'they'
                  else person = 'he'
                }
                targetMorph = { type: 'preterite', person }
              } else if (feats.Tense === 'Pres' && feats.Person) {
                // Map person for German and English
                let person
                if (language === 'de') {
                  person = {'1': 'ich', '2': 'du', '3': 'er'}[feats.Person] || 'er'
                } else {
                  // For English: map (Person, Number) tuple
                  const p = feats.Person
                  const n = feats.Number
                  if (p === '1' && n === 'Sing') person = 'I'
                  else if (p === '1' && n === 'Plur') person = 'we'
                  else if (p === '2') person = 'you'
                  else if (p === '3' && n === 'Plur') person = 'they'
                  else person = 'he'
                }
                targetMorph = { type: 'present', person }
              }
              break
            }
          }
        }
        
        // Fallback to generated inflections
        if (!targetMorph && entry) {
          if (entry.plural && normalize(entry.plural) === normSentence) {
            targetMorph = { type: 'plural' }
          } else if (entry.past_participle && normalize(entry.past_participle) === normSentence) {
            targetMorph = { type: 'past_participle' }
          } else if (entry.preterite) {
            for (const [person, form] of Object.entries(entry.preterite)) {
              if (normalize(form) === normSentence) {
                targetMorph = { type: 'preterite', person }
                break
              }
            }
          } else if (entry.present) {
            for (const [person, form] of Object.entries(entry.present)) {
              if (normalize(form) === normSentence) {
                targetMorph = { type: 'present', person }
                break
              }
            }
          }
        }
      }

      return {
        id: `blank-${idx}`,
        wordIdx: idx,
        correctWord,
        wordData, // Store full word object for tooltip display
        targetMorph,
        normSentence,
        trailingPunct
      }
    })

    // Get distractor words (exclude correct words and duplicates) - pick randomly
    const correctWords = new Set(newBlanks.map(b => normalize(b.correctWord)))
    const candidateDistractors = filteredWords.filter(w => !correctWords.has(normalize(w.word)))
    const shuffledCandidates = shuffleArray(candidateDistractors)

    const distractors = []
    const usedDisplayNorms = new Set()
    for (const cand of shuffledCandidates) {
      if (distractors.length >= distractorCount) break

      // Try to pick a form for this candidate that matches any blank's targetMorph
      let candidateDisplay = null
      if (language === 'de' && inflections && inflections.inflections) {
        const candKey = normalize(cand.word)
        const candEntry = inflections.inflections[candKey] || inflections.inflections[normalize(stripArticle(cand.word))]
        if (candEntry) {
          for (const blank of newBlanks) {
            const tm = blank.targetMorph
            if (!tm) continue
            if (tm.type === 'plural' && candEntry.plural) {
              candidateDisplay = candEntry.plural
              break
            }
            if (tm.type === 'past_participle' && candEntry.past_participle) {
              candidateDisplay = candEntry.past_participle
              break
            }
            if (tm.type === 'present' && candEntry.present && candEntry.present[tm.person]) {
              candidateDisplay = candEntry.present[tm.person]
              break
            }
            if (tm.type === 'preterite' && candEntry.preterite && candEntry.preterite[tm.person]) {
              candidateDisplay = candEntry.preterite[tm.person]
              break
            }
          }
        }
      }

      if (!candidateDisplay) {
        candidateDisplay = cand.partOfSpeech === 'noun' ? stripArticle(cand.word) : cand.word
      }
      const candNorm = normalize(candidateDisplay)
      if (usedDisplayNorms.has(candNorm)) continue
      if (correctWords.has(candNorm)) continue
      usedDisplayNorms.add(candNorm)
      distractors.push({ id: `dist-${cand.id}`, word: candidateDisplay, sourceId: cand.id })
    }

    // Create options: correct words + distractors, with correct flag
    const correctWordsList = newBlanks.map(b => b.correctWord)
    const optionsList = [
      ...correctWordsList.map((w, i) => ({ id: `opt-${i}`, word: w, isCorrect: true })),
      ...distractors.map((w, i) => ({ id: `dist-${i}`, word: w.word, isCorrect: false }))
    ]

    return {
      word: selectedWord,
      sentence: example,
      blanks: newBlanks,
      options: shuffleArray(optionsList)
    }
  }, [filteredWords, blankCount, distractorCount, vocabularyDataForLang.words, inflections, language])

  // Initialize exercise on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      const exercise = generateExercise()
      if (exercise) {
        setWord(exercise.word)
        setSentence(exercise.sentence)
        setBlanks(exercise.blanks)
        setOptions(exercise.options)
        setFilledBlanks({})
        setFeedback(null)
        setIsCorrect(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Regenerate when blankCount, distractorCount, or language changes
  useEffect(() => {
    const exercise = generateExercise()
    if (exercise) {
      setWord(exercise.word)
      setSentence(exercise.sentence)
      setBlanks(exercise.blanks)
      setOptions(exercise.options)
      setFilledBlanks({})
      setFeedback(null)
      setShowingAnswers(false)
      setIsCorrect(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankCount, distractorCount, language, inflections])

  // Clear error feedback when user modifies filled blanks (try again)
  useEffect(() => {
    if (feedback?.type === 'incorrect') {
      setFeedback(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledBlanks])

  const handleCheck = useCallback(() => {
    if (!word || blanks.length === 0) return

    // Check if all blanks are filled
    const unfilled = blanks.filter(b => !filledBlanks[b.id])
    if (unfilled.length > 0) {
      // Don't set feedback, just return (button will be disabled)
      return
    }

    // Check each blank
    let allCorrect = true
    for (const blank of blanks) {
      const filledWordId = filledBlanks[blank.id]
      const filledOption = options.find(o => o.id === filledWordId)
      if (!filledOption || !filledOption.isCorrect) {
        allCorrect = false
        break
      }
    }

    if (allCorrect) {
      if (word) {
        incrementCorrect()
        clearMistake(word.id)
      }
      setFeedback({ type: 'correct', message: t('allCorrect') })
      setIsCorrect(true)
    } else {
      if (word) {
        incrementIncorrect()
        markAsMistake(word.id)
      }
      setFeedback({ type: 'incorrect', message: t('someIncorrect') })
      setIsCorrect(false)
    }
  }, [word, blanks, filledBlanks, options, incrementCorrect, incrementIncorrect, markAsMistake, clearMistake, t])

  const handleNext = useCallback(() => {
    const exercise = generateExercise()
    if (exercise) {
      setWord(exercise.word)
      setSentence(exercise.sentence)
      setBlanks(exercise.blanks)
      setOptions(exercise.options)
      setFilledBlanks({})
      setFeedback(null)
      setShowingAnswers(false)
      setIsCorrect(false)
    }
  }, [generateExercise])

  const handleShowAnswers = useCallback(() => {
    // Clear filled blanks, disable lozenges, show correct answers
    setFilledBlanks({})
    setShowingAnswers(true)
    setFeedback(null)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // S for Show Answers (when incorrect)
      if (e.key.toLowerCase() === 's' && feedback?.type === 'incorrect') {
        e.preventDefault()
        handleShowAnswers()
        return
      }

      // Enter for Check/Next
      if (e.key === 'Enter') {
        e.preventDefault()
        // Check: only if no feedback and not showing answers
        if (feedback === null && !showingAnswers) {
          const allFilled = blanks.every(b => filledBlanks[b.id])
          if (allFilled) {
            handleCheck()
          }
        } else if (feedback?.type === 'incorrect' || feedback?.type === 'correct' || showingAnswers) {
          // Next: when incorrect, correct, or showing answers
          handleNext()
        }
        return
      }

      // Don't allow hotkeys when showing answers
      if (showingAnswers) return

      // Hotkeys 1-9 for selecting lozenges or removing filled ones
      const keyNum = parseInt(e.key, 10)
      if (keyNum >= 1 && keyNum <= 9) {
        const optionIdx = keyNum - 1
        if (optionIdx < options.length) {
          const selectedOption = options[optionIdx]

          // Check if this option is already filled in a blank
          const filledBlankId = Object.keys(filledBlanks).find(
            bId => filledBlanks[bId] === selectedOption.id
          )

          if (filledBlankId) {
            // Remove it from the blank
            setFilledBlanks(prev => {
              const updated = { ...prev }
              delete updated[filledBlankId]
              return updated
            })
          } else {
            // Find first empty blank in left-to-right order
            const sortedBlanks = [...blanks].sort((a, b) => a.wordIdx - b.wordIdx)
            const emptyBlank = sortedBlanks.find(b => !filledBlanks[b.id])
            if (emptyBlank) {
              setFilledBlanks(prev => ({
                ...prev,
                [emptyBlank.id]: selectedOption.id
              }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [feedback, handleCheck, handleNext, handleShowAnswers, blanks, filledBlanks, options, showingAnswers])

  if (filteredWords.length === 0) {
    return (
      <div className="fill-blanks">
        <div className="no-words-message">
          <p>{t('noWordsWithExamples')}</p>
          <p>{t('tryChangingFilter')}</p>
        </div>
      </div>
    )
  }

  if (!word) {
    return <div className="fill-blanks">{t('loading')}</div>
  }

  // Build the sentence with blanks as interactive elements
  const sentenceWords = sentence.split(/\s+/)
  const sentenceElements = sentenceWords.map((w, idx) => {
    const blank = blanks.find(b => b.wordIdx === idx)
    if (blank) {
      const filledOptionId = filledBlanks[blank.id]
      const filledOption = filledOptionId ? options.find(o => o.id === filledOptionId) : null
      // Find the hotkey for this option
      const hotkeyNumber = filledOption ? options.findIndex(o => o.id === filledOption.id) + 1 : null

      // Show correct answer if showingAnswers is true
      const shouldShowCorrect = showingAnswers
      const correctWord = shouldShowCorrect ? blank.correctWord : null
      const isHovered = hoveredBlankId === blank.id

      return (
        <span key={idx} className="blank-slot">
          {filledOption ? (
            <span
              className={`receptacle-lozenge filled ${isCorrect ? 'correct-solution' : ''} ${isCorrect && blank.wordData ? 'vocab-word' : ''}`}
              data-blank-id={blank.id}
              onClick={() => {
                if (!showingAnswers && !isCorrect) {
                  setFilledBlanks(prev => {
                    const updated = { ...prev }
                    delete updated[blank.id]
                    return updated
                  })
                }
              }}
              onMouseEnter={() => {
                if (isCorrect) setHoveredBlankId(blank.id)
              }}
              onMouseLeave={() => {
                if (isCorrect) setHoveredBlankId(null)
              }}
              title={isCorrect ? '' : t('clickToRemove')}
              style={isCorrect ? { position: 'relative' } : {}}
            >
              {hotkeyNumber && hotkeyNumber <= 9 && !isCorrect && <span className="hotkey">{hotkeyNumber}</span>}
              <span className={`word-text ${blank.wordData && (isCorrect || showingAnswers) ? 'vocab-inline' : ''}`}>{filledOption.word}</span>
              {/* Tooltip when correct */}
              {isCorrect && isHovered && <WordTooltip wordData={blank.wordData} t={t} />}
            </span>
          ) : shouldShowCorrect ? (
            <span 
              className={`receptacle-lozenge correct-answer ${blank.wordData ? 'vocab-word' : ''}`}
              data-blank-id={blank.id}
              onMouseEnter={() => setHoveredBlankId(blank.id)}
              onMouseLeave={() => setHoveredBlankId(null)}
              style={{ position: 'relative' }}
            >
              <span className={`word-text ${blank.wordData && (isCorrect || showingAnswers) ? 'vocab-inline' : ''}`}>{correctWord}</span>
              {/* Tooltip for correct answer */}
              {isHovered && <WordTooltip wordData={blank.wordData} t={t} />}
            </span>
          ) : (
            <span
              className="receptacle-lozenge empty"
              data-blank-id={blank.id}
              onDragOver={(e) => {
                e.preventDefault()
                if (!showingAnswers) e.currentTarget.classList.add('drag-over')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('drag-over')
              }}
              onDrop={(e) => {
                if (showingAnswers) return
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                const data = e.dataTransfer && e.dataTransfer.getData && e.dataTransfer.getData('text/plain')
                const draggedId = data || draggedLozenge
                if (draggedId) {
                  setFilledBlanks(prev => ({
                    ...prev,
                    [blank.id]: draggedId
                  }))
                  setDraggedLozenge(null)
                }
              }}
            >
              _______
            </span>
          )}
          {blank.trailingPunct}{' '}
        </span>
      )
    }
    // Non-blank word: check if it's in vocabulary
    const vocabEntry = lookupWord(w)
    const isHovered = hoveredWordIdx === idx
    const showTooltip = (showingAnswers || isCorrect) && isHovered

    return (
      <span
        key={idx}
        className={`word ${vocabEntry ? 'vocab-word' : ''}`}
        onMouseEnter={() => {
          if ((showingAnswers || isCorrect) && vocabEntry) {
            setHoveredWordIdx(idx)
          }
        }}
        onMouseLeave={() => setHoveredWordIdx(null)}
        style={{ position: vocabEntry ? 'relative' : 'static' }}
      >
        <span className={`word-text ${vocabEntry && (showingAnswers || isCorrect) ? 'vocab-inline' : ''}`}>{w}</span>{' '}
        {showTooltip && <WordTooltip wordData={vocabEntry} t={t} />}
      </span>
    )
  })

  return (
    <div className="fill-blanks">
      <div className="exercise-card">
        <div className="sentence-header">
          <p className="sentence">{sentenceElements}</p>
          {(showingAnswers || feedback?.type === 'correct') && (
            <div className="sentence-controls">
              <SpeakerIcon text={sentence} size={18} className="sentence-speaker" noRole />
            </div>
          )}
        </div>

        <div className="options-row">
          {options.map((option, idx) => {
            const isUsed = Object.values(filledBlanks).includes(option.id)
            const hotkey = idx + 1 <= 9 ? idx + 1 : null
            return (
              <div
                key={option.id}
                className={`lozenge ${isUsed ? 'used' : ''} ${showingAnswers ? 'disabled' : ''}`}
                draggable={!showingAnswers}
                onDragStart={(e) => {
                  if (!showingAnswers) {
                    try {
                      e.dataTransfer.setData('text/plain', option.id)
                      e.dataTransfer.effectAllowed = 'move'
                    } catch {
                      /* ignore */
                    }
                    setDraggedLozenge(option.id)
                  }
                }}
                onDragEnd={() => setDraggedLozenge(null)}
                onTouchStart={() => {
                  if (!showingAnswers) setDraggedLozenge(option.id)
                }}
                onTouchEnd={(e) => {
                  if (showingAnswers) {
                    setDraggedLozenge(null)
                    setTouchTarget(null)
                    return
                  }
                  const touch = e.changedTouches && e.changedTouches[0]
                  if (touch) {
                    const el = document.elementFromPoint(touch.clientX, touch.clientY)
                    const recept = el && el.closest && el.closest('.receptacle-lozenge')
                    if (recept && !recept.classList.contains('filled') && !recept.classList.contains('correct-answer')) {
                      const blankId = recept.getAttribute('data-blank-id')
                      if (blankId) {
                        setFilledBlanks(prev => ({ ...prev, [blankId]: option.id }))
                      }
                    }
                  }
                  setDraggedLozenge(null)
                  setTouchTarget(null)
                }}
                onClick={() => {
                  if (showingAnswers) return
                  const filledBlankId = Object.keys(filledBlanks).find(bId => filledBlanks[bId] === option.id)
                  if (filledBlankId) {
                    setFilledBlanks(prev => {
                      const updated = { ...prev }
                      delete updated[filledBlankId]
                      return updated
                    })
                  } else {
                    const sortedBlanks = [...blanks].sort((a, b) => a.wordIdx - b.wordIdx)
                    const emptyBlank = sortedBlanks.find(b => !filledBlanks[b.id])
                    if (emptyBlank) {
                      setFilledBlanks(prev => ({ ...prev, [emptyBlank.id]: option.id }))
                    }
                  }
                }}
                title={hotkey ? `${option.word} (${hotkey})` : option.word}
              >
                {hotkey && <span className="hotkey">{hotkey}</span>}
                <span className="lozenge-text">{option.word}</span>
                <SpeakerIcon text={option.word} size={16} className="lozenge-speaker" noRole />
              </div>
            )
          })}
        </div>

        <div className="button-row">
          {showingAnswers ? (
            <>
              <div className={`feedback correct`}>{t('correctAnswersShown')}</div>
              <button className="next-button" onClick={handleNext}>
                {t('nextEnter')}
              </button>
            </>
          ) : feedback === null ? (
            <button
              className="check-button"
              onClick={handleCheck}
              disabled={blanks.some(b => !filledBlanks[b.id])}
            >
              {t('checkEnter')}
            </button>
          ) : feedback.type === 'correct' ? (
            <>
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
              <button className="next-button" onClick={handleNext}>
                {t('nextEnter')}
              </button>
            </>
          ) : feedback.type === 'incorrect' ? (
            <>
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
              <div className="incorrect-actions">
                <button className="show-answer-button" onClick={handleShowAnswers}>
                  {t('showAnswers')}
                </button>
                <button className="next-button" onClick={handleNext}>
                  {t('nextEnter')}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
