import { BACKUP_FORMAT, BACKUP_FORMAT_VERSION, type BackupEnvelopeV1 } from '../domain/backup'
import type { ReviewDisposition } from '../domain/reviewDisposition'

export function createBackupEnvelope(attemptEvents: ReadonlyArray<BackupEnvelopeV1['attemptEvents'][number]>, reviewEvents: ReadonlyArray<BackupEnvelopeV1['reviewEvents'][number]>, exportedAt: string, databaseVersion = 3, reviewDispositions: ReadonlyArray<ReviewDisposition> = []): BackupEnvelopeV1 {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_FORMAT_VERSION,
    exportedAt,
    app: { databaseVersion },
    attemptEvents: attemptEvents.map((event) => structuredClone(event)),
    reviewEvents: reviewEvents.map((event) => structuredClone(event)),
    ...(reviewDispositions.length ? { reviewDispositions: reviewDispositions.map((item) => structuredClone(item)) } : {}),
  }
}

export function serializeBackup(envelope: BackupEnvelopeV1): string {
  return `${JSON.stringify(envelope, null, 2)}\n`
}

export function backupFilename(exportedAt: string): string {
  return `c1-trainer-backup-${exportedAt.slice(0, 10)}.json`
}
