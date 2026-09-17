import { useState, useEffect } from 'react'
import { useVocabularyStore } from '../store/vocabularyStore'
import useTranslation from '../hooks/useTranslation'
import './FlipCard.css'
import SpeakerIcon from './SpeakerIcon'

export default function FlipCard({ wordId, word, level, partOfSpeech, translations, definition, example }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { isLearned, markAsLearned, unmarkAsLearned } = useVocabularyStore()
  const { t } = useTranslation()
  const learned = isLearned(wordId)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleToggleLearned = (e) => {
    e.stopPropagation() // Prevent card flip
    if (learned) {
      unmarkAsLearned(wordId)
    } else {
      markAsLearned(wordId)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (learned) {
          unmarkAsLearned(wordId)
        } else {
          markAsLearned(wordId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [learned, wordId, markAsLearned, unmarkAsLearned]) // Include dependencies for Enter key handler

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div 
      className={`flip-card ${isFlipped ? 'flipped' : ''} ${learned ? 'learned' : ''}`}
      onClick={handleFlip}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={t('flashcardAria', { word, state: isFlipped ? t('showingTranslation') : t('showingWord'), learnedState: learned ? t('markedLearned') : t('notLearnedYet') })}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="level-badge">{level}</div>
          <button
            className={`learned-toggle ${learned ? 'is-learned' : ''}`}
            onClick={handleToggleLearned}
            aria-label={learned ? t('markNotLearned') : t('markLearned')}
            title={learned ? t('markNotLearned') : t('markLearned')}
          >
            {learned ? '✓' : '○'}
          </button>
          <div className="word-container">
            <h2 className="word">{word} <SpeakerIcon text={word} size={20} className="flipcard-speaker" /></h2>
          </div>
          <div className="flip-hint">{t('flipHint')}</div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back">
          <div className="level-badge">{level}</div>
          <button
            className={`learned-toggle ${learned ? 'is-learned' : ''}`}
            onClick={handleToggleLearned}
            aria-label={learned ? t('markNotLearned') : t('markLearned')}
            title={learned ? t('markNotLearned') : t('markLearned')}
          >
            {learned ? '✓' : '○'}
          </button>
          <div className="back-content">
            <div className="word-header">
              <h3 className="word-title">{word}<SpeakerIcon text={word} size={18} className="flipcard-back-speaker" noRole /></h3>
              <span className="part-of-speech">{t(partOfSpeech)}</span>
            </div>
            
            <div className="translations">
              <strong>{t('nativeLabel')}</strong> {translations.join(', ')}
            </div>
            
            {definition && (
              <div className="definition">
                <strong>{t('definitionLabel')}</strong> {definition} <SpeakerIcon text={definition} size={16} className="flipcard-back-speaker" noRole />
              </div>
            )}
            
            {example && (
              <div className="example">
                <strong>{t('exampleLabel')}</strong> "{example}" <SpeakerIcon text={example} size={16} className="flipcard-back-speaker" noRole />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
