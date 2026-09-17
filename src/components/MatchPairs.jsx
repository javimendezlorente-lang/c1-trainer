import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getRandomWords, shuffleArray, getRandomTranslation } from '../utils/practiceUtils'
import { getVocabularyWords } from '../utils/vocabularyUtils'
import './MatchPairs.css'
import SpeakerIcon from './SpeakerIcon'

export default function MatchPairs() {
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

  const pairCount = settings.matchPairs.pairCount

  // Filter words based on word pool filter and level filter
  const filteredWords = useMemo(() => {
    let words = allWords

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

  // Generate pairs for matching
  const generatePairs = useCallback(() => {
    if (filteredWords.length < pairCount) {
      return { leftItems: [], rightItems: [], pairs: new Map() }
    }

    // Get random words for this round
    const selectedWords = getRandomWords(filteredWords, pairCount)
    const qwertyKeys = 'QWERTYUIOP'

    // Create pairs with IDs
    const pairs = new Map()
    const leftItems = []
    const rightItems = []
    const usedWordIds = new Set()

    selectedWords.forEach((word, index) => {
      // Skip if this word ID is already used
      if (usedWordIds.has(word.id)) {
        return
      }
      usedWordIds.add(word.id)

      const pairId = `pair-${index}`
      pairs.set(pairId, word.id)

      // Always display Hungarian on the left and English on the right for consistent layout
      leftItems.push({
        id: `left-${index}`,
        pairId,
        text: getRandomTranslation(word),
        type: 'hungarian',
        hotkey: String(index + 1)
      })
      rightItems.push({
        id: `right-${index}`,
        pairId,
        text: word.word,
        type: 'english',
        hotkey: '' // Will be assigned after shuffle
      })
    })

    // Only keep items up to pairCount
    const trimmedLeft = leftItems.slice(0, pairCount)
    const trimmedRight = rightItems.slice(0, pairCount)

    // Shuffle right side to make matching non-trivial
    const shuffledRight = shuffleArray(trimmedRight)

    // Assign hotkeys after shuffle based on new position
    const rightItemsWithHotkeys = shuffledRight.map((item, index) => ({
      ...item,
      hotkey: qwertyKeys[index] || ''
    }))

    return {
      leftItems: trimmedLeft,
      rightItems: rightItemsWithHotkeys,
      pairs
    }
  }, [filteredWords, pairCount])

  // State management
  const [leftItems, setLeftItems] = useState([])
  const [rightItems, setRightItems] = useState([])
  const [pairs, setPairs] = useState(new Map())
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matches, setMatches] = useState(new Set())
  const [animateSlide, setAnimateSlide] = useState(false)
  const hasInitializedRef = useRef(false)
  const itemsAreNewRef = useRef(true)

  // Refs to measure item positions
  const leftItemsRefs = useRef({})
  const rightItemsRefs = useRef({})

  // Initialize on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      const { leftItems: left, rightItems: right, pairs: newPairs } = generatePairs()
      setLeftItems(left)
      setRightItems(right)
      setPairs(newPairs)
      setSelectedLeft(null)
      setSelectedRight(null)
      setMatches(new Set())
      setAnimateSlide(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Regenerate when pairCount changes
  useEffect(() => {
    const { leftItems: left, rightItems: right, pairs: newPairs } = generatePairs()
    setLeftItems(left)
    setRightItems(right)
    setPairs(newPairs)
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatches(new Set())
    setAnimateSlide(false)
    itemsAreNewRef.current = true
    leftItemsRefs.current = {}
    rightItemsRefs.current = {}
  }, [pairCount, generatePairs])

  // Reset animation and refs when items change
  useEffect(() => {
    setAnimateSlide(false)
    itemsAreNewRef.current = true
    leftItemsRefs.current = {}
    rightItemsRefs.current = {}
  }, [leftItems.length])

  // Trigger slide animation when all pairs are matched (but only if items are not new)
  useEffect(() => {
    if (leftItems.length > 0 && matches.size === leftItems.length && !animateSlide && !itemsAreNewRef.current) {
      // Trigger animation after a brief delay
      const timer = setTimeout(() => {
        setAnimateSlide(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [leftItems.length, matches.size, animateSlide])

  const handleItemClick = useCallback((itemId, side) => {
    // Mark items as no longer new on first interaction
    itemsAreNewRef.current = false

    // If the item is already matched, don't do anything
    const item = side === 'left'
      ? leftItems.find(i => i.id === itemId)
      : rightItems.find(i => i.id === itemId)

    if (item && matches.has(item.pairId)) {
      return
    }

    // Determine new selection state
    let newSelectedLeft = selectedLeft
    let newSelectedRight = selectedRight

    if (side === 'left') {
      newSelectedLeft = selectedLeft === itemId ? null : itemId
    } else {
      newSelectedRight = selectedRight === itemId ? null : itemId
    }

    // Update selection
    setSelectedLeft(newSelectedLeft)
    setSelectedRight(newSelectedRight)

    // Check if we now have both selected
    if (newSelectedLeft && newSelectedRight) {
      const leftItem = leftItems.find(i => i.id === newSelectedLeft)
      const rightItem = rightItems.find(i => i.id === newSelectedRight)

      if (leftItem && rightItem) {
        const isCorrect = leftItem.pairId === rightItem.pairId

        if (isCorrect) {
          const wordId = pairs.get(leftItem.pairId)
          incrementCorrect()
          clearMistake(wordId)
          setMatches(prev => new Set([...prev, leftItem.pairId]))
        } else {
          const wordId = pairs.get(leftItem.pairId)
          incrementIncorrect()
          markAsMistake(wordId)
        }

        // Clear selection after a brief delay
        setTimeout(() => {
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 300)
      }
    }
  }, [selectedLeft, selectedRight, leftItems, rightItems, pairs, matches, incrementCorrect, incrementIncorrect, markAsMistake, clearMistake])

  const handleReset = useCallback(() => {
    const { leftItems: left, rightItems: right, pairs: newPairs } = generatePairs()
    setLeftItems(left)
    setRightItems(right)
    setPairs(newPairs)
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatches(new Set())
    setAnimateSlide(false)
    // Clear refs so animation won't trigger on old refs
    leftItemsRefs.current = {}
    rightItemsRefs.current = {}
  }, [generatePairs])

  const allMatched = leftItems.length > 0 && matches.size === leftItems.length

  // Calculate slide offset for each right item to match left column position
  const getSlideOffset = (rightItem) => {
    // Don't calculate offset if not animating or items are new
    if (!animateSlide || itemsAreNewRef.current) return 0

    // Find where this item should be
    const targetIndex = leftItems.findIndex(li => li.pairId === rightItem.pairId)
    const currentIndex = rightItems.findIndex(ri => ri.id === rightItem.id)

    if (targetIndex === -1 || currentIndex === -1) return 0

    // Get actual DOM positions
    const leftElement = leftItemsRefs.current[leftItems[targetIndex]?.id]
    const rightElement = rightItemsRefs.current[rightItem.id]

    if (!leftElement || !rightElement) return 0

    // Calculate the difference in top position
    const leftTop = leftElement.getBoundingClientRect().top
    const rightTop = rightElement.getBoundingClientRect().top
    const offsetPixels = leftTop - rightTop

    return offsetPixels
  }

  // Add keyboard shortcuts (must be before conditional return)
  useEffect(() => {
    if (filteredWords.length < pairCount) {
      return
    }

    const qwertyKeys = 'QWERTYUIOP'

    const handleKeyDown = (e) => {
      // Check for number keys (1-9) for left column
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (index < leftItems.length) {
          handleItemClick(leftItems[index].id, 'left')
        }
      }
      // Check for QWERTY keys for right column
      else if (qwertyKeys.includes(e.key.toUpperCase())) {
        const index = qwertyKeys.indexOf(e.key.toUpperCase())
        if (index < rightItems.length) {
          handleItemClick(rightItems[index].id, 'right')
        }
      }
      // Check for Enter key on new round button
      else if (e.key === 'Enter' && allMatched) {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [leftItems, rightItems, allMatched, handleItemClick, handleReset, filteredWords.length, pairCount])

  if (filteredWords.length < pairCount) {
    return (
      <div className="match-pairs">
        <div className="no-words-message">
          <p>{t('notEnoughWords')}</p>
          <p>{t('tryChangingFilter')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="match-pairs">
      <div className="matching-container">
        <div className="column left-column">
          {leftItems.map(item => (
            <button
              key={item.id}
              ref={(el) => { if (el) leftItemsRefs.current[item.id] = el }}
              className={`match-item ${selectedLeft === item.id ? 'selected' : ''} ${matches.has(item.pairId) ? 'matched' : ''}`}
              onClick={() => handleItemClick(item.id, 'left')}
              disabled={matches.has(item.pairId)}
            >
              <span className="hotkey">{item.hotkey}</span>
              {item.text}
            </button>
          ))}
        </div>

        <div className="column right-column">
          {rightItems.map(item => {
            const slideOffset = getSlideOffset(item)
            const shouldAnimate = animateSlide && !itemsAreNewRef.current
            const slideStyle = shouldAnimate ? { transform: `translateY(${slideOffset}px)` } : {}

            return (
              <button
                key={item.id}
                ref={(el) => { if (el) rightItemsRefs.current[item.id] = el }}
                className={`match-item ${selectedRight === item.id ? 'selected' : ''} ${matches.has(item.pairId) ? 'matched' : ''} ${shouldAnimate ? 'sliding' : ''}`}
                style={slideStyle}
                onClick={() => handleItemClick(item.id, 'right')}
                disabled={matches.has(item.pairId)}
              >
                <span className="hotkey">{item.hotkey}</span>
                {item.text}
                <SpeakerIcon text={item.text} noRole />
              </button>
            )
          })}
        </div>
      </div>

      {allMatched && (
        <div className="completion-message">
          <p>{t('allPairsMatched')}</p>
          <button className="new-round-button" onClick={handleReset}>
            {t('newRound')}
          </button>
        </div>
      )}
    </div>
  )
}
