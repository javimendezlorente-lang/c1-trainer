import { Routes, Route, NavLink } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import VocabularyPractice from './pages/VocabularyPractice'
import { useThemeStore } from './store/themeStore'
import { useLanguageStore } from './store/languageStore'
import { useVocabularyStore } from './store/vocabularyStore'
import { usePracticeStore } from './store/practiceStore'
import useTranslation from './hooks/useTranslation'

function App() {
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()
  const vocabSetLanguage = useVocabularyStore((s) => s.setLanguage)
  const practiceSetLanguage = usePracticeStore((s) => s.setLanguage)
  const { t } = useTranslation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    vocabSetLanguage(lang)
    practiceSetLanguage(lang)
  }, [setLanguage, vocabSetLanguage, practiceSetLanguage])

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('appTitle')}</h1>
        <nav>
          <NavLink to="/" end>{t('navDashboard')}</NavLink>
          <NavLink to="/vocabulary">{t('navVocabulary')}</NavLink>
          <NavLink to="/practice">{t('navPractice')}</NavLink>
        </nav>
        <div className="header-controls">
          <div className="language-selector">
            <button
              className={`lang-flag ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
              aria-label="English"
              title="English"
            >🇬🇧</button>
            <button
              className={`lang-flag ${language === 'de' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('de')}
              aria-label="Deutsch"
              title="Deutsch"
            >🇩🇪</button>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={t('toggleTheme')}>
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb" />
            </span>
            <span className="theme-toggle-label">{theme === 'light' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route index element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularyPractice />} />
          <Route path="/practice" element={<Practice />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
