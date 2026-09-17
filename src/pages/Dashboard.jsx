import React, { useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getVocabularyWords } from '../utils/vocabularyUtils'
import './Dashboard.css'
import pkg from '../../package.json'

export default function Dashboard() {
  const {
    globalCorrectCount,
    globalIncorrectCount,
    resetAll,
    importStatsForLanguage
  } = usePracticeStore()

  const {
    learnedWords,
    mistakeWords,
    resetProgress,
    importProgress
  } = useVocabularyStore()

  const { language } = useLanguageStore()
  const { t } = useTranslation()

  const fileInputRef = useRef(null)

  const words = getVocabularyWords(language)
  const totalVocabulary = words.length
  const learnedCount = learnedWords.size
  const mistakeCount = mistakeWords.size
  const totalAttempts = globalCorrectCount + globalIncorrectCount
  const accuracy = totalAttempts > 0
    ? Math.round((globalCorrectCount / totalAttempts) * 100)
    : 0

  const handleClearProgress = () => {
    if (window.confirm(t('clearProgressConfirm'))) {
      resetAll()
      resetProgress()
    }
  }

  const handleDownload = () => {
    const payload = {
      version: 1,
      language,
      vocabulary: {
        learnedWords: Array.from(learnedWords),
        mistakeWords: Array.from(mistakeWords)
      },
      practice: {
        globalCorrectCount: globalCorrectCount || 0,
        globalIncorrectCount: globalIncorrectCount || 0
      }
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const filename = `c1-examiner-progress-${language}-${new Date().toISOString().slice(0,10)}.json`
    let url
    let shouldRevoke = false
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      url = URL.createObjectURL(blob)
      shouldRevoke = true
    } else {
      // Fallback to data URI for environments without createObjectURL (e.g., some test envs)
      url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2))
    }
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    const isJSDOM = typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('jsdom')
    if (!isJSDOM) {
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    if (shouldRevoke && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        // Basic validation
        if (!data || !data.vocabulary || !data.practice) {
          alert(t('importError'))
          return
        }
        if (!window.confirm(t('uploadProgressConfirm'))) return
        // Apply to current language (overwrite)
        importProgress(language, data.vocabulary)
        importStatsForLanguage(language, data.practice)
        alert(t('importSuccess'))
      } catch (err) {
        console.error('Import failed', err)
        alert(t('importError'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="dashboard">
      {/* Vocabulary Stats */}
      <section className="dashboard-section vocabulary-section">
        <h2>{t('vocabularyProgress')}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{t('totalWords')}</h3>
              <p className="stat-value">{totalVocabulary}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>{t('learnedWords')}</h3>
              <p className="stat-value">{learnedCount}</p>
              <p className="stat-percentage">{totalVocabulary > 0 ? Math.round((learnedCount / totalVocabulary) * 100) : 0}{t('percentComplete')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{t('mistakeWords')}</h3>
              <p className="stat-value">{mistakeCount}</p>
              <p className="stat-percentage">{t('needReview')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">?</div>
            <div className="stat-content">
              <h3>{t('wordsToLearn')}</h3>
              <p className="stat-value">{totalVocabulary - learnedCount}</p>
              <p className="stat-percentage">{t('notYetLearned')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Stats */}
      <section className="dashboard-section practice-section">
        <h2>{t('practiceStatistics')}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{t('totalAttempts')}</h3>
              <p className="stat-value">{totalAttempts}</p>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>{t('correctAnswers')}</h3>
              <p className="stat-value">{globalCorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-error">
            <div className="stat-icon">✗</div>
            <div className="stat-content">
              <h3>{t('incorrectAnswers')}</h3>
              <p className="stat-value">{globalIncorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-accuracy">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{t('accuracy')}</h3>
              <p className="stat-value">{accuracy}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="dashboard-section actions-section">
        <div className="action-buttons">
          <button
            className="btn-clear-progress"
            onClick={handleClearProgress}
          >
            {t('clearAllProgress')}
          </button>

          <button className="btn btn-secondary" onClick={handleDownload}>{t('downloadProgress')}</button>
          <button className="btn btn-secondary" onClick={handleUploadClick}>{t('uploadProgress')}</button>

          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleFileSelected} />
        </div>
      </section>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div className="footer-left">Version {pkg.version}</div>
          <div className="footer-center">© 2026 David Hanak — <a href="https://github.com/dhanak/examiner/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a></div>
          <div className="footer-right">
            <a href="https://github.com/dhanak/examiner" target="_blank" rel="noopener noreferrer" className="github-link" aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.263.82-.583 0-.288-.01-1.05-.015-2.06-3.338.727-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.76-1.604-2.665-.304-5.467-1.334-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.241 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.814 1.096.814 2.21 0 1.595-.015 2.88-.015 3.27 0 .322.216.698.825.58C20.565 21.796 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
