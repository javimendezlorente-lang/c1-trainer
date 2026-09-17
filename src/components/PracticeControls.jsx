import { useEffect } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getDirections } from '../utils/vocabularyUtils'
import './PracticeControls.css'

export default function PracticeControls() {
  const {
    currentMode,
    direction,
    wordPoolFilter,
    levelFilter,
    correctCount,
    incorrectCount,
    settings,
    setMode,
    setDirection,
    setWordPoolFilter,
    setLevelFilter,
    updateSettings,
    getAccuracy,
    resetSession
  } = usePracticeStore()

  const { language } = useLanguageStore()
  const { t } = useTranslation()
  const langDirections = getDirections(language)

  const modes = [
    { id: 'multiple-choice', label: t('modeMultipleChoice') },
    { id: 'match-pairs', label: t('modeMatchPairs') },
    { id: 'fill-blanks', label: t('modeFillBlanks') }
  ]

  const directions = [
    { id: langDirections.toTarget, label: t('directionToTarget') },
    { id: langDirections.toNative, label: t('directionToNative') }
  ]

  const filters = [
    { id: 'all', label: t('filterAllWords') },
    { id: 'learned', label: t('filterLearnedOnly') },
    { id: 'mistakes', label: t('filterMistakesOnly') }
  ]

  const levels = [
    { id: 'all', label: t('filterAllLevels') },
    { id: 'B1', label: 'B1' },
    { id: 'B2', label: 'B2' },
    { id: 'C1', label: 'C1' }
  ]

  const totalAttempts = correctCount + incorrectCount
  const accuracy = getAccuracy()

  // Ensure direction is valid for current language
  const validDirection = directions.some(d => d.id === direction) ? direction : langDirections.toTarget

  // Auto-correct direction when language changes
  useEffect(() => {
    const validIds = [langDirections.toTarget, langDirections.toNative]
    if (!validIds.includes(direction)) {
      setDirection(langDirections.toTarget)
    }
  }, [language, direction, langDirections.toTarget, langDirections.toNative, setDirection])

  const handleModeChange = (modeId) => {
    setMode(modeId)
    resetSession() // Reset stats when changing modes
  }

  return (
    <div className="practice-controls">
      {/* Mode Selector */}
      <div className="control-section mode-selector">
        <div className="mode-tabs">
          {modes.map(mode => (
            <button
              key={mode.id}
              className={`mode-tab ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeChange(mode.id)}
              aria-current={currentMode === mode.id ? 'page' : undefined}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Row: Direction + Word Pool Filter */}
      <div className="control-section settings-row">
        {/* Only show direction for multiple-choice mode */}
        {currentMode === 'multiple-choice' && (
          <div className="setting-group">
            <label htmlFor="direction-select">{t('directionSelectLabel')}</label>
            <select
              id="direction-select"
              value={validDirection}
              onChange={(e) => setDirection(e.target.value)}
              className="direction-select"
            >
              {directions.map(dir => (
                <option key={dir.id} value={dir.id}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="setting-group">
          <label htmlFor="filter-select">{t('wordPoolLabel')}</label>
          <select
            id="filter-select"
            value={wordPoolFilter}
            onChange={(e) => setWordPoolFilter(e.target.value)}
            className="filter-select"
          >
            {filters.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="level-select">{t('levelLabel')}</label>
          <select
            id="level-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="level-select"
          >
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode-Specific Parameters */}
      {currentMode === 'match-pairs' && (
        <div className="control-section parameter-controls">
          <div className="setting-group">
            <label htmlFor="pair-count">
              {t('pairsLabel')} <span className="param-value">{settings.matchPairs.pairCount}</span>
            </label>
            <input
              id="pair-count"
              type="range"
              min="4"
              max="8"
              value={settings.matchPairs.pairCount}
              onChange={(e) => updateSettings('matchPairs', { pairCount: parseInt(e.target.value) })}
              className="param-slider"
            />
          </div>
        </div>
      )}

      {currentMode === 'multiple-choice' && (
        <div className="control-section parameter-controls">
          <div className="setting-group">
            <label htmlFor="option-count">
              {t('choicesLabel')} <span className="param-value">{settings.multipleChoice.optionCount}</span>
            </label>
            <input
              id="option-count"
              type="range"
              min="4"
              max="8"
              value={settings.multipleChoice.optionCount}
              onChange={(e) => updateSettings('multipleChoice', { optionCount: parseInt(e.target.value) })}
              className="param-slider"
            />
          </div>
        </div>
      )}

      {currentMode === 'fill-blanks' && (
        <div className="control-section parameter-controls">
          <div className="setting-group">
            <label htmlFor="blank-count">
              {t('blanksLabel')} <span className="param-value">{settings.fillBlanks.blankCount}</span>
            </label>
            <input
              id="blank-count"
              type="range"
              min="1"
              max="3"
              value={settings.fillBlanks.blankCount}
              onChange={(e) => updateSettings('fillBlanks', { blankCount: parseInt(e.target.value) })}
              className="param-slider"
            />
          </div>
          <div className="setting-group">
            <label htmlFor="distractor-count">
              {t('distractorsLabel')} <span className="param-value">{settings.fillBlanks.distractorCount}</span>
            </label>
            <input
              id="distractor-count"
              type="range"
              min="2"
              max="6"
              value={settings.fillBlanks.distractorCount}
              onChange={(e) => updateSettings('fillBlanks', { distractorCount: parseInt(e.target.value) })}
              className="param-slider"
            />
          </div>
        </div>
      )}

      {/* Stats Display */}
      <div className="control-section stats-display">
        {totalAttempts > 0 ? (
          <>
            <div className="stat-item stat-correct">
              <span className="stat-icon">✓</span>
              <span className="stat-value">{correctCount}</span>
              <span className="stat-label">{t('correct')}</span>
            </div>
            <div className="stat-item stat-incorrect">
              <span className="stat-icon">✗</span>
              <span className="stat-value">{incorrectCount}</span>
              <span className="stat-label">{t('incorrect')}</span>
            </div>
            <div className="stat-item stat-accuracy">
              <span className="stat-value">{accuracy}%</span>
              <span className="stat-label">{t('accuracy')}</span>
            </div>
          </>
        ) : (
          <div className="stat-placeholder">
            {t('startPracticing')}
          </div>
        )}
      </div>
    </div>
  )
}
