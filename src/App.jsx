import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import { useThemeStore } from './store/themeStore'
import { checkStorage } from './storage'

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Practice', path: '/practice' },
  { label: 'Review', path: '/review' },
  { label: 'Progress', path: '/progress' },
  { label: 'Settings', path: '/settings' },
]

export default function App() {
  const { theme, toggleTheme } = useThemeStore()
  const [storageWarning, setStorageWarning] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    let active = true
    void checkStorage().then((status) => { if (active && !status.available) setStorageWarning('Local learning storage is unavailable. Open this app in Safari or enable site storage before submitting.') })
    return () => { active = false }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <NavLink className="app-brand" to="/" aria-label="C1 Trainer home">
          C1 Trainer
        </NavLink>

        <nav aria-label="Primary navigation" className="app-nav">
          {navigation.map(({ label, path }) => (
            <NavLink key={path} to={path} end={path === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          <span aria-hidden="true">{theme === 'light' ? '☀️' : '🌙'}</span>
          <span className="theme-toggle-text">{theme}</span>
        </button>
      </header>

      <main className="app-main">
        {storageWarning && <p className="storage-warning" role="alert">{storageWarning}</p>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="app-footer">
        C1 Trainer is an independent personal study tool and is not affiliated with or endorsed by Cambridge English.
      </footer>
    </div>
  )
}
