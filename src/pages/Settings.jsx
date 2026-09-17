import { useRef, useState } from 'react'
import { downloadBackup, exportBackup, importBackup, previewBackup } from '../application/backup'
import { attemptRepository } from '../storage'
import { useThemeStore } from '../store/themeStore'
import './Settings.css'

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore()
  const fileInput = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    setBusy(true); setMessage(null)
    try { const backup = await exportBackup(); downloadBackup(backup.json, backup.filename); setMessage(`Backup exported: ${backup.filename}`) }
    catch { setMessage('Export failed. Your learning data was not changed.') }
    finally { setBusy(false) }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true); setMessage(null)
    try { const json = await file.text(); setPendingImport({ json, preview: await previewBackup(json) }) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The backup could not be validated.') }
    finally { setBusy(false) }
  }

  async function handleImport() {
    if (!pendingImport) return
    setBusy(true); setMessage(null)
    try {
      const result = await importBackup(pendingImport.json)
      setPendingImport(null)
      setMessage(`Import complete. AttemptEvents added: ${result.attemptEventsAdded}; skipped: ${result.attemptEventsSkipped}. ReviewEvents added: ${result.reviewEventsAdded}; skipped: ${result.reviewEventsSkipped}. Learning projections rebuilt successfully.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed. Learning data was not changed.') }
    finally { setBusy(false) }
  }

  async function handleReset() {
    if (!window.confirm('Reset all learning history, including review history? Theme preferences will remain unchanged.')) return
    setBusy(true); setMessage(null)
    try { await attemptRepository.clearLearningData(); setPendingImport(null); setMessage('Learning data reset. Theme preferences were kept.') }
    catch { setMessage('Reset failed. Your learning data was not changed.') }
    finally { setBusy(false) }
  }

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
      <div className="settings-card settings-learning-card">
        <div>
          <h3>Learning data</h3>
          <p>Backups contain local AttemptEvents and ReviewEvents only. They may include answers, timestamps, and learning history. Nothing is uploaded.</p>
        </div>
        <div className="settings-actions">
          <button type="button" onClick={() => void handleExport()} disabled={busy}>Export backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" onChange={(event) => void handleFile(event)} hidden />
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}>Import backup</button>
          <button type="button" className="settings-danger" onClick={() => void handleReset()} disabled={busy}>Reset learning data</button>
        </div>
      </div>
      {pendingImport && <div className="settings-card settings-import-preview" role="dialog" aria-labelledby="import-preview-title"><div><h3 id="import-preview-title">Confirm import</h3><p>Backup: {pendingImport.preview.envelope.exportedAt}</p><p>AttemptEvents: {pendingImport.preview.envelope.attemptEvents.length} ({pendingImport.preview.attemptEventsToAdd} added, {pendingImport.preview.attemptEventsToSkip} skipped)</p><p>ReviewEvents: {pendingImport.preview.envelope.reviewEvents.length} ({pendingImport.preview.reviewEventsToAdd} added, {pendingImport.preview.reviewEventsToSkip} skipped)</p><p>Import will merge these events with existing history and rebuild learning projections.</p></div><div className="settings-actions"><button type="button" onClick={() => setPendingImport(null)} disabled={busy}>Cancel</button><button type="button" onClick={() => void handleImport()} disabled={busy}>Import</button></div></div>}
      {message && <p className="settings-message" role="status">{message}</p>}
    </section>
  )
}
