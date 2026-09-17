import { useThemeStore } from '../store/themeStore'
import './Settings.css'

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <p className="eyebrow">C1 Trainer</p>
      <h2 id="settings-title">Settings</h2>
      <div className="settings-card">
        <div>
          <h3>Theme</h3>
          <p>Choose the appearance that is most comfortable for studying.</p>
        </div>
        <button type="button" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'dark' : 'light'} theme
        </button>
      </div>
    </section>
  )
}
