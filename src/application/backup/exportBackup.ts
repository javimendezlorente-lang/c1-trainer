import { createBackupEnvelope, backupFilename, serializeBackup } from '../../backup'
import type { BackupEnvelopeV1 } from '../../domain/backup'
import { attemptRepository, type AttemptRepository } from '../../storage'
import { nowIso } from '../../time/clock'

export async function exportBackup(repository: AttemptRepository = attemptRepository, exportedAt = nowIso()): Promise<{ envelope: BackupEnvelopeV1; json: string; filename: string }> {
  const [attemptEvents, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()])
  const envelope = createBackupEnvelope(attemptEvents, reviewEvents, exportedAt)
  return { envelope, json: serializeBackup(envelope), filename: backupFilename(exportedAt) }
}

export function downloadBackup(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
