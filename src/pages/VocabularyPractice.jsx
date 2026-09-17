import { useState, useMemo, useCallback } from 'react'
import FlipCardDeck from '../components/FlipCardDeck'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getVocabularyWords } from '../utils/vocabularyUtils'
import './VocabularyPractice.css'

export default function VocabularyPractice() {
  const { currentFilter, setFilter, getLearnedCount, isLearned } = useVocabularyStore()
  const { language } = useLanguageStore()
  const { t } = useTranslation()
  const [currentProgress, setCurrentProgress] = useState({ current: 1, total: 0 })
  const [shuffleKey, setShuffleKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')

  const allWords = getVocabularyWords(language)

  const filteredWords = useMemo(() => {
    let filtered = allWords

    if (currentFilter !== 'all') {
      filtered = filtered.filter(word => word.level === currentFilter)
    }

    if (statusFilter === 'learned') {
      filtered = filtered.filter(word => isLearned(word.id))
    } else if (statusFilter === 'unlearned') {
      filtered = filtered.filter(word => !isLearned(word.id))
    }

    return filtered
  }, [currentFilter, statusFilter, isLearned, allWords])

  const learnedCount = getLearnedCount()

  const displayWords = useMemo(() => {
    if (shuffleKey === 0) {
      return filteredWords
    }
    
    const seed = shuffleKey * 9999
    const shuffled = [...filteredWords].sort((a, b) => {
      const hash = (str) => {
        let h = 0
        for (let i = 0; i < str.length; i++) {
          h = ((h << 5) - h) + str.charCodeAt(i)
          h = h & h
        }
        return h
      }
      return (hash(a.id + seed) - hash(b.id + seed))
    })
    return shuffled
  }, [filteredWords, shuffleKey])

  const handleFilterChange = (filter) => {
    setFilter(filter)
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
  }

  const handleClearFilters = () => {
    setFilter('all')
    setStatusFilter('all')
  }

  const handleProgress = useCallback((progress) => {
    setCurrentProgress(progress)
  }, [])

  const handleShuffle = () => {
    setShuffleKey(Math.floor(Math.random() * 1000000))
  }

  const handleReset = () => {
    setShuffleKey(0)
  }

  const isShuffled = shuffleKey > 0
  const words = displayWords

  const levelCounts = {
    all: allWords.length,
    B1: allWords.filter(w => w.level === 'B1').length,
    B2: allWords.filter(w => w.level === 'B2').length,
    C1: allWords.filter(w => w.level === 'C1').length
  }

  return (
    <div className="vocabulary-practice">
      <div className="practice-sidebar">
        <div className="filter-controls">
          <div className="setting-group">
            <label htmlFor="level-select">{t('levelLabel')}</label>
            <select
              id="level-select"
              value={currentFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('levelAll')} ({levelCounts.all})</option>
              <option value="B1">B1 ({levelCounts.B1})</option>
              <option value="B2">B2 ({levelCounts.B2})</option>
              <option value="C1">C1 ({levelCounts.C1})</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="status-select">{t('statusLabel')}</label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('statusAll')}</option>
              <option value="learned">{t('statusLearned')} ({learnedCount})</option>
              <option value="unlearned">{t('statusNotLearned')} ({allWords.length - learnedCount})</option>
            </select>
          </div>

          <button 
            onClick={handleClearFilters} 
            className="btn btn-secondary btn-clear-filters"
            disabled={currentFilter === 'all' && statusFilter === 'all'}
          >
            {t('clearFilters')}
          </button>
        </div>

        <div className="progress-section">
          <div className="learned-stats">
            <div className="stat-item">
              <span className="stat-label">{t('totalLabel')}</span>
              <span className="stat-value">{allWords.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('learnedLabel')}</span>
              <span className="stat-value learned">{learnedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('progressLabel')}</span>
              <span className="stat-value">{allWords.length > 0 ? Math.round((learnedCount / allWords.length) * 100) : 0}%</span>
            </div>
          </div>

          <div className="progress-info">
            <span className="progress-text">
              {t('cardOf', { current: currentProgress.current, total: currentProgress.total || words.length })}
            </span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((currentProgress.current) / (currentProgress.total || words.length)) * 100}%` }}
              />
            </div>
          </div>

          <div className="shuffle-controls">
            {!isShuffled ? (
              <button 
                onClick={handleShuffle} 
                className="btn btn-secondary btn-shuffle"
              >
                {t('shuffle')}
              </button>
            ) : (
              <button 
                onClick={handleReset} 
                className="btn btn-secondary btn-shuffle"
              >
                {t('resetOrder')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="practice-content">
        {words.length > 0 ? (
          <FlipCardDeck 
            words={words} 
            onProgress={handleProgress}
          />
        ) : (
          <div className="no-results">
            <p>{t('noWordsForFilter')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
